#!/usr/bin/env python3
"""
generate-problem-tool-content.py — Generate "Problem + Tool" content pages for recent tools.

Strategy:
  For each recently-added high-value tool (AI/SEO/Social/Image/File), generate a blog article
  that targets a real search question related to that tool. The article explains the problem,
  embeds the tool as the solution, and links to related tools.

Output:
  app/blog/<slug>/page.tsx — a Next.js page with SEO metadata, structured data, and content.

Usage:
  python scripts/generate-problem-tool-content.py --slug prompt-token-counter
  python scripts/generate-problem-tool-content.py --category ai --limit 5
  python scripts/generate-problem-tool-content.py --recent 3
"""

import json, os, argparse, time, re
from pathlib import Path
from llm_client import LLMClient

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT / "tools-registry"
BLOG_DIR = ROOT / "app" / "blog"

DEFAULT_MODEL = "claude-3-haiku-20240307"
SELECTED_MODEL = DEFAULT_MODEL


def call_llm(prompt: str, model: str = "") -> str:
    client = LLMClient()
    if not any(client._key_for(p) for p in client.providers):
        print("[ERROR] No LLM API keys found. Set OPENAI_API_KEY, CLAUDE_API_KEY, or GEMINI_API_KEY.")
        return ""
    try:
        return client.chat_completion(
            system="You are an SEO content writer for GetFastCalc. You write concise, accurate, problem-solving articles that rank in Google. Output JSON only. No markdown fences.",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2500,
            model=model or None,
            json_mode=True,
        )
    except Exception as e:
        print(f"[LLM error] {e}")
        return ""


def sanitize_filename(text: str) -> str:
    return re.sub(r"[^a-z0-9-]", "", text.lower().replace(" ", "-").replace("_", "-"))[:60]


# Mirror of lib/tools.ts CATEGORY_URL_PREFIX for Python scripts
CATEGORY_URL_PREFIX: dict[str, str] = {
    "Finance": "calc", "Math": "calc", "Health": "calc", "Crypto": "calc",
    "Fitness": "calc", "Quant": "calc", "AI": "ai", "Design": "design",
    "Generators": "design", "Developer": "dev", "Text": "dev", "Security": "dev",
    "Content": "dev", "Utilities": "dev", "Date & Time": "time", "Travel": "time",
    "Converter": "converter", "Cooking": "converter", "Productivity": "converter",
    "Ecommerce": "ecommerce", "ecommerce": "ecommerce", "SEO": "seo", "Social": "social",
    "Media": "social", "Image": "image", "File": "file",
}


def get_tool_path(slug: str) -> str:
    # Use category prefix if known, fallback to /tools/<slug>
    meta_path = REGISTRY_DIR / slug / "meta.json"
    if meta_path.exists():
        try:
            meta = json.loads(meta_path.read_text())
            cat = meta.get("category", "")
            prefix = CATEGORY_URL_PREFIX.get(cat, "")
            if prefix:
                return f"/tools/{prefix}/{slug}"
        except Exception:
            pass
    return f"/tools/{slug}"


def get_tool_meta(slug: str) -> dict | None:
    meta_path = REGISTRY_DIR / slug / "meta.json"
    if not meta_path.exists():
        return None
    try:
        return json.loads(meta_path.read_text())
    except Exception:
        return None


def problem_for_tool(meta: dict) -> dict | None:
    """Generate a problem+tool article for one tool. Returns dict with article fields."""
    name = meta.get("name", "")
    slug = meta.get("slug", "")
    category = meta.get("category", "")
    description = meta.get("description", "")
    tagline = meta.get("tagline", "")
    keywords = meta.get("keywords", [])[:5]
    related = meta.get("relatedTools", [])[:5]
    tool_url = get_tool_path(slug)

    related_links = []
    for rslug in related:
        rm = get_tool_meta(rslug)
        if rm:
            rpath = get_tool_path(rslug)
            related_links.append(f'            <li><Link href="{rpath}" className="text-blue-600 hover:underline font-medium">{rm["name"]}</Link> — {rm.get("tagline", "")}</li>')

    prompt = f"""Generate a problem-solving article for the GetFastCalc tool "{name}".

Tool URL: {tool_url}
Tool category: {category}
Tool description: {description}
Tool tagline: {tagline}
Keywords: {', '.join(keywords)}

The article should target ONE real search question that a user would type into Google before needing this tool. For example:
- For a "Prompt Token Counter", the question is "How many tokens is 10,000 words?"
- For a "Prompt Cost Calculator", the question is "How much does GPT-4o cost for 1,000 tokens?"
- For a "Twitter Character Counter", the question is "How many characters can a tweet be?"

Return JSON with exactly these keys:
{{
  "question": "The exact search question as a string (60-90 characters, ends with ?)",
  "articleSlug": "kebab-case slug for the blog post URL (e.g. how-many-tokens-in-10000-words)",
  "title": "SEO title (50-60 chars, includes the question or keyword)",
  "metaDescription": "160-char meta description, includes the question and mentions free tool",
  "keywords": ["keyword1", "keyword2", "keyword3", "long-tail keyword"],
  "h1": "Main heading (1 sentence, includes the question)",
  "shortAnswer": "2-3 sentence direct answer to the question",
  "explanation": "3-5 paragraphs of detailed explanation (300-500 words). Use plain text, no markdown. Each paragraph separated by \\n\\n.",
  "faq": [
    {{"question": "Q1", "answer": "A1"}},
    {{"question": "Q2", "answer": "A2"}},
    {{"question": "Q3", "answer": "A3"}},
    {{"question": "Q4", "answer": "A4"}},
    {{"question": "Q5", "answer": "A5"}}
  ]
}}

Requirements:
- The article must be accurate and directly useful.
- The explanation should teach the concept, not just sell the tool.
- FAQs should cover common follow-up questions.
- Output ONLY the JSON object, no markdown fences.
"""

    raw = call_llm(prompt, model=SELECTED_MODEL)
    if not raw:
        return None
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1][4:] if parts[1].startswith("json") else parts[1]
    try:
        data = json.loads(raw.strip())
    except Exception as e:
        print(f"[parse error] {e}: {raw[:200]}")
        return None

    return data


