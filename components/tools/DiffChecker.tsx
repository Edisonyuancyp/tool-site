"use client";
import { useState, useMemo } from "react";

type DiffType = "equal" | "insert" | "delete";

interface DiffLine {
  type: DiffType;
  leftLine: number | null;
  rightLine: number | null;
  text: string;
}

// Myers diff algorithm on lines
function diffLines(a: string[], b: string[]): DiffLine[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;

  const v: Map<number, number> = new Map([[1, 0]]);
  const trace: Map<number, number>[] = [];

  outer: for (let d = 0; d <= max; d++) {
    trace.push(new Map(v));
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      const down = v.get(k - 1) ?? -1;
      const right = v.get(k + 1) ?? -1;
      if (k === -d || (k !== d && down < right)) {
        x = right;
      } else {
        x = down + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      v.set(k, x);
      if (x >= n && y >= m) break outer;
    }
  }

  // Backtrack
  const edits: Array<{ type: "insert" | "delete" | "equal"; a?: string; b?: string }> = [];
  let x = n;
  let y = m;

  for (let d = trace.length - 1; d >= 0 && (x > 0 || y > 0); d--) {
    const vd = trace[d];
    const k = x - y;
    let prevK: number;
    const down = vd.get(k - 1) ?? -1;
    const right = vd.get(k + 1) ?? -1;
    if (k === -d || (k !== d && down < right)) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }
    const prevX = vd.get(prevK) ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX + (prevK === k - 1 ? 0 : 1) && y > prevY + (prevK === k + 1 ? 0 : 1)) {
      edits.unshift({ type: "equal", a: a[x - 1], b: b[y - 1] });
      x--; y--;
    }
    if (d > 0) {
      if (prevK === k - 1) {
        edits.unshift({ type: "insert", b: b[y - 1] });
        y--;
      } else {
        edits.unshift({ type: "delete", a: a[x - 1] });
        x--;
      }
    }
  }

  // Convert edits to DiffLine[]
  const result: DiffLine[] = [];
  let li = 1;
  let ri = 1;
  for (const e of edits) {
    if (e.type === "equal") {
      result.push({ type: "equal", leftLine: li++, rightLine: ri++, text: e.a ?? "" });
    } else if (e.type === "delete") {
      result.push({ type: "delete", leftLine: li++, rightLine: null, text: e.a ?? "" });
    } else {
      result.push({ type: "insert", leftLine: null, rightLine: ri++, text: e.b ?? "" });
    }
  }
  return result;
}

const SAMPLES = {
  code: {
    left: `function add(a, b) {
  return a + b;
}

const result = add(1, 2);
console.log(result);`,
    right: `function add(a, b, c = 0) {
  return a + b + c;
}

const result = add(1, 2, 3);
console.log("Result:", result);`,
  },
  json: {
    left: `{
  "name": "Alice",
  "age": 30,
  "city": "New York"
}`,
    right: `{
  "name": "Alice",
  "age": 31,
  "city": "San Francisco",
  "email": "alice@example.com"
}`,
  },
};

