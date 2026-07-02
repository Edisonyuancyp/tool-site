#!/usr/bin/env python3
"""
analyze_seo.py
Read optimization candidates from fetch_gsc_data.py, send them to an AI model,
and receive structured title/meta rewrite suggestions. Saves the result to
optimization_suggestions.json.
"""

import json
import os
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv


def load_env() -> None:
    """Load environment variables from .env in the script directory."""
    script_dir = Path(__file__).resolve().parent
    env_file = script_dir / ".env"
    if env_file.exists():
        load_dotenv(env_file, override=True)
    else:
        load_dotenv(script_dir / ".env.example")


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(
            f"Missing required environment variable: {name}. "
            "Copy .env.example to .env and fill in the values."
        )
    return value


def build_prompt(candidates: list[dict[str, Any]]) -> str:
    """Compose the SEO analysis prompt in Chinese as requested."""
    data_block = json.dumps(candidates, ensure_ascii=False, indent=2)
    prompt = f"""作为 SEO 专家，分析以下在 Google 搜索结果中排名约 50 且点击率为 0 的页面。
这些页面有展示次数但没有任何点击，说明标题（title）和描述（description）可能不够吸引用户。

数据如下（JSON 格式）：
{data_block}

针对每个 URL，请完成以下任务：
1. 简要分析为什么当前标题和描述导致点击率为 0（用户痛点、搜索意图不匹配、标题不够具体等）。
2. 提出 3 个更具点击吸引力的优化建议，每个建议应包含新的标题和描述。
3. 优化方向必须侧重：增加年份、突出痛点/利益点、加入明确的行动点（如“免费使用”、“立即计算”、“在线查看”）。
4. 以 JSON 数组返回，每个元素包含：url、current_title、current_description、analysis、suggestions（含 new_title、new_description、reason）。

请只返回 JSON，不要返回 Markdown 代码块或其他解释文字。"""
    return prompt


def call_claude(prompt: str, model: str, api_key: str) -> str:
    """Call Anthropic Claude API and return the raw text response."""
    try:
        import anthropic
    except ImportError as exc:
        print("Missing anthropic SDK. Run: pip install -r requirements.txt")
        raise exc

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model=model,
        max_tokens=4096,
        temperature=0.6,
        system="You are a senior SEO specialist. You always return valid JSON only, with no markdown formatting.",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def call_openai(prompt: str, model: str, api_key: str) -> str:
    """Call OpenAI API and return the raw text response."""
    try:
        from openai import OpenAI
    except ImportError as exc:
        print("Missing openai SDK. Run: pip install -r requirements.txt")
        raise exc

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model,
        temperature=0.6,
        max_tokens=4096,
        messages=[
            {
                "role": "system",
                "content": "You are a senior SEO specialist. You always return valid JSON only, with no markdown formatting.",
            },
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content


def call_ai(prompt: str, model: str) -> str:
    """Route to the appropriate AI provider based on the model name."""
    model_lower = model.lower()
    if model_lower.startswith("claude"):
        api_key = get_required_env("ANTHROPIC_API_KEY")
        return call_claude(prompt, model, api_key)
    if model_lower.startswith("gpt"):
        api_key = get_required_env("OPENAI_API_KEY")
        return call_openai(prompt, model, api_key)
    raise ValueError(f"Unsupported AI model: {model}. Use a Claude or GPT model.")


def extract_json(text: str) -> list[dict[str, Any]]:
    """Try to extract the JSON array from the model response."""
    text = text.strip()
    # Remove markdown code fences if present.
    if text.startswith("```"):
        text = text.strip("`").strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Attempt to find the first JSON array in the text.
        start = text.find("[")
        end = text.rfind("]")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError as inner_e:
                raise ValueError(f"Could not parse AI response as JSON: {inner_e}\n\nRaw response:\n{text}") from e
        raise ValueError(f"Could not parse AI response as JSON: {e}\n\nRaw response:\n{text}") from e


def format_for_review(suggestions: list[dict[str, Any]]) -> str:
    """Return a human-readable Markdown summary for quick review."""
    lines = ["# SEO 优化建议\n"]
    for item in suggestions:
        lines.append(f"## {item.get('url', '')}")
        lines.append(f"- 当前标题：{item.get('current_title', '')}")
        lines.append(f"- 当前描述：{item.get('current_description', '')}")
        lines.append(f"- 分析：{item.get('analysis', '')}\n")
        for idx, suggestion in enumerate(item.get("suggestions", []), 1):
            lines.append(f"### 建议 {idx}")
            lines.append(f"- 新标题：{suggestion.get('new_title', '')}")
            lines.append(f"- 新描述：{suggestion.get('new_description', '')}")
            lines.append(f"- 理由：{suggestion.get('reason', '')}\n")
        lines.append("---\n")
    return "\n".join(lines)


def main() -> int:
    load_env()

    script_dir = Path(__file__).resolve().parent
    input_path = script_dir / "gsc_optimization_candidates.json"
    output_path = script_dir / "optimization_suggestions.json"
    review_path = script_dir / "optimization_suggestions_review.md"
    model = os.getenv("AI_MODEL", "claude-3-5-sonnet-20241022")

    if not input_path.exists():
        print(f"[analyze] Input file not found: {input_path}")
        print("[analyze] Run fetch_gsc_data.py first to generate candidates.")
        return 1

    with input_path.open(encoding="utf-8") as f:
        candidates = json.load(f)

    if not candidates:
        print("[analyze] No candidates to analyze. Exiting.")
        return 0

    print(f"[analyze] Building prompt for {len(candidates)} candidates...")
    prompt = build_prompt(candidates)

    print(f"[analyze] Sending to {model}...")
    raw_response = call_ai(prompt, model)

    print("[analyze] Parsing AI response...")
    suggestions = extract_json(raw_response)

    output_path.write_text(json.dumps(suggestions, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[analyze] Saved structured suggestions to {output_path}")

    review = format_for_review(suggestions)
    review_path.write_text(review, encoding="utf-8")
    print(f"[analyze] Saved human-readable review to {review_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