def write_article(tool_meta: dict, article: dict, dry_run: bool) -> str:
    slug = article.get("articleSlug", sanitize_filename(article.get("question", "")))
    if not slug:
        slug = f"{tool_meta['slug']}-guide"

    page_dir = BLOG_DIR / slug
    page_path = page_dir / "page.tsx"

    title = article.get("title", f"{tool_meta['name']} Guide")
    meta_description = article.get("metaDescription", tool_meta.get("description", ""))
    keywords = article.get("keywords", tool_meta.get("keywords", []))
    h1 = article.get("h1", article.get("question", title))
    short_answer = article.get("shortAnswer", "")
    explanation = article.get("explanation", "")
    faq = article.get("faq", [])
    tool_url = get_tool_path(tool_meta["slug"])
    tool_name = tool_meta.get("name", "")
    tool_tagline = tool_meta.get("tagline", "")

    # Split explanation into paragraphs
    explanation_paragraphs = [p.strip() for p in explanation.split("\n\n") if p.strip()]
    explanation_jsx = "\n\n".join(f"<p>{p}</p>" for p in explanation_paragraphs)

    faq_items = []
    for q in faq:
        faq_items.append(f"""              <div className=\"border border-gray-200 rounded-xl p-5\">\n                <p className=\"font-semibold text-gray-900 mb-2\">{q['question']}</p>\n                <p className=\"text-gray-600 text-sm\">{q['answer']}</p>\n              </div>""")
    faq_jsx = "\n".join(faq_items)

    related_meta = [get_tool_meta(s) for s in tool_meta.get("relatedTools", [])[:5]]
    related_meta = [m for m in related_meta if m]
    related_jsx = "\n".join(
        f'            <li><Link href="{get_tool_path(m["slug"])}" className="text-blue-600 hover:underline font-medium">{m["name"]}</Link> — {m.get("tagline", "")}</li>'
        for m in related_meta
    )

    page_content = f'''import type {{ Metadata }} from "next";
import Link from "next/link";

export const metadata: Metadata = {{
  title: "{title}",
  description: "{meta_description}",
  keywords: {json.dumps(keywords)},
  alternates: {{ canonical: "https://getfastcalc.com/blog/{slug}" }},
  openGraph: {{
    title: "{title}",
    description: "{meta_description}",
    type: "article",
    url: "https://getfastcalc.com/blog/{slug}",
  }},
}};

const jsonLd = {{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{h1}",
  "description": "{meta_description}",
  "datePublished": "{time.strftime('%Y-%m-%d')}",
  "author": {{ "@type": "Organization", "name": "GetFastCalc" }},
  "publisher": {{ "@type": "Organization", "name": "GetFastCalc", "url": "https://getfastcalc.com" }},
  "mainEntityOfPage": "https://getfastcalc.com/blog/{slug}",
}};

export default function Post() {{
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ {{ __html: JSON.stringify(jsonLd) }} }} />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">{tool_meta.get('category', 'Tools')}</span>
            <span className="text-xs text-gray-400">{time.strftime('%B %d, %Y')}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{h1}</h1>
          <p className="text-xl text-gray-500 leading-relaxed">{short_answer}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 my-8">
          <p className="font-semibold text-blue-900 mb-2">Try the free tool</p>
          <p className="text-blue-700 text-sm mb-4">{tool_tagline}</p>
          <Link
            href="{tool_url}"
            className="inline-block bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            Open {tool_name} →
          </Link>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          {explanation_jsx}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Related tools</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
{related_jsx}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
          <div className="space-y-4">
{faq_jsx}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400 mb-4">← <Link href="/blog" className="hover:text-gray-600">Back to Blog</Link></p>
          <Link href="{tool_url}" className="inline-block bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm">
            Open {tool_name} →
          </Link>
        </div>
      </article>
    </>
  );
}}
'''

    if dry_run:
        print(f"  [dry-run] would write {page_path}")
        return slug

    page_dir.mkdir(parents=True, exist_ok=True)
    page_path.write_text(page_content, encoding="utf-8")
    print(f"  ✅ wrote {page_path}")
    return slug


