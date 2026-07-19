#!/usr/bin/env python3
"""
batch-complete-tools.py — Auto-complete stub tools in batches.

Usage:
    python3 scripts/batch-complete-tools.py            # complete all flagged stub tools
    python3 scripts/batch-complete-tools.py --limit 5  # process first 5 only
    python3 scripts/batch-complete-tools.py --category SEO  # only SEO tools
    python3 scripts/batch-complete-tools.py --dry-run    # preview only
"""

import argparse
import sys
from pathlib import Path

# Import agent functions directly
sys.path.insert(0, str(Path(__file__).resolve().parent))
from agent import cmd_find_placeholder_tools, cmd_complete_tool


def main() -> int:
    parser = argparse.ArgumentParser(description="Batch-complete stub tools")
    parser.add_argument("--limit", type=int, default=0, help="Max tools to process (0 = all)")
    parser.add_argument("--offset", type=int, default=0, help="Skip first N tools")
    parser.add_argument("--category", type=str, default="", help="Filter by category")
    parser.add_argument("--dry-run", action="store_true", help="Preview only")
    parser.add_argument("--exclude", type=str, default="_template", help="Comma-separated slugs to skip")
    args = parser.parse_args()

    exclude = {s.strip() for s in args.exclude.split(",") if s.strip()}
    flagged = cmd_find_placeholder_tools({"limit": 200})
    tools = flagged.get("flagged", [])

    if args.category:
        tools = [t for t in tools if t.get("category") == args.category]

    tools = [t for t in tools if t.get("slug") not in exclude]

    if args.offset:
        tools = tools[args.offset:]
    if args.limit:
        tools = tools[:args.limit]

    total = len(tools)
    print(f"[batch] Found {total} stub tool(s) to process")

    success = 0
    failed = 0
    skipped = 0
    for idx, tool in enumerate(tools, 1):
        slug = tool["slug"]
        name = tool["name"]
        category = tool.get("category", "")
        print(f"\n[batch] {idx}/{total}: {slug} ({name}) [{category}]")
        try:
            result = cmd_complete_tool({"slug": slug, "dry_run": args.dry_run})
            if result.get("status") == "ok":
                print(f"  ✅ {result.get('message', 'OK')}")
                success += 1
            else:
                print(f"  ❌ {result.get('error', 'Failed')}")
                failed += 1
        except Exception as e:
            print(f"  ❌ Exception: {e}")
            failed += 1

    print(f"\n[batch] Done — success: {success}, failed: {failed}, total: {total}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
