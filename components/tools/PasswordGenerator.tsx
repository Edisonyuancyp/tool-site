"use client";
import { useState, useCallback } from "react";
import CopyButton from "@/components/CopyButton";

const CHARSET = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function strengthLabel(pw: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
  if (score <= 4) return { label: "Fair", color: "bg-yellow-400", width: "w-1/2" };
  if (score <= 5) return { label: "Good", color: "bg-blue-400", width: "w-3/4" };
  return { label: "Strong", color: "bg-green-400", width: "w-full" };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");

  const generate = useCallback(() => {
    let chars = "";
    if (options.uppercase) chars += CHARSET.uppercase;
    if (options.lowercase) chars += CHARSET.lowercase;
    if (options.numbers) chars += CHARSET.numbers;
    if (options.symbols) chars += CHARSET.symbols;
    if (!chars) return;

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    const pw = Array.from(arr)
      .map((n) => chars[n % chars.length])
      .join("");
    setPassword(pw);
  }, [length, options]);

  const strength = password ? strengthLabel(password) : null;

  const toggle = (key: keyof typeof options) => {
    const next = { ...options, [key]: !options[key] };
    if (!Object.values(next).some(Boolean)) return;
    setOptions(next);
  };

  return (
    <div className="space-y-6">
      {/* Length */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Password Length</label>
          <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">{length}</span>
        </div>
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-gray-900"
        />
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>4</span><span>64</span>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(options) as (keyof typeof options)[]).map((key) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
              options[key]
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-base"
      >
        Generate Password
      </button>

      {/* Output */}
      {password && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <p className="flex-1 font-mono text-base text-gray-900 break-all select-all">{password}</p>
            <CopyButton text={password} />
          </div>

          {strength && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>Password strength</span>
                <span className={`font-medium ${strength.label === "Strong" ? "text-green-600" : strength.label === "Good" ? "text-blue-600" : strength.label === "Fair" ? "text-yellow-600" : "text-red-500"}`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
