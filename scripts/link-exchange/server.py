#!/usr/bin/env python3
"""
link-exchange/server.py
Flask API for link exchange submissions.
- Receives form submissions from the website
- Verifies reciprocal link (checks if submitter's page links to getfastcalc.com)
- Runs AI analysis on the submitted website
- Sends Telegram notification with Approve/Reject buttons
- Serves approved friend links via GET /api/friend-links

Runs on PM2 alongside the Telegram bot.
"""

import json
import os
import re
import sys
import time
import hashlib
import subprocess
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

from flask import Flask, request, jsonify
from flask_cors import CORS

# Add parent dir to path for imports
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from llm_client import LLMClient

# ── Config ────────────────────────────────────────────────────────────────────

SITE_DOMAIN = "getfastcalc.com"
SITE_URL = "https://getfastcalc.com"
DATA_FILE = SCRIPT_DIR / "link_requests.json"
APPROVED_FILE = ROOT / "public" / "friend-links.json"
PORT = int(os.getenv("LINK_EXCHANGE_PORT", "5312"))

# Load env from seo/.env
SEO_ENV = ROOT / "scripts" / "seo" / ".env"
if SEO_ENV.exists():
    for line in SEO_ENV.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
TG_CHAT_ID = os.getenv("TG_CHAT_ID", "")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ── Data helpers ──────────────────────────────────────────────────────────────

def load_requests() -> list[dict]:
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    return []


def save_requests(data: list[dict]):
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_approved() -> list[dict]:
    if APPROVED_FILE.exists():
        return json.loads(APPROVED_FILE.read_text(encoding="utf-8"))
    return []


def save_approved(data: list[dict]):
    APPROVED_FILE.parent.mkdir(parents=True, exist_ok=True)
    APPROVED_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def gen_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()[:10]


# ── Reciprocal link verification ──────────────────────────────────────────────

def verify_reciprocal_link(their_page_url: str) -> dict:
    """Fetch the submitter's page and check if it contains a link to getfastcalc.com."""
    try:
        req = Request(their_page_url, headers={
            "User-Agent": "Mozilla/5.0 (compatible; GetFastCalc-LinkChecker/1.0)"
        })
        with urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace").lower()

        # Check for our domain in href
        has_link = SITE_DOMAIN in html
        # Check if it's a proper <a href> link (not just text mention)
        link_pattern = rf'href\s*=\s*["\']?https?://[^"\']*{re.escape(SITE_DOMAIN)}'
        has_anchor = bool(re.search(link_pattern, html))
        # Check rel attribute (dofollow vs nofollow)
        nofollow = bool(re.search(
            rf'<a[^>]*href\s*=\s*["\']?https?://[^"\']*{re.escape(SITE_DOMAIN)}[^>]*rel\s*=\s*["\']?[^"\']*nofollow',
            html
        ))

        return {
            "verified": has_anchor,
            "has_mention": has_link,
            "is_nofollow": nofollow,
            "is_dofollow": has_anchor and not nofollow,
            "status": "verified" if has_anchor else ("mentioned" if has_link else "not_found"),
        }
    except HTTPError as e:
        return {"verified": False, "status": f"http_error_{e.code}", "error": str(e)}
    except (URLError, Exception) as e:
        return {"verified": False, "status": "fetch_failed", "error": str(e)}


# ── AI analysis ───────────────────────────────────────────────────────────────

