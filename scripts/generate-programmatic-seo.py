#!/usr/bin/env python3
"""
generate-programmatic-seo.py — Generate programmatic SEO param pages for ALL tools.

Approach:
  - Per-tool curated pages (high-value tools like BMI, compound-interest, etc.)
  - Category-level fallback templates for every other tool
  - Skips pages that already exist in meta.json

Each param page is stored in meta.json under "programmaticPages": [...]
The Next.js route app/tools/[category]/[slug]/[param]/page.tsx renders them.

Usage:
  python scripts/generate-programmatic-seo.py --dry-run
  python scripts/generate-programmatic-seo.py --slug bmi-calculator
  python scripts/generate-programmatic-seo.py           # all tools
"""

import json, os, argparse
from pathlib import Path

ROOT         = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"

# ── Per-tool curated pages (high-traffic, high-specificity) ───────────────────

def pages_bmi_calculator(meta: dict) -> list[dict]:
    pages = []
    for h in ["5ft0","5ft2","5ft4","5ft6","5ft8","5ft10","6ft0","6ft2",
              "160cm","165cm","170cm","175cm","180cm","185cm"]:
        hl = h.replace("-"," ")
        pages.append({
            "param": f"bmi-{h}",
            "metaTitle": f"BMI Calculator {hl.upper()} – Healthy Weight at {hl.upper()}",
            "metaDescription": f"Calculate your BMI if you are {hl}. See weight category, healthy range, and personalised advice. Free, instant.",
            "h1": f"BMI Calculator for {hl.upper()}",
            "description": f"Enter your weight to instantly get your BMI at {hl} and find out if you're in a healthy range.",
        })
    for w in [50,55,60,65,70,75,80,85,90,95,100]:
        pages.append({
            "param": f"bmi-{w}kg",
            "metaTitle": f"BMI for {w} kg – What Is My BMI at {w} kg?",
            "metaDescription": f"What is the BMI for someone who weighs {w} kg? Find your weight category instantly. Free BMI calculator.",
            "h1": f"BMI Calculator for {w} kg",
            "description": f"Calculate the BMI for a person weighing {w} kg at any height. Includes category and healthy weight range.",
        })
    return pages


def pages_ideal_weight_calculator(meta: dict) -> list[dict]:
    pages = []
    for h in ["5ft0","5ft2","5ft4","5ft6","5ft8","5ft10","6ft0"]:
        for g in ["female","male"]:
            hl = h.replace("-"," ")
            pages.append({
                "param": f"height-{h}-{g}",
                "metaTitle": f"Ideal Weight for {hl.upper()} {g.title()} – What Should I Weigh?",
                "metaDescription": f"What is the ideal weight for a {g} who is {hl}? Results from 4 medical formulas plus healthy BMI range. Free.",
                "h1": f"Ideal Weight for {hl.upper()} {g.title()}",
                "description": f"Find the ideal body weight for a {g} standing {hl} using Robinson, Devine, Miller, and Hamwi formulas.",
            })
    return pages


def pages_body_fat_calculator(meta: dict) -> list[dict]:
    pages = []
    for pct in [10,12,15,18,20,22,25,28,30,33,35]:
        for g in ["men","women"]:
            pages.append({
                "param": f"{pct}percent-{g}",
                "metaTitle": f"{pct}% Body Fat {g.title()} – Is {pct}% Body Fat Healthy?",
                "metaDescription": f"Is {pct}% body fat healthy for {g}? Learn which category it falls into and how to reach your goal. Free body fat calculator.",
                "h1": f"{pct}% Body Fat for {g.title()} – What Does It Mean?",
                "description": f"Find out if {pct}% body fat is healthy for {g}, which ACE category it falls into, and practical steps to improve.",
            })
    return pages


