"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = "https://api.getfastcalc.com";

export default function LinkExchangePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    site_name: "",
    url: "",
    link_page: "",
    description: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [resultMsg, setResultMsg] = useState("");
  const [reciprocalVerified, setReciprocalVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setResultMsg("");

    try {
      const resp = await fetch(`${API_URL}/api/link-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();

      if (data.ok) {
        setStatus("success");
        setResultMsg(data.message);
        setReciprocalVerified(data.reciprocal_verified);
      } else {
        setStatus("error");
        setResultMsg(data.error || "提交失败，请稍后重试。");
      }
    } catch {
      setStatus("error");
      setResultMsg("网络错误，请检查 API 地址是否正确，或稍后重试。");
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Link Exchange / 友情链接</h1>
          <p className="text-gray-500 mb-8">
            Want to exchange links with GetFastCalc? Add our link to your site first, then submit the form below.
            We'll verify your link and review your site within 48 hours.
          </p>

          {/* How it works */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8 text-sm text-gray-600 space-y-2">
            <p className="font-semibold text-gray-800">How it works:</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Add a link to <a href="https://getfastcalc.com" className="text-blue-600 underline">GetFastCalc</a> on your website (dofollow preferred).</li>
              <li>Fill out the form below with the URL of the page where you linked to us.</li>
              <li>Our system will automatically verify your link and analyze your website.</li>
              <li>You'll receive a confirmation, and we'll review and add your link if approved.</li>
            </ol>
          </div>

          {/* Our link info */}
          <div className="bg-blue-50 rounded-xl p-5 mb-8 text-sm">
            <p className="font-semibold text-blue-900 mb-2">Our link details:</p>
            <div className="bg-white rounded-lg p-3 font-mono text-xs text-gray-700 border border-blue-100">
              &lt;a href="https://getfastcalc.com"&gt;GetFastCalc – Free Online Calculators&lt;/a&gt;
            </div>
          </div>

          {status === "success" ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">{reciprocalVerified ? "✅" : "⏳"}</div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {reciprocalVerified ? "Submission Received!" : "Submission Received – Action Needed"}
              </h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">{resultMsg}</p>
              {reciprocalVerified ? (
                <p className="text-sm text-gray-400">We'll review your site and add your link soon.</p>
              ) : (
                <div className="bg-amber-50 rounded-xl p-4 max-w-md mx-auto text-sm text-amber-700">
                  Please add our link to your page first, then{" "}
                  <button onClick={() => setStatus("idle")} className="underline font-medium">submit again</button>.
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Website Name</label>
                <input
                  type="text"
                  name="site_name"
                  value={form.site_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
                  placeholder="My Awesome Tools"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Website URL *</label>
                <input
                  type="url"
                  name="url"
                  required
                  value={form.url}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
                  placeholder="https://your-site.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Page where you linked to us * <span className="text-gray-400 font-normal">(must contain a link to getfastcalc.com)</span>
                </label>
                <input
                  type="url"
                  name="link_page"
                  required
                  value={form.link_page}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
                  placeholder="https://your-site.com/links"
                />
                <p className="text-xs text-gray-400 mt-1">The exact URL of the page where our link appears.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description (optional)</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 text-sm resize-none"
                  placeholder="A brief description of your website (1-2 sentences)"
                />
              </div>

              {status === "error" && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{resultMsg}</div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Submitting…" : "Submit Link Exchange Request"}
              </button>
            </form>
          )}

          <div className="mt-10 text-center">
            <Link href="/links" className="text-sm text-blue-600 hover:text-blue-700">
              View our current friend links →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
