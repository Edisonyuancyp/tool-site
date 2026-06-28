"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LOCALES = ["es", "fr", "zh", "ja", "de", "pt"];
const LOCALE_RE = new RegExp(`^/(${LOCALES.join("|")})(/.*)?(\\?.*)?$`);
// URL prefixes that are category segments, not tool slugs
const CATEGORY_PREFIXES = new Set(["calc", "design", "dev", "time", "converter", "ecommerce"]);

/**
 * Mounted in the 404 page. Detects known bad locale URL patterns and
 * redirects the user to the correct page instead of showing 404.
 */
export default function SmartRedirect() {
  const router = useRouter();

  useEffect(() => {
    const path = window.location.pathname;
    const m = path.match(LOCALE_RE);
    if (!m) return;

    const locale = m[1];
    const rest = m[2] ?? "/";

    // /fr/workbench or /fr/workbench/* → /fr
    if (rest === "/workbench" || rest.startsWith("/workbench/")) {
      router.replace(`/${locale}`);
      return;
    }

    // /fr/tools/dev/base-converter → /fr/tools/base-converter
    // /fr/tools/calc/bmi-calculator → /fr/tools/bmi-calculator
    const toolWithCat = rest.match(/^\/tools\/([^/]+)\/([^/]+)$/);
    if (toolWithCat) {
      const [, seg1, seg2] = toolWithCat;
      if (CATEGORY_PREFIXES.has(seg1)) {
        router.replace(`/${locale}/tools/${seg2}`);
        return;
      }
      // /fr/tools/bmi-calculator/online-free → /fr/tools/bmi-calculator
      router.replace(`/${locale}/tools/${seg1}`);
      return;
    }

    // /fr/tools/dev (category page, no tool) → /fr
    const catOnly = rest.match(/^\/tools\/([^/]+)$/);
    if (catOnly && CATEGORY_PREFIXES.has(catOnly[1])) {
      router.replace(`/${locale}`);
      return;
    }
  }, [router]);

  return null;
}
