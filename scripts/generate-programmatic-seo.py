#!/usr/bin/env python3
"""
generate-programmatic-seo.py — Generate programmatic SEO param pages.

For high-traffic tools, creates a set of "param" pages like:
  /tools/health/bmi-calculator/5ft8-female
  /tools/finance/compound-interest-calculator/10000-dollars-10-years
  /tools/health/ideal-weight-calculator/5ft4-female

Each param page is stored in meta.json under "programmaticPages": [...]
The Next.js route app/tools/[category]/[slug]/[param]/page.tsx renders them.

Usage:
  python scripts/generate-programmatic-seo.py --dry-run
  python scripts/generate-programmatic-seo.py --slug bmi-calculator
  python scripts/generate-programmatic-seo.py           # all eligible tools
"""

import json, os, argparse
from pathlib import Path

ROOT         = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"

# ── Programmatic page definitions per tool ────────────────────────────────────
# Format: { slug: [ { "param": "...", "metaTitle": "...", "metaDescription": "...",
#                     "h1": "...", "description": "..." } ] }

PROGRAMMATIC_PAGES: dict[str, list[dict]] = {

    "bmi-calculator": [
        *[{
            "param": f"bmi-{h}",
            "metaTitle": f"BMI Calculator {h.replace('-',' ').title()} – Healthy Weight at {h.replace('-',' ').title()}",
            "metaDescription": f"Calculate your BMI if you are {h.replace('-',' ')}. See your weight category, healthy weight range, and personalised advice. Free, instant.",
            "h1": f"BMI Calculator for {h.replace('-',' ').title()}",
            "description": f"Enter your weight to instantly calculate your BMI at {h.replace('-',' ')} and find out if you're in a healthy range.",
        } for h in ["5ft0","5ft2","5ft4","5ft6","5ft8","5ft10","6ft0","6ft2",
                    "160cm","165cm","170cm","175cm","180cm","185cm"]],
        *[{
            "param": f"bmi-{w}kg",
            "metaTitle": f"BMI for {w} kg – What Is My BMI at {w} kg?",
            "metaDescription": f"What is the BMI for someone who weighs {w} kg? Find your weight category and healthy weight range instantly. Free BMI calculator.",
            "h1": f"BMI Calculator for {w} kg",
            "description": f"Calculate the BMI for a person weighing {w} kg at any height. See which BMI category applies and what a healthy weight looks like.",
        } for w in [50,55,60,65,70,75,80,85,90,95,100]],
    ],

    "ideal-weight-calculator": [
        *[{
            "param": f"height-{h}-{g}",
            "metaTitle": f"Ideal Weight for {h.replace('-',' ').title()} {g.title()} – What Should I Weigh?",
            "metaDescription": f"What is the ideal weight for a {g} who is {h.replace('-',' ')}? See results from 4 medical formulas plus the healthy BMI range. Free calculator.",
            "h1": f"Ideal Weight for {h.replace('-',' ').title()} {g.title()}",
            "description": f"Find the ideal body weight for a {g} standing {h.replace('-',' ')} using the Robinson, Devine, Miller, and Hamwi formulas.",
        } for h in ["5ft0","5ft2","5ft4","5ft6","5ft8","5ft10","6ft0"]
          for g in ["female","male"]],
    ],

    "body-fat-calculator": [
        *[{
            "param": f"{int(pct)}percent-{g}",
            "metaTitle": f"{int(pct)}% Body Fat {g.title()} – Is {int(pct)}% Body Fat Healthy?",
            "metaDescription": f"Is {int(pct)}% body fat healthy for a {g}? Find out which category it falls into, what it looks like, and how to reach your goal. Free calculator.",
            "h1": f"{int(pct)}% Body Fat for {g.title()}s – What Does It Mean?",
            "description": f"Find out if {int(pct)}% body fat is healthy for a {g}, which ACE category it falls into, and practical steps to reach your target.",
        } for pct in [10,12,15,18,20,22,25,28,30,33,35]
          for g in ["men","women"]],
    ],

    "compound-interest-calculator": [
        *[{
            "param": f"{amt}-{years}yr-{rate}pct",
            "metaTitle": f"${amt:,} at {rate}% for {years} Years – Compound Interest Calculator",
            "metaDescription": f"How much does ${amt:,} grow at {rate}% interest over {years} years? See the final balance, total interest earned, and year-by-year breakdown. Free calculator.",
            "h1": f"Compound Interest on ${amt:,} at {rate}% Over {years} Years",
            "description": f"Calculate the compound interest on ${amt:,} invested at {rate}% annual rate for {years} years, including a full year-by-year growth table.",
        } for amt in [1000, 5000, 10000, 25000, 50000, 100000]
          for years in [5, 10, 20, 30]
          for rate in [5, 7, 10]],
    ],

    "sleep-calculator": [
        *[{
            "param": f"wake-{h}",
            "metaTitle": f"Sleep Calculator – Wake Up at {h.replace('-',':')} Feeling Refreshed",
            "metaDescription": f"What time should you go to sleep to wake up at {h.replace('-',':')} after a full sleep cycle? Free sleep cycle calculator — find your ideal bedtime.",
            "h1": f"Best Bedtime to Wake Up at {h.replace('-',':')}",
            "description": f"Calculate the ideal time to fall asleep so you wake up at {h.replace('-',':')} at the end of a complete 90-minute sleep cycle, feeling alert and rested.",
        } for h in ["5-00am","5-30am","6-00am","6-30am","7-00am","7-30am",
                    "8-00am","8-30am","9-00am"]],
        *[{
            "param": f"sleep-{h}",
            "metaTitle": f"Sleep Calculator – Go to Bed at {h.replace('-',':')}",
            "metaDescription": f"If you go to bed at {h.replace('-',':')} what time should you wake up? See all ideal wake times based on complete sleep cycles. Free calculator.",
            "h1": f"Wake-Up Times If You Go to Bed at {h.replace('-',':')}",
            "description": f"Find the best times to wake up after going to bed at {h.replace('-',':')} — calculated to land at the end of a natural sleep cycle so you feel rested.",
        } for h in ["8-00pm","9-00pm","10-00pm","10-30pm","11-00pm","11-30pm","12-00am"]],
    ],

    "tip-calculator": [
        *[{
            "param": f"{int(pct)}percent-tip",
            "metaTitle": f"{int(pct)}% Tip Calculator – How Much Is a {int(pct)}% Tip?",
            "metaDescription": f"Calculate a {int(pct)}% tip quickly. Enter your bill amount to see the tip and total for any party size. Free {int(pct)}% tip calculator.",
            "h1": f"{int(pct)}% Tip Calculator",
            "description": f"Instantly calculate a {int(pct)}% tip on any restaurant bill. See the tip amount, total per person, and how the tip splits across your party.",
        } for pct in [10, 15, 18, 20, 22, 25]],
    ],

    "percentage-calculator": [
        *[{
            "param": f"what-is-{pct}percent-of-{num}",
            "metaTitle": f"What Is {pct}% of {num}? – Percentage Calculator",
            "metaDescription": f"What is {pct}% of {num}? The answer is {round(pct*num/100, 2)}. Use our free percentage calculator for any number instantly.",
            "h1": f"What Is {pct}% of {num}?",
            "description": f"{pct}% of {num} is {round(pct*num/100, 2)}. Use the calculator below to compute any percentage instantly.",
        } for pct in [10, 15, 20, 25, 30, 40, 50, 75]
          for num in [100, 200, 500, 1000, 5000]],
    ],

    "running-pace-calculator": [
        *[{
            "param": f"{dist}-{pace}",
            "metaTitle": f"{dist.replace('-',' ').title()} in {pace.replace('-',' ')} – Running Pace Calculator",
            "metaDescription": f"What pace do you need to run a {dist.replace('-',' ')} in {pace.replace('-',' ')}? Calculate splits, speed in km/h and mph, and finish time. Free pace calculator.",
            "h1": f"Pace Needed to Run a {dist.replace('-',' ').title()} in {pace.replace('-',' ')}",
            "description": f"Calculate the per-kilometre and per-mile pace required to complete a {dist.replace('-',' ')} in {pace.replace('-',' ')}, with full distance splits.",
        } for dist, pace in [
            ("5k", "20-minutes"), ("5k", "25-minutes"), ("5k", "30-minutes"),
            ("10k", "45-minutes"), ("10k", "50-minutes"), ("10k", "60-minutes"),
            ("half-marathon", "1h45"), ("half-marathon", "2h00"), ("half-marathon", "2h30"),
            ("marathon", "3h30"), ("marathon", "4h00"), ("marathon", "4h30"), ("marathon", "5h00"),
        ]],
    ],
}


