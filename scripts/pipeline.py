#!/usr/bin/env python3
"""
pipeline.py — One-command auto-growth pipeline.

Runs: research → ai_generate → generate_tool → git add/commit/push

Usage:
  python scripts/pipeline.py --category "finance" --count 5
  python scripts/pipeline.py --category "health" --count 3 --no-research --no-push
  python scripts/pipeline.py --category "developer" --count 4 --dry-run

Flags:
  --category      Tool category to target (required)
  --count         Number of new tools to generate (default: 5)
  --no-research   Skip SerpAPI research, use OpenAI knowledge only
  --no-push       Stop after generate_tool, don't git push
  --dry-run       Preview everything, write no files, no push
  --model         OpenAI model (default: gpt-4o-mini)
"""

import argparse
import subprocess
import sys
import json
from pathlib import Path

SCRIPTS_DIR = Path(__file__).parent
ROOT        = SCRIPTS_DIR.parent
TASKS_FILE  = SCRIPTS_DIR / "tasks.json"


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    print(f"\n$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=ROOT)
    if check and result.returncode != 0:
        print(f"\n[ERROR] Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    return result


def count_tasks_before() -> int:
    if not TASKS_FILE.exists():
        return 0
    return len(json.loads(TASKS_FILE.read_text()))


def main():
    parser = argparse.ArgumentParser(description="Auto-growth pipeline: research → generate → deploy")
    parser.add_argument("--category",    required=True, help="Tool category, e.g. 'finance', 'health'")
    parser.add_argument("--count",       type=int, default=5,          help="Number of new tools")
    parser.add_argument("--no-research", action="store_true",          help="Skip SerpAPI research step")
    parser.add_argument("--no-push",     action="store_true",          help="Don't git push at the end")
    parser.add_argument("--dry-run",     action="store_true",          help="Preview only, no files written")
    parser.add_argument("--model",       default="gpt-4o-mini",        help="OpenAI model")
    args = parser.parse_args()

    python = sys.executable
    category = args.category.lower().strip()

    print(f"\n{'═' * 60}")
    print(f"🏭  AUTO-GROWTH PIPELINE")
    print(f"    Category : {category}")
    print(f"    New tools: {args.count}")
    print(f"    Model    : {args.model}")
    print(f"    Dry-run  : {args.dry_run}")
    print(f"{'═' * 60}")

    tasks_before = count_tasks_before()

    # ── Step 1: Research ──────────────────────────────────────────────────────
    if not args.no_research and not args.dry_run:
        print(f"\n{'─' * 60}")
        print(f"STEP 1/3 — Research (SerpAPI)")
        print(f"{'─' * 60}")
        run([python, str(SCRIPTS_DIR / "research.py"), "--category", category])
    else:
        print(f"\nSTEP 1/3 — Research skipped ({'dry-run' if args.dry_run else '--no-research'})")

    # ── Step 2: AI Generate ───────────────────────────────────────────────────
    print(f"\n{'─' * 60}")
    print(f"STEP 2/3 — AI Generate (OpenAI {args.model})")
    print(f"{'─' * 60}")

    ai_cmd = [
        python, str(SCRIPTS_DIR / "ai_generate.py"),
        "--category", category,
        "--count", str(args.count),
        "--model", args.model,
    ]
    if args.no_research or args.dry_run:
        ai_cmd.append("--no-research")

    if not args.dry_run:
        run(ai_cmd)
    else:
        print(f"  [DRY-RUN] Would run: {' '.join(ai_cmd)}")

    # ── Step 3: Generate files ────────────────────────────────────────────────
    print(f"\n{'─' * 60}")
    print(f"STEP 3/3 — Generate registry files")
    print(f"{'─' * 60}")

    gen_cmd = [python, str(SCRIPTS_DIR / "generate_tool.py")]
    if args.dry_run:
        gen_cmd.append("--dry-run")

    run(gen_cmd)

    if args.dry_run:
        print(f"\n{'═' * 60}")
        print(f"✅ DRY-RUN complete — no files written, no push")
        print(f"{'═' * 60}")
        return

    # ── Step 4: Git push ──────────────────────────────────────────────────────
    tasks_after = count_tasks_before()
    new_count = tasks_after - tasks_before

    if args.no_push:
        print(f"\n{'═' * 60}")
        print(f"✅ Pipeline complete (--no-push, skipped git)")
        print(f"   {new_count} new tool(s) added to tasks.json")
        print(f"   Run: npm run build && git add -A && git push")
        print(f"{'═' * 60}")
        return

    print(f"\n{'─' * 60}")
    print(f"STEP 4/4 — Build & Push")
    print(f"{'─' * 60}")

    run(["npm", "run", "build"])
    run(["git", "add", "-A"])
    run(["git", "commit", "-m",
         f"feat: auto-grow '{category}' — {new_count} new tools via pipeline"])
    run(["git", "push"])

    print(f"\n{'═' * 60}")
    print(f"🚀 PIPELINE COMPLETE")
    print(f"   {new_count} new tool(s) deployed to Netlify")
    print(f"   Netlify will auto-build in ~1 min")
    print(f"{'═' * 60}")


if __name__ == "__main__":
    main()
