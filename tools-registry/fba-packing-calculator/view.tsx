"use client";

import { useState, useRef, useCallback, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  w: number; // cm
  d: number; // cm
  h: number; // cm
  weight: number; // kg
  qty: number;
  color: string;
}

interface Placement {
  productId: string;
  instanceIdx: number;
  x: number; // px on canvas (scaled)
  y: number;
  w: number; // px
  d: number; // px
  rotated: boolean;
}

interface CartonPreset {
  id: string;
  label: string;
  w: number; // cm
  d: number; // cm
  h: number; // cm
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COLORS = [
  "#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6",
  "#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16",
];

const CARTON_PRESETS: CartonPreset[] = [
  { id: "s1", label: '18×14×12 in (46×36×30 cm)',  w: 46, d: 36, h: 30 },
  { id: "s2", label: '20×16×14 in (51×41×36 cm)',  w: 51, d: 41, h: 36 },
  { id: "s3", label: '24×18×18 in (61×46×46 cm)',  w: 61, d: 46, h: 46 },
  { id: "s4", label: '24×20×20 in (61×51×51 cm)',  w: 61, d: 51, h: 51 },
  { id: "s5", label: '26×20×20 in (66×51×51 cm)',  w: 66, d: 51, h: 51 },
  { id: "custom", label: 'Custom size…', w: 60, d: 40, h: 40 },
];

const FBA_MAX_WEIGHT_KG = 22.7;
const FBA_MAX_SIDE_CM   = 63.5; // 25 in

const CANVAS_W = 420; // px
const CANVAS_H = 300; // px

// ── 2D Shelf Packing Algorithm ─────────────────────────────────────────────────
function packItems(
  items: { id: string; instanceIdx: number; w: number; d: number }[],
  cartonW: number,
  cartonD: number,
  scale: number
): Placement[] {
  // Sort by area descending
  const sorted = [...items].sort((a, b) => b.w * b.d - a.w * a.d);
  const placements: Placement[] = [];
  // Shelves: each shelf has a y offset and remaining width
  const shelves: { y: number; usedW: number; maxD: number }[] = [];
  let nextY = 0;

  for (const item of sorted) {
    // Try fitting in existing shelves
    let placed = false;
    for (const shelf of shelves) {
      if (shelf.usedW + item.w <= cartonW && item.d <= shelf.maxD) {
        placements.push({
          productId: item.id,
          instanceIdx: item.instanceIdx,
          x: shelf.usedW * scale,
          y: shelf.y * scale,
          w: item.w * scale,
          d: item.d * scale,
          rotated: false,
        });
        shelf.usedW += item.w;
        placed = true;
        break;
      }
      // Try rotated
      if (shelf.usedW + item.d <= cartonW && item.w <= shelf.maxD) {
        placements.push({
          productId: item.id,
          instanceIdx: item.instanceIdx,
          x: shelf.usedW * scale,
          y: shelf.y * scale,
          w: item.d * scale,
          d: item.w * scale,
          rotated: true,
        });
        shelf.usedW += item.d;
        placed = true;
        break;
      }
    }
    if (!placed) {
      // New shelf
      if (nextY + item.d > cartonD) continue; // doesn't fit at all
      shelves.push({ y: nextY, usedW: item.w, maxD: item.d });
      placements.push({
        productId: item.id,
        instanceIdx: item.instanceIdx,
        x: 0,
        y: nextY * scale,
        w: item.w * scale,
        d: item.d * scale,
        rotated: false,
      });
      nextY += item.d;
    }
  }
  return placements;
}

function unitsPerLayer(product: Product, cartonW: number, cartonD: number): number {
  // Try both orientations
  const a = Math.floor(cartonW / product.w) * Math.floor(cartonD / product.d);
  const b = Math.floor(cartonW / product.d) * Math.floor(cartonD / product.w);
  return Math.max(a, b);
}

function layersPerCarton(product: Product, cartonH: number): number {
  return Math.max(1, Math.floor(cartonH / product.h));
}

function dimWeightKg(w: number, d: number, h: number): number {
  // convert cm → inches, then ÷ 139 → lbs, then × 0.453592 → kg
  const wIn = w / 2.54, dIn = d / 2.54, hIn = h / 2.54;
  return (wIn * dIn * hIn / 139) * 0.453592;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function FbaPackingCalculatorView() {
  // Products
  const [products, setProducts] = useState<Product[]>([
    { id: "p1", name: "Product A", w: 12, d: 8, h: 5, weight: 0.3, qty: 10, color: COLORS[0] },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Carton
  const [presetId, setPresetId]   = useState("s2");
  const [customW, setCustomW]     = useState(60);
  const [customD, setCustomD]     = useState(40);
  const [customH, setCustomH]     = useState(40);

  // Drag state
  const [dragging, setDragging]   = useState<string | null>(null); // placement key
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Recommend modal
  const [showRecommend, setShowRecommend] = useState(false);

  // ── Derived carton dims ───────────────────────────────────────────────────
  const carton = useMemo(() => {
    if (presetId === "custom") return { w: customW, d: customD, h: customH };
    return CARTON_PRESETS.find(p => p.id === presetId) ?? CARTON_PRESETS[1];
  }, [presetId, customW, customD, customH]);

  const scaleX = CANVAS_W / carton.w;
  const scaleY = CANVAS_H / carton.d;
  const scale  = Math.min(scaleX, scaleY);

  // ── Expand products × qty for packing ─────────────────────────────────────
  const instances = useMemo(() => {
    return products.flatMap(p =>
      Array.from({ length: p.qty }, (_, i) => ({
        id: p.id,
        instanceIdx: i,
        w: p.w,
        d: p.d,
      }))
    );
  }, [products]);

  const [manualOverrides, setManualOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const autoPlacements = useMemo(
    () => packItems(instances, carton.w, carton.d, scale),
    [instances, carton.w, carton.d, scale]
  );

  const placements: Placement[] = useMemo(() =>
    autoPlacements.map(p => {
      const key = `${p.productId}-${p.instanceIdx}`;
      const ov  = manualOverrides[key];
      return ov ? { ...p, x: ov.x, y: ov.y } : p;
    }),
    [autoPlacements, manualOverrides]
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalQty      = products.reduce((s, p) => s + p.qty, 0);
  const placedQty     = placements.length;
  const totalWeight   = products.reduce((s, p) => s + p.weight * p.qty, 0);
  const cartonVolCm3  = carton.w * carton.d * carton.h;
  const usedVolCm3    = placements.reduce((s, pl) => {
    const prod = products.find(p => p.id === pl.productId)!;
    return s + prod.w * prod.d * prod.h;
  }, 0);
  const utilization   = cartonVolCm3 > 0 ? (usedVolCm3 / cartonVolCm3) * 100 : 0;
  const dimWt         = dimWeightKg(carton.w, carton.d, carton.h);
  const billableWt    = Math.max(totalWeight, dimWt);

  const fbaWarn = {
    overweight: totalWeight > FBA_MAX_WEIGHT_KG,
    teamLift:   totalWeight >= 22.7 && totalWeight <= 45.4,
    oversize:   Math.max(carton.w, carton.d, carton.h) > FBA_MAX_SIDE_CM,
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent, key: string) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const pl   = placements.find(p => `${p.productId}-${p.instanceIdx}` === key)!;
    setDragging(key);
    setDragOffset({ x: e.clientX - rect.left - pl.x, y: e.clientY - rect.top - pl.y });
  }, [placements]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, CANVAS_W));
    const newY = Math.max(0, Math.min(e.clientY - rect.top  - dragOffset.y, CANVAS_H));
    setManualOverrides(prev => ({ ...prev, [dragging]: { x: newX, y: newY } }));
  }, [dragging, dragOffset]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  // ── Product CRUD ──────────────────────────────────────────────────────────
  const addProduct = () => {
    const id = `p${Date.now()}`;
    setProducts(prev => [
      ...prev,
      { id, name: `Product ${prev.length + 1}`, w: 10, d: 8, h: 4, weight: 0.2, qty: 5,
        color: COLORS[prev.length % COLORS.length] },
    ]);
    setEditingId(id);
  };

  const updateProduct = (id: string, field: keyof Product, val: string | number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    setManualOverrides({});
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setManualOverrides({});
  };

  const resetLayout = () => setManualOverrides({});

  // ── Recommend ─────────────────────────────────────────────────────────────
  const recommendations = useMemo(() => {
    return CARTON_PRESETS.filter(p => p.id !== "custom").map(preset => {
      let totalCartons = 0;
      for (const prod of products) {
        const perLayer = unitsPerLayer(prod, preset.w, preset.d);
        const layers   = layersPerCarton(prod, preset.h);
        const perCarton = perLayer * layers;
        if (perCarton === 0) { totalCartons += prod.qty; continue; }
        totalCartons += Math.ceil(prod.qty / perCarton);
      }
      const volUtil = products.reduce((s, p) => s + p.w * p.d * p.h * p.qty, 0) /
                      (preset.w * preset.d * preset.h * Math.max(1, totalCartons)) * 100;
      const estWt = products.reduce((s, p) => s + p.weight * p.qty, 0) / Math.max(1, totalCartons);
      const dw    = dimWeightKg(preset.w, preset.d, preset.h);
      return { preset, totalCartons, volUtil: Math.min(100, volUtil), estWt, dw,
               ok: estWt <= FBA_MAX_WEIGHT_KG && Math.max(preset.w, preset.d, preset.h) <= FBA_MAX_SIDE_CM };
    }).sort((a, b) => b.volUtil - a.volUtil);
  }, [products]);

  // ── Print / Export PDF packing list ──────────────────────────────────────
  const printPackingList = () => {
    const dateStr   = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
    const stackOrder = [...products].sort((a, b) => b.weight - a.weight);

    const warnHtml = [
      fbaWarn.overweight ? `<span class="badge red">⚠ Overweight — exceeds 50 lb (22.7 kg)</span>` : "",
      fbaWarn.oversize   ? `<span class="badge red">⚠ Oversize — longest side &gt; 25 in (63.5 cm)</span>` : "",
      fbaWarn.teamLift && !fbaWarn.overweight
        ? `<span class="badge amber">⚠ Team Lift label required (&gt;50 lb)</span>` : "",
    ].filter(Boolean).join(" ");

    const productRows = products.map((p, i) => `
      <tr>
        <td><span class="swatch" style="background:${p.color}"></span>${p.name}</td>
        <td>${p.w} × ${p.d} × ${p.h}</td>
        <td>${p.weight}</td>
        <td>${p.qty}</td>
        <td>${(p.weight * p.qty).toFixed(2)}</td>
        <td>${(p.w * p.d * p.h * p.qty / 1000).toFixed(1)}</td>
      </tr>`).join("");

    const stackRows = stackOrder.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><span class="swatch" style="background:${p.color}"></span>${p.name}</td>
        <td>${p.weight} kg × ${p.qty}</td>
        <td style="color:#888;font-size:11px">Heaviest items on the bottom</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>FBA Packing List — ${dateStr}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:32px;max-width:800px;margin:auto}
  h1{font-size:20px;font-weight:700;margin-bottom:4px}
  .subtitle{color:#555;font-size:12px;margin-bottom:24px}
  .section{margin-bottom:24px}
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
  table{width:100%;border-collapse:collapse}
  th{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#888;text-align:left;padding:6px 8px;border-bottom:2px solid #e5e7eb}
  td{padding:7px 8px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  .swatch{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:middle}
  .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .card{border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center}
  .card-label{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:4px}
  .card-value{font-size:18px;font-weight:700}
  .green{color:#16a34a}.amber{color:#d97706}.red{color:#dc2626}
  .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;margin-right:6px}
  .badge.red{background:#fee2e2;color:#b91c1c}
  .badge.amber{background:#fef3c7;color:#92400e}
  .footer{margin-top:32px;font-size:10px;color:#bbb;text-align:center}
  @media print{
    body{padding:16px}
    @page{margin:12mm}
    .no-print{display:none}
  }
</style>
</head>
<body>
<div class="no-print" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
  <span style="font-size:16px">🖨️</span>
  <span style="font-size:13px;color:#166534">Use <strong>Ctrl+P / Cmd+P</strong> to print or save as PDF. For best results choose "Save as PDF" as destination.</span>
  <button onclick="window.print()" style="margin-left:auto;padding:6px 16px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">Print / Save PDF</button>
</div>

<h1>📦 FBA Packing List</h1>
<p class="subtitle">Generated ${dateStr} &nbsp;·&nbsp; Carton: <strong>${carton.w} × ${carton.d} × ${carton.h} cm</strong> &nbsp;·&nbsp; ${placements.length} / ${totalQty} items per carton &nbsp;·&nbsp; <strong>${cartonsNeeded} carton(s) total</strong></p>

${warnHtml ? `<div class="section">${warnHtml}</div>` : ""}

<div class="summary-grid" style="grid-template-columns:repeat(5,1fr)">
  <div class="card"><div class="card-label">Volume Fill</div><div class="card-value ${utilization>=70?"green":utilization>=50?"amber":"red"}">${utilization.toFixed(0)}%</div></div>
  <div class="card"><div class="card-label">Items / Carton</div><div class="card-value">${placements.length}</div></div>
  <div class="card"><div class="card-label">Cartons Needed</div><div class="card-value">${cartonsNeeded}</div></div>
  <div class="card"><div class="card-label">Actual Weight</div><div class="card-value ${fbaWarn.overweight?"red":""}">${totalWeight.toFixed(2)} kg</div></div>
  <div class="card"><div class="card-label">Billable Weight</div><div class="card-value">${billableWt.toFixed(2)} kg</div></div>
</div>

<div class="section">
  <div class="section-title">Product List</div>
  <table>
    <thead><tr>
      <th>Product</th><th>Dims (W×D×H cm)</th><th>Unit Wt (kg)</th><th>Qty</th><th>Total Wt (kg)</th><th>Vol (L)</th>
    </tr></thead>
    <tbody>${productRows}</tbody>
  </table>
</div>

<div class="section">
  <div class="section-title">Stacking Order (Bottom → Top)</div>
  <table>
    <thead><tr><th>#</th><th>Product</th><th>Weight × Qty</th><th>Note</th></tr></thead>
    <tbody>${stackRows}</tbody>
  </table>
</div>

<div class="footer">Generated by GetFastCalc FBA Packing Calculator · getfastcalc.com</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to export the packing list."); return; }
    win.document.write(html);
    win.document.close();
  };

  // ── Multi-carton count (how many full cartons needed) ──────────────────
  const cartonsNeeded = useMemo(() => {
    const perCarton = placements.length > 0 && totalQty > 0
      ? placements.length  // items that fit in one carton
      : 0;
    if (perCarton === 0 || totalQty === 0) return 1;
    return Math.ceil(totalQty / perCarton);
  }, [placements.length, totalQty]);

  const utilColor = utilization >= 70 ? "text-green-600" : utilization >= 50 ? "text-amber-500" : "text-red-500";
  const canvasStyle = { width: CANVAS_W, height: CANVAS_H };

  return (
    <div className="space-y-6 select-none">
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Carton Size
          </label>
          <select
            value={presetId}
            onChange={e => { setPresetId(e.target.value); resetLayout(); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
          >
            {CARTON_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        {presetId === "custom" && (
          <div className="flex gap-2">
            {[["W", customW, setCustomW], ["D", customD, setCustomD], ["H", customH, setCustomH]].map(
              ([label, val, setter]) => (
                <div key={label as string} className="w-20">
                  <label className="block text-xs text-gray-400 mb-1">{label as string} (cm)</label>
                  <input
                    type="number" min={1}
                    value={val as number}
                    onChange={e => { (setter as (v: number) => void)(Number(e.target.value)); resetLayout(); }}
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center"
                  />
                </div>
              )
            )}
          </div>
        )}
        <button
          onClick={() => setShowRecommend(true)}
          className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          💡 Recommend Box
        </button>
        <button
          onClick={printPackingList}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          � Export PDF
        </button>
      </div>

      {/* ── FBA warnings ──────────────────────────────────────────────── */}
      {(fbaWarn.overweight || fbaWarn.oversize || fbaWarn.teamLift) && (
        <div className="flex flex-wrap gap-2">
          {fbaWarn.overweight && (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              ⚠️ Overweight — exceeds 50 lb (22.7 kg) FBA limit
            </span>
          )}
          {fbaWarn.teamLift && !fbaWarn.overweight && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
              ⚠️ Requires Team Lift label (&gt;50 lb)
            </span>
          )}
          {fbaWarn.oversize && (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              ⚠️ Oversize — longest side exceeds 25 in (63.5 cm)
            </span>
          )}
        </div>
      )}

      {/* ── Main layout: products + canvas ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

        {/* Products panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Products</span>
            <button
              onClick={addProduct}
              className="text-xs px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              + Add
            </button>
          </div>

          {products.map(p => (
            <div
              key={p.id}
              className="border border-gray-200 rounded-xl p-3 space-y-2 bg-white"
              style={{ borderLeftWidth: 4, borderLeftColor: p.color }}
            >
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 text-sm font-medium border-0 focus:outline-none bg-transparent"
                  value={p.name}
                  onChange={e => updateProduct(p.id, "name", e.target.value)}
                />
                <button
                  onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  {editingId === p.id ? "▲" : "▼"}
                </button>
                <button onClick={() => removeProduct(p.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
              </div>

              {editingId === p.id && (
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {(["w","d","h"] as const).map(f => (
                    <div key={f}>
                      <label className="text-[10px] text-gray-400 uppercase">{f} (cm)</label>
                      <input type="number" min={1}
                        value={p[f]}
                        onChange={e => updateProduct(p.id, f, Number(e.target.value))}
                        className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-center"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Wt (kg)</label>
                    <input type="number" min={0} step={0.01}
                      value={p.weight}
                      onChange={e => updateProduct(p.id, "weight", Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Qty</label>
                    <input type="number" min={1}
                      value={p.qty}
                      onChange={e => updateProduct(p.id, "qty", Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-center"
                    />
                  </div>
                </div>
              )}

              {editingId !== p.id && (
                <p className="text-xs text-gray-500">
                  {p.w}×{p.d}×{p.h} cm · {p.weight} kg · ×{p.qty}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Canvas area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Top-down view · {carton.w}×{carton.d} cm base
            </span>
            <button
              onClick={resetLayout}
              className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              Reset Layout
            </button>
          </div>

          <div
            ref={canvasRef}
            className="relative bg-gray-50 border-2 border-gray-300 rounded-xl overflow-hidden cursor-default"
            style={canvasStyle}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Grid lines */}
            {Array.from({ length: Math.floor(carton.w / 10) }).map((_, i) => (
              <div key={`vg${i}`} className="absolute top-0 bottom-0 border-l border-gray-200"
                style={{ left: (i + 1) * 10 * scale }} />
            ))}
            {Array.from({ length: Math.floor(carton.d / 10) }).map((_, i) => (
              <div key={`hg${i}`} className="absolute left-0 right-0 border-t border-gray-200"
                style={{ top: (i + 1) * 10 * scale }} />
            ))}

            {placements.map(pl => {
              const key  = `${pl.productId}-${pl.instanceIdx}`;
              const prod = products.find(p => p.id === pl.productId)!;
              const isDraggingThis = dragging === key;
              return (
                <div
                  key={key}
                  className="absolute flex items-center justify-center text-white text-[9px] font-bold rounded cursor-grab active:cursor-grabbing transition-shadow"
                  style={{
                    left:    pl.x,
                    top:     pl.y,
                    width:   Math.max(pl.w - 2, 4),
                    height:  Math.max(pl.d - 2, 4),
                    backgroundColor: prod.color,
                    opacity: isDraggingThis ? 0.85 : 0.8,
                    boxShadow: isDraggingThis ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                    zIndex:  isDraggingThis ? 50 : 1,
                  }}
                  onMouseDown={e => onMouseDown(e, key)}
                  title={`${prod.name} #${pl.instanceIdx + 1} — ${pl.rotated ? "rotated" : "normal"}`}
                >
                  {pl.w > 24 && `#${pl.instanceIdx + 1}`}
                </div>
              );
            })}

            {/* Overflow indicator */}
            {placedQty < totalQty && (
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-red-100 text-red-600 text-xs font-semibold">
                {totalQty - placedQty} items don&apos;t fit
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Utilization", val: `${utilization.toFixed(0)}%`, className: utilColor },
              { label: "Items placed", val: `${placedQty} / ${totalQty}`, className: "text-gray-800" },
              { label: "Cartons needed", val: `${cartonsNeeded}`, className: "text-gray-800" },
              { label: "Actual weight", val: `${totalWeight.toFixed(2)} kg`, className: fbaWarn.overweight ? "text-red-600" : "text-gray-800" },
              { label: "Billable weight", val: `${billableWt.toFixed(2)} kg`, className: "text-gray-800" },
            ].map(({ label, val, className }) => (
              <div key={label} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className={`text-lg font-bold ${className}`}>{val}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <span key={p.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recommend modal ─────────────────────────────────────────────── */}
      {showRecommend && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRecommend(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">Box Size Recommendations</h3>
              <button onClick={() => setShowRecommend(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b">
                    <th className="pb-2 text-left">Box</th>
                    <th className="pb-2 text-right">Cartons</th>
                    <th className="pb-2 text-right">Fill %</th>
                    <th className="pb-2 text-right">Est. Wt</th>
                    <th className="pb-2 text-center">FBA OK</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map(r => (
                    <tr key={r.preset.id}
                      className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => { setPresetId(r.preset.id); resetLayout(); setShowRecommend(false); }}
                    >
                      <td className="py-2 font-medium text-gray-800">{r.preset.label.split(" (")[0]}</td>
                      <td className="py-2 text-right text-gray-600">{r.totalCartons}</td>
                      <td className={`py-2 text-right font-semibold ${r.volUtil >= 70 ? "text-green-600" : r.volUtil >= 50 ? "text-amber-500" : "text-red-500"}`}>
                        {r.volUtil.toFixed(0)}%
                      </td>
                      <td className={`py-2 text-right ${r.estWt > FBA_MAX_WEIGHT_KG ? "text-red-600" : "text-gray-600"}`}>
                        {r.estWt.toFixed(1)} kg
                      </td>
                      <td className="py-2 text-center">{r.ok ? "✅" : "❌"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400">Click a row to switch to that carton size.</p>
          </div>
        </div>
      )}
    </div>
  );
}
