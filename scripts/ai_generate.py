#!/usr/bin/env python3
"""
ai_generate.py — Use OpenAI to analyse research snippets and generate tasks.json entries.

Usage:
  python scripts/ai_generate.py --category "finance"
  python scripts/ai_generate.py --category "health" --count 5 --no-research

Reads:
  scripts/research_cache/<category>.json  (from research.py)
  OR skips research if --no-research flag is set

Writes:
  Appends new tool definitions to scripts/tasks.json (deduplicates by slug)
"""

import os
import json
import argparse
import re
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError

SCRIPTS_DIR = Path(__file__).parent
CACHE_DIR   = SCRIPTS_DIR / "research_cache"
TASKS_FILE  = SCRIPTS_DIR / "tasks.json"

# ── Priority category focus instructions injected into the AI prompt ──────────
PRIORITY_FOCUS: dict[str, str] = {
    "ecommerce": """\
PRIORITY FOCUS — E-Commerce Sellers:
Target users who sell on Shopify, Amazon FBA, Etsy, WooCommerce, or run dropshipping businesses.
High-value tool ideas include: profit margin calculators, break-even analysis, ROAS/ROAS target calculators,
FBA fee estimators, landed cost / customs duty calculators, Etsy listing fee calculators, pricing strategy
tools, inventory reorder point calculators, shipping rate comparators, and Amazon PPC bid calculators.
Prefer tools that solve real operational pain points that sellers discuss in r/shopify, r/amazonseller, r/Etsy.""",

    "quant": """\
PRIORITY FOCUS — Traders & Quant Finance:
Target algorithmic traders, retail investors, options traders, and forex/crypto market participants.
High-value tool ideas include: Kelly Criterion position sizer, Sharpe/Sortino ratio calculator, max drawdown
estimator, options Greeks calculator (delta/gamma/theta/vega), implied volatility calculator, risk-reward
ratio tool, backtesting metrics summarizer, correlation matrix tool, portfolio VaR calculator, and
funding rate / carry cost calculators for crypto perps.
Prefer tools discussed in r/algotrading, r/options, r/quant, r/Forex.""",

    "design": """\
PRIORITY FOCUS — Designers & Creative Professionals:
Target UI/UX designers, graphic designers, and front-end developers who use Figma, Sketch, or code.
High-value tool ideas include: contrast ratio checker (WCAG), spacing/grid calculator, type scale generator,
CSS gradient builder, SVG path generator, color palette extractor, font pairing tool, aspect ratio calculator,
icon grid calculator, and animation timing curve generator.
Prefer tools that designers request in r/graphic_design, r/UI_Design, r/web_design, r/figma.""",

    "market": """\
PRIORITY FOCUS — Market Research & Data Analytics:
Target product managers, growth marketers, and business analysts who need data-driven decision tools.
High-value tool ideas include: TAM/SAM/SOM calculator, customer LTV calculator, churn rate calculator,
cohort retention analyzer, price elasticity estimator, NPS score interpreter, A/B test significance
calculator, funnel conversion rate optimizer, and market share calculator.
Prefer tools that PMs and analysts discuss in r/ProductManagement, r/marketing, r/datascience.""",
}

# ── Existing registry slugs — avoid duplicating tools already built ───────────
def get_existing_slugs() -> set[str]:
    registry = SCRIPTS_DIR.parent / "tools-registry"
    slugs = set()
    if registry.exists():
        for d in registry.iterdir():
            if d.is_dir() and not d.name.startswith("_"):
                slugs.add(d.name)
    # also check tasks.json
    if TASKS_FILE.exists():
        for t in json.loads(TASKS_FILE.read_text()):
            slugs.add(t.get("slug", ""))
    return slugs


def load_openai_key() -> str:
    key = os.environ.get("OPENAI_API_KEY", "")
    if not key:
        env_file = SCRIPTS_DIR.parent / ".env.local"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("OPENAI_API_KEY="):
                    key = line.split("=", 1)[1].strip()
    if not key:
        raise RuntimeError("OPENAI_API_KEY not set. Add it to .env.local or set as env var.")
    return key


def call_openai(prompt: str, api_key: str, model: str = "gpt-4o-mini") -> str:
    payload = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 4000,
    }).encode()
    req = Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    try:
        with urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
    except HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"OpenAI API error {e.code}: {body}")
    return data["choices"][0]["message"]["content"]


