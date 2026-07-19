#!/usr/bin/env python3
"""
agent.py — Natural language control agent for getfastcalc.

Type everyday commands like:
    create a keto macro calculator
    generate variants for bmi-calculator
    run maintenance and push to git
    show me low CTR pages from GSC
    build the site

The agent uses an LLM to translate your intent into structured function calls,
then executes them against the existing scripts in this repo.

Environment keys are read from .env.local (OPENAI_API_KEY / CLAUDE_API_KEY / GEMINI_API_KEY).
"""

import json
import os
import subprocess
import sys
import shlex
from pathlib import Path
from typing import Any

from llm_client import LLMClient

ROOT = Path(__file__).resolve().parent.parent

# ── Tool/function schema exposed to the LLM ───────────────────────────────────
AGENT_TOOLS = [
    {
        "name": "generate_tool",
        "description": "Create a new calculator/tool page. The slug must be kebab-case.",
        "parameters": {
            "type": "object",
            "properties": {
                "slug": {"type": "string", "description": "URL-friendly slug, e.g. 'keto-macro-calculator'"},
                "category": {"type": "string", "description": "One of: AI, SEO, Ecommerce, Social, Image, File, Math, Finance, Health, Crypto, Fitness, Quant, Design, Generators, Developer, Text, Security, Content, Utilities, Date & Time, Travel, Converter, Cooking, Productivity, Home"},
                "name": {"type": "string"},
                "description": {"type": "string"},
                "keywords": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["slug", "category", "name", "description"],
        },
    },
    {
        "name": "generate_variants",
        "description": "Generate SEO variant pages for a tool or for the top N missing-variant tools.",
        "parameters": {
            "type": "object",
            "properties": {
                "slug": {"type": "string", "description": "Optional single tool slug. If omitted, processes top missing-variant tools."},
                "limit": {"type": "integer", "description": "Maximum number of tools to process. Default 10."},
            },
        },
    },
    {
        "name": "generate_howto",
        "description": "Generate HowTo Schema JSON-LD for a tool or for the configured priority list.",
        "parameters": {
            "type": "object",
            "properties": {
                "slug": {"type": "string", "description": "Optional single tool slug."},
            },
        },
    },
    {
        "name": "modify_tool_meta",
        "description": "Update meta fields (metaTitle, metaDescription, keywords, tagline, etc.) for a tool.",
        "parameters": {
            "type": "object",
            "properties": {
                "slug": {"type": "string"},
                "updates": {"type": "object", "description": "Key/value pairs to merge into the tool's meta.json"},
            },
            "required": ["slug", "updates"],
        },
    },
    {
        "name": "run_maintenance",
        "description": "Run the full weekly maintenance pass (audit, fix broken views, refresh llms.txt).",
        "parameters": {"type": "object", "properties": {}},
    },
    {
        "name": "run_audit",
        "description": "Run the tool audit and report broken or missing views/meta.",
        "parameters": {"type": "object", "properties": {}},
    },
    {
        "name": "run_build",
        "description": "Run npm run build to export the static site.",
        "parameters": {"type": "object", "properties": {}},
    },
    {
        "name": "fetch_gsc_data",
        "description": "Fetch last 7 days of Google Search Console performance data and save both a real traffic summary and low-CTR optimization candidates.",
        "parameters": {"type": "object", "properties": {}},
    },
    {
        "name": "analyze_seo",
        "description": "Analyze GSC candidates with AI and write title/description rewrite suggestions.",
        "parameters": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "description": "Max candidates to analyze. Default 10."},
            },
        },
    },
    {
        "name": "apply_seo_suggestions",
        "description": "Apply AI-generated SEO title/description suggestions to meta.json files (auto mode, no prompts).",
        "parameters": {"type": "object", "properties": {}},
    },
    {
        "name": "git_commit_push",
        "description": "Stage all changes, commit, pull-rebase, and push. Use a concise English commit message.",
        "parameters": {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
            },
            "required": ["message"],
        },
    },
    {
        "name": "get_traffic_summary",
        "description": "Return the real traffic summary from Google Search Console: total clicks, impressions, avg CTR, avg position, and top pages. Not the low-CTR candidate list.",
        "parameters": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "description": "Max pages to include in summary. Default 10."},
            },
        },
    },
    {
        "name": "optimize_tool",
        "description": "Run a one-click optimization pass for a specific tool: generate variants, HowTo schema, and refresh keywords.",
        "parameters": {
            "type": "object",
            "properties": {
                "slug": {"type": "string", "description": "Tool slug, e.g. 'bmi-calculator'"},
                "skip_variants": {"type": "boolean", "description": "Skip variant generation. Default false."},
                "skip_howto": {"type": "boolean", "description": "Skip HowTo schema. Default false."},
            },
            "required": ["slug"],
        },
    },
    {
        "name": "list_tools",
        "description": "List all tools or filter by category.",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string"},
            },
        },
    },
    {
        "name": "find_placeholder_tools",
        "description": "Scan view.tsx files and list tools that appear to be templates, stubs, or lacking substantive functionality (heuristic based).",
        "parameters": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "description": "Max number of results to return. Default 20."},
            },
        },
    },
    {
        "name": "complete_tool",
        "description": "Generate and write a real working view.tsx for a stub tool that lacks substantive functionality. Backs up the original file.",
        "parameters": {
            "type": "object",
            "properties": {
                "slug": {"type": "string", "description": "Tool slug, e.g. 'celsius-to-fahrenheit-converter'"},
                "dry_run": {"type": "boolean", "description": "If true, only preview the generated code without writing. Default false."},
            },
            "required": ["slug"],
        },
    },
    {
        "name": "respond",
        "description": "Send a plain text response to the user. Use when no action is needed or to ask clarification.",
        "parameters": {
            "type": "object",
            "properties": {
                "text": {"type": "string"},
            },
            "required": ["text"],
        },
    },
]


