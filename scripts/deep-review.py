#!/usr/bin/env python3
"""
deep-review.py — Weekly deep thinking diagnostic for GetFastCalc tools.

Goals:
1. Identify tools that are low-quality, redundant, or not problem-solving.
2. Find high-potential tools missing variants, FAQs, or related tools.
3. Generate a report with actionable recommendations.

Usage:
  python scripts/deep-review.py

Output:
  scripts/deep-review-report.md
"""

import json
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"
REPORT_PATH = ROOT / "scripts" / "deep-review-report.md"

HIGH_VALUE_CATEGORIES = {"AI", "SEO", "Social", "Image", "File", "Quant", "Ecommerce", "ecommerce", "Developer", "Design"}
RED_OCEAN_CATEGORIES = {"Math", "Health", "Fitness", "Date & Time", "Converter"}


def load_all_metas() -> list[dict]:
    metas = []
    for d in REGISTRY_DIR.iterdir():
        if not d.is_dir() or d.name.startswith("_"):
            continue
        meta_path = d / "meta.json"
        if not meta_path.exists():
            continue
        try:
            metas.append(json.loads(meta_path.read_text()))
        except Exception:
            continue
    return metas


def analyze(metas: list[dict]) -> dict:
    total = len(metas)
    by_category: dict[str, list[dict]] = {}
    for m in metas:
        by_category.setdefault(m.get("category", "Unknown"), []).append(m)

    # Find low-quality / red-ocean tools
    red_ocean = []
    for m in metas:
        if m.get("category") in RED_OCEAN_CATEGORIES:
            # Basic calculators with very generic keywords and short descriptions
            desc = m.get("description", "")
            keywords = m.get("keywords", [])
            if len(desc) < 80 and len(keywords) <= 3:
                red_ocean.append(m)

    # Find high-value tools missing variants
    missing_variants = []
    for m in metas:
        if m.get("category") in HIGH_VALUE_CATEGORIES:
            variants = m.get("variants", [])
            if len(variants) < 2:
                missing_variants.append(m)

    # Find tools with weak FAQs (< 3 questions)
    weak_faqs = []
    for m in metas:
        if len(m.get("faqs", [])) < 3:
            weak_faqs.append(m)

    # Find tools with no related tools (orphans)
    orphans = []
    for m in metas:
        if not m.get("relatedTools"):
            orphans.append(m)

    # Find potential report/share generators (calculator + generator candidates)
    report_candidates = []
    for m in metas:
        if m.get("category") in {"Health", "Finance", "Ecommerce", "ecommerce", "Quant"}:
            if len(m.get("description", "")) > 100:
                report_candidates.append(m)

    return {
        "total": total,
        "by_category": by_category,
        "red_ocean": red_ocean[:20],
        "missing_variants": missing_variants[:20],
        "weak_faqs": weak_faqs[:20],
        "orphans": orphans[:20],
        "report_candidates": report_candidates[:10],
    }


def write_report(report: dict) -> None:
    lines = [
        "# Deep Review Report – GetFastCalc",
        "",
        f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        f"## Summary",
        "",
        f"- **Total tools**: {report['total']}",
    ]

    lines.append("- **By category**:")
    for cat, tools in sorted(report["by_category"].items(), key=lambda x: -len(x[1])):
        lines.append(f"  - {cat}: {len(tools)}")

    lines.extend([
        "",
        "## Red-ocean / low-quality tools (consider improving or removing)",
        "",
        "These tools are in saturated categories and have weak descriptions/keywords. Consider enhancing them with reports, examples, or variants.",
        "",
    ])
    for m in report["red_ocean"]:
        lines.append(f"- `{m['slug']}` ({m.get('category')}) — {m.get('name')}")

    lines.extend([
        "",
        "## High-value tools missing variants (priority for SEO expansion)",
        "",
    ])
    for m in report["missing_variants"]:
        lines.append(f"- `{m['slug']}` ({m.get('category')}) — {m.get('name')}")

    lines.extend([
        "",
        "## Tools with weak FAQs",
        "",
    ])
    for m in report["weak_faqs"]:
        lines.append(f"- `{m['slug']}` — {m.get('name')} (FAQs: {len(m.get('faqs', []))})")

    lines.extend([
        "",
        "## Orphan tools (no related tools)",
        "",
    ])
    for m in report["orphans"]:
        lines.append(f"- `{m['slug']}` — {m.get('name')}")

    lines.extend([
        "",
        "## Calculator + Generator candidates (add Download/Share/Report feature)",
        "",
        "These tools are good candidates for generating downloadable reports or shareable images.",
        "",
    ])
    for m in report["report_candidates"]:
        lines.append(f"- `{m['slug']}` ({m.get('category')}) — {m.get('name')}")

    lines.extend([
        "",
        "## Recommended next actions",
        "",
        "1. Add 2-5 variants to each high-value tool missing variants.",
        "2. Expand FAQs on weak-faq tools to 5+ questions.",
        "3. Link orphan tools to 3-5 related tools.",
        "4. Add report/share/download functionality to report candidates.",
        "5. Pause new red-ocean tools; focus on AI, SEO, Social, Image, File categories.",
        "",
    ])

    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"[deep-review] Wrote {REPORT_PATH}")


def main():
    metas = load_all_metas()
    report = analyze(metas)
    write_report(report)
    print(f"[deep-review] Analysed {report['total']} tools")
    print(f"  - red-ocean low-quality: {len(report['red_ocean'])}")
    print(f"  - high-value missing variants: {len(report['missing_variants'])}")
    print(f"  - weak FAQs: {len(report['weak_faqs'])}")
    print(f"  - orphans: {len(report['orphans'])}")
    print(f"  - report candidates: {len(report['report_candidates'])}")


if __name__ == "__main__":
    main()