def ai_analyze_website(url: str, reciprocal_info: dict) -> str:
    """Use LLM to analyze the submitted website and provide a summary for decision-making."""
    # Try to fetch the homepage for content analysis
    page_content = ""
    try:
        req = Request(url, headers={
            "User-Agent": "Mozilla/5.0 (compatible; GetFastCalc-LinkChecker/1.0)"
        })
        with urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            # Extract title and meta description
            title_match = re.search(r'<title[^>]*>(.*?)</title>', raw, re.IGNORECASE | re.DOTALL)
            desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', raw, re.IGNORECASE)
            title = title_match.group(1).strip()[:200] if title_match else ""
            desc = desc_match.group(1).strip()[:300] if desc_match else ""
            # Extract some text content (strip tags)
            text = re.sub(r'<[^>]+>', ' ', raw)
            text = re.sub(r'\s+', ' ', text).strip()[:2000]
            page_content = f"Title: {title}\nDescription: {desc}\nContent snippet: {text}"
    except Exception:
        page_content = "(Could not fetch page content)"

    prompt = f"""You are an SEO expert evaluating a link exchange request for getfastcalc.com (a free online calculators site).

Website URL: {url}
Reciprocal link check: {json.dumps(reciprocal_info, ensure_ascii=False)}
Page content: {page_content}

Analyze this website and provide a concise assessment in Chinese. Include:
1. **网站主题** - What is the site about? Is it relevant to calculators/tools?
2. **内容质量** - Is the content original and useful, or thin/spammy?
3. **反链情况** - Did they link to us? Is it dofollow or nofollow?
4. **权重评估** - Based on content quality, age signals, and structure, estimate the site's authority (low/medium/high)
5. **风险提示** - Any red flags? (gambling, pharma, adult, spam, PBN, etc.)
6. **建议** - Should we accept this link exchange? (推荐接受 / 谨慎考虑 / 不推荐)

Keep it under 300 words. Be direct and honest."""

    client = LLMClient()
    result = client.chat_completion(
        system="You are an SEO link building expert. Respond in Chinese. Be concise and direct.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
    )
    return result.strip()


# ── Telegram notification ─────────────────────────────────────────────────────

def send_telegram_message(text: str, reply_markup: dict = None) -> bool:
    """Send a message via Telegram Bot API."""
    if not TG_BOT_TOKEN or not TG_CHAT_ID:
        print("[link-exchange] TG_BOT_TOKEN or TG_CHAT_ID not set, skipping notification")
        return False

    payload = {
        "chat_id": TG_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
    }
    if reply_markup:
        payload["reply_markup"] = json.dumps(reply_markup)

    try:
        data = json.dumps(payload).encode()
        req = Request(
            f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage",
            data=data,
            headers={"Content-Type": "application/json"},
        )
        with urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
            return result.get("ok", False)
    except Exception as e:
        print(f"[link-exchange] Telegram send failed: {e}")
        return False


# ── API routes ────────────────────────────────────────────────────────────────

@app.route("/api/friend-links", methods=["GET"])
def get_friend_links():
    """Public endpoint: return approved friend links for the website to display."""
    approved = load_approved()
    return jsonify({"links": approved})


@app.route("/api/link-exchange", methods=["POST"])
def submit_link_exchange():
    """Receive a link exchange request from the website form."""
    data = request.get_json(silent=True) or request.form.to_dict()

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    their_url = (data.get("url") or "").strip()
    their_link_page = (data.get("link_page") or "").strip()
    site_name = (data.get("site_name") or "").strip()
    description = (data.get("description") or "").strip()

    if not name or not their_url or not their_link_page:
        return jsonify({"ok": False, "error": "Missing required fields: name, url, link_page"}), 400

    # Normalize URL
    if not their_url.startswith("http"):
        their_url = "https://" + their_url
    if not their_link_page.startswith("http"):
        their_link_page = "https://" + their_link_page

    req_id = gen_id(their_url + str(time.time()))

    # Check for duplicates
    existing = load_requests()
    for entry in existing:
        if entry.get("url") == their_url and entry.get("status") in ("pending", "approved"):
            return jsonify({"ok": False, "error": "This URL has already been submitted."}), 409

    # Step 1: Verify reciprocal link
    print(f"[link-exchange] Verifying reciprocal link at {their_link_page}...")
    reciprocal = verify_reciprocal_link(their_link_page)

    # Step 2: AI analysis
    print(f"[link-exchange] Running AI analysis on {their_url}...")
    ai_summary = ai_analyze_website(their_url, reciprocal)

    # Step 3: Save request
    entry = {
        "id": req_id,
        "name": name,
        "email": email,
        "url": their_url,
        "site_name": site_name or name,
        "description": description,
        "link_page": their_link_page,
        "reciprocal": reciprocal,
        "ai_analysis": ai_summary,
        "status": "pending",
        "submitted_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    existing.append(entry)
    save_requests(existing)

    # Step 4: Send Telegram notification
    verified_emoji = "✅" if reciprocal.get("verified") else "❌"
    dofollow = "Dofollow ✅" if reciprocal.get("is_dofollow") else ("Nofollow ⚠️" if reciprocal.get("is_nofollow") else "未检测到 🔴")

    tg_text = f"""🔔 *友情链接申请*

*网站:* {site_name or name}
*URL:* {their_url}
*反链页面:* {their_link_page}
*联系人:* {name} ({email or "无邮箱"})

*反链验证:* {verified_emoji} {reciprocal.get('status', 'unknown')}
*链接类型:* {dofollow}

*AI 分析:*
{ai_summary}

提交时间: {entry['submitted_at']}"""

    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "✅ 同意", "callback_data": f"approve_link_{req_id}"},
                {"text": "❌ 拒绝", "callback_data": f"reject_link_{req_id}"},
            ],
            [
                {"text": "🔗 查看反链页面", "url": their_link_page},
                {"text": "🔗 查看对方网站", "url": their_url},
            ],
        ]
    }

    send_telegram_message(tg_text, reply_markup)

    # Step 5: Return result to the submitter
    if reciprocal.get("verified"):
        return jsonify({
            "ok": True,
            "message": "提交成功！已检测到您对我们的反向链接。我们会在审核后尽快添加您的链接。",
            "reciprocal_verified": True,
        })
    else:
        return jsonify({
            "ok": True,
            "message": "提交已收到，但未在您提供的页面检测到对我们网站的链接。请先添加对我们的链接（指向 https://getfastcalc.com），然后重新提交。",
            "reciprocal_verified": False,
            "reciprocal_status": reciprocal.get("status"),
        })


