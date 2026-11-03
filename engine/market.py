"""
FINN — price/volume watcher (engine/market.py)
==============================================
EOD price & volume for the portfolio via yfinance (.NS for NSE, .BO for BSE),
exactly as suggested in the brief. Runs once after market close.

Alert rules are user-configurable (the brief: "I decide what 'unusual' means"):
  - volume > V x its 20-day rolling average
  - single-day move beyond +/- P%
"""
import json
import os
from datetime import datetime, timedelta

import yfinance as yf

LOOKBACK_DAYS = 60
STATE_PATH = os.path.join(os.path.dirname(__file__), "_state_prices.json")


def fetch_eod(ticker: str) -> dict | None:
    """EOD row for one ticker, e.g. 'RELIANCE.NS' or 'DIXON.BO'."""
    h = yf.Ticker(ticker).history(period=f"{LOOKBACK_DAYS}d", interval="1d")
    if h.empty or len(h) < 21:
        return None
    last, avg20 = h.iloc[-1], h["Volume"].iloc[-21:-1].mean()
    prev = h.iloc[-2]
    return {
        "ticker": ticker,
        "date": str(h.index[-1].date()),
        "close": round(float(last["Close"]), 2),
        "chg_pct": round(float(last["Close"] / prev["Close"] - 1) * 100, 2),
        "volume": int(last["Volume"]),
        "vol_vs_avg": round(float(last["Volume"] / avg20), 2) if avg20 else None,
    }


def evaluate(rules: dict, row: dict) -> list[str]:
    """Apply user thresholds to one EOD row -> list of alert strings."""
    alerts = []
    v, p = rules.get("volume_mult", 2.0), rules.get("move_pct", 2.0)
    if row["vol_vs_avg"] and row["vol_vs_avg"] >= v:
        alerts.append(f"VOL {row['vol_vs_avg']}x avg (rule: >{v}x)")
    if abs(row["chg_pct"]) >= p:
        alerts.append(f"MOVE {row['chg_pct']:+.1f}% (rule: |move|>{p}%)")
    return alerts


def run(portfolio: list[str], rules: dict | None = None) -> list[dict]:
    """portfolio: e.g. ['RELIANCE.NS', 'DIXON.BO']. Returns rows carrying alerts."""
    rules = rules or {"volume_mult": 2.0, "move_pct": 2.0}
    rows = []
    for t in portfolio:
        row = fetch_eod(t)
        if row:
            row["alerts"] = evaluate(rules, row)
            rows.append(row)
    _save(rows)
    return rows


def _save(rows: list[dict]) -> None:
    try:
        with open(STATE_PATH, "w") as f:
            json.dump({"updated": datetime.utcnow().isoformat(), "rows": rows}, f)
    except OSError:
        pass


if __name__ == "__main__":
    import sys
    tickers = sys.argv[1:] or ["RELIANCE.NS", "DIXON.NS"]
    for r in run(tickers):
        print(r)