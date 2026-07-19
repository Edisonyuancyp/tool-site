"use client";
import { useState, useMemo } from "react";
import { marked } from "marked";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const DEFAULT_MARKDOWN = `# Welcome to Markdown Previewer

Write your **Markdown** on the left and see the *rendered HTML* on the right.

## Features
- Headings
- **Bold** and *italic* text
- Lists (ordered and unordered)
- \`inline code\` and code blocks
- [Links](https://getfastcalc.com)
- Tables

### Code Block
\`\`\`js
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Table

| Name  | Value |
|-------|-------|
| Foo   | 1     |
| Bar   | 2     |

> This is a blockquote.

1. First item
2. Second item
3. Third item
`;

export default function MarkdownPreviewerView({ variant }: ToolProps) {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);

  const html = useMemo(() => {
    try {
      if (!markdown.trim()) return "";
      const result = marked.parse(markdown, { breaks: true });
      return typeof result === "string" ? result : "";
    } catch {
      return "<p class='text-red-500'>Error rendering markdown.</p>";
    }
  }, [markdown]);

  function clearAll() {
    setMarkdown("");
  }

  function loadSample() {
    setMarkdown(DEFAULT_MARKDOWN);
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={loadSample}
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          Load Sample
        </button>
        <button
          onClick={clearAll}
          className="bg-gray-200 text-gray-800 rounded px-4 py-2 hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
        {html && <CopyButton text={html} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Markdown Input
          </label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your Markdown here..."
            className="w-full border rounded px-3 py-2 font-mono text-sm h-96 resize-y focus:outline-none focus:border-gray-400"
            spellCheck={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Preview
          </label>
          <div
            className="w-full border rounded px-4 py-3 h-96 overflow-auto bg-white prose prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-table:border prose-th:border prose-td:border prose-th:px-2 prose-td:px-2"
            dangerouslySetInnerHTML={{ __html: html || "<p class='text-gray-400'>Preview will appear here...</p>" }}
          />
        </div>
      </div>
    </div>
  );
}
