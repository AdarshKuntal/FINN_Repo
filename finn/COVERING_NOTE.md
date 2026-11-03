# Covering note — FINN, Financial Investment Agent

**ENAM — IIT screening — 2027**

## What I built
A mobile-first investment copilot, FINN, in two modes, per the brief:

**Push** — a windowed digest (24h default, user-selectable to 7d) that ranks every corporate filing across an 18-name portfolio into *needs-your-eyes / worth-a-glance / collapsed*, plus triggered alerts with investor-owned thresholds (volume > N× 20-day average, ±X% day move, category watches). Two presentation examples from the brief are built in full: quarterly results get a first cut of Revenue/EBITDA/PBT/PAT with QoQ and YoY taken from the filing; management changes get a background card on the incoming person.

**Pull** — on-demand research on any ticker, grounded exclusively in primary sources (annual reports + concall transcripts). The card set covers the menu the brief offered, with **narrative-vs-numbers** as the centrepiece: each guidance claim, verbatim, against what the financials actually delivered, with source citations.

## Key decisions and trade-offs
1. **Regex-first classification; LLM only for the residue.** The reference doc's 16 categories are mostly catchable deterministically. Every filing that doesn't need a model is a filing processed free — the classifier is the biggest daily volume, so this is where cost discipline pays.
2. **Model routing.** Cheap tier does bulk per-chunk extraction from ARs/transcripts (disk-cached, so a re-run costs zero); the strong model runs exactly once per research request, over normalized facts rather than raw PDFs. Free-tier feasible end-to-end.
3. **Primary-data discipline, enforced structurally.** Extraction runs with an explicit "null if not in the excerpt" contract, so the model cannot backfill from its own priors — the no-news/no-broker rule is a pipeline property, not a prompt hope.
4. **Generalisation over demo-wiring.** Portfolio and thresholds live in one config; `research()` accepts any NSE ticker. The demo set exists to make the demo interesting, not to bound the engine.
5. **Interaction model.** I deliberately made Push the home surface rather than a chat box: an investor's scarce resource is attention, and a ranked digest that buries routine filings respects it better than an open-ended chat. The ask-bar routes to Pull, but the product's point of view is "the feed tells you what matters; ask when you want depth."
6. **Scope discipline.** One digest flow, one alert surface, one research card — all working, rather than five half-built surfaces.

## What I deliberately left out
Live intraday data, macro feeds, and anything outside the brief's three sources; multi-user auth; voice mode (next-iteration A/B against cards); hardening of NSE rate-limiting. Full list in the README.

## Where I'd take it next
A guidance-vs-delivered backfill across 8 quarters to make the narrative tracker trendable; a learning ranker that adjusts category priorities by what the investor actually opens; deep-links to the filing PDF from every card.

## Try it
Single-file PWA — open `app/index.html` on a phone. Engine code under `engine/` (classifier, market watcher, research pipeline, scheduled worker). Demo data is engine-shaped, so swapping mocks for live output is a contract change of one file.
