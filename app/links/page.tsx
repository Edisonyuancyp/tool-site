import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FriendLinksDisplay from "@/components/FriendLinksDisplay";

export const metadata: Metadata = {
  title: "Friend Links & Partners | GetFastCalc",
  description: "Our link exchange partners and recommended resources. Want to exchange links? Visit our link exchange page.",
  alternates: { canonical: "https://getfastcalc.com/links" },
};

export default function LinksPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Friend Links & Partners</h1>
          <p className="text-gray-500 mb-8">
            We partner with quality websites to share useful resources. Interested in a link exchange?
            <a href="/link-exchange" className="text-blue-600 hover:text-blue-700 ml-1">Apply here →</a>
          </p>
          <FriendLinksDisplay />
        </div>
      </main>
      <Footer />
    </>
  );
}
