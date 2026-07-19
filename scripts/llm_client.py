#!/usr/bin/env python3
"""
llm_client.py — Unified LLM client with multi-provider fallback.

Supported providers: claude, openai, gemini.
Reads keys from env (or .env.local) and tries providers in LLM_PROVIDER_PRIORITY order.

Usage:
    from llm_client import LLMClient
    client = LLMClient()
    response = client.chat_completion(
        system="You are a helpful assistant.",
        messages=[{"role": "user", "content": "Hello"}],
        max_tokens=1000,
    )
"""

import json, os
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent


def load_env_keys() -> dict[str, str]:
    """Load keys from environment; fallback to .env.local."""
    keys = {}
    env_file = ROOT / ".env.local"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                keys[k.strip()] = v.strip().strip('"').strip("'")
    # Env vars override .env.local
    for name in ["OPENAI_API_KEY", "OPENAI_API_KEY_BACKUP", "CLAUDE_API_KEY", "CLAUDE_API_KEY_BACKUP", "GEMINI_API_KEY", "LLM_PROVIDER_PRIORITY"]:
        if os.environ.get(name):
            keys[name] = os.environ[name]
    return keys


def _extract_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1][4:] if parts[1].startswith("json") else parts[1]
    return text.strip()


class LLMClient:
    def __init__(self, priority: Optional[str] = None):
        self.keys = load_env_keys()
        # Default to openai only if no Claude key is configured, to avoid 404s on missing model/keys.
        has_claude_key = bool(self.keys.get("CLAUDE_API_KEY") or self.keys.get("CLAUDE_API_KEY_BACKUP"))
        default_priority = "openai,claude,gemini" if has_claude_key else "openai"
        priority = priority or self.keys.get("LLM_PROVIDER_PRIORITY", default_priority)
        self.providers = [p.strip().lower() for p in priority.split(",") if p.strip()]
        # Support env overrides: CLAUDE_MODEL, OPENAI_MODEL, GEMINI_MODEL
        self.model_defaults = {
            "claude": self.keys.get("CLAUDE_MODEL", "claude-sonnet-5"),
            "openai": self.keys.get("OPENAI_MODEL", "gpt-4o-mini"),
            "gemini": self.keys.get("GEMINI_MODEL", "gemini-1.5-flash"),
        }

    def _key_for(self, provider: str) -> Optional[str]:
        """Return the primary or backup key for a provider."""
        if provider == "openai":
            return self.keys.get("OPENAI_API_KEY") or self.keys.get("OPENAI_API_KEY_BACKUP")
        if provider == "claude":
            return self.keys.get("CLAUDE_API_KEY") or self.keys.get("CLAUDE_API_KEY_BACKUP")
        if provider == "gemini":
            return self.keys.get("GEMINI_API_KEY")
        return None

    def _resolve_model(self, provider: str, model: Optional[str]) -> str:
        """Use the requested model only if it belongs to the provider; otherwise use the provider default."""
        if not model:
            return self.model_defaults[provider]
        model_lower = model.lower()
        if provider == "openai" and ("gpt-" in model_lower or model_lower.startswith("o1") or model_lower.startswith("o3")):
            return model
        if provider == "claude" and "claude-" in model_lower:
            return model
        if provider == "gemini" and "gemini" in model_lower:
            return model
        return self.model_defaults[provider]

    def _call_openai(self, key: str, system: str, messages: list, max_tokens: int, model: Optional[str] = None) -> str:
        model = self._resolve_model("openai", model)
        payload = json.dumps({
            "model": model,
            "messages": ([{"role": "system", "content": system}] if system else []) + messages,
            "temperature": 0.7,
            "max_tokens": max_tokens,
        }).encode()
        req = Request(
            "https://api.openai.com/v1/chat/completions",
            data=payload,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        )
        with urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read())
        return data["choices"][0]["message"]["content"]

    def _call_claude(self, key: str, system: str, messages: list, max_tokens: int, model: Optional[str] = None) -> str:
        model = self._resolve_model("claude", model)
        payload = json.dumps({
            "model": model,
            "max_tokens": max_tokens,
            "system": system,
            "messages": messages,
        }).encode("utf-8")
        req = Request(
            "https://api.anthropic.com/v1/messages",
            data=payload,
            headers={"Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01"},
            method="POST",
        )
        with urlopen(req, timeout=90) as r:
            data = json.loads(r.read())
        return data.get("content", [{}])[0].get("text", "")

    def _call_gemini(self, key: str, system: str, messages: list, max_tokens: int, model: Optional[str] = None) -> str:
        model = self._resolve_model("gemini", model)
        # Convert messages to Gemini format
        contents = []
        for m in messages:
            role = "model" if m["role"] == "assistant" else m["role"]
            contents.append({"role": role, "parts": [{"text": m["content"]}]})
        # System instructions go as separate systemInstruction field
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        payload = json.dumps({
            "systemInstruction": {"parts": [{"text": system}]} if system else None,
            "contents": contents,
            "generationConfig": {"maxOutputTokens": max_tokens, "temperature": 0.7},
        }).encode("utf-8")
        req = Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urlopen(req, timeout=90) as r:
            data = json.loads(r.read())
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        return "".join(p.get("text", "") for p in parts)

    def chat_completion(self, system: str, messages: list, max_tokens: int = 1000, model: Optional[str] = None, json_mode: bool = False) -> str:
        """Try each configured provider in priority order until one succeeds."""
        last_error = None
        for provider in self.providers:
            key = self._key_for(provider)
            if not key:
                print(f"[llm_client] {provider}: no key, skipping")
                continue
            try:
                if provider == "openai":
                    text = self._call_openai(key, system, messages, max_tokens, model)
                elif provider == "claude":
                    text = self._call_claude(key, system, messages, max_tokens, model)
                elif provider == "gemini":
                    text = self._call_gemini(key, system, messages, max_tokens, model)
                else:
                    continue
                if text:
                    print(f"[llm_client] success via {provider}")
                    return _extract_json(text) if json_mode else text
            except HTTPError as e:
                body = e.read().decode()[:300]
                print(f"[llm_client] {provider} HTTP error {e.code}: {body}")
                last_error = f"{provider} {e.code}"
            except Exception as e:
                print(f"[llm_client] {provider} error: {e}")
                last_error = f"{provider} {e}"

        raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")


# Convenience helpers for existing scripts

def quick_json(prompt: str, system: Optional[str] = None, max_tokens: int = 2000, priority: Optional[str] = None) -> dict:
    """Call LLM and parse JSON response."""
    client = LLMClient(priority=priority)
    text = client.chat_completion(
        system=system or "You are a helpful assistant. Output JSON only, no markdown fences.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        json_mode=True,
    )
    return json.loads(text)


def quick_text(prompt: str, system: Optional[str] = None, max_tokens: int = 2000, priority: Optional[str] = None) -> str:
    """Call LLM and return plain text."""
    client = LLMClient(priority=priority)
    return client.chat_completion(
        system=system or "You are a helpful assistant.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
    )


if __name__ == "__main__":
    # Quick test
    c = LLMClient()
    print("Providers:", c.providers)
    for p in c.providers:
        print(f"  {p} key present:", bool(c._key_for(p)))
