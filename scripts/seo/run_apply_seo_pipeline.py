#!/usr/bin/env python3
"""
run_apply_seo_pipeline.py
One-command wrapper that runs the full SEO loop and automatically applies the
first AI suggestion to every candidate page.

Usage:
  python run_apply_seo_pipeline.py             # fetch + analyze + apply
  python run_apply_seo_pipeline.py --dry-run # fetch + analyze + preview apply
"""

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Optional


def run_script(name: str, args: Optional[list] = None) -> int:
    script = Path(__file__).resolve().parent / name
    print(f"\n▶ Running {name}\n")
    cmd = [sys.executable, str(script)]
    if args:
        cmd.extend(args)
    result = subprocess.run(cmd)
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(description="Run SEO pipeline and apply first suggestion to each page")
    parser.add_argument("--dry-run", action="store_true", help="Preview apply changes without writing files")
    args = parser.parse_args()

    step1 = run_script("fetch_gsc_data.py")
    if step1 != 0:
        return step1

    step2 = run_script("analyze_seo.py")
    if step2 != 0:
        return step2

    apply_args = ["--choice", "1"]
    if args.dry_run:
        apply_args.append("--dry-run")
    step3 = run_script("apply_seo_suggestions.py", apply_args)
    return step3


if __name__ == "__main__":
    sys.exit(main())