def pages_compound_interest_calculator(meta: dict) -> list[dict]:
    pages = []
    for amt in [1000, 5000, 10000, 25000, 50000, 100000]:
        for years in [5, 10, 20, 30]:
            for rate in [5, 7, 10]:
                pages.append({
                    "param": f"{amt}-{years}yr-{rate}pct",
                    "metaTitle": f"${amt:,} at {rate}% for {years} Years – Compound Interest",
                    "metaDescription": f"How much does ${amt:,} grow at {rate}% over {years} years? See final balance, interest earned, and year-by-year breakdown. Free.",
                    "h1": f"Compound Interest on ${amt:,} at {rate}% Over {years} Years",
                    "description": f"Calculate compound interest on ${amt:,} at {rate}% annual rate for {years} years, with a full year-by-year growth table.",
                })
    return pages


def pages_sleep_calculator(meta: dict) -> list[dict]:
    pages = []
    for h in ["5-00am","5-30am","6-00am","6-30am","7-00am","7-30am","8-00am","8-30am","9-00am"]:
        t = h.replace("-",":")
        pages.append({
            "param": f"wake-{h}",
            "metaTitle": f"Sleep Calculator – Wake Up at {t} Feeling Refreshed",
            "metaDescription": f"What time should you sleep to wake up at {t} after a full cycle? Free sleep calculator — find your ideal bedtime.",
            "h1": f"Best Bedtime to Wake Up at {t}",
            "description": f"Calculate the ideal time to fall asleep so you wake up at {t} at the end of a 90-minute sleep cycle feeling rested.",
        })
    for h in ["8-00pm","9-00pm","10-00pm","10-30pm","11-00pm","11-30pm","12-00am"]:
        t = h.replace("-",":")
        pages.append({
            "param": f"sleep-{h}",
            "metaTitle": f"Sleep Calculator – Bedtime at {t}",
            "metaDescription": f"If you go to bed at {t}, what time should you wake up? See ideal wake times based on complete sleep cycles. Free.",
            "h1": f"Wake-Up Times If You Go to Bed at {t}",
            "description": f"Find the best times to wake up after going to bed at {t} — timed to complete natural sleep cycles so you feel alert.",
        })
    return pages


def pages_tip_calculator(meta: dict) -> list[dict]:
    return [{
        "param": f"{pct}percent-tip",
        "metaTitle": f"{pct}% Tip Calculator – How Much Is a {pct}% Tip?",
        "metaDescription": f"Calculate a {pct}% tip instantly. Enter your bill to see the tip amount and total per person. Free {pct}% tip calculator.",
        "h1": f"{pct}% Tip Calculator",
        "description": f"Instantly calculate a {pct}% tip on any bill, with per-person split for any party size.",
    } for pct in [10, 15, 18, 20, 22, 25]]


def pages_percentage_calculator(meta: dict) -> list[dict]:
    return [{
        "param": f"what-is-{pct}percent-of-{num}",
        "metaTitle": f"What Is {pct}% of {num}? – Percentage Calculator",
        "metaDescription": f"What is {pct}% of {num}? The answer is {round(pct*num/100,2)}. Free percentage calculator for any number.",
        "h1": f"What Is {pct}% of {num}?",
        "description": f"{pct}% of {num} equals {round(pct*num/100,2)}. Use the calculator below to work out any percentage instantly.",
    } for pct in [10,15,20,25,30,40,50,75] for num in [100,200,500,1000,5000]]


def pages_running_pace_calculator(meta: dict) -> list[dict]:
    combos = [
        ("5k","20-minutes"),("5k","25-minutes"),("5k","30-minutes"),
        ("10k","45-minutes"),("10k","50-minutes"),("10k","60-minutes"),
        ("half-marathon","1h45"),("half-marathon","2h00"),("half-marathon","2h30"),
        ("marathon","3h30"),("marathon","4h00"),("marathon","4h30"),("marathon","5h00"),
    ]
    return [{
        "param": f"{dist}-{pace}",
        "metaTitle": f"{dist.replace('-',' ').title()} in {pace.replace('-',' ')} – Pace Calculator",
        "metaDescription": f"What pace to run a {dist.replace('-',' ')} in {pace.replace('-',' ')}? Get splits, km/h and mph, and finish time. Free.",
        "h1": f"Pace for a {dist.replace('-',' ').title()} in {pace.replace('-',' ')}",
        "description": f"Per-km and per-mile pace to finish a {dist.replace('-',' ')} in {pace.replace('-',' ')}, with full distance splits.",
    } for dist, pace in combos]


