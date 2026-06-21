"use client";
import { useState, useCallback } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const WORDS = ["apple","bridge","cloud","delta","eagle","flame","grace","honor","ivory","jewel","karma","light","maple","noble","ocean","pearl","quest","river","storm","tiger","ultra","vivid","water","xenon","yacht","zeal","brave","crisp","drift","echo"];

function randInt(max: number) {
  return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * max);
}

function genStandard(len: number, upper: boolean, lower: boolean, nums: boolean, syms: boolean): string {
  let chars = "";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (nums)  chars += "0123456789";
  if (syms)  chars += "!@#$%^&*()-_=+[]{}";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length: len }, () => chars[randInt(chars.length)]).join("");
}

function genWifi(len: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: len }, () => chars[randInt(chars.length)]).join("");
}

function genPin(len: number): string {
  return Array.from({ length: len }, () => String(randInt(10))).join("");
}

function genMemorable(): string {
  const w1 = WORDS[randInt(WORDS.length)];
  const w2 = WORDS[randInt(WORDS.length)];
  const w3 = WORDS[randInt(WORDS.length)];
  const num = randInt(900) + 100;
  const sym = ["!", "@", "#", "$", "&"][randInt(5)];
  return `${w1}-${w2}-${w3}${sym}${num}`;
}

export default function PasswordGeneratorView({ variant }: ToolProps) {
  const isPin = variant === "pin";
  const isWifi = variant === "wifi";
  const isMemorable = variant === "memorable";

  const [len, setLen] = useState(isPin ? 6 : isWifi ? 16 : 20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(!isPin && !isWifi);
  const [pinLen, setPinLen] = useState(6);
  const [password, setPassword] = useState("");

  const generate = useCallback(() => {
    if (isPin) setPassword(genPin(pinLen));
    else if (isWifi) setPassword(genWifi(len));
    else if (isMemorable) setPassword(genMemorable());
    else setPassword(genStandard(len, upper, lower, nums, syms));
  }, [len, upper, lower, nums, syms, pinLen, isPin, isWifi, isMemorable]);

  const strength = password.length === 0 ? null
    : password.length < 8 ? { label: "Weak", color: "text-red-500" }
    : password.length < 12 ? { label: "Fair", color: "text-yellow-500" }
    : password.length < 16 ? { label: "Strong", color: "text-green-500" }
    : { label: "Very Strong", color: "text-green-700" };

  return (
    <div className="space-y-6">
      {/* PIN length selector */}
      {isPin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PIN Length</label>
          <div className="flex gap-2">
            {[4, 6, 8].map((n) => (
              <button key={n} onClick={() => setPinLen(n)}
                className={`px-5 py-2 rounded-md text-sm font-medium border transition-all ${pinLen === n ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                {n} digits
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Standard / WiFi length */}
      {!isPin && !isMemorable && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Length: <span className="font-bold text-gray-900">{len}</span>
          </label>
          <input type="range" min={isWifi ? 8 : 6} max={isWifi ? 32 : 64} value={len}
            onChange={(e) => setLen(Number(e.target.value))}
            className="w-full accent-gray-900" />
        </div>
      )}

      {/* Options for standard only */}
      {!isPin && !isWifi && !isMemorable && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Uppercase (A–Z)", val: upper, set: setUpper },
            { label: "Lowercase (a–z)", val: lower, set: setLower },
            { label: "Numbers (0–9)", val: nums, set: setNums },
            { label: "Symbols (!@#…)", val: syms, set: setSyms },
          ].map(({ label, val, set }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="accent-gray-900" />
              {label}
            </label>
          ))}
        </div>
      )}

      <button onClick={generate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-base">
        Generate {isPin ? "PIN" : isWifi ? "WiFi Password" : isMemorable ? "Memorable Password" : "Password"}
      </button>

      {password && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-lg font-semibold text-gray-900 break-all">{password}</p>
            {strength && <p className={`text-xs mt-1 font-medium ${strength.color}`}>{strength.label}</p>}
          </div>
          <div className="ml-4 shrink-0"><CopyButton text={password} /></div>
        </div>
      )}

      {/* Cross-links */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Other password tools:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {variant !== undefined && <a href="/tools/password-generator" className="text-blue-500 hover:underline">Standard</a>}
          {variant !== "wifi" && <a href="/tools/wifi-password-generator" className="text-blue-500 hover:underline">WiFi Password</a>}
          {variant !== "pin" && <a href="/tools/pin-generator" className="text-blue-500 hover:underline">PIN Generator</a>}
          {variant !== "memorable" && <a href="/tools/memorable-password-generator" className="text-blue-500 hover:underline">Memorable Password</a>}
        </div>
      </div>
    </div>
  );
}