# ── Action implementations ────────────────────────────────────────────────────

def run_shell(command: list[str], cwd: Path = ROOT) -> tuple[int, str, str]:
    print(f"[shell] {' '.join(command)[:120]}...")
    proc = subprocess.run(command, cwd=cwd, text=True, capture_output=True, timeout=600)
    out = proc.stdout[-1500:] if proc.stdout else ""
    err = proc.stderr[-1500:] if proc.stderr else ""
    return proc.returncode, out, err


def cmd_generate_tool(args: dict) -> dict:
    slug = args["slug"]
    category = args["category"]
    name = args["name"]
    description = args["description"]
    keywords = args.get("keywords", [])
    kw_arg = json.dumps(keywords, ensure_ascii=False) if keywords else ""
    cmd = [
        "python3", "scripts/generate_tool.py",
        "--slug", slug,
        "--category", category,
        "--name", name,
        "--description", description,
    ]
    if kw_arg:
        cmd += ["--keywords", kw_arg]
    rc, out, err = run_shell(cmd)
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_generate_variants(args: dict) -> dict:
    cmd = ["python3", "scripts/generate-variants.py"]
    if args.get("slug"):
        cmd += ["--slug", args["slug"]]
    if args.get("limit"):
        cmd += ["--limit", str(args["limit"])]
    else:
        cmd += ["--limit", "10"]
    rc, out, err = run_shell(cmd)
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_generate_howto(args: dict) -> dict:
    cmd = ["python3", "scripts/generate-howto-schema.py"]
    if args.get("slug"):
        cmd += ["--slug", args["slug"]]
    rc, out, err = run_shell(cmd)
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_modify_tool_meta(args: dict) -> dict:
    slug = args["slug"]
    updates = args["updates"]
    # Find the meta.json for this slug
    candidates = list((ROOT / "tools-registry").rglob(f"{slug}/meta.json"))
    if not candidates:
        return {"status": "error", "error": f"Tool slug not found: {slug}"}
    meta_path = candidates[0]
    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        meta.update(updates)
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return {"status": "ok", "updated": meta_path.relative_to(ROOT).as_posix(), "changes": list(updates.keys())}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def cmd_run_maintenance(_args: dict) -> dict:
    rc, out, err = run_shell(["bash", "scripts/run-maintenance.sh"])
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_run_audit(_args: dict) -> dict:
    rc, out, err = run_shell(["node", "scripts/audit-tools.mjs"])
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_run_build(_args: dict) -> dict:
    rc, out, err = run_shell(["npm", "run", "build"])
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_fetch_gsc(_args: dict) -> dict:
    venv_python = ROOT / "scripts" / "seo" / ".venv" / "bin" / "python3"
    python = str(venv_python) if venv_python.exists() else "python3"
    rc, out, err = run_shell([python, "scripts/seo/fetch_gsc_data.py"])
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_analyze_seo(args: dict) -> dict:
    venv_python = ROOT / "scripts" / "seo" / ".venv" / "bin" / "python3"
    python = str(venv_python) if venv_python.exists() else "python3"
    limit = args.get("limit", 10)
    rc, out, err = run_shell([python, "scripts/seo/analyze_seo.py", "--auto", "--limit", str(limit)])
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_apply_seo(_args: dict) -> dict:
    venv_python = ROOT / "scripts" / "seo" / ".venv" / "bin" / "python3"
    python = str(venv_python) if venv_python.exists() else "python3"
    rc, out, err = run_shell([python, "scripts/seo/apply_seo_suggestions.py", "--yes"])
    return {"status": "ok" if rc == 0 else "error", "stdout": out, "stderr": err}


