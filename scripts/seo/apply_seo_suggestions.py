#!/usr/bin/env python3
"""
apply_seo_suggestions.py
Read optimization_suggestions.json and automatically apply the chosen AI
suggestions to the site's meta.json files.

Usage:
  python apply_seo_suggestions.py              # apply first suggestion to all
  python apply_seo_suggestions.py --dry-run    # preview changes without writing
  python apply_seo_suggestions.py --choice 2     # apply suggestion #2 (1-based)
  python apply_seo_suggestions.py --interactive # ask for each URL
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Optional, Union


ROOT = Path(__file__).resolve().parent.parent.parent
REGISTRY_DIR = ROOT / "tools-registry"
SUGGESTIONS_FILE = Path(__file__).resolve().parent / "optimization_suggestions.json"


def url_to_slug_and_variant(url: str) -> tuple[Optional[str], Optional[str]]:
    """
    Extract the registry slug/variant from a canonical URL.
    Returns (base_slug, variant_slug) or (None, None) if not a registry tool URL.
    """
    # Match both /tools/<category>/<slug> and /<locale>/tools/<slug>
    m = re.match(r"https?://[^/]+(?:/\w{2})?/tools/(?:[^/]+/)?([^/]+)/?", url)
    if not m:
        return None, None
    tail = m.group(1)

    # Check if tail is a base slug or a variant slug
    base_meta = REGISTRY_DIR / tail / "meta.json"
    if base_meta.exists():
        return tail, None

    # Try to find a variant matching the tail
    for meta_path in REGISTRY_DIR.rglob("meta.json"):
        if not meta_path.parent.is_dir():
            continue
        data = json.loads(meta_path.read_text(encoding="utf-8"))
        for variant in data.get("variants", []):
            if variant.get("variantSlug") == tail:
                return meta_path.parent.name, tail
    return None, None


def apply_suggestion(meta_path: Path, base_slug: Optional[str], variant_slug: Optional[str],
                     suggestion: dict) -> dict:
    """Apply one suggestion to the correct meta.json and return a change summary."""
    data = json.loads(meta_path.read_text(encoding="utf-8"))
    old_title = data.get("metaTitle", "")
    old_desc = data.get("metaDescription", "")

    if variant_slug:
        for variant in data.get("variants", []):
            if variant.get("variantSlug") == variant_slug:
                old_title = variant.get("metaTitle", "")
                old_desc = variant.get("metaDescription", "")
                variant["metaTitle"] = suggestion["new_title"]
                variant["metaDescription"] = suggestion["new_description"]
                break
    else:
        data["metaTitle"] = suggestion["new_title"]
        data["metaDescription"] = suggestion["new_description"]

    meta_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    return {
        "file": str(meta_path.relative_to(ROOT)),
        "variant": variant_slug,
        "old_title": old_title,
        "new_title": suggestion["new_title"],
        "old_description": old_desc,
        "new_description": suggestion["new_description"],
    }


def choose_suggestion(suggestions: list, choice: int) -> dict:
    """Return the chosen suggestion (1-based index)."""
    if not 1 <= choice <= len(suggestions):
        raise ValueError(f"Invalid suggestion choice {choice}. Available: 1-{len(suggestions)}")
    return suggestions[choice - 1]


# Patterns that historically produced spammy / clickbait titles and descriptions.
_SPAMMY_PATTERNS = [
    r"\b202[0-9]\b",  # any year like 2026, 2027
    r"\bTry now!",
    r"\bStart now!",
    r"\bBoost Your\b.*\bInstantly\b",
    r"\bMaximize\b.*\bInstantly\b",
    r"\bUnlock\b.*\bInstantly\b",
    r"\bDiscover\b.*\bInstantly\b",
    r"\bFree & Instant\b",
]
_SPAMMY_RE = re.compile("|".join(_SPAMMY_PATTERNS), re.IGNORECASE)


def is_spammy_suggestion(suggestion: dict) -> bool:
    """Return True if the suggestion contains low-quality clickbait patterns."""
    title = suggestion.get("new_title", "")
    desc = suggestion.get("new_description", "")
    return bool(_SPAMMY_RE.search(title)) or bool(_SPAMMY_RE.search(desc))


def main() -> int:
    parser = argparse.ArgumentParser(description="Apply AI SEO suggestions to registry meta.json files")
    parser.add_argument("--choice", type=int, default=1, help="Suggestion index to apply (1-based, default 1)")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing files")
    parser.add_argument("--interactive", action="store_true", help="Ask for each URL")
    args = parser.parse_args()

    if not SUGGESTIONS_FILE.exists():
        print(f"[apply] Suggestions file not found: {SUGGESTIONS_FILE}")
        print("[apply] Run analyze_seo.py first.")
        return 1

    suggestions = json.loads(SUGGESTIONS_FILE.read_text(encoding="utf-8"))
    if not suggestions:
        print("[apply] No suggestions to apply.")
        return 0

    applied: list[dict[str, Any]] = []
    skipped: list[dict[str, str]] = []

    for item in suggestions:
        url = item["url"]
        base_slug, variant_slug = url_to_slug_and_variant(url)
        if not base_slug:
            skipped.append({"url": url, "reason": "Could not map URL to a registry tool"})
            continue

        meta_path = REGISTRY_DIR / base_slug / "meta.json"
        if not meta_path.exists():
            skipped.append({"url": url, "reason": f"meta.json not found: {meta_path}"})
            continue

        if args.interactive:
            print(f"\nURL: {url}")
            print(f"Current title: {item['current_title']}")
            for i, s in enumerate(item["suggestions"], 1):
                print(f"  {i}. {s['new_title']}")
                print(f"     {s['new_description']}")
            while True:
                try:
                    choice = input("Apply which? (1-3, 0=skip): ").strip()
                    choice = int(choice)
                    if choice == 0:
                        skipped.append({"url": url, "reason": "Skipped by user"})
                        break
                    if 1 <= choice <= len(item["suggestions"]):
                        suggestion = choose_suggestion(item["suggestions"], choice)
                        if is_spammy_suggestion(suggestion):
                            print("Rejected: suggestion looks spammy/clickbait. Pick another or 0 to skip.")
                            continue
                        break
                except ValueError:
                    pass
                print("Invalid input. Enter 1-3 or 0.")
            if choice == 0:
                continue
        else:
            suggestion = choose_suggestion(item["suggestions"], args.choice)

        if is_spammy_suggestion(suggestion):
            skipped.append({"url": url, "reason": "Suggestion rejected as spammy/clickbait"})
            continue

        if args.dry_run:
            print(f"[dry-run] Would update {url}")
            print(f"  title: {suggestion['new_title']}")
            print(f"  desc:  {suggestion['new_description']}")
            applied.append({"url": url, "file": str(meta_path.relative_to(ROOT)), "variant": variant_slug,
                            "new_title": suggestion["new_title"], "new_description": suggestion["new_description"]})
            continue

        summary = apply_suggestion(meta_path, base_slug, variant_slug, suggestion)
        applied.append({"url": url, **summary})
        print(f"[apply] Updated {url}")

    print(f"\n[apply] {len(applied)} applied, {len(skipped)} skipped.")

    if skipped:
        print("\nSkipped:")
        for s in skipped:
            print(f"  - {s['url']}: {s['reason']}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
