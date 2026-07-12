#!/usr/bin/env python3
"""
fetch_gsc_data.py
Fetch Google Search Console performance data for the configured site and filter
pages that are shown in search results but never clicked:
- ctr == 0
- impressions > 30

Output: gsc_optimization_candidates.json
"""

import os
import re
import json
import sys
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

# Try to import GSC API libraries; fail gracefully with instructions.
try:
    from googleapiclient.discovery import build
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
except ImportError as exc:  # pragma: no cover
    print("Missing Google API dependencies. Run: pip install -r requirements.txt")
    raise exc


def load_env() -> None:
    """Load environment variables from .env in the script directory."""
    script_dir = Path(__file__).resolve().parent
    env_file = script_dir / ".env"
    if env_file.exists():
        load_dotenv(env_file, override=True)
    else:
        load_dotenv(script_dir / ".env.example")


def get_required_env(name: str) -> str:
    """Return an environment variable or raise a clear error."""
    value = os.getenv(name)
    if not value:
        raise ValueError(
            f"Missing required environment variable: {name}. "
            "Copy .env.example to .env and fill in the values."
        )
    return value


def _is_service_account(credentials_path: str) -> bool:
    """Return True if the JSON file contains service-account credentials."""
    try:
        data = json.loads(Path(credentials_path).read_text(encoding="utf-8"))
    except Exception:
        return False
    return data.get("type") == "service_account"


def authenticate_gsc_service(credentials_path: str) -> Any:
    """
    Authenticate to the Google Search Console API.
    Supports service account keys and OAuth 2.0 desktop/client credentials.
    OAuth tokens are cached so you only need to authorize once.
    """
    creds_path = Path(credentials_path)
    if not creds_path.exists():
        raise FileNotFoundError(
            f"Credentials file not found: {credentials_path}\n"
            "Download it from Google Cloud Console -> APIs & Services -> Credentials."
        )

    SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
    script_dir = Path(__file__).resolve().parent
    token_path = script_dir / "gsc_token.json"

    # Service account: no interactive authorization needed.
    if _is_service_account(credentials_path):
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
        print("[auth] Using service account (no browser prompt).")
        return build("webmasters", "v3", credentials=credentials)

    # OAuth 2.0: reuse cached token if available.
    if token_path.exists():
        try:
            credentials = Credentials.from_authorized_user_file(str(token_path), SCOPES)
            if credentials and credentials.valid:
                print("[auth] Reusing cached OAuth token.")
                return build("webmasters", "v3", credentials=credentials)
            if credentials and credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                token_path.write_text(credentials.to_json(), encoding="utf-8")
                print("[auth] Refreshed cached OAuth token.")
                return build("webmasters", "v3", credentials=credentials)
        except Exception as e:
            print(f"[auth] Cached token invalid: {e}. Re-authorizing...")

    # Otherwise run the interactive OAuth flow and save the token.
    flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
    credentials = flow.run_local_server(port=0)
    token_path.write_text(credentials.to_json(), encoding="utf-8")
    print(f"[auth] Saved OAuth token to {token_path}. Next run will not prompt for authorization.")
    return build("webmasters", "v3", credentials=credentials)


def fetch_page_meta(url: str, timeout: int = 15) -> dict[str, str]:
    """Fetch the page title and meta description from a URL."""
    try:
        response = requests.get(url, timeout=timeout, headers={
            "User-Agent": "Mozilla/5.0 (compatible; GetFastCalc SEO bot; +https://getfastcalc.com)"
        })
        response.raise_for_status()
        html = response.text
    except Exception as e:
        return {"title": "", "description": "", "fetch_error": str(e)}

    title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""
    title = re.sub(r"\s+", " ", title)

    desc_match = re.search(
        r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>',
        html, re.IGNORECASE | re.DOTALL
    ) or re.search(
        r'<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\'][^>]*>',
        html, re.IGNORECASE | re.DOTALL
    )
    description = desc_match.group(1).strip() if desc_match else ""
    description = re.sub(r"\s+", " ", description)

    return {"title": title, "description": description, "fetch_error": ""}


def fetch_gsc_data(service: Any, site_url: str, days: int = 7) -> list[dict[str, Any]]:
    """
    Query GSC Search Analytics for the last N days, grouped by page.
    Returns a list of rows with keys/position/ctr/impressions/clicks.
    """
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    request_body = {
        "startDate": start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "dimensions": ["page"],
        "rowLimit": 25000,
    }

    response = service.searchanalytics().query(siteUrl=site_url, body=request_body).execute()
    rows = response.get("rows", [])
    return rows


def filter_candidates(
    rows: list[dict[str, Any]], min_impressions: int = 30, max_ctr: float = 0.01
) -> list[dict[str, Any]]:
    """
    Keep under-performing pages:
    - ctr == 0 with impressions > min_impressions, OR
    - ctr <= max_ctr with impressions > min_impressions (low CTR opportunities)
    """
    candidates = []
    seen = set()
    for row in rows:
        clicks = int(row.get("clicks", 0))
        impressions = int(row.get("impressions", 0))
        ctr = float(row.get("ctr", 0))
        if impressions < min_impressions:
            continue
        if not (ctr == 0 or ctr <= max_ctr):
            continue
        page_url = row.get("keys", [""])[0]
        if page_url in seen:
            continue
        seen.add(page_url)
        position = float(row.get("position", 0))
        candidates.append({
            "url": page_url,
            "impressions": impressions,
            "position": round(position, 2),
            "clicks": clicks,
            "ctr": round(ctr, 4),
        })
    # Sort by impressions descending so the highest-opportunity pages are analyzed first
    candidates.sort(key=lambda x: x["impressions"], reverse=True)
    return candidates


def enrich_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Add live title and meta description to each candidate."""
    enriched = []
    for item in candidates:
        meta = fetch_page_meta(item["url"])
        enriched.append({
            **item,
            "title": meta.get("title", ""),
            "description": meta.get("description", ""),
            "fetch_error": meta.get("fetch_error", ""),
        })
    return enriched


def main() -> int:
    load_env()

    credentials_path = get_required_env("GSC_CREDENTIALS_PATH")
    site_url = get_required_env("GSC_SITE_URL")
    days = int(os.getenv("GSC_DAYS", "7"))

    output_path = Path(__file__).resolve().parent / "gsc_optimization_candidates.json"

    print(f"[fetch] Authenticating GSC API for {site_url}...")
    service = authenticate_gsc_service(credentials_path)

    print(f"[fetch] Pulling last {days} days of search analytics...")
    rows = fetch_gsc_data(service, site_url, days=days)
    print(f"[fetch] Got {len(rows)} page rows from GSC.")

    candidates = filter_candidates(rows, min_impressions=30, max_ctr=0.01)
    print(f"[fetch] Found {len(candidates)} candidates (ctr<=1%, impressions>30).")

    print("[fetch] Enriching with live title/meta description...")
    enriched = enrich_candidates(candidates)

    output_path.write_text(json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[fetch] Saved {len(enriched)} candidates to {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
