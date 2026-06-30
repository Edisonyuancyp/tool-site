#!/usr/bin/env python3
"""
update_tax_rules.py — Semi-automatic annual tax data updater.

Uses SerpAPI to search for the latest official tax brackets for each country,
then calls OpenAI to parse them into the tax-rules.json schema.
Outputs a DRAFT file for human review before applying.

Usage:
  python scripts/update_tax_rules.py              # update all countries
  python scripts/update_tax_rules.py --country us # single country
  python scripts/update_tax_rules.py --apply       # apply draft after review

Workflow:
  1. Run script → generates lib/tax-rules.draft.json
  2. YOU review the draft (check brackets are correct!)
  3. Run with --apply to replace lib/tax-rules.json
  4. Run npm run build && git push
"""

import os
import json
import argparse
import time
import shutil
from datetime import date
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from urllib.error import HTTPError
from llm_client import LLMClient

ROOT       = Path(__file__).parent.parent
RULES_FILE = ROOT / "lib" / "tax-rules.json"
DRAFT_FILE = ROOT / "lib" / "tax-rules.draft.json"

COUNTRY_SEARCH_QUERIES = {
    "us": [
        "IRS 2025 federal income tax brackets single married filing jointly",
        "site:irs.gov 2025 tax rate schedules",
    ],
    "uk": [
        "HMRC 2025-26 income tax rates personal allowance",
        "site:gov.uk 2025 income tax rates",
    ],
    "ca": [
        "Canada Revenue Agency 2025 federal tax brackets rates",
        "site:canada.ca 2025 federal income tax rates",
    ],
    "au": [
        "ATO 2025-26 individual income tax rates resident Australia",
        "site:ato.gov.au 2025 tax rates individuals",
    ],
    "de": [
        "Germany 2025 Einkommensteuer Steuersatz Grundfreibetrag",
        "Germany 2025 income tax brackets solidarity surcharge",
    ],
    "sg": [
        "IRAS Singapore 2025 YA personal income tax rates",
        "site:iras.gov.sg income tax rates 2025",
    ],
    "fr": [
        "France 2025 barème impôt revenu tranches",
        "France 2025 income tax brackets rates official",
    ],
    "jp": [
        "Japan 2025 income tax brackets rates NTA",
        "Japan national tax agency 2025 income tax rates",
    ],
}

COUNTRY_NAMES = {
    "us": "United States", "uk": "United Kingdom", "ca": "Canada",
    "au": "Australia",     "de": "Germany",         "sg": "Singapore",
    "fr": "France",        "jp": "Japan",
}


# ── Key loaders ───────────────────────────────────────────────────────────────

def load_key(var: str) -> str:
    key = os.environ.get(var, "")
    if not key:
        env_file = ROOT / ".env.local"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith(f"{var}="):
                    key = line.split("=", 1)[1].strip()
    if not key:
        raise RuntimeError(f"{var} not set. Add it to .env.local")
    return key


# ── SerpAPI search ────────────────────────────────────────────────────────────

def serpapi_search(query: str, api_key: str, num: int = 5) -> list[dict]:
    params = {"q": query, "api_key": api_key, "num": num, "engine": "google", "gl": "us", "hl": "en"}
    url = "https://serpapi.com/search.json?" + urlencode(params)
    req = Request(url, headers={"User-Agent": "toolcalc-tax-updater/1.0"})
    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
    except Exception as e:
        print(f"    [WARN] SerpAPI failed: {e}")
        return []
    results = []
    for r in data.get("organic_results", []):
        results.append({
            "title":   r.get("title", ""),
            "snippet": r.get("snippet", ""),
            "link":    r.get("link", ""),
        })
    return results


def gather_snippets(country_code: str, api_key: str) -> str:
    queries = COUNTRY_SEARCH_QUERIES.get(country_code, [])
    all_snippets = []
    for q in queries:
        results = serpapi_search(q, api_key, num=5)
        for r in results:
            all_snippets.append(f"[{r['link'][:70]}]\n{r['title']}\n{r['snippet']}")
        time.sleep(0.8)
    return "\n\n".join(all_snippets[:12])


# ── LLM parse ─────────────────────────────────────────────────────────────────

def call_llm(prompt: str) -> str:
    client = LLMClient()
    if not any(client._key_for(p) for p in client.providers):
        raise RuntimeError("No LLM API keys found. Set OPENAI_API_KEY, CLAUDE_API_KEY, or GEMINI_API_KEY.")
    return client.chat_completion(
        system="You are a tax data extraction specialist. Return raw JSON only, no markdown fences, no explanation.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3000,
        temperature=0.1,
        json_mode=True,
    )


def build_parse_prompt(country_code: str, country_name: str, snippets: str, existing: dict) -> str:
    existing_str = json.dumps(existing, indent=2)
    return f"""You are a tax data extraction specialist. Your job is to extract the LATEST official income tax brackets for {country_name} and return them in a strict JSON format.

SEARCH RESULTS (from Google, may be incomplete or mixed):
{snippets if snippets else "(No search results — use your training knowledge for the most recent year)"}

EXISTING DATA (for reference and schema):
{existing_str}

TASK: Update the JSON object for "{country_code}" with the most current tax year data you can find.

RULES:
1. Return ONLY the updated JSON object for this single country (not the full file)
2. Keep the exact same schema as the existing data
3. Update the "year" field to reflect the tax year (e.g. 2025 or "2025-26")
4. If you cannot find confirmed bracket data from the search results, keep the existing brackets but update the year if you know it changed
5. Add a "dataSource" field with the URL or source you used (or "OpenAI training data" if from knowledge)
6. Do NOT invent tax rates — if uncertain, keep existing values and note it in "notes"
7. Return raw JSON only, no markdown fences, no explanation

Schema reminder:
- brackets: array of [min, max_or_null, rate] tuples
- standardDeduction: object by filing status
- All monetary values in local currency
- All rates as decimals (0.20 = 20%)
"""


