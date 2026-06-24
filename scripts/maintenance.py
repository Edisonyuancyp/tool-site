#!/usr/bin/env python3
"""
maintenance.py — Every Sunday, run a light maintenance pass:
1. Run fix-broken-tools.mjs to stub any broken view.tsx files.
2. Print a simple audit of registry health.

This is intentionally lightweight; the workflow still runs the full build.

Usage:
  python3 scripts/maintenance.py
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIX_SCRIPT = ROOT / "scripts" / "fix-broken-tools.mjs"


def main():
    print("[maintenance] Running weekly maintenance")

    if FIX_SCRIPT.exists():
        try:
            result = subprocess.run(
                ["node", str(FIX_SCRIPT)],
                cwd=ROOT,
                capture_output=True,
                text=True,
                timeout=120,
            )
            print(result.stdout)
            if result.returncode != 0:
                print(result.stderr[:500])
        except Exception as exc:
            print(f"  [WARN] fix-broken-tools failed: {exc}")
    else:
        print(f"  [WARN] {FIX_SCRIPT} not found, skipping")

    # Simple registry audit
    registry_dir = ROOT / "tools-registry"
    total = 0
    missing_view = 0
    missing_meta = 0
    for d in registry_dir.iterdir():
        if not d.is_dir() or d.name.startswith("_"):
            continue
        total += 1
        if not (d / "meta.json").exists():
            missing_meta += 1
        if not (d / "view.tsx").exists():
            missing_view += 1

    print(f"[maintenance] Registry audit: {total} tools, {missing_meta} missing meta, {missing_view} missing view")
    print("[maintenance] Done")


if __name__ == "__main__":
    main()