def build_prompt(category: str, snippets: list[dict], count: int, existing: set[str]) -> str:
    snippet_text = "\n".join(
        f"- [{r.get('link','')[:60]}] {r.get('title','')} | {r.get('snippet','')[:120]}"
        for r in snippets[:40]
    )
    existing_list = ", ".join(sorted(existing)[:30]) + ("…" if len(existing) > 30 else "")
    priority_block = PRIORITY_FOCUS.get(category, "")

    return f"""You are a tool-website product manager. Your job is to identify high-traffic, high-intent calculator/tool ideas that people are searching for online.
{priority_block}

CATEGORY: {category}

RESEARCH SNIPPETS (from Google/Reddit/Quora):
{snippet_text if snippet_text else "(No snippets — use your knowledge of common searches in this category)"}

ALREADY BUILT (do NOT suggest these): {existing_list}

TASK: Generate exactly {count} NEW tool ideas for the '{category}' category. Each tool must:
1. Have a unique URL slug (kebab-case, e.g. "tip-calculator")
2. Target a specific high-volume search query (long-tail is fine)
3. Be realistically implementable as a simple web calculator/tool
4. NOT duplicate any already-built tool above

Return a valid JSON array. Each object must have ALL these fields:
{{
  "slug": "kebab-case-slug",
  "name": "Human Readable Name",
  "tagline": "One line — action verb, under 60 chars",
  "description": "2 sentences describing what the tool does and who it's for.",
  "metaTitle": "Primary Keyword – Secondary Keyword | Free Online Tool",
  "metaDescription": "160-char max. Include primary keyword, mention free, no signup, instant results.",
  "keywords": ["primary keyword", "long tail 1", "long tail 2", "long tail 3", "long tail 4"],
  "category": "{category.title()}",
  "icon": "single emoji",
  "faqs": [
    {{"question": "Q1?", "answer": "A1 (2 sentences max)"}},
    {{"question": "Q2?", "answer": "A2"}},
    {{"question": "Q3?", "answer": "A3"}}
  ],
  "relatedTools": ["existing-slug-1", "existing-slug-2"],
  "variants": [
    {{
      "variantSlug": "variant-slug-1",
      "metaTitle": "Specific Variant Title",
      "metaDescription": "160-char variant description",
      "keywords": ["variant keyword 1", "variant keyword 2", "variant keyword 3"],
      "defaultVariant": "variant-key",
      "headline": "1-2 sentence intro shown at top of this variant page."
    }},
    {{
      "variantSlug": "variant-slug-2",
      "metaTitle": "Another Variant Title",
      "metaDescription": "160-char variant description",
      "keywords": ["variant keyword 1", "variant keyword 2"],
      "defaultVariant": "variant-key-2",
      "headline": "1-2 sentence intro for this variant."
    }}
  ]
}}

IMPORTANT: Return ONLY the raw JSON array, no markdown fences, no explanation text.
"""


def parse_json_from_response(text: str) -> list[dict]:
    """Extract JSON array from GPT response, handling markdown fences."""
    text = text.strip()
    # Strip markdown fences if present
    text = re.sub(r"^```[a-z]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    text = text.strip()
    return json.loads(text)


def main():
    parser = argparse.ArgumentParser(description="Generate tool ideas via OpenAI")
    parser.add_argument("--category",    required=True, help="Category to generate tools for")
    parser.add_argument("--count",       type=int, default=5, help="Number of new tools to generate")
    parser.add_argument("--no-research", action="store_true", help="Skip research cache, use OpenAI knowledge only")
    parser.add_argument("--model",       default="gpt-4o-mini", help="OpenAI model to use")
    args = parser.parse_args()

    category = args.category.lower().strip()
    api_key  = load_openai_key()

    # ── Load research snippets ────────────────────────────────────────────────
    snippets: list[dict] = []
    if not args.no_research:
        cache_file = CACHE_DIR / f"{category}.json"
        if cache_file.exists():
            snippets = json.loads(cache_file.read_text())
            print(f"📂 Loaded {len(snippets)} research snippets from cache")
        else:
            print(f"⚠️  No research cache found for '{category}'. Run research.py first, or use --no-research.")
            print(f"   Continuing with OpenAI knowledge only…\n")

    # ── Load existing slugs ───────────────────────────────────────────────────
    existing = get_existing_slugs()
    print(f"🔍 {len(existing)} existing tools/slugs found — will avoid duplicates")
    print(f"🤖 Calling OpenAI ({args.model}) to generate {args.count} tool ideas for '{category}'…\n")

    # ── Call OpenAI ───────────────────────────────────────────────────────────
    prompt   = build_prompt(category, snippets, args.count, existing)
    response = call_openai(prompt, api_key, model=args.model)

    # ── Parse response ────────────────────────────────────────────────────────
    try:
        new_tools = parse_json_from_response(response)
    except json.JSONDecodeError as e:
        print(f"[ERROR] Failed to parse OpenAI response as JSON: {e}")
        print("Raw response:\n", response[:500])
        return

    # ── Deduplicate against existing ─────────────────────────────────────────
    added = []
    skipped = []
    for tool in new_tools:
        slug = tool.get("slug", "").strip()
        if not slug:
            skipped.append(tool)
            continue
        if slug in existing:
            print(f"  ⏭  Skipped duplicate: {slug}")
            skipped.append(tool)
            continue
        added.append(tool)
        existing.add(slug)  # prevent intra-batch duplicates

    # ── Merge into tasks.json ─────────────────────────────────────────────────
    current_tasks: list[dict] = []
    if TASKS_FILE.exists():
        current_tasks = json.loads(TASKS_FILE.read_text())

    current_slugs = {t.get("slug") for t in current_tasks}
    truly_new = [t for t in added if t.get("slug") not in current_slugs]
    current_tasks.extend(truly_new)

    TASKS_FILE.write_text(json.dumps(current_tasks, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'─' * 50}")
    print(f"✅ Added {len(truly_new)} new tool(s) to tasks.json")
    for t in truly_new:
        variants_count = len(t.get("variants", []))
        print(f"   • {t['slug']}  ({t.get('name','')} — {variants_count} variants)")
    if skipped:
        print(f"⏭  Skipped {len(skipped)} (duplicates or invalid)")
    total_variants = sum(len(t.get("variants", [])) for t in truly_new)
    print(f"\n🚀 {len(truly_new)} tools + {total_variants} variant pages ready to generate")
    print(f"   Next: python scripts/generate_tool.py")


if __name__ == "__main__":
    main()
