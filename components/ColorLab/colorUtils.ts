/** ColorLab — pure color-math utilities. No external dependencies. */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

/** Parse 6-digit hex string (with or without #) → RGB 0-255 */
export function hexToRgb(hex: string): RGB {
  const clean = hex.replace(/^#/, "").toUpperCase();
  const n = parseInt(clean, 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  };
}

/** RGB 0-255 → CMYK 0-100 (approximate, device-independent) */
export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rp - k) / (1 - k);
  const m = (1 - gp - k) / (1 - k);
  const y = (1 - bp - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/** Hex → CMYK convenience wrapper */
export function hexToCmyk(hex: string): CMYK {
  return rgbToCmyk(hexToRgb(hex));
}

/**
 * Returns true if white text should be used on top of the given hex background.
 * Uses WCAG relative luminance formula.
 */
export function needsWhiteText(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L < 0.179;
}

/** Format CMYK as display string, e.g. "C12 M34 Y56 K0" */
export function cmykToString({ c, m, y, k }: CMYK): string {
  return `C${c} M${m} Y${y} K${k}`;
}

/** Format RGB as display string, e.g. "rgb(255, 128, 0)" */
export function rgbToString({ r, g, b }: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}
