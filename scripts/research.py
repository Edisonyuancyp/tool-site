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

# ── Query templates — mix of Reddit, Quora, and general "how do I" patterns ──
QUERY_TEMPLATES = [
    'site:reddit.com "{category} calculator" OR "{category} tool" how',
    'site:reddit.com "need a {category} calculator" OR "looking for {category} tool"',
    'site:quora.com "best {category} calculator" OR "how to calculate {category}"',
    '"{category} calculator" "I wish" OR "why doesn\'t" OR "is there a way"',
    '"how to calculate {category}" OR "{category} formula" free tool online',
]


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

    queries = [t.replace("{category}", category) for t in QUERY_TEMPLATES[:num_queries]]

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
