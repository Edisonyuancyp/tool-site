"use client";
import { useState, useMemo } from "react";

export interface ToolProps { variant?: string; }

function fmt(n: number, dec = 0) {
  if (isNaN(n) || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtUSD(n: number) {
  if (isNaN(n) || !isFinite(n)) return "—";
  return "$" + fmt(Math.abs(n));
}

function Field({ label, value, onChange, prefix, suffix, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      {hint && <p className="text-[10px] text-gray-400 mb-1.5">{hint}</p>}
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 bg-white">
        {prefix && <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} step="any" min={0}
          className="flex-1 px-3 py-2.5 text-sm font-mono focus:outline-none" />
        {suffix && <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">{suffix}</span>}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  const accent = positive === true ? "bg-emerald-50 border-emerald-200" : positive === false ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200";
  const textColor = positive === true ? "text-emerald-700" : positive === false ? "text-red-700" : "text-gray-900";
  return (
    <div className={`p-4 rounded-xl border ${accent}`}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${textColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function RentVsBuyView() {
  const [homePrice, setHomePrice]       = useState("500000");
  const [monthlyRent, setMonthlyRent]   = useState("2500");
  const [downPct, setDownPct]           = useState("20");
  const [mortgageRate, setMortgateRate] = useState("7");
  const [years, setYears]               = useState("10");
  const [appreciation, setAppreciation] = useState("3");
  const [investReturn, setInvestReturn] = useState("7");
  const [propTaxPct, setPropTaxPct]     = useState("1.2");
  const [maintPct, setMaintPct]         = useState("1");

  const r = useMemo(() => {
    const P  = parseFloat(homePrice)    || 0;
    const rent  = parseFloat(monthlyRent) || 0;
    const down  = P * (parseFloat(downPct) / 100);
    const loan  = P - down;
    const rM    = (parseFloat(mortgageRate) / 100) / 12;
    const n     = parseFloat(years) * 12;
    const appR  = parseFloat(appreciation) / 100;
    const invR  = parseFloat(investReturn)  / 100;
    const ptax  = P * (parseFloat(propTaxPct) / 100) / 12;
    const maint = P * (parseFloat(maintPct)  / 100) / 12;

    // Monthly mortgage payment (P&I)
    const monthlyMortgage = rM > 0
      ? loan * rM * Math.pow(1 + rM, n) / (Math.pow(1 + rM, n) - 1)
      : loan / n;

    const totalMonthlyBuy = monthlyMortgage + ptax + maint;

    // Total cost to buy over N years
    const totalInterest = monthlyMortgage * n - loan;
    const totalPropTax  = ptax * n;
    const totalMaint    = maint * n;
    const closingCostBuy  = P * 0.03; // 3% buy
    const closingCostSell = P * 0.06; // 6% sell

    // Home value at end
    const homeValueEnd = P * Math.pow(1 + appR, parseFloat(years));
    // Remaining loan balance
    let balance = loan;
    for (let i = 0; i < n; i++) balance = balance * (1 + rM) - monthlyMortgage;
    balance = Math.max(0, balance);
    const equityEnd = homeValueEnd - balance;
    // Net wealth from buying = equity - total costs paid
    const totalBuyCost = closingCostBuy + totalInterest + totalPropTax + totalMaint + closingCostSell;
    const buyNetWealth = equityEnd - totalBuyCost + down; // down payment returned via equity

    // Renting: invest down payment + monthly difference
    const monthlyDiff = Math.max(0, totalMonthlyBuy - rent);
    const initialInvest = down + closingCostBuy; // would-be down + closing
    const rentNetWealth =
      initialInvest * Math.pow(1 + invR, parseFloat(years)) +
      monthlyDiff * ((Math.pow(1 + invR / 12, n) - 1) / (invR / 12));

    const breakEvenYear = (() => {
      for (let y = 1; y <= 30; y++) {
        const ny = y * 12;
        // simplified: recalculate at each year
        const hv = P * Math.pow(1 + appR, y);
        let bal = loan;
        for (let i = 0; i < ny; i++) bal = bal * (1 + rM) - monthlyMortgage;
        bal = Math.max(0, bal);
        const buyW = hv - bal - closingCostBuy - (totalInterest * y / parseFloat(years)) - totalPropTax * y / parseFloat(years) - totalMaint * y / parseFloat(years);
        const rentW = initialInvest * Math.pow(1 + invR, y) + monthlyDiff * ((Math.pow(1 + invR / 12, ny) - 1) / (invR / 12));
        if (buyW > rentW) return y;
      }
      return null;
    })();

    return {
      monthlyMortgage, totalMonthlyBuy, totalBuyCost,
      homeValueEnd, equityEnd, buyNetWealth, rentNetWealth,
      breakEvenYear,
      buyWins: buyNetWealth > rentNetWealth,
      diff: Math.abs(buyNetWealth - rentNetWealth),
    };
  }, [homePrice, monthlyRent, downPct, mortgageRate, years, appreciation, investReturn, propTaxPct, maintPct]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">🏠 Buying</p>
          <Field label="Home price" value={homePrice} onChange={setHomePrice} prefix="$" />
          <Field label="Down payment" value={downPct} onChange={setDownPct} suffix="%" hint="Typical: 20%" />
          <Field label="Mortgage rate" value={mortgageRate} onChange={setMortgateRate} suffix="%" hint="Current ~7% in US" />
          <Field label="Property tax" value={propTaxPct} onChange={setPropTaxPct} suffix="% /yr" />
          <Field label="Maintenance" value={maintPct} onChange={setMaintPct} suffix="% /yr" hint="1% rule of thumb" />
          <Field label="Annual appreciation" value={appreciation} onChange={setAppreciation} suffix="% /yr" />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">🏢 Renting</p>
          <Field label="Monthly rent" value={monthlyRent} onChange={setMonthlyRent} prefix="$" />
          <Field label="Investment return" value={investReturn} onChange={setInvestReturn} suffix="% /yr" hint="If down payment invested" />
          <Field label="Time horizon" value={years} onChange={setYears} suffix="years" />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Monthly (buy)" value={fmtUSD(r.totalMonthlyBuy)} sub="mortgage+tax+maint" />
        <StatCard label="Monthly (rent)" value={fmtUSD(parseFloat(monthlyRent) || 0)} />
        <StatCard label={`Buy net wealth (${years}yr)`} value={fmtUSD(r.buyNetWealth)} positive={r.buyWins} />
        <StatCard label={`Rent net wealth (${years}yr)`} value={fmtUSD(r.rentNetWealth)} positive={!r.buyWins} />
      </div>

      {/* Verdict */}
      <div className={`rounded-xl p-5 border ${r.buyWins ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}>
        <p className="text-sm font-bold text-gray-900 mb-1">
          {r.buyWins
            ? `🏠 Buying wins by ${fmtUSD(r.diff)} over ${years} years`
            : `🏢 Renting + investing wins by ${fmtUSD(r.diff)} over ${years} years`}
        </p>
        <p className="text-xs text-gray-600">
          {r.breakEvenYear
            ? `Break-even point: ~${r.breakEvenYear} years. Buying becomes better after that.`
            : `At these inputs, renting + investing outperforms buying over a 30-year horizon.`}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Home value (end)" value={fmtUSD(r.homeValueEnd)} />
        <StatCard label="Equity at sale" value={fmtUSD(r.equityEnd)} />
        <StatCard label="Monthly mortgage" value={fmtUSD(r.monthlyMortgage)} />
      </div>

      <p className="text-[10px] text-gray-400 leading-relaxed">
        Assumptions: 3% buy closing costs, 6% sell closing costs. Investment returns are before tax.
        Rent increases not modeled. This is a simplified model — consult a financial advisor for personal decisions.
      </p>
    </div>
  );
}
