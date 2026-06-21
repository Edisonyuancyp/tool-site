import Link from "next/link";
import { tools, getToolPath } from "@/lib/tools";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={getToolPath(tool)}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {tool.icon} {tool.name}
            </Link>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} GetFastCalc — Free online tools &amp; calculators
          </p>
          <p className="text-xs text-gray-300">Fast · Free · No signup required</p>
        </div>
      </div>
    </footer>
  );
}
