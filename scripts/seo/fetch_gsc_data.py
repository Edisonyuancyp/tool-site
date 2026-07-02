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
    from google_auth_oauthlib.flow import InstalledAppFlow
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


def authenticate_gsc_service(credentials_path: str) -> Any:
    """
    Authenticate to the Google Search Console API.
    Supports OAuth 2.0 credentials downloaded from Google Cloud Console.
    """
    creds_path = Path(credentials_path)
    if not creds_path.exists():
        raise FileNotFoundError(
            f"Credentials file not found: {credentials_path}\n"
            "Download it from Google Cloud Console -> APIs & Services -> Credentials."
        )

    SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

    # If the file is a service account, use it directly.
    try:
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
        return build("webmasters", "v3", credentials=credentials)
    except ValueError:
        pass

    # Otherwise treat it as OAuth 2.0 desktop/client credentials.
    flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
    credentials = flow.run_local_server(port=0)
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


def filter_candidates(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Keep pages with zero clicks and >30 impressions.
    Average position is typically ~50 in this scenario.
    """
    candidates = []
    for row in rows:
        clicks = int(row.get("clicks", 0))
        impressions = int(row.get("impressions", 0))
        ctr = float(row.get("ctr", 0))
        if clicks == 0 and impressions > 30 and ctr == 0:
            page_url = row.get("keys", [""])[0]
            position = float(row.get("position", 0))
            candidates.append({
                "url": page_url,
                "impressions": impressions,
                "position": round(position, 2),
                "clicks": clicks,
                "ctr": ctr,
            })
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

    candidates = filter_candidates(rows)
    print(f"[fetch] Found {len(candidates)} candidates (ctr=0, impressions>30).")

    print("[fetch] Enriching with live title/meta description...")
    enriched = enrich_candidates(candidates)

    output_path.write_text(json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[fetch] Saved {len(enriched)} candidates to {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
