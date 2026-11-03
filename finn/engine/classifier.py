"""
FINN — announcement classifier (engine/classifier.py)
=====================================================
Classifies NSE/BSE corporate announcements into the 16 categories defined in
"Reference: Announcement Categories & Financial Glossary" (§1). Guidance-only
taxonomy: the category list lives in CATEGORIES so it can be adapted without
touching code.

Design (matches the brief's cost instinct):
  Stage 1 — deterministic keyword/expression rules catch ~85% of filings at
            zero model cost.
  Stage 2 — only ambiguous filings go to a cheap LLM (single JSON call,
            batched). No strong model is ever used for classification.
  Stage 3 — priority scoring (1=needs your eyes, 2=glance, 3=collapse) is
            pure rules over (category, materiality terms, portfolio weight).
"""
import re

# Reference §1 taxonomy — adapt freely (brief says so)
CATEGORIES = [
    "results", "M&A", "fund_raise", "management_change", "litigation",
    "insider_trading", "earnings_call", "investor_meetings", "credit_rating",
    "dividend", "bonus_split", "capex", "press_release", "postal_ballot",
    "agm_egm", "pledging", "unclassified",
]

# Category -> deterministic regex signals (Stage 1). Compiled once.
RULES = {
    "results": [
        r"financial result", r"audited (financial )?results", r"board meeting.{0,40}results",
        r"(un)?audited financial results", r"results (press )?(release|announcement)",
    ],
    "M&A": [
        r"acquisition", r"merger|amalgamation", r"demerger", r"joint venture",
        r"stake (sale|purchase|acquisition)", r"divest(ment|iture)", r"subsidiar",
    ],
    "fund_raise": [
        r"qip|qualified institutional", r"rights issue", r"preferential (allotment|issue)",
        r"buyback|buy.back", r"commercial paper", r"non.convertible debenture|NCD",
        r"fund rais|capital rais",
    ],
    "management_change": [
        r"resignation", r"appointment of (chief|cfo|ceo|md|director|company secretary)",
        r"cessation of", r"retirement of director", r"change in (director|management|key managerial)",
        r"chief financial officer|chief executive|managing director",
    ],
    "litigation": [
        r"national company law tribunal|NCLT", r"insolvency|IBC|resolution professional",
        r"(penalt|fine|order) .{0,30}(imposed|passed|levied)", r"sebi order", r"writ|lawsuit|litigation",
    ],
    "insider_trading": [
        r" PIT |SAST|system for acquisition and update", r"acquisition.{0,30}disposal.{0,30}shares",
        r"promoter.{0,40}(sold|purchased|acquired|disposed)",
    ],
    "earnings_call": [
        r"earnings call|concall|conference call", r"transcript of .{0,30}(call|meeting)",
        r"recording of .{0,20}call",
    ],
    "investor_meetings": [
        r"institutional investor|analyst meet|one.on.one", r"investor conference",
        r"schedule of (analyst|investor) meet",
    ],
    "credit_rating": [
        r"credit rating", r"reaffirm.{0,30}rating", r"rating (upgrade|downgrade|affirmed|assigned|withdrawn)",
        r"outlook (revised|affirmed) .{0,20}(positive|negative|stable)",
    ],
    "dividend": [r"dividend", r"record date for dividend"],
    "bonus_split": [r"bonus issue", r"stock split", r"sub.division|subdivision of shares"],
    "capex": [r"capex|capital expenditure", r"greenfield", r"new (plant|facility|unit)", r"capacity expansion"],
    "postal_ballot": [r"postal ballot", r"e.voting result", r"remote e-voting"],
    "agm_egm": [r"annual general meeting|AGM", r"extra.ordinary general meeting|EGM"],
    "pledging": [r"pledg", r"creation of (a )?security", r"release of (a )?pledge"],
    "press_release": [r"press release", r"order win", r"partnership|MoU", r"product launch", r"clarification.{0,30}rumour"],
    "unclassified": [
        r"compliance certificate", r"ESOP", r"ESOS", r"share certificate",
        r"audit observer", r"intimation", r"certificate under regulat",
        r"newspaper publication", r"website (update|publication)",
    ],
}
COMPILED = {c: [re.compile(p, re.I) for p in pats] for c, pats in RULES.items()}

# Materiality hints for priority scoring (beyond category)
STRONG_TERMS = re.compile(
    r"resignation|acquisition|merger|demerger|downgrad|insolvency|NCLT|buyback|"
    r"qip|preferential|disqualif|suspension|pledge", re.I)


def classify_regex(subject: str, body: str = "") -> str | None:
    """Stage 1: free. Returns first matching category by precedence, else None."""
    text = f"{subject}\n{body}"
    # precedence matters: e.g. 'record date for dividend' must not hit 'agm'
    for cat in ("results", "M&A", "management_change", "litigation", "credit_rating",
                "fund_raise", "insider_trading", "pledging", "bonus_split", "dividend",
                "capex", "earnings_call", "investor_meetings", "postal_ballot",
                "agm_egm", "press_release", "unclassified"):
        for rx in COMPILED.get(cat, []):
            if rx.search(text):
                return cat
    return None


def score_priority(cat: str, subject: str, weight: int = 1) -> int:
    """Priority 1 = interrupt, 2 = glance, 3 = collapse/hide."""
    if cat in {"results", "M&A", "management_change", "litigation", "credit_rating",
               "fund_raise", "insider_trading", "pledging"}:
        return 1
    if cat in {"capex", "dividend", "bonus_split", "earnings_call"} or STRONG_TERMS.search(subject):
        return 2
    if cat in {"unclassified", "agm_egm", "postal_ballot", "investor_meetings"}:
        return 3
    return 2 if weight >= 3 else 3  # low-weight names get routine press releases collapsed


async def classify(announcements: list[dict], llm=None) -> list[dict]:
    """
    Full pipeline. `announcements`: [{symbol, subject, body, weight}]
    `llm`: optional callable (subject, body) -> category for Stage 2.
    Only regex-miss filings reach the LLM; failures default to 'unclassified'.
    """
    out = []
    pending = []
    for a in announcements:
        cat = classify_regex(a["subject"], a.get("body", ""))
        if cat:
            a = {**a, "cat": cat}
        else:
            pending.append(a)
        out.append(a)
    if pending and llm is not None:  # Stage 2: one batched cheap-model call
        results = await llm([{"subject": p["subject"], "body": p.get("body", "")[:1200]} for p in pending])
        for a, cat in zip(pending, results):
            a["cat"] = cat if cat in CATEGORIES else "unclassified"
    for a in out:
        if "cat" not in a:
            a["cat"] = "unclassified"
        a["priority"] = score_priority(a["cat"], a["subject"], a.get("weight", 1))
    return out