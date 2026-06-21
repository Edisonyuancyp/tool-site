"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
  nextBirthday: number;
}

function calcAge(dob: string, toDate: string): AgeResult | null {
  const birth = new Date(dob);
  const target = new Date(toDate);
  if (isNaN(birth.getTime()) || isNaN(target.getTime())) return null;
  if (birth > target) return null;

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const totalMonths = years * 12 + months;

  const nextBd = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBd <= target) nextBd.setFullYear(nextBd.getFullYear() + 1);
  const nextBirthday = Math.ceil((nextBd.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  return { years, months, days, totalDays, totalMonths, nextBirthday };
}

export default function AgeCalculator() {
  const today = new Date().toISOString().split("T")[0];
  const [dob, setDob] = useState("");
  const [toDate, setToDate] = useState(today);
  const [result, setResult] = useState<AgeResult | null>(null);

  const calculate = () => {
    const r = calcAge(dob, toDate);
    setResult(r);
  };

  const resultText = result
    ? `Age: ${result.years} years, ${result.months} months, ${result.days} days (${result.totalDays} days total)`
    : "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={today}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Age at Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-base"
      >
        Calculate Age
      </button>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Years", value: result.years },
              { label: "Months", value: result.months },
              { label: "Days", value: result.days },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-gray-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Total months</span>
              <span className="font-medium text-gray-900">{result.totalMonths.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total days</span>
              <span className="font-medium text-gray-900">{result.totalDays.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Next birthday in</span>
              <span className="font-medium text-gray-900">{result.nextBirthday} days</span>
            </div>
          </div>

          <CopyButton text={resultText} />
        </>
      )}
    </div>
  );
}
