"use client";
import { useState, useEffect } from "react";

const TIMEZONES = [
  { label: "UTC", value: "UTC" },
  { label: "Local (browser)", value: "local" },
  { label: "US/Eastern (ET)", value: "America/New_York" },
  { label: "US/Pacific (PT)", value: "America/Los_Angeles" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Europe/Paris (CET)", value: "Europe/Paris" },
  { label: "Asia/Shanghai (CST)", value: "Asia/Shanghai" },
  { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Asia/Bangkok (ICT)", value: "Asia/Bangkok" },
  { label: "Asia/Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
  { label: "Australia/Sydney (AEST)", value: "Australia/Sydney" },
];

function tsToDate(ts: number, unit: "s" | "ms"): Date {
  return new Date(unit === "s" ? ts * 1000 : ts);
}

function formatDate(date: Date, tz: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
      timeZone: tz === "local" ? undefined : tz,
    };
    return new Intl.DateTimeFormat("en-CA", options).format(date).replace(",", "");
  } catch {
    return "Invalid timezone";
  }
}

function formatISO(date: Date): string {
  return date.toISOString();
}

function dateToTs(dateStr: string, tz: string): number | null {
  try {
    let iso = dateStr;
    // if user typed without T, add T
    if (dateStr.includes(" ") && !dateStr.includes("T")) {
      iso = dateStr.replace(" ", "T");
    }
    // append timezone offset if not local
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return Math.floor(d.getTime() / 1000);
  } catch {
    return null;
  }
}

function nowTs(): number {
  return Math.floor(Date.now() / 1000);
}

export default function UnixTimestampConverter() {
  const [tsInput, setTsInput] = useState(String(nowTs()));
  const [tsUnit, setTsUnit] = useState<"s" | "ms">("s");
  const [tz, setTz] = useState("UTC");
  const [liveMode, setLiveMode] = useState(false);

  // Date → Timestamp direction
  const [dateInput, setDateInput] = useState("");

  const [now, setNow] = useState(nowTs());

  // Live clock
  useEffect(() => {
    if (!liveMode) return;
    const id = setInterval(() => {
      const t = nowTs();
      setNow(t);
      setTsInput(String(t));
    }, 1000);
    return () => clearInterval(id);
  }, [liveMode]);

  const tsNum = parseInt(tsInput, 10);
  const isValidTs = !isNaN(tsNum) && tsNum > 0;
  const date = isValidTs ? tsToDate(tsNum, tsUnit) : null;

  const tzFormatted = date ? formatDate(date, tz) : "—";
  const isoFormatted = date ? formatISO(date) : "—";
  const relativeTime = date
    ? (() => {
        const diff = Math.floor(Date.now() / 1000) - (tsUnit === "s" ? tsNum : tsNum / 1000);
        const abs = Math.abs(diff);
        const future = diff < 0;
        if (abs < 60) return `${abs}s ${future ? "from now" : "ago"}`;
        if (abs < 3600) return `${Math.floor(abs / 60)}m ${future ? "from now" : "ago"}`;
        if (abs < 86400) return `${Math.floor(abs / 3600)}h ${future ? "from now" : "ago"}`;
        if (abs < 86400 * 365) return `${Math.floor(abs / 86400)}d ${future ? "from now" : "ago"}`;
        return `${Math.floor(abs / 86400 / 365)}y ${future ? "from now" : "ago"}`;
      })()
    : "—";

  const dateToTsResult = dateInput ? dateToTs(dateInput, tz) : null;

  function copy(text: string) {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed"; el.style.left = "-9999px";
    document.body.appendChild(el); el.focus(); el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  const [copied, setCopied] = useState<string | null>(null);
  function handleCopy(val: string, key: string) {
    copy(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Live clock bar */}
      <div className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Current Unix Timestamp</div>
          <div className="font-mono text-xl font-bold text-green-400">{now}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => { setTsInput(String(now)); setLiveMode(false); }}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            Use Now
          </button>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-300">
            <input
              type="checkbox"
              checked={liveMode}
              onChange={(e) => setLiveMode(e.target.checked)}
              className="accent-green-400"
            />
            Live
          </label>
        </div>
      </div>

      {/* Timezone selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Timezone</label>
        <select
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:border-gray-400 cursor-pointer"
        >
          {TIMEZONES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* ── Section 1: Timestamp → Date ── */}
      <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Timestamp → Human Date</h3>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Unix Timestamp</label>
            <input
              type="number"
              value={tsInput}
              onChange={(e) => { setTsInput(e.target.value); setLiveMode(false); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-mono text-lg text-gray-900 focus:outline-none focus:border-gray-400"
            />
          </div>
          <div className="shrink-0">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Unit</label>
            <div className="flex">
              {(["s", "ms"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setTsUnit(u)}
                  className={
                    "px-4 py-2.5 text-sm font-semibold border transition-all first:rounded-l-xl last:rounded-r-xl " +
                    (tsUnit === u
                      ? "bg-gray-900 text-white border-gray-900 z-10"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")
                  }
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-2">
          {[
            { label: `Formatted (${tz === "local" ? "Local" : tz})`, value: tzFormatted, key: "fmt" },
            { label: "ISO 8601 / UTC", value: isoFormatted, key: "iso" },
            { label: "Relative", value: relativeTime, key: "rel" },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
              <div>
                <div className="text-xs text-gray-400">{row.label}</div>
                <div className="font-mono text-sm font-semibold text-gray-900">{row.value}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(row.value, row.key)}
                className="shrink-0 text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all"
              >
                {copied === row.key ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Date → Timestamp ── */}
      <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Human Date → Timestamp</h3>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Date / Time (YYYY-MM-DD HH:MM:SS or ISO 8601)
          </label>
          <input
            type="datetime-local"
            step="1"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-mono focus:outline-none focus:border-gray-400"
          />
        </div>
        {dateToTsResult !== null ? (
          <div className="space-y-2">
            {[
              { label: "Unix (seconds)", value: String(dateToTsResult), key: "dts" },
              { label: "Unix (milliseconds)", value: String(dateToTsResult * 1000), key: "dtms" },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                <div>
                  <div className="text-xs text-gray-400">{row.label}</div>
                  <div className="font-mono text-sm font-semibold text-gray-900">{row.value}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(row.value, row.key)}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all"
                >
                  {copied === row.key ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          dateInput && (
            <p className="text-sm text-red-500">Invalid date input</p>
          )
        )}
      </div>

      {/* Quick reference */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Common Timestamps</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs font-mono">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 text-gray-500 font-semibold">Event</th>
                <th className="text-right px-3 py-2 text-gray-500 font-semibold">Unix (s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { label: "Unix Epoch (1970-01-01)", ts: 0 },
                { label: "Y2K (2000-01-01)", ts: 946684800 },
                { label: "Now", ts: now },
                { label: "2030-01-01 00:00:00 UTC", ts: 1893456000 },
                { label: "2038 Overflow (int32 max)", ts: 2147483647 },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setTsInput(String(row.ts)); setTsUnit("s"); setLiveMode(false); }}>
                  <td className="px-3 py-2 text-gray-600">{row.label}</td>
                  <td className="px-3 py-2 text-right text-blue-600 font-bold">{row.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Click any row to load it</p>
      </div>
    </div>
  );
}
