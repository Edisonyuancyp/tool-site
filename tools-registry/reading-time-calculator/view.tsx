"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

interface ResultData {
  wordCount: number;
  charCount: number;
  minutes: number;
  seconds: number;
  displayTime: string;
}

export default function ReadingTimeCalculatorView({ variant }: ToolProps) {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState("200");
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    setResult(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text to calculate reading time.");
      return;
    }

    const speed = parseFloat(wpm);
    if (isNaN(speed) || speed <= 0) {
      setError("Please enter a valid reading speed greater than 0.");
      return;
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = trimmed.length;

    const totalMinutesExact = wordCount / speed;
    const totalSeconds = Math.round(totalMinutesExact * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let displayTime = "";
    if (minutes > 0 && seconds > 0) {
      displayTime = `${minutes} min ${seconds} sec`;
    } else if (minutes > 0) {
      displayTime = `${minutes} min`;
    } else {
      displayTime = `${seconds} sec`;
    }

    setResult({
      wordCount,
      charCount,
      minutes,
      seconds,
      displayTime,
    });
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">
          Mode: {variant}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Paste your article or blog post
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
          rows={10}
          className="w-full border rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 text-base resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Reading speed (words per minute)
        </label>
        <select
          value={wpm}
          onChange={(e) => setWpm(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="150">150 wpm (Slow reader)</option>
          <option value="200">200 wpm (Average adult)</option>
          <option value="250">250 wpm (Fast reader)</option>
          <option value="300">300 wpm (Very fast reader)</option>
        </select>
      </div>

      <button
        onClick={calculate}
        className="w-full sm:w-auto bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
      >
        Calculate
      </button>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estimated reading time</p>
              <p className="text-2xl font-bold text-gray-900">{result.displayTime}</p>
            </div>
            <CopyButton text={result.displayTime} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg border border-gray-200 bg-white">
              <p className="text-sm text-gray-500">Word count</p>
              <p className="text-lg font-semibold text-gray-900">
                {result.wordCount.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-white">
              <p className="text-sm text-gray-500">Character count</p>
              <p className="text-lg font-semibold text-gray-900">
                {result.charCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
