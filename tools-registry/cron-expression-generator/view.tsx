"use client";
import { useState, useMemo } from "react";

export interface ToolProps { variant?: string; }

const FIELD_LABELS = ["Minute", "Hour", "Day of Month", "Month", "Day of Week"];
const FIELD_RANGES = ["0-59", "0-23", "1-31", "1-12", "0-7"];
const MONTH_NAMES  = ["","JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const DOW_NAMES    = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

function parseCron(expr: string): { valid: boolean; parts: string[]; error?: string } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return { valid: false, parts: [], error: "Cron must have exactly 5 fields: minute hour day month weekday" };
  return { valid: true, parts };
}

function fieldToHuman(val: string, index: number): string {
  if (val === "*") {
    const labels = ["every minute", "every hour", "every day", "every month", "every day of week"];
    return labels[index];
  }
  if (val.startsWith("*/")) {
    const n = val.slice(2);
    const units = ["minutes", "hours", "days", "months", "days"];
    return `every ${n} ${units[index]}`;
  }
  if (val.includes("-")) {
    const [a, b] = val.split("-");
    if (index === 4) return `${DOW_NAMES[+a] ?? a}–${DOW_NAMES[+b] ?? b}`;
    if (index === 3) return `${MONTH_NAMES[+a] ?? a}–${MONTH_NAMES[+b] ?? b}`;
    return `${a} to ${b}`;
  }
  if (val.includes(",")) {
    const parts = val.split(",");
    if (index === 4) return parts.map(p => DOW_NAMES[+p] ?? p).join(", ");
    if (index === 3) return parts.map(p => MONTH_NAMES[+p] ?? p).join(", ");
    return `at ${parts.join(", ")}`;
  }
  if (index === 4) return DOW_NAMES[+val] ?? val;
  if (index === 3) return MONTH_NAMES[+val] ?? val;
  if (index === 1) {
    const h = +val;
    return `${h === 0 ? "12" : h > 12 ? h - 12 : h}:00 ${h < 12 ? "AM" : "PM"}`;
  }
  return `at ${val}`;
}

function cronToHuman(parts: string[]): string {
  const [min, hour, dom, month, dow] = parts;
  let desc = "";
  if (min === "*" && hour === "*") desc = "Every minute";
  else if (min.startsWith("*/")) desc = `Every ${min.slice(2)} minutes`;
  else desc = `At ${hour === "*" ? "every hour" : fieldToHuman(hour, 1)}:${min.padStart ? min.padStart(2, "0") : min}`;

  if (dom !== "*" || month !== "*" || dow !== "*") {
    if (dow !== "*") desc += `, on ${fieldToHuman(dow, 4)}`;
    if (dom !== "*") desc += `, on day ${dom} of the month`;
    if (month !== "*") desc += `, in ${fieldToHuman(month, 3)}`;
  }
  return desc;
}

function nextRuns(parts: string[], count = 5): Date[] {
  // Simplified: only handles common patterns
  const [minF, hourF] = parts;
  const dates: Date[] = [];
  const now = new Date();
  let d = new Date(now);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);

  let attempts = 0;
  while (dates.length < count && attempts < 10000) {
    attempts++;
    const min  = d.getMinutes();
    const hour = d.getHours();

    const minOk  = minF  === "*" || (minF.startsWith("*/")  ? min  % +minF.slice(2)  === 0 : +minF  === min);
    const hourOk = hourF === "*" || (hourF.startsWith("*/") ? hour % +hourF.slice(2) === 0 : +hourF === hour);

    if (minOk && hourOk) dates.push(new Date(d));
    d.setMinutes(d.getMinutes() + 1);
  }
  return dates;
}

const PRESETS = [
  { label: "Every minute",        expr: "* * * * *" },
  { label: "Every 5 minutes",     expr: "*/5 * * * *" },
  { label: "Every hour",          expr: "0 * * * *" },
  { label: "Daily at midnight",   expr: "0 0 * * *" },
  { label: "Daily at 9 AM",       expr: "0 9 * * *" },
  { label: "Mon–Fri at 9 AM",     expr: "0 9 * * 1-5" },
  { label: "Every Sunday midnight", expr: "0 0 * * 0" },
  { label: "1st of month",        expr: "0 0 1 * *" },
  { label: "Every 6 hours",       expr: "0 */6 * * *" },
  { label: "Mon–Fri every 15min (9–17)", expr: "*/15 9-17 * * 1-5" },
];

export default function CronGeneratorView() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [fields, setFields] = useState(["0", "9", "*", "*", "1-5"]);
  const [tab, setTab] = useState<"visual" | "raw">("visual");

  const currentExpr = tab === "visual" ? fields.join(" ") : expr;
  const parsed = useMemo(() => parseCron(currentExpr), [currentExpr]);
  const human  = useMemo(() => parsed.valid ? cronToHuman(parsed.parts) : "", [parsed]);
  const runs   = useMemo(() => parsed.valid ? nextRuns(parsed.parts) : [], [parsed]);

  const setField = (i: number, v: string) => setFields(f => f.map((x, j) => j === i ? v : x));

  return (
    <div className="space-y-5">
      {/* Tab */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("visual")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "visual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Visual Builder
        </button>
        <button onClick={() => setTab("raw")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "raw" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Raw Expression
        </button>
      </div>

      {tab === "visual" ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {FIELD_LABELS.map((label, i) => (
            <div key={i}>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {label}
                <span className="ml-1 text-gray-300 normal-case font-normal">({FIELD_RANGES[i]})</span>
              </label>
              <input type="text" value={fields[i]} onChange={e => setField(i, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-gray-400 text-center" />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Cron Expression</label>
          <input type="text" value={expr} onChange={e => setExpr(e.target.value)}
            placeholder="* * * * *"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:border-gray-400" />
        </div>
      )}

      {/* Human-readable */}
      {parsed.error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{parsed.error}</div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Runs</p>
          <p className="text-lg font-medium text-white">{human}</p>
          <code className="text-sm font-mono text-gray-400 mt-2 block">{currentExpr}</code>
        </div>
      )}

      {/* Next runs */}
      {runs.length > 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Next 5 Run Times</p>
          <div className="space-y-1.5">
            {runs.map((d, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-mono">
                <span className="text-gray-300 text-xs">#{i + 1}</span>
                <span className="text-gray-700">{d.toLocaleString()}</span>
                <span className="text-gray-400 text-xs">
                  {Math.round((d.getTime() - Date.now()) / 60000)} min from now
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Presets */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Common Patterns</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map(p => (
            <button key={p.expr} onClick={() => { setExpr(p.expr); setFields(p.expr.split(" ")); }}
              className="flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-all text-left">
              <span className="text-xs text-gray-700">{p.label}</span>
              <code className="text-[10px] font-mono text-gray-400">{p.expr}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
