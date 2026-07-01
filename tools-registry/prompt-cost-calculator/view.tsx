"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import {
  AI_MODELS,
  estimateTokens,
  estimateCost,
  formatCost,
  formatTokens,
} from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function PromptCostCalculatorView({ variant }: ToolProps) {
  const [inputText, setInputText] = useState("");
  const [outputTokens, setOutputTokens] = useState<number | "">("");
  const [modelId, setModelId] = useState(AI_MODELS[0].id);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const model = useMemo(() => AI_MODELS.find((m) => m.id === modelId) ?? AI_MODELS[0], [modelId]);

  const inputTokens = useMemo(() => estimateTokens(inputText), [inputText]);
  const estimatedOutputTokens = Number(outputTokens) || Math.max(1, Math.round(inputTokens * 0.4));

  const inputCost = estimateCost(inputTokens, model.inputPrice);
  const outputCost = estimateCost(estimatedOutputTokens, model.outputPrice);
  const totalCost = inputCost + outputCost;

  const resultText = useMemo(() => {
    return `Model: ${model.name} (${model.provider})\n` +
      `Input tokens: ${formatTokens(inputTokens)}\n` +
      `Estimated output tokens: ${formatTokens(estimatedOutputTokens)}\n` +
      `Input cost: ${formatCost(inputCost)}\n` +
      `Output cost: ${formatCost(outputCost)}\n` +
      `Total cost: ${formatCost(totalCost)}\n` +
      `Context window: ${formatTokens(model.contextWindow)} tokens`;
  }, [model, inputTokens, estimatedOutputTokens, inputCost, outputCost, totalCost]);

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">
          Mode: {variant}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Prompt text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your prompt here..."
          rows={6}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Estimated input tokens: {formatTokens(inputTokens)}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Model
        </label>
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:outline-none focus:border-gray-400 text-base"
        >
          {AI_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — ${m.inputPrice}/${m.outputPrice} per 1M tokens
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((s) => !s)}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        {showAdvanced ? "Hide advanced options" : "Advanced options"}
      </button>

      {showAdvanced && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Expected output tokens (optional)
          </label>
          <input
            type="number"
            min={0}
            value={outputTokens}
            onChange={(e) => setOutputTokens(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Leave blank to auto-estimate"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
      )}

      {resultText && (
        <div className="flex items-start justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">
            {resultText}
          </pre>
          <CopyButton text={resultText} />
        </div>
      )}
    </div>
  );
}
