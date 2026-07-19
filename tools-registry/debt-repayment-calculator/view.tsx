"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DebtRepaymentCalculatorView({ variant }: ToolProps) {
  const [debtBalance, setDebtBalance] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [monthlyPayment, setMonthlyPayment] = useState<number | "">("");
  const [result, setResult] = useState<{ payoffDate: string; totalInterest: number; amortizationSchedule: string } | null>(null);

  const calculate = () => {
    const balance = typeof debtBalance === "number" ? debtBalance : 0;
    const rate = typeof interestRate === "number" ? interestRate : 0;
    const payment = typeof monthlyPayment === "number" ? monthlyPayment : 0;

    if (balance <= 0 || rate < 0 || payment <= 0) {
      setResult(null);
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const monthsToPayoff = Math.ceil(Math.log(payment / (payment - monthlyRate * balance)) / Math.log(1 + monthlyRate));
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);

    const totalInterest = (payment * monthsToPayoff) - balance;
    const amortizationSchedule = `Amortization Schedule: Pay ${payment} monthly for ${monthsToPayoff} months.`;

    setResult({ payoffDate: payoffDate.toDateString(), totalInterest, amortizationSchedule });
  };

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Debt Balance</label>
        <input
          type="number"
          value={debtBalance}
          onChange={(e) => setDebtBalance(e.target.value ? Number(e.target.value) : "")}
          placeholder="Enter your debt balance..."
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Interest Rate (%)</label>
        <input
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value ? Number(e.target.value) : "")}
          placeholder="Enter interest rate..."
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Payment</label>
        <input
          type="number"
          value={monthlyPayment}
          onChange={(e) => setMonthlyPayment(e.target.value ? Number(e.target.value) : "")}
          placeholder="Enter monthly payment..."
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Calculate
      </button>
      {result && (
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">Payoff Date: {result.payoffDate}</p>
          <p className="text-lg text-gray-800">Total Interest Paid: ${result.totalInterest.toFixed(2)}</p>
          <p className="text-md text-gray-700">{result.amortizationSchedule}</p>
          <CopyButton text={`Payoff Date: ${result.payoffDate}, Total Interest Paid: $${result.totalInterest.toFixed(2)}`} />
        </div>
      )}
    </div>
  );
}
