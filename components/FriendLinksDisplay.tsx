import fs from "fs";
import path from "path";

interface FriendLink {
  name: string;
  url: string;
  description: string;
  approved_at: string;
}

export default function FriendLinksDisplay() {
  const linksPath = path.join(process.cwd(), "public", "friend-links.json");
  let links: FriendLink[] = [];

  try {
    if (fs.existsSync(linksPath)) {
      links = JSON.parse(fs.readFileSync(linksPath, "utf-8"));
    }
  } catch {
    // ignore
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">No friend links yet. Be the first to partner with us!</p>
        <a
          href="/link-exchange"
          className="inline-block mt-4 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
        >
          Apply for Link Exchange →
        </a>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-5 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <p className="font-semibold text-gray-800 text-sm mb-1">{link.name}</p>
          {link.description && (
            <p className="text-xs text-gray-400 leading-relaxed">{link.description}</p>
          )}
          <p className="text-xs text-blue-500 mt-2 truncate">{link.url}</p>
        </a>
      ))}
    </div>
  );
}