def pages_discount_calculator(meta: dict) -> list[dict]:
    return [{
        "param": f"{pct}percent-off-{amt}",
        "metaTitle": f"{pct}% Off ${amt} – Discount Calculator",
        "metaDescription": f"What is {pct}% off ${amt}? The sale price is ${amt - round(amt*pct/100,2):.2f}. Free discount calculator.",
        "h1": f"{pct}% Off ${amt}",
        "description": f"{pct}% off ${amt} gives a discount of ${round(amt*pct/100,2):.2f} and a final price of ${amt - round(amt*pct/100,2):.2f}.",
    } for pct in [10,15,20,25,30,40,50,60,70,75]
      for amt in [10,20,50,100,200,500,1000]]


def pages_profit_margin_calculator(meta: dict) -> list[dict]:
    return [{
        "param": f"{pct}percent-margin",
        "metaTitle": f"{pct}% Profit Margin – What Should I Charge?",
        "metaDescription": f"Calculate the selling price needed to achieve a {pct}% profit margin. Free profit margin calculator for any cost.",
        "h1": f"How to Price for a {pct}% Profit Margin",
        "description": f"Enter your cost to find the selling price that gives a {pct}% gross profit margin, plus markup percentage.",
    } for pct in [10,15,20,25,30,40,50,60,70,80]]


def pages_inflation_calculator(meta: dict) -> list[dict]:
    pages = []
    for amount in [100, 1000, 10000]:
        for start, end in [(2000,2024),(2010,2024),(2015,2024),(1990,2024),(1980,2024)]:
            pages.append({
                "param": f"{amount}-from-{start}-to-{end}",
                "metaTitle": f"${amount:,} in {start} = How Much in {end}? Inflation Calculator",
                "metaDescription": f"What is ${amount:,} from {start} worth in {end} dollars? See inflation-adjusted value with year-by-year breakdown. Free.",
                "h1": f"${amount:,} in {start} Adjusted for Inflation to {end}",
                "description": f"Find out what ${amount:,} from {start} is worth in today's {end} dollars, using historical CPI inflation data.",
            })
    return pages


# ── Category-level fallback generator ─────────────────────────────────────────
# For tools without curated pages — generates generic "online", "free", "how to" pages

CATEGORY_FALLBACK_PARAMS: dict[str, list[tuple[str,str,str]]] = {
    "Finance": [
        ("online-free",      "Online Free",        "Use {name} online for free — no signup required."),
        ("how-to-calculate", "How to Calculate",   "Step-by-step guide to using {name} with real examples."),
        ("for-beginners",    "For Beginners",      "Beginner-friendly guide to {name} with plain-English explanations."),
    ],
    "Health": [
        ("online-free",   "Online Free",  "Free online {name} — instant results, no signup."),
        ("metric-units",  "Metric",       "{name} using metric units (kg, cm, metres)."),
        ("imperial-units","Imperial",     "{name} using imperial units (lbs, feet, inches)."),
    ],
    "Fitness": [
        ("online-free",   "Online Free",  "Free online {name} — instant results, no signup."),
        ("for-women",     "Women",        "{name} for women with female-specific guidance."),
        ("for-men",       "Men",          "{name} for men with male-specific guidance."),
    ],
    "Math": [
        ("online-free",   "Online Free",  "Free online {name} — instant results."),
        ("with-steps",    "With Steps",   "{name} with step-by-step working shown."),
        ("for-students",  "For Students", "{name} for high school and college students."),
    ],
    "Developer": [
        ("online-free",   "Online Free",    "Free online {name} — no install required."),
        ("javascript",    "JavaScript",     "{name} reference for JavaScript developers."),
        ("python",        "Python",         "{name} reference for Python developers."),
    ],
    "Design": [
        ("online-free",   "Online Free",  "Free online {name} — instant results."),
        ("for-web",       "Web Design",   "{name} for web designers and front-end developers."),
    ],
    "Travel": [
        ("online-free",       "Online Free",      "Free online {name} — instant results."),
        ("international",     "International",    "{name} for international travel planning."),
        ("budget-travel",     "Budget Travel",    "{name} for budget-conscious travellers."),
    ],
    "Converter": [
        ("online-free",   "Online Free",  "Free online {name} — instant conversion, no signup."),
        ("metric",        "Metric",       "{name} for metric unit conversions."),
        ("imperial",      "Imperial",     "{name} for imperial unit conversions."),
    ],
    "Cooking": [
        ("online-free",    "Online Free",  "Free online {name} — instant results."),
        ("metric",         "Metric",       "{name} using metric measurements (g, ml, °C)."),
        ("imperial",       "Imperial",     "{name} using imperial measurements (oz, cups, °F)."),
    ],
    "Productivity": [
        ("online-free",   "Online Free",  "Free online {name} — instant results."),
        ("for-teams",     "For Teams",    "{name} for team and project management."),
    ],
}