export default function DiffChecker() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [mode, setMode] = useState<"split" | "unified">("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const diffs = useMemo(() => {
    let la = left.split("\n");
    let ra = right.split("\n");
    if (ignoreWhitespace) {
      la = la.map((l) => l.trim());
      ra = ra.map((l) => l.trim());
    }
    if (ignoreCase) {
      la = la.map((l) => l.toLowerCase());
      ra = ra.map((l) => l.toLowerCase());
    }
    // Use original lines for display, but diff normalized
    const origLeft = left.split("\n");
    const origRight = right.split("\n");
    const d = diffLines(la, ra);
    // Map back to original text
    let li = 0; let ri = 0;
    return d.map((item) => {
      if (item.type === "equal") {
        const t = origLeft[li] ?? item.text;
        li++; ri++;
        return { ...item, text: t };
      } else if (item.type === "delete") {
        const t = origLeft[li] ?? item.text;
        li++;
        return { ...item, text: t };
      } else {
        const t = origRight[ri] ?? item.text;
        ri++;
        return { ...item, text: t };
      }
    });
  }, [left, right, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    const additions = diffs.filter((d) => d.type === "insert").length;
    const deletions = diffs.filter((d) => d.type === "delete").length;
    const unchanged = diffs.filter((d) => d.type === "equal").length;
    return { additions, deletions, unchanged };
  }, [diffs]);

  const hasDiff = left.length > 0 || right.length > 0;
  const noDifferences = hasDiff && stats.additions === 0 && stats.deletions === 0;

  function loadSample(type: "code" | "json") {
    setLeft(SAMPLES[type].left);
    setRight(SAMPLES[type].right);
  }

  // Split view: pair deleted with inserted lines
  const splitRows = useMemo(() => {
    const rows: Array<{ left: DiffLine | null; right: DiffLine | null }> = [];
    const dels: DiffLine[] = [];
    const ins: DiffLine[] = [];

    for (const d of diffs) {
      if (d.type === "equal") {
        // Flush pending del/ins
        const maxLen = Math.max(dels.length, ins.length);
        for (let i = 0; i < maxLen; i++) {
          rows.push({ left: dels[i] ?? null, right: ins[i] ?? null });
        }
        dels.length = 0; ins.length = 0;
        rows.push({ left: d, right: d });
      } else if (d.type === "delete") {
        dels.push(d);
      } else {
        ins.push(d);
      }
    }
    const maxLen = Math.max(dels.length, ins.length);
    for (let i = 0; i < maxLen; i++) {
      rows.push({ left: dels[i] ?? null, right: ins[i] ?? null });
    }
    return rows;
  }, [diffs]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex">
          {(["split", "unified"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={
                "px-3.5 py-1.5 text-xs font-semibold border transition-all first:rounded-l-lg last:rounded-r-lg capitalize " +
                (mode === m
                  ? "bg-gray-900 text-white border-gray-900 z-10"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")
              }>{m}</button>
          ))}
        </div>

        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} className="accent-gray-900" />
          Ignore whitespace
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="accent-gray-900" />
          Ignore case
        </label>

        <div className="flex gap-1.5 ml-auto">
          <button type="button" onClick={() => loadSample("code")}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
            Sample: Code
          </button>
          <button type="button" onClick={() => loadSample("json")}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
            Sample: JSON
          </button>
          <button type="button" onClick={() => { setLeft(""); setRight(""); }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-600 transition-all">
            Clear
          </button>
        </div>
      </div>

      {/* Input textareas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Original</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            rows={10}
            placeholder="Paste original text here…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-mono text-xs text-gray-900 focus:outline-none focus:border-gray-400 resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Changed</label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            rows={10}
            placeholder="Paste changed text here…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-mono text-xs text-gray-900 focus:outline-none focus:border-gray-400 resize-y"
          />
        </div>
      </div>

      {/* Stats bar */}
      {hasDiff && (
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-green-600">+{stats.additions} additions</span>
          <span className="text-red-500">−{stats.deletions} deletions</span>
          <span className="text-gray-400">{stats.unchanged} unchanged</span>
          {noDifferences && (
            <span className="ml-auto text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              ✓ Files are identical
            </span>
          )}
        </div>
      )}

      {/* Diff output */}
      {hasDiff && !noDifferences && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {mode === "split" ? (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-2 py-1.5 text-gray-400 text-right font-normal">#</th>
                    <th className="px-3 py-1.5 text-left text-gray-500 font-semibold border-r border-gray-200">Original</th>
                    <th className="w-8 px-2 py-1.5 text-gray-400 text-right font-normal">#</th>
                    <th className="px-3 py-1.5 text-left text-gray-500 font-semibold">Changed</th>
                  </tr>
                </thead>
                <tbody>
                  {splitRows.map((row, i) => {
                    const lType = row.left?.type ?? "empty";
                    const rType = row.right?.type ?? "empty";
                    const lBg = lType === "delete" ? "bg-red-50" : lType === "equal" ? "bg-white" : "bg-gray-50";
                    const rBg = rType === "insert" ? "bg-green-50" : rType === "equal" ? "bg-white" : "bg-gray-50";
                    const lText = lType === "delete" ? "text-red-700" : "text-gray-700";
                    const rText = rType === "insert" ? "text-green-700" : "text-gray-700";
                    return (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className={`w-8 px-2 py-0.5 text-right text-gray-300 select-none ${lBg}`}>
                          {row.left?.leftLine ?? ""}
                        </td>
                        <td className={`px-3 py-0.5 whitespace-pre border-r border-gray-200 ${lBg} ${lText}`}>
                          {lType === "delete" && <span className="select-none text-red-400 mr-1">−</span>}
                          {row.left?.text ?? ""}
                        </td>
                        <td className={`w-8 px-2 py-0.5 text-right text-gray-300 select-none ${rBg}`}>
                          {row.right?.rightLine ?? ""}
                        </td>
                        <td className={`px-3 py-0.5 whitespace-pre ${rBg} ${rText}`}>
                          {rType === "insert" && <span className="select-none text-green-500 mr-1">+</span>}
                          {row.right?.text ?? ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Unified view */
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-2 py-1.5 text-gray-400 text-right font-normal">Old</th>
                    <th className="w-8 px-2 py-1.5 text-gray-400 text-right font-normal border-r border-gray-200">New</th>
                    <th className="px-3 py-1.5 text-left text-gray-500 font-semibold">Content</th>
                  </tr>
                </thead>
                <tbody>
                  {diffs.map((d, i) => {
                    const bg = d.type === "insert" ? "bg-green-50" : d.type === "delete" ? "bg-red-50" : "bg-white";
                    const textColor = d.type === "insert" ? "text-green-700" : d.type === "delete" ? "text-red-700" : "text-gray-700";
                    const prefix = d.type === "insert" ? "+" : d.type === "delete" ? "−" : " ";
                    const prefixColor = d.type === "insert" ? "text-green-500" : d.type === "delete" ? "text-red-400" : "text-gray-300";
                    return (
                      <tr key={i} className={`border-b border-gray-100 last:border-0 ${bg}`}>
                        <td className="w-8 px-2 py-0.5 text-right text-gray-300 select-none">
                          {d.leftLine ?? ""}
                        </td>
                        <td className="w-8 px-2 py-0.5 text-right text-gray-300 select-none border-r border-gray-200">
                          {d.rightLine ?? ""}
                        </td>
                        <td className={`px-3 py-0.5 whitespace-pre ${textColor}`}>
                          <span className={`select-none mr-2 ${prefixColor}`}>{prefix}</span>
                          {d.text}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!hasDiff && (
        <div className="text-center text-sm text-gray-400 py-10 border border-dashed border-gray-200 rounded-xl">
          Paste text into both panels above to see the diff
          <div className="mt-2 text-xs">or load a sample →</div>
        </div>
      )}
    </div>
  );
}
