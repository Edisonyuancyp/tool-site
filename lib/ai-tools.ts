// Shared utilities for AI / prompt tools.

export interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  inputPrice: number; // USD per 1M input tokens
  outputPrice: number; // USD per 1M output tokens
  contextWindow: number; // tokens
  outputLimit: number; // tokens
}

export const AI_MODELS: ModelPricing[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", inputPrice: 2.5, outputPrice: 10.0, contextWindow: 128000, outputLimit: 16384 },
  { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", inputPrice: 0.15, outputPrice: 0.6, contextWindow: 128000, outputLimit: 16384 },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI", inputPrice: 10.0, outputPrice: 30.0, contextWindow: 128000, outputLimit: 4096 },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", inputPrice: 3.0, outputPrice: 15.0, contextWindow: 200000, outputLimit: 8192 },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", inputPrice: 0.25, outputPrice: 1.25, contextWindow: 200000, outputLimit: 4096 },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", inputPrice: 15.0, outputPrice: 75.0, contextWindow: 200000, outputLimit: 4096 },
  { id: "gemini-1-5-pro", name: "Gemini 1.5 Pro", provider: "Google", inputPrice: 1.25, outputPrice: 5.0, contextWindow: 2000000, outputLimit: 8192 },
  { id: "gemini-1-5-flash", name: "Gemini 1.5 Flash", provider: "Google", inputPrice: 0.075, outputPrice: 0.3, contextWindow: 1000000, outputLimit: 8192 },
  { id: "llama-3-1-70b", name: "Llama 3.1 70B", provider: "Meta", inputPrice: 0.9, outputPrice: 0.9, contextWindow: 131072, outputLimit: 4096 },
  { id: "llama-3-1-8b", name: "Llama 3.1 8B", provider: "Meta", inputPrice: 0.18, outputPrice: 0.18, contextWindow: 131072, outputLimit: 4096 },
];

export const DEFAULT_MODEL = AI_MODELS[0];

/** Rough token estimate: ~4 chars / token for English, with word count fallback. */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const charTokens = Math.ceil(trimmed.length / 4);
  const wordCount = trimmed.split(/\s+/).length;
  const wordTokens = Math.ceil(wordCount * 1.3);
  return Math.max(1, Math.round((charTokens + wordTokens) / 2));
}

export function estimateCost(tokens: number, pricePer1M: number): number {
  return (tokens / 1_000_000) * pricePer1M;
}

export function formatCost(usd: number): string {
  if (usd < 0.0001) return `$${usd.toExponential(2)}`;
  return `$${usd.toFixed(6)}`;
}

export function formatTokens(n: number): string {
  return n.toLocaleString();
}

/** Clean prompt: remove extra whitespace, smart quotes, normalize. */
export function cleanPrompt(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2026]/g, "...")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Simple prompt optimization: trim, remove filler words, suggest shorter phrasing. */
export function optimizePrompt(text: string): {
  original: string;
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  tips: string[];
} {
  const original = text.trim();
  let optimized = cleanPrompt(original);

  // Remove common filler phrases
  const fillers = [
    /\bplease\s+/gi,
    /\bI would like\s+/gi,
    /\bI want\s+/gi,
    /\bcould you\s+/gi,
    /\bwould you\s+/gi,
    /\bkindly\s+/gi,
    /\bjust\s+/gi,
    /\breally\s+/gi,
    /\bvery\s+/gi,
  ];
  fillers.forEach((re) => {
    optimized = optimized.replace(re, "");
  });

  // Convert to imperative where possible
  optimized = optimized
    .replace(/\bCan you (show|explain|tell|give|list|help)/gi, (_, verb) => `${verb.charAt(0).toUpperCase() + verb.slice(1)}`)
    .replace(/\bI need (to know|help with|a|an)/gi, (_, rest) => rest ? rest.replace(/\bto know\b/gi, "").trim() : "")
    .replace(/\bHelp me\b/gi, "")
    .trim();

  optimized = cleanPrompt(optimized);

  const originalTokens = estimateTokens(original);
  const optimizedTokens = estimateTokens(optimized);
  const savedTokens = Math.max(0, originalTokens - optimizedTokens);

  const tips: string[] = [];
  if (original.length > optimized.length) tips.push("Removed filler words and polite padding");
  if (original.split("\n").length > 5) tips.push("Consider breaking a very long prompt into shorter messages");
  if (original.includes("please") || original.includes("could you")) tips.push("Use direct imperative commands instead of polite requests");
  if (original.split(/\.\s+/).length > 8) tips.push("Try bullet points for multiple instructions");
  if (tips.length === 0) tips.push("Prompt is already concise");

  return { original, optimized, originalTokens, optimizedTokens, savedTokens, tips };
}

/** Extract variable placeholders like {{name}}, {name}, [name]. */
export function extractVariables(prompt: string): string[] {
  const seen = new Set<string>();
  const patterns = [
    /\{\{([a-zA-Z0-9_]+)\}\}/g,
    /\{([a-zA-Z0-9_]+)\}/g,
    /\[([a-zA-Z0-9_]+)\]/g,
    /\$([a-zA-Z0-9_]+)/g,
  ];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(prompt)) !== null) {
      seen.add(m[1]);
    }
  });
  return [...seen].sort();
}

/** Split a prompt into chunks of ~maxTokens. */
export function splitByTokens(text: string, maxTokens: number): string[] {
  if (!text) return [];
  const avgChars = 4;
  const maxChars = Math.max(1, maxTokens * avgChars);
  const chunks: string[] = [];
  let current = "";
  const words = text.split(/\s+/);
  for (const word of words) {
    if ((current + " " + word).length > maxChars && current) {
      chunks.push(current.trim());
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

/** Diff two strings line by line. */
export function diffLines(a: string, b: string): { type: "same" | "removed" | "added"; text: string }[] {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const result: { type: "same" | "removed" | "added"; text: string }[] = [];
  let i = 0, j = 0;
  while (i < aLines.length || j < bLines.length) {
    if (i < aLines.length && j < bLines.length && aLines[i] === bLines[j]) {
      result.push({ type: "same", text: aLines[i] });
      i++; j++;
    } else if (i < aLines.length && !bLines.includes(aLines[i])) {
      result.push({ type: "removed", text: aLines[i] });
      i++;
    } else if (j < bLines.length && !aLines.includes(bLines[j])) {
      result.push({ type: "added", text: bLines[j] });
      j++;
    } else {
      // both changed
      if (i < aLines.length) { result.push({ type: "removed", text: aLines[i] }); i++; }
      if (j < bLines.length) { result.push({ type: "added", text: bLines[j] }); j++; }
    }
  }
  return result;
}
