#!/usr/bin/env python3
"""
generate-variants.py — Batch-generate variant pages for tools that have none.

For each tool without variants, look up its category and apply a set of
pre-defined variant templates (gender, unit-system, country, age group, etc.)
that are proven to generate high-volume long-tail search traffic.

Then optionally call Claude to write custom metaTitle / metaDescription /
keywords / headline for each variant.

Usage:
  python scripts/generate-variants.py --dry-run          # preview only
  python scripts/generate-variants.py --limit 10         # process 10 tools
  python scripts/generate-variants.py --slug discount-calculator
  python scripts/generate-variants.py                    # all missing-variant tools

Environment:
  CLAUDE_API_KEY   — optional; if missing, uses template-based fallback copy
"""

import json, os, sys, argparse, time, urllib.request, urllib.error
from pathlib import Path
from typing import Optional

ROOT         = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"
CLAUDE_API_KEY  = os.environ.get("CLAUDE_API_KEY", "")
CLAUDE_MODEL    = "claude-3-5-haiku-20241022"
CLAUDE_API_URL  = "https://api.anthropic.com/v1/messages"

# ── Variant templates by category ─────────────────────────────────────────────
# Each entry: (variantSlug_suffix, dimension_label, hint_for_claude)
CATEGORY_VARIANTS: dict[str, list[tuple[str,str,str]]] = {
    "Finance": [
        ("for-students",   "Students",        "college students managing tight budgets"),
        ("for-business",   "Business",        "small business owners and freelancers"),
        ("uk",             "UK",              "users in the United Kingdom using GBP"),
        ("canada",         "Canada",          "Canadian users using CAD"),
        ("australia",      "Australia",       "Australian users using AUD"),
    ],
    "Health": [
        ("for-women",      "Women",           "women and female-specific health metrics"),
        ("for-men",        "Men",             "men and male-specific health metrics"),
        ("for-seniors",    "Seniors",         "adults over 60 years old"),
        ("imperial",       "Imperial Units",  "users who prefer pounds, feet, and inches"),
        ("metric",         "Metric Units",    "users who prefer kg and cm"),
    ],
    "Fitness": [
        ("for-women",      "Women",           "women's fitness goals and metrics"),
        ("for-men",        "Men",             "men's fitness goals and metrics"),
        ("for-beginners",  "Beginners",       "people new to fitness and exercise"),
        ("imperial",       "Imperial Units",  "users who prefer pounds and feet"),
    ],
    "Math": [
        ("online",         "Online",          "students looking for a free online tool"),
        ("with-steps",     "Step by Step",    "students who need to see working steps"),
        ("for-students",   "Students",        "high school and college students"),
    ],
    "ecommerce": [
        ("shopify",        "Shopify",         "Shopify store owners"),
        ("amazon",         "Amazon FBA",      "Amazon FBA sellers"),
        ("etsy",           "Etsy",            "Etsy sellers and handmade goods creators"),
        ("for-dropshipping","Dropshipping",   "dropshipping business owners"),
    ],
    "Quant": [
        ("forex",          "Forex",           "forex / currency traders"),
        ("crypto",         "Crypto",          "cryptocurrency traders"),
        ("stocks",         "Stocks",          "stock market investors"),
        ("options",        "Options",         "options traders"),
    ],
    "Developer": [
        ("online",         "Online",          "developers looking for a free online tool"),
        ("javascript",     "JavaScript",      "JavaScript developers"),
        ("python",         "Python",          "Python developers"),
    ],
    "Travel": [
        ("international",  "International",   "international travelers"),
        ("budget",         "Budget Travel",   "budget-conscious backpackers"),
        ("business",       "Business Travel", "business travelers"),
    ],
    "Text": [
        ("online",         "Online",          "users looking for a free online tool"),
        ("for-seo",        "SEO",             "SEO professionals and content marketers"),
        ("for-students",   "Students",        "students writing essays and papers"),
    ],
    "Design": [
        ("online",         "Online",          "designers looking for a free online tool"),
        ("free",           "Free",            "designers looking for a completely free tool"),
        ("for-web",        "Web Design",      "web designers and front-end developers"),
    ],
    "Content": [
        ("online",         "Online",          "content creators and bloggers"),
        ("free",           "Free",            "users looking for a completely free tool"),
        ("for-bloggers",   "Bloggers",        "bloggers and content writers"),
    ],
}

# Fallback for categories not listed above
DEFAULT_VARIANTS = [
    ("online",       "Online",      "users looking for a free online tool"),
    ("free",         "Free",        "users wanting a completely free tool"),
    ("for-students", "Students",    "students and educators"),
]


def get_templates(category: str) -> list[tuple[str,str,str]]:
    return CATEGORY_VARIANTS.get(category, DEFAULT_VARIANTS)


