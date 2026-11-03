# FINN — Financial Investment Agent

*ENAM Holdings — AI Engineer Build Challenge · Release Oct 27, 2026 · Due Nov 1, 2026*

FINN is a mobile-first investment copilot that works in two modes:

- **Push** — it tells you what changed and *why you should care* (windowed digest + threshold alerts).
- **Pull** — you ask it to research any NSE company, grounded in **primary sources only** (annual reports + concall transcripts).

---

## Try it on a phone

The prototype is a single-file responsive web app:

```
app/index.html        ← open on a phone (or serve: python -m http.server)
app/app.js            ← demo data + interaction model (engine-shaped)
```

**Push demo flow:** Feed tab → change the digest window (24h/48h/3d/7d) → open the DIXON results card (Revenue/EBITDA/PBT/PAT, QoQ + YoY, from the filing) → open the TATAPOWER management-change card (incoming-CFO background enrichment) → tap "routine filings collapsed" to peek at what FINN buried.
**Pull demo flow:** Research tab → TRENT / CUMMINSIND / PERSISTENT / POLYCAB → the *Narrative vs numbers* card is the core: what management promised (verbatim transcript quotes) vs what the numbers delivered. Type any ticker in the search box to see the generalisation contract.
**Alerts demo flow:** Alerts tab → drag the volume-multiple / daily-move thresholds; rules show what fired and why.

## Repository layout

```
finn/
├── app/
│   ├── index.html          # mobile-first UI (PWA, deployable as-is)
│   ├── app.js              # interaction model; consumes the engine's data contract
│   └── manifest.webmanifest
├── engine/
│   ├── config.py           # portfolio + alert defaults + model routing
│   ├── classifier.py       # 16-category announcement classifier (ref doc §1)
│   ├── market.py           # yfinance EOD (.NS/.BO) + threshold rules
│   ├── research.py         # primary-source research pipeline (AR + concalls)
│   └── worker.py           # scheduled push pipeline (digest → web push)
├── requirements.txt
└── README.md
```

## Architecture & key decisions

1. **Regex-first classification, LLM only for the residue.** The 16 categories from the reference doc are encoded as deterministic rules that catch most filings at zero cost; only unmatched subjects go to a cheap model (one batched JSON call). Priority (1=needs your eyes / 2=glance / 3=collapse) is pure rules over category × materiality terms × portfolio weight.
2. **Model routing (cost instinct).** Cheap tier for bulk extraction (per-chunk AR/transcript facts, disk-cached by URL hash); the strong model runs **once** per research request, on normalized facts, not raw PDFs. Identical company+quarter never re-extracts.
3. **Primary-source discipline on Pull.** `engine/research.py` extracts structured facts from annual reports and concall transcripts (screener.in / IR links) with an explicit "null if not in the excerpt" instruction — the model cannot fill gaps from its own knowledge. Push-side enrichment (e.g. an incoming CFO's public background) is deliberately scoped to the Push side only, as the brief permits.
4. **Generalisation.** Portfolio lives in `engine/config.py`; `research()` takes any ticker where screener data exists. Nothing in the pipeline is hard-wired to the demo set.
5. **Ship a thin, working thing.** The frontend is a zero-build single-page PWA — installable, works offline on the demo dataset, and swaps `app.js` mock data for the engine's JSON contract at deploy.

## Deliberately left out (judgment, not omission)

- Live intraday prices, options/F&O, macro feeds — out of the brief's three-source scope.
- Full NSE rate-limit hardening / login-gated transcript fetching — plumbing, not the point.
- Voice mode and chat history — a considered cut: the digest *is* the interface; chat on top risked becoming a second dashboard. Next iteration would A/B voice briefing vs. cards.
- Multi-user auth — the investor is one person.

## Where next

1. Backfill guidance-vs-delivered for 8 quarters to make the narrative tracker trendable.
2. Learning ranker: raise/lower categories by what the investor actually opens.
3. Filing-PDF deep-link on every card; share-to-colleague with the "why it matters" note.

## Model routing & cost

Free-tier feasible end-to-end. Estimated per-day cost for an 18-name portfolio: classification ≈ 0–2 cheap calls (regex handles most), research ≈ 8–14 cheap extraction calls + 1 strong synthesis call, all cached. No spend required to run the demo.

---

*Demo data note: the prototype ships with realistic mock data shaped exactly like the engine's output contract (`ANN`, `ALERTS`, `RULES`, `RESEARCH` in `app.js`) so it runs offline. The engine modules are the real implementation path.*
