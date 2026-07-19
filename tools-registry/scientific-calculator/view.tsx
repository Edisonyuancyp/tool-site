"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const buttons: string[][] = [
  ["sin", "cos", "tan", "(", ")"],
  ["log", "ln", "sqrt", "^", "!"],
  ["7", "8", "9", "/", "pi"],
  ["4", "5", "6", "*", "e"],
  ["1", "2", "3", "-", "%"],
  ["0", ".", "=", "+", "C"],
];

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function evaluateExpression(raw: string): number {
  let expr = raw;

  // Replace constants
  expr = expr.replace(/pi/g, `(${Math.PI})`);
  expr = expr.replace(/e/g, `(${Math.E})`);

  // Replace power operator
  expr = expr.replace(/\^/g, "**");

  // Replace factorial: number followed by !
  expr = expr.replace(/(\d+(\.\d+)?)!/g, (_, num) => {
    const val = factorial(parseFloat(num));
    return `(${val})`;
  });

  // Replace sqrt(x)
  expr = expr.replace(/sqrt\(([^()]+)\)/g, (_, inner) => {
    const val = Math.sqrt(evaluateExpression(inner));
    return `(${val})`;
  });

  // Replace log(x) -> log10
  expr = expr.replace(/log\(([^()]+)\)/g, (_, inner) => {
    const val = Math.log10(evaluateExpression(inner));
    return `(${val})`;
  });

  // Replace ln(x)
  expr = expr.replace(/ln\(([^()]+)\)/g, (_, inner) => {
    const val = Math.log(evaluateExpression(inner));
    return `(${val})`;
  });

  // Replace trig functions (in degrees)
  expr = expr.replace(/sin\(([^()]+)\)/g, (_, inner) => {
    const val = Math.sin((evaluateExpression(inner) * Math.PI) / 180);
    return `(${val})`;
  });
  expr = expr.replace(/cos\(([^()]+)\)/g, (_, inner) => {
    const val = Math.cos((evaluateExpression(inner) * Math.PI) / 180);
    return `(${val})`;
  });
  expr = expr.replace(/tan\(([^()]+)\)/g, (_, inner) => {
    const val = Math.tan((evaluateExpression(inner) * Math.PI) / 180);
    return `(${val})`;
  });

  // Only allow safe characters before evaluating
  if (!/^[0-9+\-*/().\s%]*$/.test(expr.replace(/\*\*/g, ""))) {
    throw new Error("Invalid expression");
  }

  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${expr})`);
  const value = fn();

  if (typeof value !== "number" || !isFinite(value)) {
    throw new Error("Invalid result");
  }

  return value;
}

export default function ScientificCalculatorView({ variant }: ToolProps) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleButtonClick(label: string) {
    if (label === "C") {
      setExpression("");
      setResult(null);
      setError(null);
      return;
    }
    if (label === "=") {
      calculate();
      return;
    }
    if (["sin", "cos", "tan", "log", "ln", "sqrt"].includes(label)) {
      setExpression((prev) => prev + label + "(");
      return;
    }
    setExpression((prev) => prev + label);
  }

  function calculate() {
    setError(null);
    setResult(null);
    if (!expression.trim()) {
      setError("Please enter an expression.");
      return;
    }
    try {
      const value = evaluateExpression(expression);
      setResult(String(value));
    } catch {
      setError("Invalid expression. Please check your input.");
    }
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Expression
        </label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          placeholder="e.g. sin(30) + sqrt(16) * 2"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {buttons.map((row) =>
          row.map((label) => (
            <button
              key={label}
              onClick={() => handleButtonClick(label)}
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              {label}
            </button>
          ))
        )}
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2 w-full"
      >
        Calculate
      </button>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result !== null && (
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">{result}</p>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