def cmd_git_commit_push(args: dict) -> dict:
    msg = args["message"]
    rc1, out1, err1 = run_shell(["git", "add", "-A"])
    rc2, out2, err2 = run_shell(["git", "commit", "-m", msg])
    rc3, out3, err3 = run_shell(["git", "pull", "--rebase"])
    rc4, out4, err4 = run_shell(["git", "push"])
    combined = out1 + out2 + out3 + out4
    errors = err1 + err2 + err3 + err4
    ok = all(r == 0 for r in [rc1, rc2, rc3, rc4])
    return {"status": "ok" if ok else "error", "stdout": combined, "stderr": errors}


def cmd_get_traffic_summary(args: dict) -> dict:
    summary_path = ROOT / "scripts" / "seo" / "gsc_traffic_summary.json"
    candidates_path = ROOT / "scripts" / "seo" / "gsc_optimization_candidates.json"

    # If no summary exists, try to fetch fresh data first
    if not summary_path.exists():
        fetch_result = cmd_fetch_gsc({})
        if fetch_result.get("status") != "ok":
            return {"status": "error", "error": "GSC 数据尚未拉取且自动拉取失败。请检查 GSC_CREDENTIALS_PATH 和 GSC_SITE_URL。"}

    if not summary_path.exists():
        return {"status": "error", "error": "无法生成流量摘要。"}

    try:
        summary = json.loads(summary_path.read_text(encoding="utf-8"))
        candidates = []
        if candidates_path.exists():
            candidates = json.loads(candidates_path.read_text(encoding="utf-8"))

        return {
            "status": "ok",
            "summary": {
                "days": summary.get("days", 7),
                "total_pages": summary.get("total_pages", 0),
                "total_clicks": summary.get("total_clicks", 0),
                "total_impressions": summary.get("total_impressions", 0),
                "avg_ctr_percent": summary.get("avg_ctr_percent", 0),
                "avg_position": summary.get("avg_position", 0),
                "optimization_candidates": len(candidates),
            },
            "top_pages_by_clicks": summary.get("top_pages_by_clicks", [])[:10],
            "top_pages_by_impressions": summary.get("top_pages_by_impressions", [])[:10],
            "note": "GSC 数据来自 Google Search Console，已排除您自己的浏览记录。",
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def cmd_optimize_tool(args: dict) -> dict:
    slug = args["slug"]
    outputs = []
    if not args.get("skip_variants"):
        rc, out, err = run_shell(["python3", "scripts/generate-variants.py", "--slug", slug])
        outputs.append({"step": "generate_variants", "status": "ok" if rc == 0 else "error", "stdout": out[-800:], "stderr": err[-400:]})
    if not args.get("skip_howto"):
        rc, out, err = run_shell(["python3", "scripts/generate-howto-schema.py", "--slug", slug])
        outputs.append({"step": "generate_howto", "status": "ok" if rc == 0 else "error", "stdout": out[-800:], "stderr": err[-400:]})
    # Also refresh keywords for this tool
    meta_candidates = list((ROOT / "tools-registry").rglob(f"{slug}/meta.json"))
    if meta_candidates:
        try:
            meta = json.loads(meta_candidates[0].read_text(encoding="utf-8"))
            # ensure keywords exist
            if not meta.get("keywords"):
                meta["keywords"] = [slug.replace("-", " "), meta.get("name", ""), meta.get("category", "")]
                meta_candidates[0].write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                outputs.append({"step": "refresh_keywords", "status": "ok"})
        except Exception as e:
            outputs.append({"step": "refresh_keywords", "status": "error", "error": str(e)})
    any_error = any(o.get("status") == "error" for o in outputs)
    return {"status": "error" if any_error else "ok", "outputs": outputs}


def _score_placeholder(content: str) -> tuple[int, list[str]]:
    """Heuristic score for how much a view.tsx looks like a stub/placeholder."""
    score = 0
    reasons = []
    lower = content.lower()

    # Common stub markers
    stub_markers = [
        ("TODO", "包含 TODO 标记"),
        ("FIXME", "包含 FIXME 标记"),
        ("placeholder", "包含 placeholder"),
        ("coming soon", "包含 coming soon"),
        ("not implemented", "包含 not implemented"),
        ("under construction", "包含 under construction"),
        ("未实现", "包含未实现"),
        ("占位", "包含占位"),
    ]
    for marker, reason in stub_markers:
        if marker.lower() in lower:
            score += 10
            reasons.append(reason)

    lines = [l for l in content.splitlines() if l.strip()]
    non_empty = len(lines)
    if non_empty < 45:
        score += 15
        reasons.append(f"文件很短（{non_empty} 行）")
    elif non_empty < 70:
        score += 5
        reasons.append(f"文件较短（{non_empty} 行）")

    # Very simple components usually lack state/effects
    if "useState" not in content and "useMemo" not in content and "useReducer" not in content:
        score += 10
        reasons.append("没有 useState/useMemo/useReducer")
    if "useEffect" not in content:
        score += 5
        reasons.append("没有 useEffect")

    # Hardcoded result patterns
    hardcode_patterns = [
        r'result\s*=\s*["\']\d+["\']',
        r'result\s*:\s*["\']\d+["\']',
        r'return\s+["\']\d+["\']',
        r'result\s*=\s*["\'].*?["\']',
    ]
    import re
    for pat in hardcode_patterns:
        if re.search(pat, lower):
            score += 8
            reasons.append("结果疑似硬编码")
            break

    # Wrapper importing a real calculator/converter component from @/components/* — likely NOT a stub
    # (CopyButton is just a utility, not a real component wrapper)
    if "@/components/" in content and "@/components/CopyButton" not in content:
        score -= 45
        reasons.append("从 @/components 导入真实共享组件（视为包装器）")

    # No input handling
    if "onChange" not in content and "onInput" not in content and "useState" not in content:
        score += 10
        reasons.append("没有 onChange/onInput 输入处理")

    # Cap reasons list for readability
    reasons = reasons[:4]
    return score, reasons


def cmd_find_placeholder_tools(args: dict) -> dict:
    registry = ROOT / "tools-registry"
    limit = args.get("limit", 20)
    results = []
    for view_file in sorted(registry.rglob("view.tsx")):
        try:
            content = view_file.read_text(encoding="utf-8")
            slug = view_file.parent.name
            score, reasons = _score_placeholder(content)
            if score >= 25:
                meta_file = view_file.parent / "meta.json"
                name = slug
                category = ""
                if meta_file.exists():
                    meta = json.loads(meta_file.read_text(encoding="utf-8"))
                    name = meta.get("name", slug)
                    category = meta.get("category", "")
                results.append({
                    "slug": slug,
                    "name": name,
                    "category": category,
                    "score": score,
                    "reasons": reasons,
                    "lines": len([l for l in content.splitlines() if l.strip()]),
                })
        except Exception:
            continue

    results.sort(key=lambda x: x["score"], reverse=True)
    return {
        "status": "ok",
        "total_scanned": len(list(registry.rglob("view.tsx"))),
        "flagged_count": len(results),
        "flagged": results[:limit],
    }


def _extract_code(text: str) -> str:
    """Strip markdown code fences if present."""
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1][4:] if parts[1].startswith("tsx") else parts[1]
    return text.strip()


