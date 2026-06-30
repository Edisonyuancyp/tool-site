#!/usr/bin/env python3
"""
research.py — Scrape Google (via SerpAPI) for user pain points related to online tools.

Usage:
  python scripts/research.py --category "finance"
  python scripts/research.py --category "health" --queries 5 --results 10

Output:
  scripts/research_cache/<category>.json  — raw snippets for ai_generate.py
"""

import os
import json
import argparse
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request

CACHE_DIR = Path(__file__).parent / "research_cache"

# ── Default query templates ──────────────────────────────────────────────────
QUERY_TEMPLATES = [
    'site:reddit.com "{category} calculator" OR "{category} tool" how',
    'site:reddit.com "need a {category} calculator" OR "looking for {category} tool"',
    'site:quora.com "best {category} calculator" OR "how to calculate {category}"',
    '"{category} calculator" "I wish" OR "why doesn\'t" OR "is there a way"',
    '"how to calculate {category}" OR "{category} formula" free tool online',
]

# ── Priority category overrides — more targeted Reddit/forum queries ───────────
PRIORITY_QUERY_TEMPLATES: dict[str, list[str]] = {
    # E-commerce sellers (Shopify, Amazon, Etsy, dropshipping)
    "ecommerce": [
        'site:reddit.com (r/shopify OR r/amazonseller OR r/etsy OR r/dropship) "calculator" OR "spreadsheet" OR "tool"',
        'site:reddit.com "profit margin" OR "break even" OR "shipping cost" OR "ROAS" calculator ecommerce',
        'site:reddit.com "I need a tool" OR "is there a way to calculate" ecommerce OR shopify OR amazon seller',
        'site:reddit.com "pricing calculator" OR "landed cost" OR "customs duty" OR "FBA fee" calculator',
        '"ecommerce calculator" OR "shopify calculator" "I wish" OR "wish there was" OR "doesn\'t exist"',
    ],
    # Trading / quant finance
    "quant": [
        'site:reddit.com (r/algotrading OR r/quant OR r/stocks OR r/options OR r/Forex) "calculator" OR "tool" OR "spreadsheet"',
        'site:reddit.com "position size" OR "kelly criterion" OR "sharpe ratio" OR "drawdown" OR "backtesting" tool',
        'site:reddit.com "options calculator" OR "greeks" OR "implied volatility" OR "risk/reward" tool',
        'site:reddit.com "I need a" OR "looking for" trading OR quant calculator OR tool 2024 OR 2025',
        '"trading calculator" OR "quant tool" free online "I wish" OR "why isn\'t there"',
    ],
    # AI / prompt engineering tools
    "ai": [
        'site:reddit.com (r/ChatGPT OR r/ClaudeAI OR r/LocalLLaMA OR r/OpenAI) "token counter" OR "cost calculator" OR "prompt tool"',
        'site:reddit.com "prompt cost" OR "token cost" OR "context window" OR "prompt splitter" OR "prompt optimizer" tool',
        'site:reddit.com "how many tokens" OR "token limit" OR " Claude context" OR "GPT cost" calculator',
        '"AI prompt calculator" OR "LLM cost calculator" OR "prompt token counter" free online',
        '"prompt tool" OR "AI tool" "I wish" OR "doesn\'t exist" OR "looking for" site:reddit.com',
    ],
    # SEO / content marketing tools
    "seo": [
        'site:reddit.com (r/SEO OR r/juststart OR r/blogging) "calculator" OR "tool" OR "generator" OR "checker"',
        'site:reddit.com "title generator" OR "meta description" OR "schema generator" OR "keyword density" tool',
        'site:reddit.com "SEO tool" "I need" OR "looking for" OR "free" OR "doesn\'t exist"',
        '"SEO calculator" OR "slug generator" OR "canonical checker" OR "OpenGraph preview" free online',
        '"content optimization tool" OR "reading time calculator" OR "SEO score checker" free no signup',
    ],
    # Social media / caption counters
    "social": [
        'site:reddit.com (r/Twitter OR r/Instagram OR r/TikTokCringe OR r/YouTube) "character counter" OR "caption" OR "description" tool',
        'site:reddit.com "Twitter character limit" OR "Instagram caption length" OR "TikTok caption" OR "LinkedIn post" tool',
        '"character counter" OR "caption counter" "I wish" OR "looking for" site:reddit.com',
        '"social media character counter" OR "tweet length checker" OR "YouTube description tool" free online',
        '"X post counter" OR "Threads character counter" OR "Bluesky post counter" free tool',
    ],
    # Image tools
    "image": [
        'site:reddit.com (r/webdesign OR r/photography OR r/graphic_design) "image compressor" OR "cropper" OR "converter" OR "DPI" tool',
        'site:reddit.com "webp converter" OR "png transparent" OR "aspect ratio" OR "image size" calculator',
        '"image tool" OR "image compressor" OR "base64 image" "free online" site:reddit.com',
        '"resize image" OR "compress image online" OR "transparent png checker" free no signup',
        '"image dpi checker" OR "image aspect ratio calculator" OR "image cropper browser" free',
    ],
    # File / text / data tools
    "file": [
        'site:reddit.com (r/webdev OR r/programming OR r/excel) "json formatter" OR "csv cleaner" OR "regex tester" tool',
        'site:reddit.com "XML formatter" OR "YAML validator" OR "Markdown preview" OR "duplicate line remover"',
        '"developer tool" OR "text formatter" OR "json beautifier" "free online" site:reddit.com',
        '"regex tester online" OR "csv cleaner online" OR "html escape tool" free no signup',
        '"file format converter" OR "code formatter" OR "data cleaning tool" browser',
    ],
    # Design / creative tools
    "design": [
        'site:reddit.com (r/graphic_design OR r/UI_Design OR r/web_design OR r/figma) "tool" OR "calculator" OR "generator"',
        'site:reddit.com "color palette" OR "font pairing" OR "spacing" OR "contrast ratio" tool designer',
        'site:reddit.com "I wish there was a tool" OR "does anyone know a tool" design OR Figma OR Canva',
        'site:reddit.com "svg generator" OR "css generator" OR "gradient generator" OR "icon" tool free',
        '"design tool" OR "designer calculator" free online "I wish" OR "why doesn\'t" site:reddit.com',
    ],
    # Market research / data analytics
    "market": [
        'site:reddit.com "market research" OR "data analysis" tool OR calculator OR spreadsheet',
        'site:reddit.com "TAM calculator" OR "market size" OR "cohort analysis" OR "churn rate" tool',
        'site:reddit.com "pricing strategy" OR "price elasticity" OR "customer LTV" calculator',
        'site:reddit.com "I need a tool" OR "is there a free" market research OR analytics tool',
        '"market analysis calculator" OR "business metrics" free online tool site:reddit.com',
    ],
}


