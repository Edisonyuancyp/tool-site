#!/usr/bin/env python3
"""
refresh-content.py — Refresh Claude-written tutorials for a few existing tools
so the site gets updated content every Tuesday. Picks tools whose seoBody exists
and rewrites it with a fresh angle, then writes back to meta.json.

Usage:
  python3 scripts/refresh-content.py --limit 5

Environment:
  CLAUDE_API_KEY
"""

import json
import os
import random
import sys
import argparse
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional, List, Dict

CLAUDE_API_KEY = os.environ.get("CLAUDE_API_KEY", "")
CLAUDE_MODEL = "claude-3-5-haiku-20241022"  # fast/cost-friendly for refresh
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"

SYSTEM_PROMPT = """You are a practical, experienced writer who refreshes calculator tutorials. Keep the same factual content but present it from a slightly different angle, with new examples and fresher phrasing. No AI clichés: never use "delve", "harness", "leverage", "it's worth noting", "in the realm of", "embark", "transformative", "game-changer", "dive into", "cutting-edge", "robust". Write like a knowledgeable friend. Output JSON only."""


def build_prompt(meta: dict) -> str:
    name = meta.get("name", "")
    tagline = meta.get("tagline", "")
    description = meta.get("description", "")
    keywords = meta.get("keywords", [])[:6]
    return f"""Rewrite the tutorial for the online tool: "{name}"

Tool tagline: {tagline}
Description: {description}
Target keywords: {", ".join(keywords)}

Generate exactly 5 sections. Each section has:
- "heading": a specific, descriptive H2 title
- "body": 2-3 paragraphs of prose (120-160 words each), separated by \\n\\n

Rules:
- Same factual accuracy and formula as the original, but a fresh angle and new examples
- Use real numbers, not placeholders
- Avoid AI filler phrases
- Total 700-900 words

Return only JSON, no extra text:
[
  {{"heading": "...", "body": "..."}},
  {{"heading": "...", "body": "..."}},
  {{"heading": "...", "body": "..."}},
  {{"heading": "...", "body": "..."}},
  {{"heading": "...", "body": "..."}}
]"""


def call_claude(prompt: str) -> Optional[List[Dict]]:
    if not CLAUDE_API_KEY:
        print("  [ERROR] CLAUDE_API_KEY not set")
        return None

    payload = json.dumps({
        "model": CLAUDE_MODEL,
        "max_tokens": 2000,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")

    req = urllib.request.Request(
        CLAUDE_API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"  [ERROR] Claude API HTTP {e.code}: {e.read().decode()[:300]}")
        return None
    except Exception as exc:
        print(f"  [ERROR] Claude API call failed: {exc}")
        return None

    raw = data.get("content", [{}])[0].get("text", "").strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) >= 2 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        sections = json.loads(raw)
        if isinstance(sections, list) and all("heading" in s and "body" in s for s in sections):
            return sections
    except Exception as e:
        print(f"  [WARN] JSON parse error: {e}")

    return None


def refresh_tool(slug: str) -> bool:
    tool_dir = REGISTRY_DIR / slug
    meta_path = tool_dir / "meta.json"
    if not meta_path.exists():
        return False

    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    if not meta.get("seoBody"):
        return False

    print(f"  ✏️  Refreshing: {meta.get('name', slug)}")
    sections = call_claude(build_prompt(meta))
    if not sections:
        return False

    meta["seoBody"] = sections
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        f.write("\n")

    word_count = sum(len(s.get("body", "").split()) for s in sections)
    print(f"  ✅ Refreshed ({word_count} words): {slug}")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--delay", type=float, default=1.0)
    args = parser.parse_args()

    if not REGISTRY_DIR.exists():
        print("[ERROR] tools-registry not found")
        sys.exit(1)

    slugs = sorted(
        d.name for d in REGISTRY_DIR.iterdir()
        if d.is_dir() and not d.name.startswith("_") and (d / "meta.json").exists()
    )

    # Prefer tools that already have seoBody
    with_seo = []
    without_seo = []
    for slug in slugs:
        try:
            with open(REGISTRY_DIR / slug / "meta.json", encoding="utf-8") as f:
                meta = json.load(f)
            if meta.get("seoBody"):
                with_seo.append(slug)
            else:
                without_seo.append(slug)
        except Exception:
            pass

    # Randomly pick limit tools from those with seoBody; if not enough, fill with others
    random.seed()
    chosen = (random.sample(with_seo, min(args.limit, len(with_seo))) +
              random.sample(without_seo, max(0, args.limit - len(with_seo))))

    print(f"[refresh-content] Refreshing {len(chosen)} tool(s) with model={CLAUDE_MODEL}")

    refreshed = 0
    for i, slug in enumerate(chosen):
        if refresh_tool(slug):
            refreshed += 1
        if i < len(chosen) - 1:
            time.sleep(args.delay)

    print(f"[refresh-content] Done — refreshed={refreshed}, attempted={len(chosen)}")


if __name__ == "__main__":
    main()
