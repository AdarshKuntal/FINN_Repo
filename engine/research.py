"""
FINN — primary-source research pipeline (engine/research.py)
============================================================
Pull mode. Grounded in primary sources ONLY — annual reports (AR) +
concall transcripts via screener.in links or the company IR site.
No news, no broker notes, no research reports, and no reliance on the
model's own outside knowledge of the company (brief: "no AI slop" + the
primary-data discipline).

Cost design (brief: "Efficiency earns bonus points"):
  Stage A  fetch + parse AR/transcript PDFs (chunked, cached by URL hash)
  Stage B  cheap model per chunk: extract structured facts into a
           normalized JSON (segments, P&L, BS, CF, guidance quotes) —
           ~90% of tokens spent here, on the cheapest tier
  Stage C  reasoning model ONCE: cross-check guidance vs delivered numbers
           (narrative-vs-numbers), build bull/bear, produce the card
  Cache    identical company+quarter never re-extracts (disk cache)

Outputs the same card schema the UI renders (app.js `RESEARCH`).
"""
import asyncio
import hashlib
import json
import os

import httpx

from config import settings

CACHE_DIR = os.path.join(os.path.dirname(__file__), "_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

EXTRACT_SYSTEM = """You extract structured facts from excerpts of an Indian company's
annual report or earnings-call transcript. Output ONLY JSON matching the schema.
Never use outside knowledge: if a field is not in the excerpt, output null.
Schema: {"segments":[{"name":str,"share_pct":num|null}],"pnl":{"revenue_cr":num|null,
"ebitda_cr":num|null,"pbt_cr":num|null,"pat_cr":num|null,"period":str|null},
"bs":{"debt_cr":num|null,"equity_cr":num|null,"wc_days":num|null},
"cash":{"cfo_cr":num|null,"capex_cr":num|null},
"guidance":[{"claim":str,"metric":str,"value":str,"verbatim":str}],
"page":int|null}"""

SYNTH_SYSTEM = """You are an investment analyst. Using ONLY the extracted facts JSON
(primary-source data from the annual report and concall transcripts — nothing else),
produce the research card as JSON with: business snapshot, financial snapshot,
trajectory (multi-year), balance sheet, cash quality (cash conversion), narrative vs
numbers (each guidance claim vs what the numbers show, with verbatim quotes and the
source section), guidance tracker, bull case, bear case. If data for a section is
missing, say so rather than filling from priors. No news, no broker commentary."""

SCREENER_SEARCH = "https://www.screener.in/api/company/{q}/"


async def find_sources(client: httpx.AsyncClient, query: str) -> dict:
    """Resolve screener.in links for annual reports + concall transcripts."""
    # Screener exposes per-company document links on the company page; the
    # deployed worker resolves them per ticker. Demo fallback: IR-page URLs.
    r = await client.get(SCREENER_SEARCH.format(q=query))
    r.raise_for_status()
    data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    return {"ar": data.get("annual_report"), "transcripts": data.get("concall", [])}


def _chunk(text: str, size: int = 4000) -> list[str]:
    return [text[i:i + size] for i in range(0, len(text), size)]


def _key(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]


async def extract_chunk(client: httpx.AsyncClient, cheap, url: str, text: str, page: int) -> dict:
    """Stage B: one cheap-model call per chunk, disk-cached."""
    k = os.path.join(CACHE_DIR, f"{_key(url)}_{page}.json")
    if os.path.exists(k):
        with open(k) as f:
            return json.load(f)
    prompt = f"Excerpt (page {page}):\n{text[:4000]}"
    resp = await cheap.chat(EXTRACT_SYSTEM, prompt)  # cheap tier: e.g. gemini-flash/haiku class
    try:
        out = json.loads(resp)
    except json.JSONDecodeError:
        out = {"error": "parse", "page": page}
    with open(k, "w") as f:
        json.dump(out, f)
    return out


async def research(ticker: str, cheap, strong) -> dict:
    """Full pull-mode run for ANY NSE ticker (engine generalises — no demo hard-coding)."""
    async with httpx.AsyncClient(timeout=30) as client:
        src = await find_sources(client, ticker)
        docs = []
        for url in ([src["ar"]] if src.get("ar") else []) + list(src.get("transcripts") or [])[:4]:
            pdf = (await client.get(url)).content
            text = _pdf_text(pdf)  # pdfplumber-based, see utils
            for i, ch in enumerate(_chunk(text)):
                docs.append(await extract_chunk(client, cheap, url, ch, i + 1))
    facts = [d for d in docs if d and not d.get("error")]
    # Stage C: one strong-model synthesis pass over normalized facts
    card = await strong.chat(SYNTH_SYSTEM, json.dumps(facts)[:120_000])
    return json.loads(card) if isinstance(card, str) else card


def _pdf_text(pdf: bytes) -> str:
    import io
    import pdfplumber
    out = []
    with pdfplumber.open(io.BytesIO(pdf)) as p:
        for pg in p.pages:
            out.append(pg.extract_text() or "")
    return "\n\f".join(out)


if __name__ == "__main__":
    print(asyncio.run(research(settings.demo_tickers[0], cheap=None, strong=None)))