def discover_target_tools(category: str | None, recent: int, limit: int) -> list[dict]:
    """Find tools that need problem+tool articles."""
    candidates = []
    for d in REGISTRY_DIR.iterdir():
        if not d.is_dir() or d.name.startswith("_"):
            continue
        meta = get_tool_meta(d.name)
        if not meta:
            continue
        if category and meta.get("category", "").lower() != category.lower():
            continue
        # Prefer high-value categories if no category filter
        if not category:
            if meta.get("category", "") not in {"AI", "SEO", "Social", "Image", "File", "Quant", "Ecommerce", "ecommerce"}:
                continue
        # Skip if already has a guide
        guide_slug = f"{meta['slug']}-guide"
        if (BLOG_DIR / guide_slug / "page.tsx").exists():
            continue
        candidates.append(meta)

    # Sort by createdAt if available, otherwise by directory mtime
    def sort_key(m):
        p = REGISTRY_DIR / m["slug"] / "meta.json"
        try:
            return p.stat().st_mtime
        except Exception:
            return 0

    candidates.sort(key=sort_key, reverse=True)
    if recent:
        candidates = candidates[:recent]
    if limit:
        candidates = candidates[:limit]
    return candidates


def update_blog_index(new_slugs: list[str], dry_run: bool) -> None:
    """Update app/blog/page.tsx to include new articles."""
    index_path = BLOG_DIR / "page.tsx"
    if not index_path.exists():
        print(f"[warn] {index_path} not found, skipping index update")
        return

    text = index_path.read_text(encoding="utf-8")
    if "POSTS = [" not in text:
        return

    # Rebuild POSTS from current state + new articles
    # For simplicity, we append new entries to the POSTS array
    new_entries = []
    for slug in new_slugs:
        page_path = BLOG_DIR / slug / "page.tsx"
        if not page_path.exists():
            continue
        # Extract title and description from generated page
        content = page_path.read_text(encoding="utf-8")
        title_match = re.search(r'title:\s*"([^"]+)"', content)
        desc_match = re.search(r'description:\s*"([^"]+)"', content)
        title = title_match.group(1) if title_match else slug
        desc = desc_match.group(1) if desc_match else ""
        new_entries.append(f"""  {{
    slug: "{slug}",
    title: "{title}",
    excerpt: "{desc}",
    date: "{time.strftime('%Y-%m-%d')}",
    tag: "Auto",
    readTime: "3 min read",
  }},""")

    if not new_entries:
        return

    entries_text = "\n".join(new_entries)
    # Insert before the closing ] of POSTS
    if text.rfind("];") == -1:
        return
    insert_pos = text.rfind("];")
    new_text = text[:insert_pos] + entries_text + "\n" + text[insert_pos:]

    if dry_run:
        print(f"  [dry-run] would update {index_path}")
        return
    index_path.write_text(new_text, encoding="utf-8")
    print(f"  ✅ updated blog index")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", default="", help="Generate article for a specific tool slug")
    parser.add_argument("--category", default="", help="Generate articles for tools in category")
    parser.add_argument("--recent", type=int, default=0, help="Generate for N most recent tools")
    parser.add_argument("--limit", type=int, default=5, help="Max articles to generate")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, no writes")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="LLM model to use")
    parser.add_argument("--priority", default="", help="Provider priority (e.g. openai,gemini,claude)")
    args = parser.parse_args()

    if args.priority:
        os.environ["LLM_PROVIDER_PRIORITY"] = args.priority

    client = LLMClient()
    if not any(client._key_for(p) for p in client.providers):
        print("[warn] No LLM API keys found. Set OPENAI_API_KEY, CLAUDE_API_KEY, or GEMINI_API_KEY. Use --dry-run to preview.")
        if not args.dry_run:
            return

    global SELECTED_MODEL
    SELECTED_MODEL = args.model

    if args.slug:
        targets = [get_tool_meta(args.slug)]
    else:
        targets = discover_target_tools(args.category, args.recent, args.limit)

    targets = [t for t in targets if t]
    print(f"[generate-problem-tool-content] {len(targets)} tool(s) to process")

    new_slugs = []
    for meta in targets:
        print(f"  → {meta['slug']}: {meta['name']}")
        article = problem_for_tool(meta)
        if not article:
            print(f"    ⚠️ failed to generate article")
            continue
        slug = write_article(meta, article, args.dry_run)
        if slug:
            new_slugs.append(slug)
        time.sleep(0.6)

    if new_slugs:
        update_blog_index(new_slugs, args.dry_run)
        print(f"\n[generate-problem-tool-content] Done — {len(new_slugs)} article(s) generated")
    else:
        print("\n[generate-problem-tool-content] Done — no new articles")


if __name__ == "__main__":
    main()
