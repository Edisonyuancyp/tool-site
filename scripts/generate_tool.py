#!/usr/bin/env python3
"""
generate_tool.py — Auto-generate tools-registry entries from tasks.json

Usage:
  python scripts/generate_tool.py                  # process all tasks
  python scripts/generate_tool.py --slug tip-calculator  # process one tool
  python scripts/generate_tool.py --dry-run         # preview without writing

tasks.json format:
  Array of objects, each matching the RegistryMeta schema (slug, name, tagline,
  description, metaTitle, metaDescription, keywords, category, icon, faqs,
  relatedTools, variants[]).

Behaviour:
  - Skips tools whose registry folder already exists (safe to re-run).
  - Creates <slug>/meta.json  (from task definition)
  - Creates <slug>/view.tsx   (generic stub with placeholder UI)
  - Prints a summary at the end.
"""

import json
import os
import sys
import argparse
import textwrap
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"
TASKS_FILE = Path(__file__).resolve().parent / "tasks.json"

# ── view.tsx stub template ────────────────────────────────────────────────────
# Uses str.replace() substitution (not .format()) to avoid brace-escaping issues.
VIEW_TEMPLATE = '''"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function __COMPONENT__View({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    // TODO: implement __NAME__ logic
    setResult(`Result for: ${input} (variant: ${variant ?? "default"})`);
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">
          Mode: {variant}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Input
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter value..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
        />
      </div>

      <button
        onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
      >
        Calculate
      </button>

      {result && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">{result}</p>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
'''

# ── Helpers ───────────────────────────────────────────────────────────────────

def slug_to_component_name(slug: str) -> str:
    """tip-calculator  →  TipCalculator"""
    return "".join(part.capitalize() for part in slug.split("-"))


def load_tasks() -> list[dict]:
    if not TASKS_FILE.exists():
        print(f"[ERROR] tasks.json not found at {TASKS_FILE}")
        sys.exit(1)
    with open(TASKS_FILE, encoding="utf-8") as f:
        tasks = json.load(f)
    if not isinstance(tasks, list):
        print("[ERROR] tasks.json must be a JSON array")
        sys.exit(1)
    return tasks


def write_file(path: Path, content: str, dry_run: bool) -> None:
    if dry_run:
        print(f"  [DRY-RUN] Would write: {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  ✅ Written: {path.relative_to(ROOT)}")


def generate_tool(task: dict, dry_run: bool, force: bool = False) -> str:
    """Returns one of: 'created' | 'skipped' | 'error'"""
    slug = task.get("slug", "").strip()
    if not slug:
        print(f"  [WARN] Task missing 'slug': {task.get('name', '?')} — skipping")
        return "error"

    tool_dir = REGISTRY_DIR / slug

    # ── Skip if already exists (unless --force) ─────────────────────────────
    if tool_dir.exists() and not dry_run and not force:
        print(f"  ⏭  Skipped (already exists): {slug}")
        return "skipped"

    name = task.get("name", slug)
    component = slug_to_component_name(slug)

    # ── meta.json ────────────────────────────────────────────────────────────
    meta = {
        "slug":            slug,
        "name":            name,
        "tagline":         task.get("tagline", f"Free online {name}"),
        "description":     task.get("description", ""),
        "metaTitle":       task.get("metaTitle", f"{name} – Free Online Tool"),
        "metaDescription": task.get("metaDescription", ""),
        "keywords":        task.get("keywords", [slug, name.lower()]),
        "category":        task.get("category", "Utilities"),
        "icon":            task.get("icon", "🔧"),
        "faqs":            task.get("faqs", []),
        "relatedTools":    task.get("relatedTools", []),
        "variants":        task.get("variants", []),
    }
    meta_json = json.dumps(meta, ensure_ascii=False, indent=2) + "\n"
    write_file(tool_dir / "meta.json", meta_json, dry_run)

    # ── view.tsx ─────────────────────────────────────────────────────────────
    view_content = VIEW_TEMPLATE.replace("__COMPONENT__", component).replace("__NAME__", name)
    write_file(tool_dir / "view.tsx", view_content, dry_run)

    return "created"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate tools-registry entries from tasks.json")
    parser.add_argument("--slug",    help="Only process this specific slug")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, no files written")
    parser.add_argument("--force",   action="store_true", help="Overwrite existing tool folders")
    args = parser.parse_args()

    tasks = load_tasks()

    if args.slug:
        tasks = [t for t in tasks if t.get("slug") == args.slug]
        if not tasks:
            print(f"[ERROR] No task with slug '{args.slug}' found in tasks.json")
            sys.exit(1)

    if args.dry_run:
        print("🔍 DRY-RUN mode — no files will be written\n")

    counts = {"created": 0, "skipped": 0, "error": 0}

    print(f"📋 Processing {len(tasks)} task(s) from {TASKS_FILE.name}\n")
    for task in tasks:
        slug = task.get("slug", "?")
        name = task.get("name", slug)
        print(f"→ {slug}  ({name})")
        status = generate_tool(task, dry_run=args.dry_run, force=args.force)
        counts[status] += 1
        print()

    # ── Summary ───────────────────────────────────────────────────────────────
    print("─" * 50)
    print(f"✅ Created:  {counts['created']}")
    print(f"⏭  Skipped:  {counts['skipped']}")
    print(f"❌ Errors:   {counts['error']}")
    total_variants = sum(len(t.get("variants", [])) for t in tasks if t.get("slug") not in ["?"])
    if counts["created"] > 0:
        print(f"\n🚀 {counts['created']} new tool(s) added to tools-registry/")
        print(f"   → {total_variants} variant page(s) will be generated at next build")
        print(f"\nNext steps:")
        print(f"  1. Customize view.tsx for each new tool (add real calculation logic)")
        print(f"  2. Run: npm run build")
        print(f"  3. Verify new pages appear in out/tools/")


if __name__ == "__main__":
    main()
