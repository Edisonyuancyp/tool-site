"use client";
import { useState, useMemo } from "react";
import { countries, getDynamicHolidays } from "@/lib/holidays";

type WorkSchedule = "5" | "6" | "7";

interface ResolvedHoliday {
  name: string;
  date: Date;
  daysLeft: number;
  isWeekend: boolean;
  isWorkday: boolean;
}

function resolveHolidays(countryCode: string, year: number): ResolvedHoliday[] {
  const country = countries.find((c) => c.code === countryCode);
  if (!country) return [];

  const dynamic = getDynamicHolidays(year);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const resolved: ResolvedHoliday[] = [];

  for (const h of country.holidays) {
    let date: Date | null = null;

    if (h.date.startsWith("dynamic-")) {
      const key = h.date.replace("dynamic-", "") as keyof typeof dynamic;
      const dyn = dynamic[key];
      if (dyn && dyn[0]) {
        date = new Date(year, dyn[0].month - 1, dyn[0].day);
      }
    } else {
      const [m, d] = h.date.split("-").map(Number);
      date = new Date(year, m - 1, d);
    }

    if (!date) continue;

    const dow = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;
    const diffMs = date.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    resolved.push({
      name: h.name,
      date,
      daysLeft,
      isWeekend,
      isWorkday: !isWeekend,
    });
  }

  // Also get next year's holidays for ones that have passed
  const nextYear = year + 1;
  const dynamicNext = getDynamicHolidays(nextYear);

  for (const h of country.holidays) {
    let date: Date | null = null;

    if (h.date.startsWith("dynamic-")) {
      const key = h.date.replace("dynamic-", "") as keyof typeof dynamicNext;
      const dyn = dynamicNext[key];
      if (dyn && dyn[0]) {
        date = new Date(nextYear, dyn[0].month - 1, dyn[0].day);
      }
    } else {
      const [m, d] = h.date.split("-").map(Number);
      date = new Date(nextYear, m - 1, d);
    }

    if (!date) continue;

    // Only add if not already covered in current year upcoming
    const alreadyHas = resolved.some(
      (r) => r.name === h.name && r.daysLeft > 0
    );
    if (alreadyHas) continue;

    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const diffMs = date.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) {
      resolved.push({
        name: h.name,
        date,
        daysLeft,
        isWeekend,
        isWorkday: !isWeekend,
      });
    }
  }

  return resolved.sort((a, b) => a.daysLeft - b.daysLeft);
}

function isHolidayEffective(h: ResolvedHoliday, schedule: WorkSchedule): boolean {
  // For 7-day workers: every holiday counts
  if (schedule === "7") return true;
  // For 6-day workers: Saturday is a workday, Sunday is off
  if (schedule === "6") return h.date.getDay() !== 0; // not Sunday
  // For 5-day workers: weekends are off, holidays on weekdays are extra days off
  return h.date.getDay() !== 0 && h.date.getDay() !== 6;
}

function getDayLabel(days: number): string {
  if (days === 0) return "Today! 🎉";
  if (days === 1) return "Tomorrow!";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `${days} days`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HolidayCalculator() {
  const [selectedCountry, setSelectedCountry] = useState("CN");
  const [schedule, setSchedule] = useState<WorkSchedule>("5");
  const [showAll, setShowAll] = useState(false);

  const year = new Date().getFullYear();

  const allHolidays = useMemo(
    () => resolveHolidays(selectedCountry, year),
    [selectedCountry, year]
  );

  const upcoming = useMemo(() => {
    return allHolidays.filter((h) => h.daysLeft >= 0);
  }, [allHolidays]);

  const effective = useMemo(() => {
    return upcoming.filter((h) => isHolidayEffective(h, schedule));
  }, [upcoming, schedule]);

  const next = effective[0] ?? null;

  const displayList = showAll ? effective : effective.slice(0, 8);

  const country = countries.find((c) => c.code === selectedCountry);

  const scheduleLabels: Record<WorkSchedule, string> = {
    "5": "5-day week (Mon–Fri off on weekends)",
    "6": "6-day week (Mon–Sat, only Sunday off)",
    "7": "7-day week (no weekends off)",
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Country selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Country / Region
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-sm bg-white cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Work schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Work Schedule
          </label>
          <div className="space-y-2">
            {(["5", "6", "7"] as WorkSchedule[]).map((s) => (
              <label
                key={s}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  schedule === s
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="schedule"
                  value={s}
                  checked={schedule === s}
                  onChange={() => setSchedule(s)}
                  className="mt-0.5 accent-gray-900"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {s === "5" ? "Double Rest (5-day)" : s === "6" ? "Single Rest (6-day)" : "No Rest Days (7-day)"}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{scheduleLabels[s]}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Next holiday hero */}
      {next && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            {country?.flag} {country?.name} · Next Public Holiday
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2 mb-1">{next.name}</div>
          <div className="text-gray-300 text-sm mb-4">{formatDate(next.date)} ({DOW_LABELS[next.date.getDay()]})</div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{next.daysLeft === 0 ? "🎉" : next.daysLeft}</span>
            {next.daysLeft > 0 && <span className="text-xl text-gray-300">days away</span>}
            {next.daysLeft === 0 && <span className="text-xl text-gray-300">Today is a holiday!</span>}
          </div>
          {schedule !== "5" && next.isWorkday && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs">
              ✅ Counts as a day off for your work schedule
            </div>
          )}
          {schedule === "5" && next.isWeekend && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-yellow-400/20 rounded-full px-3 py-1 text-xs text-yellow-200">
              ⚠️ Falls on a weekend — already your day off
            </div>
          )}
        </div>
      )}

      {/* Holiday list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Upcoming Holidays {country?.flag}
          <span className="ml-2 text-xs font-normal text-gray-400">({effective.length} total)</span>
        </h3>
        <div className="space-y-2">
          {displayList.map((h, i) => {
            const isNext = i === 0;
            const dow = DOW_LABELS[h.date.getDay()];
            const isWeekendForSchedule =
              schedule === "5"
                ? h.isWeekend
                : schedule === "6"
                ? h.date.getDay() === 0
                : false;

            return (
              <div
                key={`${h.name}-${h.date.toISOString()}`}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isNext
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    isNext ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{h.name}</div>
                    <div className="text-xs text-gray-400">
                      {formatDate(h.date)}
                      {isWeekendForSchedule && (
                        <span className="ml-2 text-amber-500">· Weekend</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`text-sm font-semibold ${
                    h.daysLeft === 0 ? "text-green-600" : isNext ? "text-gray-900" : "text-gray-600"
                  }`}>
                    {getDayLabel(h.daysLeft)}
                  </div>
                  <div className="text-xs text-gray-400">{dow}</div>
                </div>
              </div>
            );
          })}
        </div>

        {effective.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="mt-3 w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all"
          >
            {showAll ? "Show less" : `Show all ${effective.length} holidays`}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>📅 Dates shown for {year}–{year + 1}</span>
        <span>
          {schedule === "5" ? "⚠️ Weekend holidays = already off" :
           schedule === "6" ? "⚠️ Sunday holidays = already off" :
           "✅ All holidays count as extra days off"}
        </span>
      </div>
    </div>
  );
}