@app.route("/api/link-exchange/approve/<req_id>", methods=["POST"])
def approve_link(req_id):
    """Approve a link exchange request (called by Telegram bot or manual API)."""
    requests_list = load_requests()
    entry = next((r for r in requests_list if r["id"] == req_id), None)
    if not entry:
        return jsonify({"ok": False, "error": "Request not found"}), 404

    entry["status"] = "approved"
    entry["approved_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    save_requests(requests_list)

    # Add to approved links
    approved = load_approved()
    # Remove if already exists (update)
    approved = [a for a in approved if a.get("url") != entry["url"]]
    approved.append({
        "name": entry.get("site_name") or entry.get("name"),
        "url": entry["url"],
        "description": entry.get("description", ""),
        "approved_at": entry["approved_at"],
    })
    save_approved(approved)

    # Git commit and push
    try:
        subprocess.run(["git", "add", "-A"], cwd=str(ROOT), check=True, capture_output=True)
        subprocess.run(
            ["git", "commit", "-m", f"feat: approve friend link {entry['url']}"],
            cwd=str(ROOT), check=True, capture_output=True
        )
        subprocess.run(["git", "push"], cwd=str(ROOT), check=True, capture_output=True)
    except Exception as e:
        print(f"[link-exchange] Git push failed: {e}")

    return jsonify({"ok": True, "message": f"Approved {entry['url']}"})


@app.route("/api/link-exchange/reject/<req_id>", methods=["POST"])
def reject_link(req_id):
    """Reject a link exchange request."""
    requests_list = load_requests()
    entry = next((r for r in requests_list if r["id"] == req_id), None)
    if not entry:
        return jsonify({"ok": False, "error": "Request not found"}), 404

    entry["status"] = "rejected"
    entry["rejected_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    save_requests(requests_list)

    return jsonify({"ok": True, "message": f"Rejected {entry['url']}"})


@app.route("/api/link-exchange/pending", methods=["GET"])
def list_pending():
    """List pending link exchange requests (for admin)."""
    requests_list = load_requests()
    pending = [r for r in requests_list if r["status"] == "pending"]
    return jsonify({"pending": pending})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "service": "link-exchange", "port": PORT})


if __name__ == "__main__":
    print(f"[link-exchange] Server starting on port {PORT}")
    print(f"[link-exchange] Data file: {DATA_FILE}")
    print(f"[link-exchange] Approved links: {APPROVED_FILE}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
