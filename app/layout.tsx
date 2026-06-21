import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { WorkbenchProvider } from "@/lib/WorkbenchContext";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Free Online Tools & Calculators – GetFastCalc",
    template: "%s | GetFastCalc",
  },
  description:
    "Free online tools and calculators: BMI, age, compound interest, currency converter, QR code, password generator, base converter, word counter, and more. Instant results, no signup.",
  keywords: [
    "online tools", "free calculators", "bmi calculator", "age calculator",
    "qr code generator", "password generator", "compound interest calculator",
    "currency converter", "base converter", "word counter", "unix timestamp",
    "base64 encoder", "json formatter", "developer tools",
    "tax calculator", "income tax calculator", "retirement savings calculator",
    "investment return calculator", "loan calculator", "budget calculator",
    "debt repayment calculator", "tip calculator", "gpa calculator",
    "body fat calculator", "water intake calculator", "running pace calculator",
    "sleep calculator", "ovulation calculator", "ideal weight calculator",
    "percentage calculator", "crypto calculator", "position size calculator",
  ],
  authors: [{ name: "GetFastCalc" }],
  creator: "GetFastCalc",
  publisher: "GetFastCalc",
  metadataBase: new URL("https://getfastcalc.com"),
  alternates: {
    canonical: "https://getfastcalc.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GetFastCalc",
    title: "Free Online Tools & Calculators – GetFastCalc",
    description:
      "Fast, free browser-based tools: BMI, compound interest, currency converter, base converter, QR code, and 25+ more. No signup required.",
    url: "https://getfastcalc.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Tools & Calculators – GetFastCalc",
    description:
      "Fast, free browser-based tools: BMI, compound interest, currency converter, base converter, QR code, and 25+ more.",
    creator: "@getfastcalc",
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LSG3NFQFWD"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LSG3NFQFWD');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 pb-14 lg:pb-0">
        <WorkbenchProvider>
          {children}
          <Sidebar />
        </WorkbenchProvider>
      </body>
    </html>
  );
}
