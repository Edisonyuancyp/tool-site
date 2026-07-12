#!/usr/bin/env python3
"""
generate-howto-schema.py

为指定工具生成 HowTo Schema 数据并写入 meta.json。

Usage:
    python scripts/generate-howto-schema.py --slugs bmi-calculator,age-calculator
    python scripts/generate-howto-schema.py --all-high-priority
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from llm_client import LLMClient

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "tools-registry"

HIGH_PRIORITY = [
    "bmi-calculator", "age-calculator", "qr-code-generator", "password-generator",
    "compound-interest-calculator", "currency-converter", "percentage-calculator",
    "unix-timestamp-converter", "base64-tool", "word-counter", "base-converter",
    "json-csv-formatter", "diff-checker", "sleep-calculator", "bmr-tdee-calculator",
    "tax-calculator", "retirement-savings-calculator", "investment-return-calculator",
    "debt-repayment-calculator", "budget-calculator", "loan-calculator",
    "tip-calculator", "gpa-calculator", "body-fat-calculator", "ideal-weight-calculator",
    "water-intake-calculator", "running-pace-calculator",
]

PROMPT = """You are an SEO specialist. Given a tool's metadata, create a JSON object for schema.org/HowTo structured data.

Tool metadata:
{meta_json}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{{
  "name": "How to use [Tool Name]",
  "description": "A concise 1-sentence description of what the user will accomplish.",
  "totalTime": "PT1M",
  "steps": [
    {{"name": "Step 1 title", "text": "What the user does in step 1."}},
    {{"name": "Step 2 title", "text": "What the user does in step 2."}},
    {{"name": "Step 3 title", "text": "What the user does in step 3."}}
  ]
}}

Rules:
- Include 3-4 concrete steps.
- Each step text should be 1-2 sentences.
- totalTime should be realistic (PT30S, PT1M, PT2M).
- Do not include extra fields.
"""


def load_meta(slug: str) -> dict:
    path = REGISTRY / slug / "meta.json"
    return json.loads(path.read_text("utf-8"))


def save_meta(slug: str, meta: dict) -> None:
    path = REGISTRY / slug / "meta.json"
    path.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", "utf-8")


def generate_howto(client: LLMClient, meta: dict) -> dict:
    system = "You output only valid JSON."
    user = PROMPT.format(meta_json=json.dumps({
        "name": meta["name"],
        "tagline": meta["tagline"],
        "description": meta["description"],
        "category": meta["category"],
    }, ensure_ascii=False))

    text = client.chat_completion(system=system, messages=[{"role": "user", "content": user}], max_tokens=600)
    if not text:
        raise RuntimeError("LLM returned empty response")

    # Extract JSON
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()
    return json.loads(text)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slugs", help="Comma-separated slugs")
    parser.add_argument("--all-high-priority", action="store_true", help="Process HIGH_PRIORITY list")
    args = parser.parse_args()

    slugs = args.slugs.split(",") if args.slugs else []
    if args.all_high_priority:
        slugs = HIGH_PRIORITY
    if not slugs:
        print("Usage: python scripts/generate-howto-schema.py --slugs slug1,slug2 OR --all-high-priority")
        sys.exit(1)

    client = LLMClient()
    for slug in slugs:
        try:
            meta = load_meta(slug)
            if meta.get("howTo"):
                print(f"⏭ {slug}: howTo already exists, skipping")
                continue
            howto = generate_howto(client, meta)
            meta["howTo"] = howto
            save_meta(slug, meta)
            print(f"✅ {slug}: generated {len(howto['steps'])} steps")
        except Exception as e:
            print(f"❌ {slug}: {e}")


if __name__ == "__main__":
    main()