def process_tool(slug: str, dry_run: bool) -> int:
    meta_path = REGISTRY_DIR / slug / "meta.json"
    if not meta_path.exists():
        print(f"  skip {slug} — meta.json not found")
        return 0

    pages = PROGRAMMATIC_PAGES.get(slug, [])
    if not pages:
        print(f"  skip {slug} — no programmatic pages defined")
        return 0

    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    existing = {p["param"] for p in meta.get("programmaticPages", [])}
    new_pages = [p for p in pages if p["param"] not in existing]

    if not new_pages:
        print(f"  skip {slug} — all {len(pages)} pages already exist")
        return 0

    print(f"  {slug} → +{len(new_pages)} programmatic pages")
    for p in new_pages[:3]:
        print(f"    /tools/.../{ slug }/{p['param']}")
    if len(new_pages) > 3:
        print(f"    … and {len(new_pages)-3} more")

    if not dry_run:
        meta["programmaticPages"] = meta.get("programmaticPages", []) + new_pages
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  ✅ wrote {len(new_pages)} pages → {slug}/meta.json")

    return len(new_pages)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug",    default="")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.slug:
        targets = [args.slug]
    else:
        targets = list(PROGRAMMATIC_PAGES.keys())

    print(f"[generate-programmatic-seo] {len(targets)} tools | dry_run={args.dry_run}")
    total = 0
    for slug in targets:
        total += process_tool(slug, args.dry_run)

    print(f"\n[generate-programmatic-seo] Done — {total} new programmatic pages")


if __name__ == "__main__":
    main()
