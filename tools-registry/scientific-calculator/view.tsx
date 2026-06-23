"use client";
import { useState, useCallback } from "react";

export interface ToolProps { variant?: string; }

type AngleMode = "DEG" | "RAD";

const BTN_GRID = [
  // row 1 — mode + memory + clear
  ["DEG/RAD", "(",  ")",  "AC",  "⌫"],
  // row 2 — functions
  ["sin",  "cos",  "tan",  "log",  "ln"],
  // row 3 — inverse / extra
  ["sin⁻¹","cos⁻¹","tan⁻¹","√",   "x²"],
  // row 4 — constants + power
  ["π",    "e",    "xʸ",   "%",   "1/x"],
  // row 5 — digits top
  ["7",    "8",    "9",    "÷",   "!"],
  // row 6
  ["4",    "5",    "6",    "×",   "EXP"],
  // row 7
  ["1",    "2",    "3",    "−",   ""],
  // row 8
  ["0",    "00",   ".",    "+",   "="],
];

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function toDeg(rad: number) { return (rad * 180) / Math.PI; }

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function evaluate(expr: string, mode: AngleMode): string {
  try {
    // Replace display symbols with JS operators
    let e = expr
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/−/g, "-")
      .replace(/π/g, `(${Math.PI})`)
      .replace(/e(?![0-9])/g, `(${Math.E})`);

    // Handle factorial: number!
    e = e.replace(/(\d+(\.\d+)?)!/g, (_, n) => String(factorial(parseFloat(n))));

    // Handle functions
    const applyTrig = (fn: string, val: number) => {
      if (mode === "DEG") val = toRad(val);
      const map: Record<string, (v: number) => number> = {
        sin: Math.sin, cos: Math.cos, tan: Math.tan,
      };
      return map[fn](val);
    };
    const applyInvTrig = (fn: string, val: number) => {
      const map: Record<string, (v: number) => number> = {
        asin: Math.asin, acos: Math.acos, atan: Math.atan,
      };
      const r = map[fn](val);
      return mode === "DEG" ? toDeg(r) : r;
    };

    e = e.replace(/sin\(([^)]+)\)/g, (_, v) => String(applyTrig("sin", parseFloat(evaluate(v, mode)))));
    e = e.replace(/cos\(([^)]+)\)/g, (_, v) => String(applyTrig("cos", parseFloat(evaluate(v, mode)))));
    e = e.replace(/tan\(([^)]+)\)/g, (_, v) => String(applyTrig("tan", parseFloat(evaluate(v, mode)))));
    e = e.replace(/asin\(([^)]+)\)/g, (_, v) => String(applyInvTrig("asin", parseFloat(evaluate(v, mode)))));
    e = e.replace(/acos\(([^)]+)\)/g, (_, v) => String(applyInvTrig("acos", parseFloat(evaluate(v, mode)))));
    e = e.replace(/atan\(([^)]+)\)/g, (_, v) => String(applyInvTrig("atan", parseFloat(evaluate(v, mode)))));
    e = e.replace(/log\(([^)]+)\)/g, (_, v) => String(Math.log10(parseFloat(evaluate(v, mode)))));
    e = e.replace(/ln\(([^)]+)\)/g, (_, v) => String(Math.log(parseFloat(evaluate(v, mode)))));
    e = e.replace(/sqrt\(([^)]+)\)/g, (_, v) => String(Math.sqrt(parseFloat(evaluate(v, mode)))));

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${e})`)();
    if (typeof result !== "number") return "Error";
    if (!isFinite(result)) return result > 0 ? "∞" : "-∞";
    if (isNaN(result)) return "Error";
    // Format: avoid floating point noise
    const str = String(parseFloat(result.toPrecision(12)));
    return str;
  } catch {
    return "Error";
  }
}

const BTN_COLOR: Record<string, string> = {
  "=":       "col-span-1 bg-gray-900 text-white hover:bg-black",
  "AC":      "bg-red-50 text-red-600 hover:bg-red-100 border-red-100",
  "⌫":       "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100",
  "DEG/RAD": "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 text-xs font-bold",
  "÷": "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100",
  "×": "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100",
  "−": "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100",
  "+": "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100",
};

const FUNC_BUTTONS = new Set(["sin","cos","tan","sin⁻¹","cos⁻¹","tan⁻¹","log","ln","√","x²","xʸ","1/x","EXP","!"]);

export default function ScientificCalculatorView() {
  const [expr, setExpr]     = useState("0");
  const [history, setHistory] = useState("");
  const [mode, setMode]     = useState<AngleMode>("DEG");
  const [justEvaled, setJustEvaled] = useState(false);

  const press = useCallback((btn: string) => {
    if (btn === "") return;

    if (btn === "DEG/RAD") {
      setMode(m => m === "DEG" ? "RAD" : "DEG");
      return;
    }
    if (btn === "AC") {
      setExpr("0"); setHistory(""); setJustEvaled(false); return;
    }
    if (btn === "⌫") {
      setExpr(e => e.length <= 1 ? "0" : e.slice(0, -1));
      setJustEvaled(false);
      return;
    }
    if (btn === "=") {
      const result = evaluate(expr, mode);
      setHistory(expr + " =");
      setExpr(result);
      setJustEvaled(true);
      return;
    }

    // Function buttons — append with (
    const funcMap: Record<string, string> = {
      "sin": "sin(", "cos": "cos(", "tan": "tan(",
      "sin⁻¹": "asin(", "cos⁻¹": "acos(", "tan⁻¹": "atan(",
      "log": "log(", "ln": "ln(", "√": "sqrt(",
    };
    if (funcMap[btn]) {
      setExpr(e => (e === "0" || justEvaled) ? funcMap[btn] : e + funcMap[btn]);
      setJustEvaled(false);
      return;
    }

    // Special transforms
    const transforms: Record<string, (e: string) => string> = {
      "x²": e => `(${e})²`.replace(/²/, "**2"),
      "xʸ": e => e + "**",
      "1/x": e => `1/(${e})`,
      "EXP": e => e + "e+",
      "!":  e => e + "!",
      "%":  e => `(${e})/100`,
      "π":  e => (e === "0" || justEvaled) ? "π" : e + "π",
      "e":  e => (e === "0" || justEvaled) ? "e" : e + "e",
    };
    if (transforms[btn]) {
      setExpr(transforms[btn]);
      setJustEvaled(false);
      return;
    }

    // Digits / operators / parens
    setExpr(e => {
      if (justEvaled && /[\d.]/.test(btn)) return btn;
      if (e === "0" && /^\d$/.test(btn)) return btn;
      return e + btn;
    });
    setJustEvaled(false);
  }, [expr, mode, justEvaled]);

  return (
    <div className="max-w-sm mx-auto select-none">
      {/* Display */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-4 min-h-[100px] flex flex-col justify-end items-end">
        <p className="text-gray-400 text-sm h-5 truncate w-full text-right">{history}</p>
        <p
          className="text-white font-mono mt-1 break-all text-right leading-tight"
          style={{ fontSize: expr.length > 14 ? "1.4rem" : "2rem" }}
        >
          {expr}
        </p>
        <p className="text-gray-500 text-xs mt-2">{mode}</p>
      </div>

      {/* Button grid */}
      <div className="grid grid-cols-5 gap-2">
        {BTN_GRID.flat().map((btn, i) => {
          if (btn === "") return <div key={i} />;
          const isFunc = FUNC_BUTTONS.has(btn);
          const custom = BTN_COLOR[btn] ?? "";
          const base = custom || (isFunc
            ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            : "bg-white text-gray-900 hover:bg-gray-50 border-gray-200");
          return (
            <button
              key={i}
              onClick={() => press(btn)}
              className={`
                ${base}
                border rounded-xl py-3 text-sm font-semibold
                transition-all active:scale-95 shadow-sm
                ${btn === "0" ? "col-span-1" : ""}
              `}
            >
              {btn}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Tap <span className="font-semibold">DEG/RAD</span> to switch angle mode · Supports sin, cos, tan, log, ln, √, x², π, e
      </p>
    </div>
  );
}