# ── Core update logic ─────────────────────────────────────────────────────────

def update_country(country_code: str, existing_rules: dict, serp_key: str) -> dict:
    country_name = COUNTRY_NAMES.get(country_code, country_code.upper())
    print(f"\n  🔍 Searching for {country_name} tax data…")
    snippets = gather_snippets(country_code, serp_key)
    print(f"  📄 {len(snippets.splitlines())} snippet lines collected")

    existing_country = existing_rules.get(country_code, {})
    prompt = build_parse_prompt(country_code, country_name, snippets, existing_country)

    client = LLMClient()
    print(f"  🤖 Asking LLM (providers: {','.join(client.providers)}) to parse tax brackets…")
    try:
        response = call_llm(prompt)
        updated = json.loads(response)
        print(f"  ✅ Parsed successfully — tax year: {updated.get('year', '?')}")
        return updated
    except Exception as e:
        print(f"  ⚠️  LLM parsing failed: {e}")
        print(f"     Keeping existing data for {country_code}")
        return existing_country


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Update tax-rules.json with latest brackets")
    parser.add_argument("--country", help="Update only this country code (e.g. us, uk, ca)")
    parser.add_argument("--apply",   action="store_true", help="Apply tax-rules.draft.json → tax-rules.json")
    parser.add_argument("--no-search", action="store_true", help="Skip SerpAPI, use LLM knowledge only")
    args = parser.parse_args()

    # ── Apply mode ────────────────────────────────────────────────────────────
    if args.apply:
        if not DRAFT_FILE.exists():
            print(f"[ERROR] No draft found at {DRAFT_FILE.name}. Run without --apply first.")
            return
        shutil.copy(DRAFT_FILE, RULES_FILE)
        DRAFT_FILE.unlink()
        print(f"✅ Applied {DRAFT_FILE.name} → {RULES_FILE.name}")
        print(f"   Next: npm run build && git add lib/tax-rules.json && git push")
        return

    # ── Load keys ─────────────────────────────────────────────────────────────
    serp_key = "" if args.no_search else load_key("SERPAPI_KEY")
    client = LLMClient()
    if not any(client._key_for(p) for p in client.providers):
        print("[ERROR] No LLM API keys found. Set OPENAI_API_KEY, CLAUDE_API_KEY, or GEMINI_API_KEY.")
        return

    # ── Load existing rules ───────────────────────────────────────────────────
    existing = json.loads(RULES_FILE.read_text())
    meta     = existing.get("_meta", {})

    # ── Determine which countries to update ───────────────────────────────────
    all_codes = [c for c in existing.keys() if not c.startswith("_")]
    target_codes = [args.country] if args.country else all_codes

    invalid = [c for c in target_codes if c not in all_codes]
    if invalid:
        print(f"[ERROR] Unknown country code(s): {invalid}. Valid: {all_codes}")
        return

    print(f"\n{'═' * 60}")
    print(f"🏦  TAX RULES UPDATER")
    print(f"    Countries : {', '.join(target_codes)}")
    print(f"    Search    : {'disabled (--no-search)' if args.no_search else 'SerpAPI'}")
    print(f"    Output    : {DRAFT_FILE.name} (DRAFT — review before applying!)")
    print(f"{'═' * 60}")

    # ── Update each country ───────────────────────────────────────────────────
    draft = dict(existing)  # copy full file
    updated_count = 0
    skipped_count = 0

    for code in target_codes:
        print(f"\n→ [{code.upper()}] {COUNTRY_NAMES.get(code, code)}")
        try:
            serp_k = "" if args.no_search else serp_key
            updated = update_country(code, existing, serp_k)
            draft[code] = updated
            updated_count += 1
        except Exception as e:
            print(f"  ❌ Error updating {code}: {e}")
            skipped_count += 1

    # ── Update _meta ──────────────────────────────────────────────────────────
    draft["_meta"] = {
        **meta,
        "lastUpdated": date.today().isoformat(),
        "updatedBy":   "update_tax_rules.py (AI-assisted, human-reviewed)",
        "description": meta.get("description", ""),
        "disclaimer":  meta.get("disclaimer", ""),
    }

    # ── Write draft ───────────────────────────────────────────────────────────
    DRAFT_FILE.write_text(json.dumps(draft, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"\n{'═' * 60}")
    print(f"✅ Draft written → {DRAFT_FILE.name}")
    print(f"   Updated : {updated_count} country/countries")
    print(f"   Skipped : {skipped_count} (errors)")
    print(f"\n⚠️  IMPORTANT — Please review the draft before applying:")
    print(f"   1. Open lib/tax-rules.draft.json")
    print(f"   2. Verify bracket numbers against official sources:")
    for code in target_codes:
        sources = {
            "us": "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments",
            "uk": "https://www.gov.uk/income-tax-rates",
            "ca": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
            "au": "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
            "de": "https://www.bundesfinanzministerium.de",
            "sg": "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates",
            "fr": "https://www.impots.gouv.fr",
            "jp": "https://www.nta.go.jp/english/",
        }
        print(f"      [{code.upper()}] {sources.get(code, 'official government tax authority website')}")
    print(f"   3. Once satisfied, run:")
    print(f"      python scripts/update_tax_rules.py --apply")
    print(f"      npm run build && git add lib/tax-rules.json && git push")
    print(f"{'═' * 60}")


if __name__ == "__main__":
    main()
