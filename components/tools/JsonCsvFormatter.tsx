"use client";
import { useState, useMemo } from "react";

type Mode = "json" | "csv";

function formatJson(input: string): { output: string; error: string | null } {
  try {
    const parsed = JSON.parse(input.trim());
    return { output: JSON.stringify(parsed, null, 2), error: null };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

function minifyJson(input: string): { output: string; error: string | null } {
  try {
    const parsed = JSON.parse(input.trim());
    return { output: JSON.stringify(parsed), error: null };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

function validateJson(input: string): { valid: boolean; message: string; type: string } {
  if (!input.trim()) return { valid: false, message: "Empty input", type: "" };
  try {
    const parsed = JSON.parse(input.trim());
    const type = Array.isArray(parsed) ? "Array" : typeof parsed === "object" && parsed !== null ? "Object" : typeof parsed;
    const keys = typeof parsed === "object" && parsed !== null ? Object.keys(parsed).length : 0;
    const msg = Array.isArray(parsed)
      ? `Valid JSON Array — ${parsed.length} items`
      : typeof parsed === "object" && parsed !== null
      ? `Valid JSON Object — ${keys} keys`
      : `Valid JSON — ${type}`;
    return { valid: true, message: msg, type };
  } catch (e) {
    return { valid: false, message: (e as Error).message, type: "" };
  }
}

function formatCsv(input: string, delimiter: string): { output: string; error: string | null; rows: number; cols: number } {
  try {
    const lines = input.trim().split(/\r?\n/);
    if (lines.length === 0) return { output: "", error: "Empty input", rows: 0, cols: 0 };

    const parsed = lines.map((line) => {
      const cells: string[] = [];
      let current = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuote && line[i + 1] === '"') { current += '"'; i++; }
          else inQuote = !inQuote;
        } else if (ch === delimiter && !inQuote) {
          cells.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
      cells.push(current);
      return cells;
    });

    const maxCols = Math.max(...parsed.map((r) => r.length));
    // Normalize all rows to same column count
    const normalized = parsed.map((row) => {
      while (row.length < maxCols) row.push("");
      return row;
    });

    const formatted = normalized.map((row) =>
      row.map((cell) => {
        const needsQuote = cell.includes(delimiter) || cell.includes('"') || cell.includes("\n") || cell.includes(" ");
        const escaped = cell.replace(/"/g, '""');
        return needsQuote ? `"${escaped}"` : cell;
      }).join(delimiter)
    ).join("\n");

    return { output: formatted, error: null, rows: normalized.length, cols: maxCols };
  } catch (e) {
    return { output: "", error: (e as Error).message, rows: 0, cols: 0 };
  }
}

function csvToJson(input: string, delimiter: string): { output: string; error: string | null } {
  try {
    const lines = input.trim().split(/\r?\n/);
    if (lines.length < 2) return { output: "", error: "Need at least a header row + 1 data row" };
    const parseRow = (line: string): string[] => {
      const cells: string[] = [];
      let current = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuote && line[i + 1] === '"') { current += '"'; i++; }
          else inQuote = !inQuote;
        } else if (ch === delimiter && !inQuote) {
          cells.push(current.trim()); current = "";
        } else { current += ch; }
      }
      cells.push(current.trim());
      return cells;
    };
    const headers = parseRow(lines[0]);
    const result = lines.slice(1).map((line) => {
      const vals = parseRow(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      return obj;
    });
    return { output: JSON.stringify(result, null, 2), error: null };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

const JSON_SAMPLE = `{"name":"Alice","age":30,"scores":[95,87,92],"address":{"city":"Bangkok","country":"Thailand"}}`;
const CSV_SAMPLE = `name,age,city,score
Alice,30,Bangkok,95
Bob,25,Tokyo,87
Charlie,35,London,92`;

export default function JsonCsvFormatter() {
  const [mode, setMode] = useState<Mode>("json");
  const [input, setInput] = useState("");
  const [jsonAction, setJsonAction] = useState<"format" | "minify">("format");
  const [csvDelimiter, setCsvDelimiter] = useState(",");
  const [csvAction, setCsvAction] = useState<"format" | "toJson">("format");
  const [copied, setCopied] = useState(false);

  const jsonResult = useMemo(() => {
    if (mode !== "json" || !input.trim()) return null;
    return jsonAction === "format" ? formatJson(input) : minifyJson(input);
  }, [mode, input, jsonAction]);

  const jsonValidation = useMemo(() => {
    if (mode !== "json" || !input.trim()) return null;
    return validateJson(input);
  }, [mode, input]);

  const csvResult = useMemo(() => {
    if (mode !== "csv" || !input.trim()) return null;
    if (csvAction === "toJson") return csvToJson(input, csvDelimiter);
    return formatCsv(input, csvDelimiter);
  }, [mode, input, csvDelimiter, csvAction]);

  const output = mode === "json" ? (jsonResult?.output ?? "") : (csvResult?.output ?? "");
  const error = mode === "json" ? (jsonResult?.error ?? null) : (csvResult?.error ?? null);

  function handleCopy() {
    navigator.clipboard?.writeText(output).catch(() => {
      const el = document.createElement("textarea");
      el.value = output;
      el.style.position = "fixed"; el.style.left = "-9999px";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      {/* Mode + actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex">
          {(["json", "csv"] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setInput(""); }}
              className={"px-4 py-2 text-sm font-bold border transition-all first:rounded-l-xl last:rounded-r-xl uppercase " +
                (mode === m ? "bg-gray-900 text-white border-gray-900 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
              {m}
            </button>
          ))}
        </div>

        {mode === "json" && (
          <div className="flex">
            {(["format", "minify"] as const).map((a) => (
              <button key={a} type="button" onClick={() => setJsonAction(a)}
                className={"px-3.5 py-2 text-xs font-semibold border transition-all first:rounded-l-lg last:rounded-r-lg capitalize " +
                  (jsonAction === a ? "bg-blue-600 text-white border-blue-600 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
                {a}
              </button>
            ))}
          </div>
        )}

        {mode === "csv" && (
          <>
            <div className="flex">
              {(["format", "toJson"] as const).map((a) => (
                <button key={a} type="button" onClick={() => setCsvAction(a)}
                  className={"px-3.5 py-2 text-xs font-semibold border transition-all first:rounded-l-lg last:rounded-r-lg " +
                    (csvAction === a ? "bg-blue-600 text-white border-blue-600 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
                  {a === "toJson" ? "→ JSON" : "Format"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Delimiter:</span>
              {[",", ";", "\t", "|"].map((d) => (
                <button key={d} type="button" onClick={() => setCsvDelimiter(d)}
                  className={"px-2.5 py-1 rounded-lg border font-mono font-bold transition-all " +
                    (csvDelimiter === d ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 hover:border-gray-400 text-gray-600")}>
                  {d === "\t" ? "TAB" : d}
                </button>
              ))}
            </div>
          </>
        )}

        <button type="button" onClick={() => setInput(mode === "json" ? JSON_SAMPLE : CSV_SAMPLE)}
          className="ml-auto text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
          Load Sample
        </button>
      </div>

      {/* Validation badge for JSON */}
      {mode === "json" && jsonValidation && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
          jsonValidation.valid ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <span>{jsonValidation.valid ? "✓" : "✗"}</span>
          <span>{jsonValidation.message}</span>
        </div>
      )}

      {mode === "csv" && csvResult && !csvResult.error && "rows" in csvResult && "cols" in csvResult && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border bg-green-50 border-green-200 text-green-700">
          <span>✓</span>
          <span>{(csvResult as {rows:number;cols:number}).rows} rows × {(csvResult as {rows:number;cols:number}).cols} columns</span>
        </div>
      )}

      {/* Input / Output */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16}
            placeholder={mode === "json" ? 'Paste JSON here…\n{"key": "value"}' : "Paste CSV here…\nname,age,city\nAlice,30,Bangkok"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-mono text-xs text-gray-900 focus:outline-none focus:border-gray-400 resize-y" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Output</label>
            {output && (
              <button type="button" onClick={handleCopy}
                className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>
          {error ? (
            <div className="w-full h-64 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 font-mono text-xs text-red-700 overflow-auto">
              Error: {error}
            </div>
          ) : (
            <textarea readOnly value={output} rows={16}
              placeholder="Output appears here…"
              className="w-full border border-gray-100 rounded-xl px-3 py-2.5 font-mono text-xs text-gray-900 bg-gray-50 resize-y" />
          )}
        </div>
      </div>
    </div>
  );
}