def _generate_tool_view(slug: str, name: str, description: str, category: str, old_view: str, variant: str = "") -> str:
    """Use LLM to generate a working React view.tsx for a tool."""
    prompt = f"""You are a React + TypeScript developer for getfastcalc.com.
Generate a complete, working `view.tsx` file for this tool.

Tool metadata:
- slug: {slug}
- name: {name}
- category: {category}
- description: {description}
- variant: {variant or "none"}

Requirements:
1. The component must be a React functional component exported as default.
2. Use "use client" at the top.
3. Use `export interface ToolProps {{ variant?: string; }}`.
4. Use `useState` for inputs and result.
5. Implement the actual calculation logic based on the tool name/description.
6. Provide input controls (text inputs, selects, buttons) and a "Calculate" or live result.
7. Use Tailwind CSS classes for styling: inputs with `w-full border rounded px-3 py-2`, buttons with `bg-blue-600 text-white rounded px-4 py-2`.
8. Include CopyButton from `@/components/CopyButton` if showing a result text.
9. Handle invalid inputs gracefully (non-numeric, empty, zero, negative where applicable).
10. DO NOT import external packages that are not already in package.json, except `marked` is allowed for markdown previewer.
11. If the tool name implies markdown preview/rendering, import `marked` from the `marked` package and use `dangerouslySetInnerHTML`. Do NOT import `react-markdown`.
12. If you need a lookup map keyed by strings (e.g. model prices), type it as `Record<string, number>` or use a `switch` statement; do not index a literal object with a string variable.
13. Output ONLY the file contents, no markdown fences, no explanations.

Original stub view.tsx (for reference only):
```tsx
{old_view}
```

Generate the new view.tsx now.
"""
    client = LLMClient()
    return client.chat_completion(
        system="You generate TypeScript React components for online calculators. Output only code, no markdown.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3000,
    )


