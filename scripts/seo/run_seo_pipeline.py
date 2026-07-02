#!/usr/bin/env python3
"""
run_seo_pipeline.py
One-command wrapper that runs the full SEO optimization loop:
1. Fetch GSC data
2. AI analysis
3. Save formatted suggestions
"""

import subprocess
import sys
from pathlib import Path


def run_script(name: str) -> int:
    script = Path(__file__).resolve().parent / name
    print(f"\n▶ Running {name}\n")
    result = subprocess.run([sys.executable, str(script)])
    return result.returncode


def main() -> int:
    step1 = run_script("fetch_gsc_data.py")
    if step1 != 0:
        return step1

    step2 = run_script("analyze_seo.py")
    return step2


if __name__ == "__main__":
    sys.exit(main())
