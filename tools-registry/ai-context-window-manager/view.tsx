"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import { AI_MODELS, estimateTokens, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

interface Message { role: string; text: string; }

export default function AiContextWindowManagerView({ variant }: ToolProps) {
  const [modelId, setModelId] = useState(AI_MODELS[0].id);
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", text: "" },
    { role: "user", text: "" },
  ]);

  const model = AI_MODELS.find((m) => m.id === modelId) ?? AI_MODELS[0];

  const totalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.text), 0);
  const pct = Math.min(100, (totalTokens / model.contextWindow) * 100);
  const remaining = Math.max(0, model.contextWindow - totalTokens);

  function updateMessage(index: number, field: keyof Message, value: string) {
    setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function addMessage() {
    setMessages((prev) => [...prev, { role: "user", text: "" }]);
  }

  function removeMessage(index: number) {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  }

  const summary = `Model: ${model.name}\n` +
    `Context window: ${formatTokens(model.contextWindow)} tokens\n` +
    `Total tokens used: ${formatTokens(totalTokens)} (${pct.toFixed(1)}%)\n` +
    `Remaining: ${formatTokens(remaining)} tokens`;

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:outline-none focus:border-gray-400 text-base"
        >
          {AI_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {formatTokens(m.contextWindow)} tokens
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <select
                value={msg.role}
                onChange={(e) => updateMessage(idx, "role", e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white"
              >
                <option value="system">System</option>
                <option value="user">User</option>
                <option value="assistant">Assistant</option>
              </select>
              <span className="text-xs text-gray-400 ml-auto">
                {formatTokens(estimateTokens(msg.text))} tokens
              </span>
              <button
                onClick={() => removeMessage(idx)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <textarea
              value={msg.text}
              onChange={(e) => updateMessage(idx, "text", e.target.value)}
              placeholder={`${msg.role} message...`}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addMessage}
        className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        + Add message
      </button>

      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-start justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">{summary}</pre>
        <CopyButton text={summary} />
      </div>
    </div>
  );
}
