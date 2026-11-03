"""
FINN engine — shared settings. Change the portfolio here; nothing in the
pipeline is hard-wired to the demo set (brief: "build it so it works on any
NSE ticker").
"""
import os

NSE_SUFFIX = ".NS"
BSE_SUFFIX = ".BO"

# Mock portfolio: 18 names, 13 sectors, mixed sizes (brief: 15–20 names)
PORTFOLIO_NSE = [
    "RELIANCE", "HDFCBANK", "TCS", "INFY", "TITAN", "DMART", "SUNPHARMA",
    "TATAPOWER", "PIIND", "LT", "BAJFINANCE", "DIXON", "KAYA", "AARTIIND",
    "CDSL", "KPITTECH", "GRASIM", "DEEPAKNTR",
]
PORTFOLIO_TICKERS = [t + NSE_SUFFIX for t in PORTFOLIO_NSE]

# Ad-hoc research demo set: 4 names, may sit outside the portfolio (brief: 3–5)
DEMO_RESEARCH = ["TRENT", "CUMMINSIND", "PERSISTENT", "POLYCAB"]

# Push-alert defaults (user-configurable in the UI; brief requires this)
DEFAULT_ALERT_RULES = {"volume_mult": 2.0, "move_pct": 2.0}

# Model routing: cheap tier for bulk extraction/classification, strong tier
# only for the single research-synthesis pass. All free-tier feasible.
CHEAP_MODEL = os.getenv("FINN_CHEAP_MODEL", "gemini-2.0-flash")
STRONG_MODEL = os.getenv("FINN_STRONG_MODEL", "claude-sonnet-4")

# Cron: EOD scan after NSE close (16:15 IST) + digest push at 08:00 IST
CRON_EOD_SCAN = "15 10 * * 1-5"   # UTC 10:15 == 15:45 IST pre-close buffer
CRON_MORNING_DIGEST = "30 2 * * 1-5"  # UTC 02:30 == 08:00 IST