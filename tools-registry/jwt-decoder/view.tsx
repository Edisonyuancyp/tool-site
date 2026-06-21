"use client";
import { useState, useMemo } from "react";

export interface ToolProps { variant?: string; }

function base64UrlDecode(str: string): string {
  try {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4;
    const paddedStr = pad ? padded + "=".repeat(4 - pad) : padded;
    return decodeURIComponent(
      atob(paddedStr).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch {
    return "";
  }
}

interface JwtParts { header: Record<string, unknown> | null; payload: Record<string, unknown> | null; raw: [string, string, string] | null; error: string | null }

function parseJwt(token: string): JwtParts {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { header: null, payload: null, raw: null, error: "Invalid JWT: must have exactly 3 parts separated by dots." };
  try {
    const h = JSON.parse(base64UrlDecode(parts[0]));
    const p = JSON.parse(base64UrlDecode(parts[1]));
    return { header: h, payload: p, raw: [parts[0], parts[1], parts[2]], error: null };
  } catch {
    return { header: null, payload: null, raw: null, error: "Failed to decode JWT — malformed Base64 or JSON." };
  }
}

interface SecurityIssue { level: "error" | "warn" | "ok"; message: string }

function analyzeJwt(header: Record<string, unknown>, payload: Record<string, unknown>): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const alg = header.alg as string | undefined;

  if (!alg || alg === "none") issues.push({ level: "error", message: "Algorithm is 'none' — unsigned tokens are a critical security vulnerability." });
  else if (["HS256", "HS384", "HS512"].includes(alg)) issues.push({ level: "warn", message: `Using symmetric algorithm ${alg}. Prefer RS256 or ES256 for distributed systems.` });
  else issues.push({ level: "ok", message: `Algorithm: ${alg} (asymmetric — good practice)` });

  if (!payload.exp) {
    issues.push({ level: "error", message: "Missing 'exp' (expiration) claim — token never expires. This is a serious security risk." });
  } else {
    const exp = payload.exp as number;
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) issues.push({ level: "error", message: `Token EXPIRED at ${new Date(exp * 1000).toLocaleString()}` });
    else {
      const mins = Math.floor((exp - now) / 60);
      issues.push({ level: mins < 60 ? "ok" : "warn", message: `Expires in ${mins} minutes (${new Date(exp * 1000).toLocaleString()})` });
    }
  }

  if (!payload.iat) issues.push({ level: "warn", message: "Missing 'iat' (issued at) claim — recommended for audit trails." });
  if (!payload.iss) issues.push({ level: "warn", message: "Missing 'iss' (issuer) claim — add it and validate on your server." });
  if (!payload.sub) issues.push({ level: "warn", message: "Missing 'sub' (subject) claim — usually the user ID." });

  const payloadSize = JSON.stringify(payload).length;
  if (payloadSize > 1000) issues.push({ level: "warn", message: `Payload is ${payloadSize} bytes — keep JWT payloads small. Store sensitive data server-side.` });

  if (JSON.stringify(payload).toLowerCase().includes("password") || JSON.stringify(payload).toLowerCase().includes("secret")) {
    issues.push({ level: "error", message: "Possible sensitive data in payload! JWT payloads are only Base64-encoded, not encrypted — anyone can read them." });
  }

  return issues;
}

function JsonDisplay({ obj }: { obj: Record<string, unknown> }) {
  return (
    <pre className="text-xs font-mono bg-gray-950 text-green-300 p-4 rounded-xl overflow-auto max-h-48 leading-relaxed">
      {JSON.stringify(obj, null, 2)}
    </pre>
  );
}

const SAMPLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderView() {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const jwt = useMemo(() => token.trim() ? parseJwt(token) : null, [token]);
  const issues = useMemo(() => jwt?.header && jwt?.payload ? analyzeJwt(jwt.header, jwt.payload) : [], [jwt]);

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const levelIcon = { error: "🔴", warn: "🟡", ok: "🟢" };
  const levelBg   = { error: "bg-red-50 border-red-200 text-red-800", warn: "bg-yellow-50 border-yellow-200 text-yellow-800", ok: "bg-green-50 border-green-200 text-green-800" };

  return (
    <div className="space-y-5">
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">JWT Token</label>
          <button onClick={() => setToken(SAMPLE)} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
            Load sample
          </button>
        </div>
        <textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Paste your JWT token here…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-gray-400 resize-none break-all"
        />
      </div>

      {jwt?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{jwt.error}</div>
      )}

      {jwt && !jwt.error && jwt.header && jwt.payload && (
        <>
          {/* Decoded parts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Header</p>
                <button onClick={() => copy(JSON.stringify(jwt.header, null, 2), "header")}
                  className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors">
                  {copied === "header" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <JsonDisplay obj={jwt.header} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Payload</p>
                <button onClick={() => copy(JSON.stringify(jwt.payload, null, 2), "payload")}
                  className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors">
                  {copied === "payload" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <JsonDisplay obj={jwt.payload} />
            </div>
          </div>

          {/* Signature note */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Signature</span> (cannot be verified client-side — requires the secret key):
            <code className="ml-2 font-mono text-gray-400 break-all">{jwt.raw![2].slice(0, 40)}…</code>
          </div>

          {/* Security analysis */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">🔒 Security Analysis</p>
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div key={i} className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs ${levelBg[issue.level]}`}>
                  <span>{levelIcon[issue.level]}</span>
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
