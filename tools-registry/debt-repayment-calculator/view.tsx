"use client";
import { useState } from "react";

export interface ToolProps { variant?: string; }

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function DebtRepaymentCalculatorView({ variant }: ToolProps) {
  const isStudent    = variant === "student-loan";
  const isCreditCard = variant === "credit-card-debt";

  const [balance,    setBalance]    = useState(isStudent ? "30000" : isCreditCard ? "5000" : "10000");
  const [rate,       setRate]       = useState(isStudent ? "5.5"   : isCreditCard ? "22"  : "8");
  const [payment,    setPayment]    = useState(isStudent ? "350"   : isCreditCard ? "150" : "300");
  const [extraPay,   setExtraPay]   = useState("0");

  const [result, setResult] = useState<null | {
    months: number; totalPaid: number; totalInterest: number;
    monthsExtra: number; totalPaidExtra: number; totalInterestExtra: number; interestSaved: number;
  }>(null);

  function calcMonths(bal: number, r: number, pay: number) {
    if (pay <= bal * r) return Infinity; // payment doesn't cover interest
    return Math.ceil(-Math.log(1 - (bal * r) / pay) / Math.log(1 + r));
  }

  function calculate() {
    const b  = parseFloat(balance);
    const r  = parseFloat(rate) / 100 / 12;
    const p  = parseFloat(payment);
    const ep = parseFloat(extraPay) || 0;
    if ([b, r, p].some(isNaN) || b <= 0 || p <= 0) return;

    const months = calcMonths(b, r, p);
    if (!isFinite(months)) { alert("Monthly payment is too low to cover interest. Please increase it."); return; }
    const totalPaid     = p * months;
    const totalInterest = totalPaid - b;

    const monthsExtra       = calcMonths(b, r, p + ep);
    const totalPaidExtra    = (p + ep) * monthsExtra;
    const totalInterestExtra= totalPaidExtra - b;
    const interestSaved     = totalInterest - totalInterestExtra;

    setResult({ months, totalPaid, totalInterest, monthsExtra, totalPaidExtra, totalInterestExtra, interestSaved });
  }

  const rateLabel = isCreditCard ? "APR (%)" : isStudent ? "Interest Rate (%)" : "Annual Interest Rate (%)";
  const balanceLabel = isCreditCard ? "Credit Card Balance ($)" : isStudent ? "Student Loan Balance ($)" : "Total Debt ($)";

  return (
    <div className="space-y-6">
      {isCreditCard && (
        <div className="p-4 bg-red-50 rounded-xl text-sm text-red-700">
          <strong>Credit Card Warning:</strong> The average credit card APR is ~22%. Paying only the minimum can keep you in debt for decades. Use Extra Payment to see how much you can save.
        </div>
      )}
      {isStudent && (
        <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
          Federal student loan rates range from 5.5% (undergrad) to 8.05% (grad PLUS). Income-driven repayment plans can lower your monthly payment.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: balanceLabel,       value: balance,  set: setBalance },
          { label: rateLabel,          value: rate,     set: setRate },
          { label: "Monthly Payment ($)", value: payment, set: setPayment },
          { label: "Extra Monthly Payment ($)", value: extraPay, set: setExtraPay },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input type="number" value={value} onChange={e => set(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
          </div>
        ))}
      </div>

      <button onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
        Calculate
      </button>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Payoff Time",     value: `${Math.floor(result.months / 12)}y ${result.months % 12}m` },
              { label: "Total Paid",      value: fmt(result.totalPaid) },
              { label: "Total Interest",  value: fmt(result.totalInterest) },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {parseFloat(extraPay) > 0 && result.interestSaved > 0 && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50">
              <p className="text-sm font-medium text-green-800 mb-2">💡 With ${extraPay}/month extra payment:</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-green-600">New payoff time</p>
                  <p className="font-bold text-green-900">{Math.floor(result.monthsExtra / 12)}y {result.monthsExtra % 12}m</p>
                </div>
                <div>
                  <p className="text-green-600">Interest saved</p>
                  <p className="font-bold text-green-900">{fmt(result.interestSaved)}</p>
                </div>
                <div>
                  <p className="text-green-600">Time saved</p>
                  <p className="font-bold text-green-900">{result.months - result.monthsExtra} months</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
