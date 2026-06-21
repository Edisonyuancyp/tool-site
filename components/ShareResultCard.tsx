"use client";
import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import QRCode from "qrcode";

interface ShareResultCardProps {
  toolName: string;
  toolIcon: string;
  /** Array of { label, value } pairs to show on the card */
  results: { label: string; value: string }[];
  slug: string;
}

const SITE = "getfastcalc.com";

export default function ShareResultCard({
  toolName,
  toolIcon,
  results,
  slug,
}: ShareResultCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const toolUrl = `https://${SITE}/tools/${slug}`;

  useEffect(() => {
    QRCode.toDataURL(toolUrl, {
      width: 120,
      margin: 1,
      color: { dark: "#ffffff", light: "#00000000" }, // white on transparent
    }).then(setQrDataUrl).catch(() => {});
  }, [toolUrl]);

  async function downloadImage() {
    if (!cardRef.current) return;
    setStatus("generating");
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `${slug}-result.png`;
      link.href = dataUrl;
      link.click();
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  function shareTwitter() {
    const text = results.map((r) => `${r.label}: ${r.value}`).join(" | ");
    const url = `https://${SITE}/tools/${slug}`;
    const tweet = encodeURIComponent(`${toolIcon} ${text}\n\nCalculated with ${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, "_blank");
  }

  return (
    <div className="space-y-3">
      {/* Hidden card that gets rendered to image */}
      <div
        ref={cardRef}
        className="pointer-events-none select-none"
        style={{
          width: 600,
          position: "absolute",
          left: -9999,
          top: -9999,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #111 0%, #1f1f1f 100%)",
            borderRadius: 20,
            padding: "36px 40px 28px",
            color: "#fff",
            width: 600,
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <span style={{ fontSize: 36 }}>{toolIcon}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{toolName}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Result from {SITE}</div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.map((r) => (
              <div
                key={r.label}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 14, color: "#aaa" }}>{r.label}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: 13, color: "#666" }}>Free · No signup · 100% browser</span>
              <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>Scan to try it yourself →</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {qrDataUrl && (
                <div style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: 6,
                  display: "flex",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="QR" width={72} height={72} style={{ display: "block" }} />
                </div>
              )}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  background: "rgba(255,255,255,0.12)",
                  padding: "4px 12px",
                  borderRadius: 20,
                }}
              >
                {SITE}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visible preview card */}
      <div
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        className="rounded-2xl overflow-hidden"
      >
        <div
          style={{ background: "linear-gradient(135deg, #111 0%, #1f1f1f 100%)" }}
          className="p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{toolIcon}</span>
            <div>
              <div className="font-bold text-white text-base">{toolName}</div>
              <div className="text-xs text-gray-400 mt-0.5">Result from {SITE}</div>
            </div>
          </div>

          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <span className="text-sm text-gray-400">{r.label}</span>
                <span className="text-lg font-bold text-white">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-gray-600">Free · No signup · 100% browser</span>
              <p className="text-xs text-gray-600 mt-0.5">Scan to try it yourself →</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {qrDataUrl && (
                <div className="rounded-xl p-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="QR code" width={56} height={56} />
                </div>
              )}
              <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full">{SITE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={downloadImage}
          disabled={status === "generating"}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
        >
          {status === "generating" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating…
            </>
          ) : status === "done" ? (
            <><span>✓</span> Downloaded!</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download image
            </>
          )}
        </button>

        <button
          onClick={shareTwitter}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>

        <button
          onClick={() => {
            const url = `https://${SITE}/tools/${slug}`;
            navigator.clipboard?.writeText(url).then(() => {}).catch(() => {});
            const text = `[${toolName}] ${results.map((r) => `${r.label}: ${r.value}`).join(" | ")} — ${url}`;
            window.open(
              `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
              "_blank"
            );
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
          </svg>
          Share on Reddit
        </button>
      </div>
    </div>
  );
}
