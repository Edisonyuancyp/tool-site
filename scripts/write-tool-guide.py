#!/usr/bin/env python3
"""
write-tool-guide.py — Use Claude to write a rich, human-feeling tutorial for every
tool in tools-registry, storing the result as `seoBody` inside each meta.json.

Usage:
  python scripts/write-tool-guide.py                      # all tools missing seoBody
  python scripts/write-tool-guide.py --slug bmi-calculator # one tool
  python scripts/write-tool-guide.py --force              # rewrite even if seoBody exists
  python scripts/write-tool-guide.py --dry-run            # print prompt, no API call
  python scripts/write-tool-guide.py --limit 10           # process at most N tools

Environment variables:
  CLAUDE_API_KEY   — your Anthropic API key  ← FILL THIS IN .env.local or export it

The guide is stored as:
  meta.json → "seoBody": [ { "heading": "...", "body": "..." }, ... ]

`SEOContent.tsx` already reads and renders this field on every tool page.
"""

import json
import os
import sys
import argparse
import time
from pathlib import Path
from typing import Optional, List, Dict
from llm_client import LLMClient

# Default model used by LLMClient. Override via --model if you prefer a different one.
DEFAULT_MODEL = "claude-3-haiku-20240307"

ROOT         = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"

# ── Writing style system prompt ───────────────────────────────────────────────
SYSTEM_PROMPT = """You are a practical, experienced writer who creates genuinely helpful
tutorials for everyday people. Your writing style:

- Conversational but precise — you write like a knowledgeable friend, not a textbook
- Concrete: every claim is illustrated with a real number or real-world scenario
- No AI clichés: never use "delve", "harness", "leverage", "it's worth noting",
  "in the realm of", "embark", "transformative", "game-changer", "dive into", 
  "cutting-edge", "robust", or any hollow filler phrases
- No bullet-point padding: use prose paragraphs with clear topic sentences
- Honest about limitations: where a formula has caveats, say so plainly
- Short sentences mix with longer ones for natural rhythm
- Write for someone who wants to understand the topic, not just copy-paste a result

Your output must be JSON only — no intro, no explanation, no markdown outside the JSON."""

# ── Per-tool guide prompt ─────────────────────────────────────────────────────
def build_prompt(meta: dict) -> str:
    name        = meta.get("name", "")
    tagline     = meta.get("tagline", "")
    description = meta.get("description", "")
    keywords    = meta.get("keywords", [])[:8]
    category    = meta.get("category", "")
    faqs        = meta.get("faqs", [])

    faq_block = ""
    if faqs:
        faq_block = "FAQs users ask about this tool:\n" + "\n".join(
            f'  Q: {f["question"]}\n  A: {f["answer"]}' for f in faqs[:5]
        )

    return f"""Write a complete tutorial for the online tool: "{name}"

Tool tagline: {tagline}
Description: {description}
Category: {category}
Target keywords: {", ".join(keywords)}
{faq_block}

Generate exactly 5 sections. Each section must have:
- "heading": a specific, descriptive H2 title (NOT generic like "Introduction" or "Overview")
  Good examples: "What BMI Actually Measures (and What It Misses)",
                 "The Compound Interest Formula, Step by Step",
                 "How to Use This Calculator to Plan a Budget"
- "body": 2–3 paragraphs of plain prose, 120–160 words each

Section structure (adapt the exact titles to fit this tool):
1. What this tool actually does — explain the underlying concept, not the button clicks
2. The formula or method behind it — with real numbers worked through step by step
3. A practical real-world scenario — walk through a complete example a person might actually face
4. Unexpected or advanced uses most people overlook — at least 2 concrete scenarios
5. Common mistakes and how to avoid them — practical, specific, not vague warnings

Critical rules:
- Use natural transitions between paragraphs
- Vary sentence length — mix short punchy sentences with longer explanatory ones
- Include specific numbers (not "X" or "N") in examples
- Do NOT use bullet points or numbered lists inside "body" — prose only
- Each "body" string uses \\n\\n to separate paragraphs (two newlines)
- Total word count across all sections: 700–900 words

Return ONLY this JSON (no extra text before or after):
[
  {{"heading": "...", "body": "paragraph one.\\n\\nparagraph two.\\n\\nparagraph three."}},
  {{"heading": "...", "body": "..."}},
  {{"heading": "...", "body": "..."}},
  {{"heading": "...", "body": "..."}},
  {{"heading": "...", "body": "..."}}
]"""