def load_key() -> str:
    key = os.environ.get("SERPAPI_KEY", "")
    if not key:
        env_file = Path(__file__).parent.parent / ".env.local"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("SERPAPI_KEY="):
                    key = line.split("=", 1)[1].strip()
    if not key:
        raise RuntimeError("SERPAPI_KEY not set. Add it to .env.local or set as env var.")
    return key


def serpapi_search(query: str, api_key: str, num: int = 10) -> list[dict]:
    """Call SerpAPI Google search, return list of {title, snippet, link}."""
    params = {
        "q": query,
        "api_key": api_key,
        "num": num,
        "engine": "google",
        "gl": "us",
        "hl": "en",
    }
    url = "https://serpapi.com/search.json?" + urlencode(params)
    req = Request(url, headers={"User-Agent": "toolcalc-pipeline/1.0"})
    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [WARN] SerpAPI request failed: {e}")
        return []

    results = []
    for r in data.get("organic_results", []):
        results.append({
            "title":   r.get("title", ""),
            "snippet": r.get("snippet", ""),
            "link":    r.get("link", ""),
        })
    return results


def research_category(category: str, num_queries: int, results_per_query: int) -> list[dict]:
    api_key = load_key()
    all_results: list[dict] = []
    seen_links: set[str] = set()

    # Use priority templates if defined for this category, else fall back to defaults
    templates = PRIORITY_QUERY_TEMPLATES.get(category, QUERY_TEMPLATES)
    if category in PRIORITY_QUERY_TEMPLATES:
        print(f"  🎯 Using priority query templates for '{category}'")
    queries = [t.replace("{category}", category) for t in templates[:num_queries]]

    for i, query in enumerate(queries):
        print(f"  [{i+1}/{len(queries)}] Searching: {query[:80]}…")
        results = serpapi_search(query, api_key, num=results_per_query)
        for r in results:
            if r["link"] not in seen_links:
                seen_links.add(r["link"])
                r["query"] = query
                all_results.append(r)
        if i < len(queries) - 1:
            time.sleep(1)  # polite delay

    print(f"  → {len(all_results)} unique snippets collected")
    return all_results


def main():
    parser = argparse.ArgumentParser(description="Research user pain points via SerpAPI")
    parser.add_argument("--category", required=True, help="Tool category, e.g. 'finance', 'health'")
    parser.add_argument("--queries",  type=int, default=4, help="Number of search queries to run (max 5)")
    parser.add_argument("--results",  type=int, default=8, help="Results per query")
    args = parser.parse_args()

    category = args.category.lower().strip()
    print(f"\n🔍 Researching pain points for category: '{category}'\n")

    snippets = research_category(category, min(args.queries, 5), args.results)

    CACHE_DIR.mkdir(exist_ok=True)
    out_path = CACHE_DIR / f"{category}.json"
    out_path.write_text(json.dumps(snippets, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ Saved {len(snippets)} snippets → {out_path.relative_to(Path(__file__).parent.parent)}")
    print(f"   Next: python scripts/ai_generate.py --category {category}")


if __name__ == "__main__":
    main()
