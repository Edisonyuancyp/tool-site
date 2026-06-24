#!/usr/bin/env python3
"""
refresh-keywords.py — Every Saturday, run the existing enrich-keywords.mjs
against every tool that has not yet had keywords enriched. This keeps Google
Suggest long-tail keywords up to date without consuming too many SerpAPI credits.

Usage:
  python3 scripts/refresh-keywords.py [--limit 20]
"""

import json
import subprocess
import sys
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"
ENRICH_SCRIPT = ROOT / "scripts" / "enrich-keywords.mjs"


def needs_enrichment(slug: str) -> bool:
    meta_path = REGISTRY_DIR / slug / "meta.json"
    if not meta_path.exists():
        return False
    try:
        with open(meta_path, encoding="utf-8") as f:
            meta = json.load(f)
        # If keywords already have a long-tail "online" suffix, assume enriched
        keywords = meta.get("keywords", [])
        return not any("online" in k for k in keywords)
    except Exception:
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--delay", type=float, default=0.5)
    args = parser.parse_args()

    if not ENRICH_SCRIPT.exists():
        print(f"[ERROR] {ENRICH_SCRIPT} not found")
        sys.exit(1)

    slugs = sorted(
        d.name for d in REGISTRY_DIR.iterdir()
        if d.is_dir() and not d.name.startswith("_") and needs_enrichment(d.name)
    )
    if args.limit:
        slugs = slugs[:args.limit]

    print(f"[refresh-keywords] Enriching {len(slugs)} tool(s)")
    enriched = 0
    for slug in slugs:
        try:
            result = subprocess.run(
                ["node", str(ENRICH_SCRIPT), "--slug", slug],
                cwd=ROOT,
                capture_output=True,
                text=True,
                timeout=60,
            )
            if result.returncode == 0:
                enriched += 1
                for line in result.stdout.splitlines():
                    if line.strip().startswith(("✓", "+", "⚠")):
                        print(f"  {line.strip()}")
            else:
                print(f"  [WARN] {slug}: {result.stderr[:200]}")
        except Exception as exc:
            print(f"  [WARN] {slug}: {exc}")

    print(f"[refresh-keywords] Done — enriched={enriched}, attempted={len(slugs)}")


if __name__ == "__main__":
    main()
