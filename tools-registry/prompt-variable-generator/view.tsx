"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import { extractVariables } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function PromptVariableGeneratorView({ variant }: ToolProps) {
  const [prompt, setPrompt] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const variables = useMemo(() => extractVariables(prompt), [prompt]);

  const filled = useMemo(() => {
    let out = prompt;
    variables.forEach((v) => {
      const val = values[v] ?? "";
      out = out.replace(new RegExp(`\\{\\{${v}\\}\\}|\\{${v}\\}|\\[${v}\\]|\\$${v}`, "g"), val);
    });
    return out;
  }, [prompt, variables, values]);

  const jsonMap = useMemo(() => {
    const map: Record<string, string> = {};
    variables.forEach((v) => (map[v] = values[v] ?? ""));
    return JSON.stringify(map, null, 2);
  }, [variables, values]);

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Prompt template</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Write a {{tone}} email to {{name}} about {{topic}}..."
          rows={6}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
        />
      </div>

      {variables.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Variables</p>
          {variables.map((v) => (
            <div key={v} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="sm:col-span-1 text-sm text-gray-600 self-center">{v}</label>
              <input
                type="text"
                value={values[v] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                placeholder={`Value for ${v}`}
                className="sm:col-span-2 w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
              />
            </div>
          ))}
        </div>
      )}

      {variables.length === 0 && prompt && (
        <p className="text-sm text-gray-500">No variables found. Use placeholders like {'{{name}}'}, {'{name}'}, [name], or $name.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Filled prompt</p>
            <CopyButton text={filled} />
          </div>
          <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">{filled}</pre>
        </div>
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Variables JSON</p>
            <CopyButton text={jsonMap} />
          </div>
          <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">{jsonMap}</pre>
        </div>
      </div>
    </div>
  );
}
