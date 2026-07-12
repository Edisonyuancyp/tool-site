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
    default: "Free Online Calculator – 100+ Free Calculators & Tools | GetFastCalc",
    template: "%s | GetFastCalc",
  },
  description:
    "Use GetFastCalc's free online calculators — percentage, BMI, mortgage, age, tax, salary, scientific, tip, compound interest, unit conversion and 100+ more. No signup, instant results.",
  keywords: [
    "free online calculator",
    "online calculator",
    "calculator online",
    "free calculator",
    "math calculator",
    "scientific calculator online",
    "percentage calculator",
    "bmi calculator",
    "age calculator",
    "compound interest calculator",
    "tax calculator",
    "salary calculator",
    "tip calculator",
    "loan calculator",
    "mortgage calculator",
    "unit converter",
    "currency converter",
    "date calculator",
    "qr code generator",
    "password generator",
    "base converter",
    "word counter",
    "unix timestamp converter",
    "base64 encoder",
    "json formatter",
    "developer tools online",
    "body fat calculator",
    "water intake calculator",
    "running pace calculator",
    "sleep calculator",
    "ideal weight calculator",
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
    title: "Free Online Calculator – 100+ Free Calculators & Tools | GetFastCalc",
    description:
      "Free online calculators for math, finance, health, science and more. BMI, percentage, compound interest, tax, age, tip, salary and 100+ tools. No signup, instant results.",
    url: "https://getfastcalc.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Calculator – 100+ Free Calculators & Tools | GetFastCalc",
    description:
      "Free online calculators: BMI, percentage, compound interest, tax, age, tip, salary, scientific and 100+ more. No signup, instant results.",
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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://storage.ko-fi.com" />
        <link rel="dns-prefetch" href="https://storage.ko-fi.com" />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QRTFP647H6"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QRTFP647H6');
          `}
        </Script>
        {/* Ko-fi floating chat widget */}
        <Script
          src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
          strategy="lazyOnload"
        />
        <Script id="kofi-init" strategy="lazyOnload">
          {`
            (function waitKofi() {
              if (typeof kofiWidgetOverlay === 'undefined') {
                setTimeout(waitKofi, 500);
                return;
              }
              // Only show on desktop/large tablets so it doesn't cover the mobile bottom nav
              if (window.innerWidth >= 1024) {
                kofiWidgetOverlay.draw('getfastcalc', {
                  'type': 'floating-chat',
                  'floating-chat.donateButton.text': 'Support me',
                  'floating-chat.donateButton.background-color': '#00b9fe',
                  'floating-chat.donateButton.text-color': '#fff'
                });
              }
            })();
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