DEFAULT_FALLBACK = [
    ("online-free",   "Online Free",  "Free online {name} — instant results, no signup."),
    ("how-to-use",    "How to Use",   "Step-by-step guide to getting the most from {name}."),
]


def generate_fallback_pages(meta: dict) -> list[dict]:
    name     = meta.get("name", meta["slug"].replace("-"," ").title())
    slug     = meta["slug"]
    category = meta.get("category", "")
    params   = CATEGORY_FALLBACK_PARAMS.get(category, DEFAULT_FALLBACK)
    pages    = []
    for param_suffix, label, desc_tpl in params:
        desc = desc_tpl.format(name=name)
        pages.append({
            "param": param_suffix,
            "metaTitle": f"{name} {label} – Free Online {name}",
            "metaDescription": f"{desc} {meta.get('metaDescription','')[:80]}",
            "h1": f"{name} – {label}",
            "description": desc,
        })
    return pages


# ── Dispatch table: slug → curated page generator ────────────────────────────
CURATED: dict[str, callable] = {
    "bmi-calculator":               pages_bmi_calculator,
    "ideal-weight-calculator":      pages_ideal_weight_calculator,
    "body-fat-calculator":          pages_body_fat_calculator,
    "compound-interest-calculator": pages_compound_interest_calculator,
    "sleep-calculator":             pages_sleep_calculator,
    "tip-calculator":               pages_tip_calculator,
    "percentage-calculator":        pages_percentage_calculator,
    "running-pace-calculator":      pages_running_pace_calculator,
    "discount-calculator":          pages_discount_calculator,
    "profit-margin-calculator":     pages_profit_margin_calculator,
    "inflation-calculator":         pages_inflation_calculator,
}


def get_pages_for_tool(meta: dict) -> list[dict]:
    slug = meta["slug"]
    if slug in CURATED:
        return CURATED[slug](meta)
    return generate_fallback_pages(meta)


# ── Core processing ───────────────────────────────────────────────────────────

def process_tool(slug: str, dry_run: bool) -> int:
    meta_path = REGISTRY_DIR / slug / "meta.json"
    if not meta_path.exists():
        return 0
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    all_pages  = get_pages_for_tool(meta)
    existing   = {p["param"] for p in meta.get("programmaticPages", [])}
    new_pages  = [p for p in all_pages if p["param"] not in existing]

    if not new_pages:
        return 0

    print(f"  {slug} → +{len(new_pages)} pages")
    for p in new_pages[:2]:
        print(f"    /{slug}/{p['param']}")
    if len(new_pages) > 2:
        print(f"    … and {len(new_pages)-2} more")

    if not dry_run:
        meta["programmaticPages"] = meta.get("programmaticPages", []) + new_pages
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
            f.write("\n")

    return len(new_pages)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug",    default="")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit",   type=int, default=0)
    args = parser.parse_args()

    if args.slug:
        targets = [args.slug]
    else:
        targets = sorted(
            d.name for d in REGISTRY_DIR.iterdir()
            if d.is_dir() and not d.name.startswith("_")
        )
        if args.limit:
            targets = targets[:args.limit]

    print(f"[generate-programmatic-seo] {len(targets)} tools | dry_run={args.dry_run}")
    total = 0
    for slug in targets:
        total += process_tool(slug, args.dry_run)

    print(f"\n✅ Done — {total} new programmatic pages across {len(targets)} tools")


if __name__ == "__main__":
    main()
