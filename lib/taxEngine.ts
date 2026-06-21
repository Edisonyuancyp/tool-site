/**
 * taxEngine.ts — Universal progressive tax calculation engine.
 * Pure functions only. No side effects. Framework-agnostic.
 *
 * Usage:
 *   import { calculateTax, getCountryConfig } from "@/lib/taxEngine";
 *   const result = calculateTax("us", 75000, "single");
 */

import TAX_RULES from "@/lib/tax-rules.json";

export type CountryCode = keyof typeof TAX_RULES;

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxResult {
  country: string;
  currency: string;
  currencySymbol: string;
  grossIncome: number;
  deduction: number;
  taxableIncome: number;
  incomeTax: number;
  effectiveRate: number;     // % of gross
  marginalRate: number;      // top bracket rate
  afterTax: number;
  additionalCharges: AdditionalCharge[];
  totalDeductions: number;   // all social/extra charges
  netIncome: number;         // after tax AND social charges
  bracketBreakdown: BracketItem[];
  notes: string;
}

export interface AdditionalCharge {
  label: string;
  amount: number;
}

export interface BracketItem {
  range: string;
  rate: string;
  taxPaid: number;
}

// ── Core progressive tax engine ───────────────────────────────────────────────

function calcProgressive(taxableIncome: number, brackets: (number | null)[][]): { tax: number; marginalRate: number; breakdown: BracketItem[] } {
  let tax = 0;
  let marginalRate = brackets[0][2] as number;
  const breakdown: BracketItem[] = [];

  for (const row of brackets) {
    const [min, maxRaw, rate] = row as [number, number | null, number];
    const max = maxRaw ?? Infinity;
    if (taxableIncome <= min) break;
    const slice = Math.min(taxableIncome, max) - min;
    const taxPaid = slice * rate;
    tax += taxPaid;
    marginalRate = rate;
    if (taxPaid > 0 || rate === 0) {
      const maxLabel = maxRaw ? formatNumber(maxRaw) : "∞";
      breakdown.push({
        range: `${formatNumber(min)} – ${maxLabel}`,
        rate:  `${(rate * 100).toFixed(1)}%`,
        taxPaid,
      });
    }
  }
  return { tax, marginalRate, breakdown };
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Country-specific handlers ─────────────────────────────────────────────────

function calcUS(income: number, filingStatus: string, isSelfEmployed: boolean): TaxResult {
  const cfg = TAX_RULES.us;
  const status = (filingStatus === "married" ? "married" : "single") as "single" | "married";
  const deduction = cfg.standardDeduction[status];
  const taxableIncome = Math.max(0, income - deduction);
  const brackets = cfg.brackets[status];
  const { tax: incomeTax, marginalRate, breakdown } = calcProgressive(taxableIncome, brackets);

  const additional: AdditionalCharge[] = [];
  if (isSelfEmployed && income > 0) {
    const seNet = income * (1 - cfg.selfEmploymentDeductionRate * cfg.selfEmploymentTaxRate);
    const seTax = seNet * cfg.selfEmploymentTaxRate;
    additional.push({ label: "Self-Employment Tax (SE)", amount: seTax });
  }

  const totalCharges = additional.reduce((s, c) => s + c.amount, 0);
  return {
    country: cfg.name,
    currency: cfg.currency,
    currencySymbol: cfg.currencySymbol,
    grossIncome: income,
    deduction,
    taxableIncome,
    incomeTax,
    effectiveRate: income > 0 ? (incomeTax / income) * 100 : 0,
    marginalRate,
    afterTax: income - incomeTax,
    additionalCharges: additional,
    totalDeductions: totalCharges,
    netIncome: income - incomeTax - totalCharges,
    bracketBreakdown: breakdown,
    notes: cfg.notes,
  };
}

function calcUK(income: number): TaxResult {
  const cfg = TAX_RULES.uk;
  let allowance = cfg.personalAllowance;
  if (income > cfg.personalAllowanceTaperStart) {
    allowance = Math.max(0, allowance - Math.floor((income - cfg.personalAllowanceTaperStart) / 2));
  }
  const taxableIncome = Math.max(0, income - allowance);
  const brackets = cfg.brackets.individual;
  const { tax: incomeTax, marginalRate, breakdown } = calcProgressive(taxableIncome, brackets);

  // National Insurance
  const ni = cfg.nationalInsurance;
  let niAmount = 0;
  if (income > ni.threshold2) {
    niAmount = (ni.threshold2 - ni.threshold1) * ni.rate1 + (income - ni.threshold2) * ni.rate2;
  } else if (income > ni.threshold1) {
    niAmount = (income - ni.threshold1) * ni.rate1;
  }
  const additional: AdditionalCharge[] = niAmount > 0 ? [{ label: "National Insurance (Class 1)", amount: niAmount }] : [];
  const totalCharges = niAmount;

  return {
    country: cfg.name,
    currency: cfg.currency,
    currencySymbol: cfg.currencySymbol,
    grossIncome: income,
    deduction: allowance,
    taxableIncome,
    incomeTax,
    effectiveRate: income > 0 ? (incomeTax / income) * 100 : 0,
    marginalRate,
    afterTax: income - incomeTax,
    additionalCharges: additional,
    totalDeductions: totalCharges,
    netIncome: income - incomeTax - totalCharges,
    bracketBreakdown: breakdown,
    notes: cfg.notes,
  };
}

function calcCA(income: number): TaxResult {
  const cfg = TAX_RULES.ca;
  const bpa = cfg.basicPersonalAmount;
  const bpaCredit = bpa * cfg.basicPersonalAmountCredit;
  const taxableIncome = income; // Canada doesn't subtract BPA before calculation
  const brackets = cfg.brackets.individual;
  const { tax: rawTax, marginalRate, breakdown } = calcProgressive(taxableIncome, brackets);
  const incomeTax = Math.max(0, rawTax - bpaCredit);

  const cpp = Math.min(Math.max(0, income - 3500) * cfg.cppRate, cfg.cppMax);
  const ei  = Math.min(income * cfg.eiRate, cfg.eiMax);
  const additional: AdditionalCharge[] = [
    { label: "CPP Contributions", amount: cpp },
    { label: "EI Premiums",       amount: ei  },
  ];
  const totalCharges = cpp + ei;

  return {
    country: cfg.name,
    currency: cfg.currency,
    currencySymbol: cfg.currencySymbol,
    grossIncome: income,
    deduction: bpa,
    taxableIncome,
    incomeTax,
    effectiveRate: income > 0 ? (incomeTax / income) * 100 : 0,
    marginalRate,
    afterTax: income - incomeTax,
    additionalCharges: additional,
    totalDeductions: totalCharges,
    netIncome: income - incomeTax - totalCharges,
    bracketBreakdown: breakdown,
    notes: cfg.notes,
  };
}

function calcAU(income: number, filingStatus: string): TaxResult {
  const cfg = TAX_RULES.au;
  const isResident = filingStatus !== "nonresident";
  const status = isResident ? "resident" : "nonresident";
  const brackets = cfg.brackets[status as "resident" | "nonresident"];
  const { tax: rawTax, marginalRate, breakdown } = calcProgressive(income, brackets);

  // Low Income Tax Offset
  let lito = 0;
  if (isResident) {
    const lo = cfg.lowIncomeTaxOffset;
    if (income <= lo.start) lito = lo.max;
    else if (income < lo.end) lito = lo.max - ((income - lo.start) / (lo.end - lo.start)) * lo.max;
  }
  const incomeTax = Math.max(0, rawTax - lito);

  // Medicare Levy
  const medicare = isResident && income > cfg.medicareLevyThreshold ? income * cfg.medicareLevy : 0;
  const additional: AdditionalCharge[] = medicare > 0 ? [{ label: "Medicare Levy (2%)", amount: medicare }] : [];

  return {
    country: cfg.name,
    currency: cfg.currency,
    currencySymbol: cfg.currencySymbol,
    grossIncome: income,
    deduction: lito,
    taxableIncome: income,
    incomeTax,
    effectiveRate: income > 0 ? (incomeTax / income) * 100 : 0,
    marginalRate,
    afterTax: income - incomeTax,
    additionalCharges: additional,
    totalDeductions: medicare,
    netIncome: income - incomeTax - medicare,
    bracketBreakdown: breakdown,
    notes: cfg.notes,
  };
}

function calcDE(income: number, filingStatus: string): TaxResult {
  const cfg = TAX_RULES.de;
  const status = filingStatus === "married" ? "married" : "individual";
  const deduction = cfg.standardDeduction[status as "individual" | "married"];
  const taxableIncome = Math.max(0, income - deduction);
  const brackets = cfg.brackets[status as "individual" | "married"];
  const { tax: incomeTax, marginalRate, breakdown } = calcProgressive(taxableIncome, brackets);

  // Solidarity surcharge
  const soli = incomeTax > cfg.solidaritySurchargeThreshold
    ? incomeTax * cfg.solidaritySurcharge : 0;

  // Social security (employee share)
  const ss = cfg.socialSecurity;
  const socialTotal = income * (ss.healthInsurance + ss.pensionInsurance + ss.unemploymentInsurance + ss.longTermCare);
  const additional: AdditionalCharge[] = [
    { label: "Solidarity Surcharge (Soli)", amount: soli },
    { label: "Social Security (employee)", amount: socialTotal },
  ];
  const totalCharges = soli + socialTotal;

  return {
    country: cfg.name,
    currency: cfg.currency,
    currencySymbol: cfg.currencySymbol,
    grossIncome: income,
    deduction,
    taxableIncome,
    incomeTax,
    effectiveRate: income > 0 ? (incomeTax / income) * 100 : 0,
    marginalRate,
    afterTax: income - incomeTax,
    additionalCharges: additional,
    totalDeductions: totalCharges,
    netIncome: income - incomeTax - totalCharges,
    bracketBreakdown: breakdown,
    notes: cfg.notes,
  };
}

function calcGeneric(countryCode: CountryCode, income: number, filingStatus: string): TaxResult {
  const cfg = TAX_RULES[countryCode] as {
    name: string; currency: string; currencySymbol: string;
    brackets: Record<string, number[][]>;
    standardDeduction: Record<string, number>;
    notes: string;
  };
  const statuses = Object.keys(cfg.brackets);
  const status = statuses.includes(filingStatus) ? filingStatus : statuses[0];
  const deduction = (cfg.standardDeduction as Record<string, number>)[status] ?? 0;
  const taxableIncome = Math.max(0, income - deduction);
  const brackets = cfg.brackets[status];
  const { tax: incomeTax, marginalRate, breakdown } = calcProgressive(taxableIncome, brackets);

  return {
    country: cfg.name,
    currency: cfg.currency,
    currencySymbol: cfg.currencySymbol,
    grossIncome: income,
    deduction,
    taxableIncome,
    incomeTax,
    effectiveRate: income > 0 ? (incomeTax / income) * 100 : 0,
    marginalRate,
    afterTax: income - incomeTax,
    additionalCharges: [],
    totalDeductions: 0,
    netIncome: income - incomeTax,
    bracketBreakdown: breakdown,
    notes: cfg.notes,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function calculateTax(
  countryCode: CountryCode,
  income: number,
  filingStatus: string,
  options: { isSelfEmployed?: boolean } = {}
): TaxResult {
  switch (countryCode) {
    case "us": return calcUS(income, filingStatus, options.isSelfEmployed ?? false);
    case "uk": return calcUK(income);
    case "ca": return calcCA(income);
    case "au": return calcAU(income, filingStatus);
    case "de": return calcDE(income, filingStatus);
    default:   return calcGeneric(countryCode, income, filingStatus);
  }
}

export function getCountryConfig(code: CountryCode) {
  return TAX_RULES[code];
}

export function getSupportedCountries(): { code: CountryCode; name: string; currencySymbol: string }[] {
  return (Object.keys(TAX_RULES) as CountryCode[]).map(code => ({
    code,
    name: (TAX_RULES[code] as { name: string }).name,
    currencySymbol: (TAX_RULES[code] as { currencySymbol: string }).currencySymbol,
  }));
}

export function getFilingStatuses(code: CountryCode): string[] {
  const cfg = TAX_RULES[code] as { filingStatuses?: string[]; brackets: Record<string, unknown> };
  return cfg.filingStatuses ?? Object.keys(cfg.brackets);
}
