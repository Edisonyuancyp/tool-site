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
from pathlib import Path
from typing import Optional, List, Dict
from llm_client import LLMClient

DEFAULT_MODEL = "claude-3-5-haiku-20241022"  # fast/cost-friendly for refresh

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"

SYSTEM_PROMPT = """You are a practical, experienced writer adding NEW sections to an existing calculator tutorial. Add fresh angles, deeper how-to content, or new use cases NOT already covered by the existing headings. Never rewrite what already exists. No AI clichés: never use "delve", "harness", "leverage", "it's worth noting", "in the realm of", "embark", "transformative", "game-changer", "dive into", "cutting-edge", "robust". Write like a knowledgeable friend. Output JSON only."""


MAX_SEO_SECTIONS = 8  # keep at most this many sections total
NEW_SECTIONS_PER_RUN = 2  # how many genuinely new sections to add each refresh

SELECTED_MODEL = DEFAULT_MODEL


def build_prompt(meta: dict) -> str:
    name = meta.get("name", "")
    tagline = meta.get("tagline", "")
    description = meta.get("description", "")
    keywords = meta.get("keywords", [])[:8]
    existing_headings = [s.get("heading", "") for s in meta.get("seoBody", [])]
    existing_str = "\n".join(f'- {h}' for h in existing_headings) if existing_headings else "(none yet)"
    return f"""Add NEW tutorial sections for the online tool: "{name}"

Tool tagline: {tagline}
Description: {description}
Target keywords: {", ".join(keywords)}

Existing section headings (DO NOT repeat these topics):
{existing_str}

Write exactly {NEW_SECTIONS_PER_RUN} NEW sections that cover angles not already in the existing headings.
Ideas: common mistakes, real-world use cases, comparison with manual methods, quick tips, edge cases.

Each section:
- "heading": specific H2 title, different from existing ones
- "body": 2-3 paragraphs of prose (120-160 words each) separated by \\n\\n

Rules:
- Use real numbers, not placeholders
- Avoid AI filler phrases
- Each section 250-320 words

Return only JSON, no extra text:
[
  {{"heading": "...", "body": "..."}},
  {{"heading": "...", "body": "..."}}
]"""


def call_llm(prompt: str, model: str = "") -> Optional[List[Dict]]:
    client = LLMClient()
    if not any(client._key_for(p) for p in client.providers):
        print("  [ERROR] No LLM API keys found. Set OPENAI_API_KEY, CLAUDE_API_KEY, or GEMINI_API_KEY.")
        return None

    try:
        raw = client.chat_completion(
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            model=model or None,
            json_mode=True,
        )
        sections = json.loads(raw)
        if isinstance(sections, list) and all("heading" in s and "body" in s for s in sections):
            return sections
    except Exception as e:
        print(f"  [WARN] LLM call or JSON parse error: {e}")

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
    sections = call_llm(build_prompt(meta), model=SELECTED_MODEL)
    if not sections:
        return False

    # ── Additive merge: keep existing, append genuinely new sections ─────────
    existing_sections = meta.get("seoBody", [])
    existing_headings_lower = {s.get("heading", "").lower().strip() for s in existing_sections}

    new_unique = [
        s for s in sections
        if s.get("heading", "").lower().strip() not in existing_headings_lower
    ]

    if not new_unique:
        print(f"  ⚠️  All generated headings duplicate existing ones, skipping: {slug}")
        return False

    # Append new; if total exceeds cap, drop oldest sections to keep it fresh
    merged = existing_sections + new_unique
    if len(merged) > MAX_SEO_SECTIONS:
        merged = merged[-MAX_SEO_SECTIONS:]

    meta["seoBody"] = merged
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        f.write("\n")

    word_count = sum(len(s.get("body", "").split()) for s in merged)
    print(f"  ✅ +{len(new_unique)} sections ({word_count} words total, {len(merged)} sections): {slug}")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--delay", type=float, default=1.0)
    parser.add_argument("--model", default=DEFAULT_MODEL, help="LLM model to use")
    parser.add_argument("--priority", default="", help="Provider priority (e.g. openai,gemini,claude)")
    args = parser.parse_args()

    global SELECTED_MODEL
    SELECTED_MODEL = args.model
    if args.priority:
        os.environ["LLM_PROVIDER_PRIORITY"] = args.priority

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

    client = LLMClient()
    print(f"[refresh-content] Refreshing {len(chosen)} tool(s) with providers={','.join(client.providers)} model={SELECTED_MODEL}")

    refreshed = 0
    for i, slug in enumerate(chosen):
        if refresh_tool(slug):
            refreshed += 1
        if i < len(chosen) - 1:
            time.sleep(args.delay)

    print(f"[refresh-content] Done — refreshed={refreshed}, attempted={len(chosen)}")


if __name__ == "__main__":
    main()
