"use client";
import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getCanvas = (): HTMLCanvasElement | null => {
    return canvasRef.current?.querySelector("canvas") ?? null;
  };

  const download = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "qrcode.png";
    a.click();
  };

  const copyImage = async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      download();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Enter URL or text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          {text.length} characters · QR updates automatically
        </p>
      </div>

      {text.trim() ? (
        <div className="flex flex-col items-center gap-5">
          <div
            ref={canvasRef}
            className="border border-gray-100 rounded-xl p-5 bg-white"
          >
            <QRCodeCanvas
              value={text}
              size={260}
              marginSize={2}
              fgColor="#111111"
              bgColor="#ffffff"
              level="M"
            />
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={download}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PNG
            </button>
            <button
              onClick={copyImage}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 font-medium rounded-lg border transition-all text-sm ${
                copied
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {copied ? "✓ Copied!" : "Copy Image"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-[200px] border-2 border-dashed border-gray-100 rounded-xl text-gray-300 text-sm">
          QR code will appear here
        </div>
      )}
    </div>
  );
}