# ── LLM API call ───────────────────────────────────────────────────────────────
def call_llm(prompt: str, dry_run: bool, model: str = "") -> Optional[List[Dict]]:
    if dry_run:
        print("  [DRY-RUN] Prompt (first 400 chars):")
        print("  " + prompt[:400].replace("\n", "\n  "))
        return None

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
    except Exception as exc:
        print(f"  [ERROR] LLM call failed: {exc}")
        return None

    try:
        sections = json.loads(raw)
        if (isinstance(sections, list)
                and all("heading" in s and "body" in s for s in sections)):
            return sections
        print(f"  [WARN] Unexpected JSON structure from LLM")
    except json.JSONDecodeError as e:
        print(f"  [WARN] JSON parse error: {e}")
        print(f"  Raw (first 300 chars): {raw[:300]}")

    return None


# ── Process one tool ──────────────────────────────────────────────────────────
SELECTED_MODEL = DEFAULT_MODEL

def process_tool(slug: str, force: bool, dry_run: bool) -> str:  # returns 'written' | 'skipped' | 'error'
    """Returns 'written' | 'skipped' | 'error'"""
    tool_dir  = REGISTRY_DIR / slug
    meta_path = tool_dir / "meta.json"

    if not meta_path.exists():
        print(f"  [WARN] meta.json not found for: {slug}")
        return "error"

    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    # Skip if already has seoBody and --force not set
    if meta.get("seoBody") and not force:
        print(f"  ⏭  Skipped (seoBody exists): {slug}")
        return "skipped"

    print(f"\n  ✏️  Writing guide for: {meta.get('name', slug)}")

    prompt   = build_prompt(meta)
    sections = call_llm(prompt, dry_run, model=SELECTED_MODEL)

    if sections is None:
        if dry_run:
            return "skipped"
        return "error"

    word_count = sum(len(s.get("body", "").split()) for s in sections)
    meta["seoBody"] = sections

    if not dry_run:
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  ✅ Written ({word_count} words, {len(sections)} sections): {slug}")

    return "written"


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Write LLM-powered tutorials for every tool")
    parser.add_argument("--slug",    help="Process only this slug")
    parser.add_argument("--force",   action="store_true", help="Overwrite existing seoBody")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts, skip API calls")
    parser.add_argument("--limit",   type=int, default=0,  help="Max number of tools to process")
    parser.add_argument("--delay",   type=float, default=1.2,
                        help="Seconds to wait between API calls (default 1.2, avoids rate limits)")
    parser.add_argument("--model",   default=DEFAULT_MODEL, help="LLM model to use")
    parser.add_argument("--priority", default="", help="Provider priority (e.g. openai,gemini,claude)")
    args = parser.parse_args()

    if args.priority:
        os.environ["LLM_PROVIDER_PRIORITY"] = args.priority

    global SELECTED_MODEL
    SELECTED_MODEL = args.model

    if not REGISTRY_DIR.exists():
        print(f"[ERROR] tools-registry not found at {REGISTRY_DIR}")
        sys.exit(1)

    # Collect slugs
    if args.slug:
        slugs = [args.slug]
    else:
        slugs = sorted(
            d.name for d in REGISTRY_DIR.iterdir()
            if d.is_dir() and not d.name.startswith("_")
        )

    if args.limit:
        slugs = slugs[: args.limit]

    client = LLMClient()
    print(f"[write-tool-guide] Processing {len(slugs)} tool(s) with providers={','.join(client.providers)} model={args.model}")
    if args.dry_run:
        print("[write-tool-guide] DRY-RUN mode — no files will be modified\n")

    counts = {"written": 0, "skipped": 0, "error": 0}

    for i, slug in enumerate(slugs):
        result = process_tool(slug, force=args.force, dry_run=args.dry_run)
        counts[result] += 1

        # Rate-limit: pause between real API calls
        if result == "written" and not args.dry_run and i < len(slugs) - 1:
            time.sleep(args.delay)

    print(f"\n[write-tool-guide] Done — "
          f"written={counts['written']}, skipped={counts['skipped']}, errors={counts['error']}")


if __name__ == "__main__":
    main()
