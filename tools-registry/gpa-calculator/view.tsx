"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const GRADE_MAP: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};
const GRADES = Object.keys(GRADE_MAP);

const WEIGHTED_BONUS: Record<string, number> = { "AP": 1.0, "IB": 1.0, "Honors": 0.5, "Dual": 0.5 };

type Course = { name: string; grade: string; credits: string; type: string };

const blank = (): Course => ({ name: "", grade: "A", credits: "3", type: "Regular" });

export default function GpaCalculatorView({ variant }: ToolProps) {
  const isHS      = variant === "highschool";
  const isGrade   = variant === "grade";
  const [courses, setCourses] = useState<Course[]>([blank(), blank(), blank()]);

  function update(i: number, field: keyof Course, val: string) {
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  }
  function addCourse()    { setCourses(p => [...p, blank()]); }
  function removeCourse(i: number) { setCourses(p => p.filter((_, idx) => idx !== i)); }

  const valid = courses.filter(c => c.grade && parseFloat(c.credits) > 0);
  const totalCredits = valid.reduce((s, c) => s + parseFloat(c.credits), 0);

  const unweightedPoints = valid.reduce((s, c) => s + (GRADE_MAP[c.grade] ?? 0) * parseFloat(c.credits), 0);
  const unweightedGPA = totalCredits > 0 ? unweightedPoints / totalCredits : 0;

  const weightedPoints = valid.reduce((s, c) => {
    const base = GRADE_MAP[c.grade] ?? 0;
    const bonus = WEIGHTED_BONUS[c.type] ?? 0;
    return s + Math.min(4.0, base + bonus) * parseFloat(c.credits);
  }, 0);
  const weightedGPA = totalCredits > 0 ? weightedPoints / totalCredits : 0;

  const letterFor = (g: number) => g >= 3.7 ? "A" : g >= 3.3 ? "B+" : g >= 3.0 ? "B" : g >= 2.7 ? "B-" : g >= 2.0 ? "C" : g >= 1.0 ? "D" : "F";

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="pb-2 font-medium pr-3">Course</th>
              <th className="pb-2 font-medium pr-3">Grade</th>
              <th className="pb-2 font-medium pr-3">Credits / Hours</th>
              {isHS && <th className="pb-2 font-medium pr-3">Type</th>}
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map((c, i) => (
              <tr key={i} className="py-2">
                <td className="py-2 pr-3">
                  <input value={c.name} onChange={e => update(i, "name", e.target.value)}
                    placeholder={`Course ${i + 1}`}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                </td>
                <td className="py-2 pr-3">
                  <select value={c.grade} onChange={e => update(i, "grade", e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400">
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </td>
                <td className="py-2 pr-3">
                  <input type="number" value={c.credits} min="0.5" step="0.5" onChange={e => update(i, "credits", e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                </td>
                {isHS && (
                  <td className="py-2 pr-3">
                    <select value={c.type} onChange={e => update(i, "type", e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400">
                      {["Regular", "Honors", "AP", "IB", "Dual"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </td>
                )}
                <td className="py-2">
                  <button onClick={() => removeCourse(i)} className="text-gray-300 hover:text-red-400 text-lg px-1">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addCourse}
        className="text-sm text-gray-500 hover:text-gray-900 border border-dashed border-gray-300 rounded-lg px-4 py-2 w-full hover:border-gray-400 transition-colors">
        + Add Course
      </button>

      {totalCredits > 0 && (
        <div className="space-y-3">
          <div className={`grid grid-cols-1 gap-4 ${isHS ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">GPA (Unweighted)</p>
              <p className="text-3xl font-bold text-gray-900">{unweightedGPA.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mt-1">{letterFor(unweightedGPA)} · {totalCredits} credit hrs</p>
            </div>
            {isHS && (
              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50 text-center">
                <p className="text-sm text-blue-600 mb-1">GPA (Weighted)</p>
                <p className="text-3xl font-bold text-blue-900">{weightedGPA.toFixed(2)}</p>
                <p className="text-sm text-blue-400 mt-1">Includes AP/IB/Honors bonus</p>
              </div>
            )}
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Credit Hours</p>
              <p className="text-3xl font-bold text-gray-900">{totalCredits}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <CopyButton text={`GPA: ${unweightedGPA.toFixed(2)}${isHS ? ` (weighted: ${weightedGPA.toFixed(2)})` : ""} | ${totalCredits} credit hours`} />
          </div>
        </div>
      )}
    </div>
  );
}
