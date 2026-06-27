"use client";
import { useState } from "react";

function fmt(n: number) { return Math.ceil(n).toLocaleString(); }
function fmtD(n: number) { return n.toFixed(1); }

export default function FbaReorderCalculator({ variant }: { variant?: string }) {
  const [currentStock, setCurrentStock] = useState("300");
  const [dailySales,   setDailySales]   = useState("15");
  const [leadTime,     setLeadTime]     = useState("35");
  const [safetyDays,   setSafetyDays]   = useState("14");
  const [reviewPeriod, setReviewPeriod] = useState("30");

  const stock   = parseFloat(currentStock) || 0;
  const daily   = parseFloat(dailySales)   || 0;
  const lead    = parseFloat(leadTime)     || 0;
  const safety  = parseFloat(safetyDays)  || 0;
  const review  = parseFloat(reviewPeriod)|| 0;

  const safetyUnits   = daily * safety;
  const reorderPoint  = daily * lead + safetyUnits;
  const daysRemaining = daily > 0 ? stock / daily : 999;
  const daysUntilROP  = daily > 0 ? Math.max(0, (stock - reorderPoint) / daily) : 0;
  const orderQty      = Math.max(0, daily * (review + lead) + safetyUnits - stock);
  const stockoutRisk  = daysRemaining < lead + safety;
  const mustOrderNow  = stock <= reorderPoint;

  const statusColor = mustOrderNow
    ? "bg-red-50 border-red-200 text-red-700"
    : stockoutRisk
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-green-50 border-green-200 text-green-700";

  const statusMsg = mustOrderNow
    ? "🚨 Order NOW — stock at or below reorder point"
    : stockoutRisk
    ? `⚠️ Order soon — only ${fmtD(daysRemaining)} days of stock vs ${lead + safety} days needed`
    : `✅ Stock OK — reorder in ~${fmtD(daysUntilROP)} days`;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Status Banner */}
      <div className={`rounded-xl p-3 border text-sm font-semibold text-center ${statusColor}`}>
        {statusMsg}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Inventory Details</h3>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Current Stock (units at Amazon)</span>
            <input type="number" value={currentStock} onChange={e => setCurrentStock(e.target.value)} min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Average Daily Sales (units/day)</span>
            <input type="number" value={dailySales} onChange={e => setDailySales(e.target.value)} min="0" step="0.1"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Lead Time — supplier to Amazon (days)</span>
            <input type="number" value={leadTime} onChange={e => setLeadTime(e.target.value)} min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Safety Stock Buffer (days of sales)</span>
            <input type="number" value={safetyDays} onChange={e => setSafetyDays(e.target.value)} min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Review Period (days between orders)</span>
            <input type="number" value={reviewPeriod} onChange={e => setReviewPeriod(e.target.value)} min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Calculations</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{fmtD(daysRemaining)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Days of Stock Left</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${mustOrderNow ? "text-red-500" : "text-blue-600"}`}>
                {fmt(reorderPoint)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Reorder Point (units)</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{fmt(orderQty)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Suggested Order Qty</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-orange-500">{fmt(safetyUnits)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Safety Stock (units)</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
            <p><span className="font-semibold text-gray-700">Reorder Point</span> = Daily sales × Lead time + Safety stock</p>
            <p><span className="font-semibold text-gray-700">Order Qty</span> = Daily sales × (Review + Lead) + Safety stock − Current stock</p>
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-0.5">
              <p>Daily sales: <span className="font-medium text-gray-700">{fmtD(daily)} units</span></p>
              <p>Lead time coverage: <span className="font-medium text-gray-700">{fmt(daily * lead)} units</span></p>
              <p>Safety stock: <span className="font-medium text-gray-700">{fmt(safetyUnits)} units ({safety} days)</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
