import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmartRedirect from "@/components/SmartRedirect";

export default function NotFound() {
  return (
    <>
      <SmartRedirect />
      <Header />
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="text-7xl mb-6">🔍</div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Page Not Found</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            This page doesn&apos;t exist or may have moved. Try searching for the tool you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
            >
              Browse All Tools
            </Link>
            <Link
              href="/tools/calc/bmi-calculator"
              className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Popular: BMI Calculator
            </Link>
          </div>
          <p className="mt-10 text-xs text-gray-400">
            Error 404 · <Link href="/" className="underline hover:text-gray-600">getfastcalc.com</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