# ── Claude call ───────────────────────────────────────────────────────────────
def call_claude(prompt: str) -> Optional[dict]:
    if not CLAUDE_API_KEY:
        return None
    payload = json.dumps({
        "model": CLAUDE_MODEL,
        "max_tokens": 800,
        "system": "You write concise, keyword-rich SEO metadata for online calculator tools. Output JSON only. No markdown fences.",
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    req = urllib.request.Request(
        CLAUDE_API_URL, data=payload,
        headers={"Content-Type":"application/json","x-api-key":CLAUDE_API_KEY,"anthropic-version":"2023-06-01"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())
    except Exception as e:
        print(f"    [Claude error] {e}")
        return None
    raw = data.get("content",[{}])[0].get("text","").strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1][4:] if parts[1].startswith("json") else parts[1]
    try:
        return json.loads(raw.strip())
    except:
        return None


def make_variant_claude(meta: dict, suffix: str, label: str, hint: str) -> dict:
    name = meta["name"]
    slug = meta["slug"]
    variant_slug = f"{slug}-{suffix}"
    prompt = f"""Generate SEO metadata for a variant page of the tool "{name}".

Variant audience: {hint}
Variant page URL slug: {variant_slug}

Return JSON with exactly these keys:
{{
  "metaTitle": "...",          // 50-60 chars, includes variant keyword
  "metaDescription": "...",    // 140-155 chars, action-oriented
  "keywords": ["...", "...", "...", "...", "..."],  // 5 long-tail keywords
  "headline": "..."            // 1 sentence hero subtitle shown on page (20-30 words)
}}"""
    result = call_claude(prompt)
    if result and all(k in result for k in ("metaTitle","metaDescription","keywords","headline")):
        return {
            "variantSlug": variant_slug,
            "metaTitle": result["metaTitle"],
            "metaDescription": result["metaDescription"],
            "keywords": result["keywords"][:6],
            "headline": result["headline"],
        }
    # Fallback: template-based
    return make_variant_template(meta, suffix, label, hint)


def make_variant_template(meta: dict, suffix: str, label: str, hint: str) -> dict:
    name  = meta["name"]
    slug  = meta["slug"]
    desc  = meta.get("description", "")[:80]
    variant_slug = f"{slug}-{suffix}"
    return {
        "variantSlug": variant_slug,
        "metaTitle": f"{name} for {label} – Free Online {name}",
        "metaDescription": f"Free {name.lower()} for {hint}. {desc} No signup required.",
        "keywords": [
            f"{name.lower()} for {label.lower()}",
            f"{label.lower()} {name.lower()}",
            f"free {name.lower()} {label.lower()}",
            f"{name.lower()} {suffix.replace('-',' ')}",
            f"online {name.lower()} {label.lower()}",
        ],
        "headline": f"{name} optimised for {hint}. Free, instant, no signup required.",
    }


# ── Main ──────────────────────────────────────────────────────────────────────
def process_tool(slug: str, use_claude: bool, dry_run: bool) -> int:
    meta_path = REGISTRY_DIR / slug / "meta.json"
    if not meta_path.exists():
        return 0
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    if meta.get("variants"):
        print(f"  skip {slug} — already has {len(meta['variants'])} variant(s)")
        return 0

    category  = meta.get("category", "")
    templates = get_templates(category)

    print(f"  {slug} [{category}] → generating {len(templates)} variants …")
    new_variants = []
    for suffix, label, hint in templates:
        if use_claude:
            v = make_variant_claude(meta, suffix, label, hint)
            time.sleep(0.4)
        else:
            v = make_variant_template(meta, suffix, label, hint)
        print(f"    + {v['variantSlug']}")
        new_variants.append(v)

    if not dry_run:
        meta["variants"] = new_variants
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  ✅ wrote {len(new_variants)} variants → {slug}/meta.json")
    else:
        print(f"  [dry-run] would write {len(new_variants)} variants to {slug}/meta.json")

    return len(new_variants)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug",    default="")
    parser.add_argument("--limit",   type=int, default=0)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-claude", action="store_true", help="Skip Claude, use template fallback")
    args = parser.parse_args()

    use_claude = bool(CLAUDE_API_KEY) and not args.no_claude
    if use_claude:
        print(f"[generate-variants] Using Claude ({CLAUDE_MODEL}) for metadata")
    else:
        print("[generate-variants] Using template fallback (no Claude key or --no-claude)")

    if args.slug:
        targets = [args.slug]
    else:
        targets = sorted(
            d.name for d in REGISTRY_DIR.iterdir()
            if d.is_dir() and not d.name.startswith("_")
        )
        # filter to only those without variants
        def needs_variants(slug):
            p = REGISTRY_DIR / slug / "meta.json"
            if not p.exists(): return False
            try:
                m = json.loads(p.read_text())
                return not m.get("variants")
            except:
                return False
        targets = [s for s in targets if needs_variants(s)]
        if args.limit:
            targets = targets[:args.limit]

    print(f"[generate-variants] Processing {len(targets)} tool(s) | dry_run={args.dry_run}")
    total = 0
    for slug in targets:
        total += process_tool(slug, use_claude, args.dry_run)

    print(f"\n[generate-variants] Done — {total} new variant pages generated across {len(targets)} tools")


if __name__ == "__main__":
    main()
