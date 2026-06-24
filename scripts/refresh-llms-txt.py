#!/usr/bin/env python3
"""
refresh-llms-txt.py — Regenerate public/llms.txt every Thursday with the latest
tool list so AI crawlers always see the current catalog.

Usage:
  python3 scripts/refresh-llms-txt.py
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"
OUTPUT = ROOT / "public" / "llms.txt"

CATEGORY_PREFIX = {
    "Math": "calc",
    "Health": "calc",
    "Crypto": "calc",
    "Finance": "finance",
    "Business": "finance",
    "Design": "design",
    "Generators": "design",
    "Developer": "dev",
    "Security": "dev",
    "Text": "content",
    "Content": "content",
    "Date & Time": "time",
    "Quant": "quant",
}


def tool_url(tool: dict) -> str:
    slug = tool.get("slug", "")
    category = tool.get("category", "")
    prefix = CATEGORY_PREFIX.get(category)
    if prefix:
        return f"https://getfastcalc.com/tools/{prefix}/{slug}"
    return f"https://getfastcalc.com/tools/{slug}"


def load_tools() -> list[dict]:
    tools = []
    if not REGISTRY_DIR.exists():
        print("[ERROR] tools-registry not found")
        sys.exit(1)

    for d in sorted(REGISTRY_DIR.iterdir()):
        meta_path = d / "meta.json"
        if not d.is_dir() or d.name.startswith("_") or not meta_path.exists():
            continue
        try:
            with open(meta_path, encoding="utf-8") as f:
                meta = json.load(f)
            tools.append(meta)
        except Exception as exc:
            print(f"  [WARN] Could not read {meta_path}: {exc}")
    return tools


def build_llms_txt(tools: list[dict]) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    # Group by category
    by_category: dict[str, list[dict]] = {}
    for tool in tools:
        cat = tool.get("category", "Other")
        by_category.setdefault(cat, []).append(tool)

    lines = [
        "# GetFastCalc — Free Online Calculators & Tools",
        "",
        f"> AI-friendly site overview. Last updated: {today}. Site: https://getfastcalc.com",
        "",
        "GetFastCalc is a free, no-signup collection of online calculators and small utilities for everyday problems.",
        "Coverage: math, finance, health, developer tools, design, date & time, quant/trading, and text utilities.",
        "",
        "## Popular tools",
        "",
    ]

    popular = ["percentage-calculator", "bmi-calculator", "compound-interest-calculator",
               "tax-calculator", "tip-calculator", "loan-calculator", "age-calculator"]
    for slug in popular:
        for tool in tools:
            if tool.get("slug") == slug:
                lines.append(f"- {tool['name']}: {tool_url(tool)} — {tool.get('tagline', '')}")
                break

    lines += ["", "## All tools by category", ""]
    for cat in sorted(by_category.keys()):
        lines.append(f"### {cat}")
        for tool in by_category[cat]:
            lines.append(f"- {tool.get('name', '')}: {tool_url(tool)} — {tool.get('tagline', '')}")
        lines.append("")

    lines += [
        "## Sitemap",
        "- Home: https://getfastcalc.com/",
        "- Sitemap: https://getfastcalc.com/sitemap.xml",
        "- robots.txt: https://getfastcalc.com/robots.txt",
        "",
        "## Notes for AI crawlers",
        "- Every tool page includes a built-in calculator and a detailed usage guide written for humans.",
        "- Tools are free, require no signup, and run entirely in the browser.",
    ]

    return "\n".join(lines) + "\n"


def main():
    tools = load_tools()
    print(f"[refresh-llms-txt] Loaded {len(tools)} tools")

    content = build_llms_txt(tools)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[refresh-llms-txt] Written {len(content)} chars to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