def cmd_complete_tool(args: dict) -> dict:
    slug = args["slug"]
    dry_run = args.get("dry_run", False)
    registry = ROOT / "tools-registry"
    candidates = list(registry.rglob(f"{slug}/meta.json"))
    if not candidates:
        return {"status": "error", "error": f"Tool slug not found: {slug}"}
    meta_path = candidates[0]
    view_path = meta_path.parent / "view.tsx"
    if not view_path.exists():
        return {"status": "error", "error": f"view.tsx missing for {slug}"}

    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        old_view = view_path.read_text(encoding="utf-8")
    except Exception as e:
        return {"status": "error", "error": f"Failed to read files: {e}"}

    name = meta.get("name", slug)
    description = meta.get("description", "")
    category = meta.get("category", "")

    # If the view is just a wrapper around a real component, don't overwrite it.
    if "@/components/tools/" in old_view:
        return {
            "status": "error",
            "error": f"{slug} view.tsx is a wrapper that imports from @/components/tools/. The real logic is in that shared component, not in view.tsx.",
        }

    # Check if it already looks substantive
    score, _ = _score_placeholder(old_view)
    if score < 25:
        return {
            "status": "error",
            "error": f"{slug} already appears to have substantive functionality (placeholder score {score}). Aborting to avoid overwriting real code.",
        }

    try:
        new_view = _generate_tool_view(slug, name, description, category, old_view)
        # Clean up any markdown fences the LLM might have added despite instructions
        new_view = _extract_code(new_view) if new_view.strip().startswith("```") else new_view.strip()
        if not new_view.startswith('"use client"') and not new_view.startswith("import"):
            new_view = '"use client";\n' + new_view
    except Exception as e:
        return {"status": "error", "error": f"LLM generation failed: {e}"}

    if dry_run:
        return {"status": "ok", "preview": new_view[:1500], "message": "Dry run - no file written."}

    # Backup original
    backup_path = view_path.with_suffix(".tsx.bak")
    try:
        backup_path.write_text(old_view, encoding="utf-8")
        view_path.write_text(new_view + "\n", encoding="utf-8")
    except Exception as e:
        return {"status": "error", "error": f"Failed to write files: {e}"}

    # Type check
    rc, out, err = run_shell(["npx", "tsc", "--noEmit"])
    if rc != 0:
        # Restore backup on type-check failure
        view_path.write_text(old_view, encoding="utf-8")
        return {
            "status": "error",
            "error": f"TypeScript check failed. Original restored from backup.\n{err[-1500:]}\n{out[-800:]}",
        }

    return {
        "status": "ok",
        "message": f"Generated and wrote new view.tsx for {slug}. Backup saved to {backup_path.name}.",
        "lines": len(new_view.splitlines()),
    }


def cmd_list_tools(args: dict) -> dict:
    registry = ROOT / "tools-registry"
    tools = []
    for meta_file in sorted(registry.rglob("meta.json")):
        try:
            data = json.loads(meta_file.read_text())
            if args.get("category") and data.get("category") != args["category"]:
                continue
            tools.append({
                "slug": data.get("slug", meta_file.parent.name),
                "name": data.get("name", ""),
                "category": data.get("category", ""),
            })
        except Exception:
            continue
    return {"status": "ok", "count": len(tools), "tools": tools[:50]}


