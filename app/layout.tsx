import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Free Online Tools & Calculators – ToolCalc",
    template: "%s | ToolCalc",
  },
  description:
    "Free online tools and calculators: BMI, age, compound interest, currency converter, QR code, password generator, base converter, word counter, and more. Instant results, no signup.",
  keywords: [
    "online tools", "free calculators", "bmi calculator", "age calculator",
    "qr code generator", "password generator", "compound interest calculator",
    "currency converter", "base converter", "word counter", "unix timestamp",
    "base64 encoder", "json formatter", "developer tools",
  ],
  authors: [{ name: "ToolCalc" }],
  creator: "ToolCalc",
  publisher: "ToolCalc",
  metadataBase: new URL("https://toolcalc.com"),
  alternates: {
    canonical: "https://toolcalc.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ToolCalc",
    title: "Free Online Tools & Calculators – ToolCalc",
    description:
      "Fast, free browser-based tools: BMI, compound interest, currency converter, base converter, QR code, and 25+ more. No signup required.",
    url: "https://toolcalc.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Tools & Calculators – ToolCalc",
    description:
      "Fast, free browser-based tools: BMI, compound interest, currency converter, base converter, QR code, and 25+ more.",
    creator: "@toolcalc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
