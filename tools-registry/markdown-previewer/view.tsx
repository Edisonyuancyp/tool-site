"use client";
import { useState, useMemo } from "react";

export interface ToolProps { variant?: string; }

// ── Lightweight Markdown → HTML (no external deps) ────────────────────────────

function mdToHtml(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="md-pre"><code class="${lang ? `language-${lang}` : ""}">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trimEnd()}</code></pre>`)
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    // Headings
    .replace(/^#{6} (.+)$/gm, "<h6>$1</h6>")
    .replace(/^#{5} (.+)$/gm, "<h5>$1</h5>")
    .replace(/^#{4} (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // HR
    .replace(/^---$/gm, "<hr />")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Images (before links)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Tables
  html = html.replace(/(\|.+\|\n)+/g, (table) => {
    const rows = table.trim().split("\n");
    const header = rows[0].split("|").filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join("");
    const body = rows.slice(2).map(r =>
      "<tr>" + r.split("|").filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join("") + "</tr>"
    ).join("");
    return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
  });

  // Unordered lists
  html = html.replace(/(^[\*\-] .+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map(l => `<li>${l.replace(/^[\*\-] /, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(^\d+\. .+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map(l => `<li>${l.replace(/^\d+\. /, "")}</li>`).join("");
    return `<ol>${items}</ol>`;
  });

  // Paragraphs (lines not already wrapped)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>");

  return html;
}

// ── Default sample ─────────────────────────────────────────────────────────────

const SAMPLE = `# Markdown Previewer

Write Markdown on the **left**, see the preview on the **right** — *live*.

## Features

- Headings (H1–H6)
- **Bold**, *italic*, ~~strikethrough~~
- \`inline code\` and code blocks
- Links and images
- Ordered and unordered lists
- Tables
- Blockquotes

## Code example

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("World"));
\`\`\`

## Table

| Name       | Role       | Salary  |
|------------|------------|---------|
| Alice      | Engineer   | $120k   |
| Bob        | Designer   | $95k    |

> "The best way to predict the future is to invent it." — Alan Kay

---

[Visit GetFastCalc](https://getfastcalc.com)
`;

export default function MarkdownPreviewerView() {
  const [md, setMd] = useState(SAMPLE);
  const [view, setView] = useState<"split" | "preview" | "source">("split");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => mdToHtml(md), [md]);

  const copy = () => {
    navigator.clipboard?.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["split", "source", "preview"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${view === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {v === "split" ? "⬛ Split" : v === "source" ? "✏️ Source" : "👁 Preview"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMd(SAMPLE)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-all">
            Reset
          </button>
          <button onClick={copy}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"}`}>
            {copied ? "✓ Copied" : "Copy Markdown"}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className={`grid gap-4 ${view === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Source */}
        {(view === "split" || view === "source") && (
          <div className="flex flex-col">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Markdown</div>
            <textarea
              value={md}
              onChange={e => setMd(e.target.value)}
              spellCheck={false}
              className="flex-1 border border-gray-200 rounded-xl p-4 text-sm font-mono text-gray-800 focus:outline-none focus:border-gray-400 resize-none leading-relaxed bg-gray-950 text-gray-100 min-h-[460px]"
            />
          </div>
        )}

        {/* Preview */}
        {(view === "split" || view === "preview") && (
          <div className="flex flex-col">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Preview</div>
            <div
              className="flex-1 border border-gray-200 rounded-xl p-5 overflow-auto min-h-[460px] bg-white prose prose-sm max-w-none
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
                [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5
                [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-gray-700
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1
                [&_li]:text-gray-700 [&_li]:text-sm
                [&_strong]:font-bold [&_em]:italic
                [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-gray-800
                [&_.md-pre]:bg-gray-950 [&_.md-pre]:rounded-xl [&_.md-pre]:p-4 [&_.md-pre]:mb-3 [&_.md-pre]:overflow-x-auto
                [&_.md-pre_code]:bg-transparent [&_.md-pre_code]:text-gray-100 [&_.md-pre_code]:text-xs [&_.md-pre_code]:p-0
                [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:text-gray-500 [&_blockquote]:italic [&_blockquote]:my-3
                [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                [&_hr]:border-gray-200 [&_hr]:my-4
                [&_del]:line-through [&_del]:text-gray-400
                [&_img]:max-w-full [&_img]:rounded-lg
                [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:mb-3
                [&_th]:bg-gray-50 [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-gray-700
                [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-600"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