HANDLERS = {
    "generate_tool": cmd_generate_tool,
    "generate_variants": cmd_generate_variants,
    "generate_howto": cmd_generate_howto,
    "modify_tool_meta": cmd_modify_tool_meta,
    "run_maintenance": cmd_run_maintenance,
    "run_audit": cmd_run_audit,
    "run_build": cmd_run_build,
    "fetch_gsc_data": cmd_fetch_gsc,
    "analyze_seo": cmd_analyze_seo,
    "apply_seo_suggestions": cmd_apply_seo,
    "git_commit_push": cmd_git_commit_push,
    "get_traffic_summary": cmd_get_traffic_summary,
    "optimize_tool": cmd_optimize_tool,
    "find_placeholder_tools": cmd_find_placeholder_tools,
    "complete_tool": cmd_complete_tool,
    "list_tools": cmd_list_tools,
    "respond": lambda args: {"status": "ok", "text": args["text"]},
}


# ── LLM function-calling via JSON mode ───────────────────────────────────────

SYSTEM_PROMPT = """You are the getfastcalc AI operator. The user will give everyday commands in Chinese or English.
Translate the intent into one or more of the provided functions. Return a JSON array of function calls only.

Available functions:
__AGENT_TOOLS__

Rules:
- Return a single JSON array: [{"name": "function_name", "arguments": {...}}, ...]
- Do not output markdown fences, explanations, or anything outside the JSON.
- Prefer atomic actions: e.g. "build and push" should call run_build then git_commit_push.
- For vague requests, ask a clarification question using the "respond" function.
- For category names, use the canonical English names provided in the tools schema.
- The user's input may be in Chinese, but the function name and argument keys must always be in English as defined above.
- Traffic queries: "get_traffic_summary" returns real traffic summary (clicks, impressions, avg CTR, top pages). If the user asks for low-CTR/optimization candidate pages, use "analyze_seo" or "fetch_gsc_data" instead.
"""


def build_plan(user_input: str) -> list[dict]:
    tools_json = json.dumps(AGENT_TOOLS, ensure_ascii=False, indent=2)
    system = SYSTEM_PROMPT.replace("__AGENT_TOOLS__", tools_json)
    user = f"User request: {user_input}\n\nReturn function calls as a JSON array."
    client = LLMClient()
    text = client.chat_completion(
        system=system,
        messages=[{"role": "user", "content": user}],
        max_tokens=2000,
        json_mode=True,
    )
    plan = json.loads(text)
    if isinstance(plan, dict):
        plan = [plan]
    return plan


def execute_plan(plan: list[dict]) -> list[dict]:
    results = []
    for step in plan:
        name = step.get("name")
        arguments = step.get("arguments", {})
        handler = HANDLERS.get(name)
        if not handler:
            results.append({"name": name, "status": "error", "error": f"Unknown function: {name}"})
            continue
        try:
            result = handler(arguments)
            results.append({"name": name, "status": result.get("status", "ok"), **result})
        except Exception as e:
            results.append({"name": name, "status": "error", "error": str(e)})
    return results


def _detect_language(text: str) -> str:
    """Simple heuristic: Chinese if CJK chars present, otherwise English."""
    if any("\u4e00" <= ch <= "\u9fff" for ch in text):
        return "Chinese"
    return "English"


def summarize_results(user_input: str, results: list[dict]) -> str:
    lang = _detect_language(user_input)
    summary_prompt = (
        f"The user asked: '{user_input}'.\n"
        f"The system executed these actions and got raw results:\n{json.dumps(results, ensure_ascii=False, indent=2)[:3000]}\n\n"
        f"Important: respond in {lang}, matching the language of the user's request. "
        "Use 2–4 short bullet points. Mention what was done and any errors or next steps."
    )
    try:
        client = LLMClient()
        return client.chat_completion(
            system=f"You summarize system execution results for the user. Always respond in {lang}.",
            messages=[{"role": "user", "content": summary_prompt}],
            max_tokens=500,
        )
    except Exception as e:
        return f"Execution complete. Raw results: {json.dumps(results, ensure_ascii=False)}"


def repl():
    print("🤖 getfastcalc AI Agent")
    print("Type a command (e.g., 'create a bmi calculator', 'run maintenance and push'), or 'quit'.\n")
    while True:
        try:
            user_input = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not user_input:
            continue
        if user_input.lower() in {"quit", "exit", "q"}:
            break
        try:
            plan = build_plan(user_input)
            results = execute_plan(plan)
            summary = summarize_results(user_input, results)
            print("\n" + summary + "\n")
        except Exception as e:
            print(f"[agent] Error: {e}\n")
    print("Goodbye!")


def run_once(command: str):
    plan = build_plan(command)
    results = execute_plan(plan)
    print(summarize_results(command, results))


if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_once(" ".join(sys.argv[1:]))
    else:
        repl()
