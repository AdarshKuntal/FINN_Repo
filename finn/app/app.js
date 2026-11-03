/* FINN — push/pull investment copilot. All data is demo mock; engine contract matches /engine */

/* ---------------- MOCK DATA (engine-shaped) ---------------- */
const PORTFOLIO = [
 {sym:"RELIANCE", name:"Reliance Industries", sector:"Energy", px:1412.4, chg:+0.8, w:14},
 {sym:"HDFCBANK", name:"HDFC Bank", sector:"Financials", px:1698.2, chg:-0.4, w:11},
 {sym:"TCS", name:"Tata Consultancy Svcs", sector:"IT", px:3155.0, chg:+1.2, w:10},
 {sym:"INFY", name:"Infosys", sector:"IT", px:1876.5, chg:+0.3, w:8},
 {sym:"TITAN", name:"Titan Company", sector:"Consumer", px:3418.9, chg:-1.1, w:7},
 {sym:"DMART", name:"Avenue Supermarts", sector:"Retail", px:4265.0, chg:+0.5, w:6},
 {sym:"SUNPHARMA", name:"Sun Pharmaceutical", sector:"Pharma", px:1832.7, chg:+2.1, w:6},
 {sym:"TATAPOWER", name:"Tata Power", sector:"Power", px:392.6, chg:+3.4, w:5},
 {sym:"PIIND", name:"PI Industries", sector:"Agrochem", px:3644.1, chg:-0.7, w:5},
 {sym:"LT", name:"Larsen & Toubro", sector:"Infra", px:3612.3, chg:+0.9, w:5},
 {sym:"BAJFINANCE", name:"Bajaj Finance", sector:"Financials", px:6874.0, chg:-1.8, w:4},
 {sym:"DIXON", name:"Dixon Technologies", sector:"EMS", px:15240.0, chg:+4.2, w:3},
 {sym:"KAYA", name:"Kaya", sector:"Smallcap", px:548.0, chg:+0.2, w:2},
 {sym:"AARTIIND", name:"Aarti Industries", sector:"Specialty Chem", px:438.6, chg:-2.3, w:2},
 {sym:"CDSL", name:"Central Depository Svcs", sector:"Capital Mkt", px:1462.0, chg:+1.6, w:2},
 {sym:"KPITTECH", name:"KPIT Technologies", sector:"Auto IT", px:1321.5, chg:+2.4, w:2},
 {sym:"GRASIM", name:"Grasim Industries", sector:"Cement", px:2578.4, chg:0.0, w:1},
 {sym:"DEEPAKNTR", name:"Deepak Nitrite", sector:"Specialty Chem", px:2198.5, chg:-1.4, w:1},
];
const ADHOC = ["TRENT","CUMMINSIND","PERSISTENT","POLYCAB"];

/* Announcements as the engine would emit them (engine/classifier.py taxonomy) */
const ANN = [
 {id:1, sym:"TATAPOWER", cat:"management_change", p:1, h:20, t:"Resignation of Chief Financial Officer",
  sum:"CFO Padam Bhanbunse resigned w.e.f. 31 Oct, to pursue an opportunity outside the group. Search initiated; interim coverage by the F&A head.",
  why:"2nd C-suite exit in 6 months. Watch for successor quality in the next filing.",
  src:"NSE filing · 2 Nov, 18:42 IST · Corp. Announcement",
  bio:{nm:"Name: incoming CFO — announced 4 Nov", rl:"Joins from: Adani Green (Deputy CFO)", p:"19 years across Adani Green and Tata Power's renewables arm; led the AGPL IPO-year treasury and the 2024 green-bond raise. Known for capital-discipline turnarounds.",
  src2:"Public professional background — push-side enrichment only (brief allows this)"}},
 {id:2, sym:"DIXON", cat:"results", p:1, h:26, t:"Q2 FY27 results approved by board",
  sum:"First cut of headline numbers from the actual results filing:",
  res:{rows:[["Revenue","₹11,489 cr","+14.2% QoQ","+31.5% YoY"],["EBITDA","₹642 cr","+9.8% QoQ","+28.9% YoY"],["EBITDA margin","5.6%","-22 bps QoQ","+31 bps YoY"],["PBT","₹518 cr","+11.0% QoQ","+30.1% YoY"],["PAT","₹405 cr","+12.4% QoQ","+29.8% YoY"]],
  note:"Mobile-EMS mix now 71% of revenue; margin dip QoQ on component pass-through lag, per filing."},
  why:"Beat seasonality; margins are the thing to watch, not growth.", src:"NSE filing · 2 Nov, 17:05 IST · Results"},
 {id:3, sym:"AARTIIND", cat:"M&A", p:1, h:31, t:"Board approves divestment of Speciality Chemicals arm",
  sum:"Agreed to sell 74% in the pharma-intermediates subsidiary to a PE consortium at an implied EV of ₹4,900 cr (~9.1× EV/EBITDA). Expected completion H1 FY28; proceeds earmarked for debt reduction.",
  why:"~22% of consolidated EBITDA in play. Re-rating lever, but execution risk on the remaining entity.",
  src:"NSE filing · 2 Nov, 14:20 IST · Material agreement"},
 {id:4, sym:"BAJFINANCE", cat:"credit_rating", p:1, h:33, t:"Rating agency downgrades outlook to Negative",
  sum:"Long-term rating affirmed at AAA but outlook moved to Negative citing rising share of unsecured book and funding-cost pressure.",
  why:"First AAA-name in our book with a negative outlook in this cycle.", src:"NSE filing · 2 Nov, 11:10 IST"},
 {id:5, sym:"TITAN", cat:"results", p:2, h:29, t:"Q2 FY27 results — jewellery studded mix recovers",
  sum:"Headline cut: Revenue ₹22,180 cr (+18.5% YoY); EBITDA ₹2,844 cr (12.8% margin, +40 bps YoY); PAT ₹1,041 cr (+9.2% YoY). Carat-led growth; guidance on studded mix intact.",
  why:"In-line top line, better mix. Watch gold-metal-lease impact in H2.", src:"NSE filing · 2 Nov, 16:30 IST"},
 {id:6, sym:"INFY", cat:"earnings_call", p:2, h:40, t:"Q2 concall transcript published",
  sum:"Management maintained FY27 CC revenue guidance of 3–4%; margin guidance trimmed 30 bps on furloughs. New deal TCV $3.1bn.",
  why:"Guidance intact but margin language softened — flag for narrative tracker.", src:"Screener.in transcript · 31 Oct"},
 {id:7, sym:"SUNPHARMA", cat:"fund_raise", p:2, h:44, t:"QIP of ₹4,000 cr concluded",
  sum:"Issued 1.42 cr shares at ₹2,812 to marquee institutions; placement closed oversubscribed 3.4×.",
  why:"Cash-rich company raising equity — read as pre-funding for the US specialty pipeline.", src:"NSE filing · 1 Nov"},
 {id:8, sym:"KPITTECH", cat:"insider_trading", p:2, h:50, t:"Promoter sells 0.9% stake via block deal",
  sum:"Promoter group sold 13.1 lakh shares (0.9%) at ₹1,298, citing 'philanthropic commitments'. Post-sale promoter holding 33.6%.",
  why:"Second such sale this half. Pattern matters more than the single print.", src:"SAST filing · 1 Nov"},
 {id:9, sym:"LT", cat:"capex", p:2, h:58, t:"Board approves ₹1,200 cr greenfield giga-factory",
  sum:"Capex for electrolyser manufacturing capacity at Hazira; phased over 3 years, debt-funded.",
  why:"Capex ahead of order book — watch working capital in Q3.", src:"NSE filing · 1 Nov"},
 {id:10, sym:"TCS", cat:"dividend", p:3, h:70, t:"Second interim dividend of ₹11/share",
  sum:"Record date 12 Nov. Annualised yield ~1.4% at current price.", src:"NSE filing · 31 Oct"},
 {id:11, sym:"CDSL", cat:"agm_egm", p:3, h:73, t:"AGM notice — e-voting window opens 20 Nov",
  sum:"Routine AGM items plus special resolution for ESOP pool expansion of 1.2%.", src:"NSE filing · 31 Oct"},
 {id:12, sym:"GRASIM", cat:"press_release", p:3, h:78, t:"Paints business crosses ₹1,000 cr quarterly revenue",
  sum:"'Birla Opus' crossed the milestone 6 quarters after launch — fastest in category per company release.", src:"Company press release · 31 Oct"},
];
const ROUTINE = [
 ["KPITTECH","Compliance certificate — Sep quarter (Reg 27(2))"],["SUNPHARMA","Analyst meet intimation"],
 ["DMART","Newspaper publication of results notice"],["TCS","Share transfer/audit observer intimation"],
 ["CDSL","ESOP allotment — 42,000 shares"],["PIIND","Certificate under Reg 74(5)"],
 ["HDFCBANK","Disclosure of related-party transactions"],["INFY","Notice of record date (nothing actionable)"],
 ["TATAPOWER","Investor presentation for Q2 — filed as compliance"],["LT","Updated presentations on website"],
 ["GRASIM","Compliance under SEBI LODR 13(3)"],["DIXON","Analyst institutional meet intimation"],
 ["AARTIIND","Board meeting intimation change"],["BAJFINANCE","Schedule of analyst meets — Nov"],
];

const ALERTS = [
 {ic:"📈", t:"Volume anomaly — DIXON", d:"Traded 5.9× its 20-day average on results day (2 Nov). Price +4.2%.", meta:"Rule: vol > 2× avg · EOD via Yahoo", p:1},
 {ic:"📉", t:"Price threshold — AARTIIND −2.3%", d:"Crossed your −2% daily-move rule on M&A-divestment headline day. Digest card #3 explains the move.", meta:"Rule: |move| > 2% · EOD via Yahoo", p:1},
 {ic:"🧑‍💼", t:"Material filing — TATAPOWER management_change", d:"CFO resignation caught by your category watch. Background enrichment attached.", meta:"Rule: cat ∈ {results, M&A, management_change, litigation, credit_rating}", p:1},
 {ic:"⚠️", t:"Rating action — BAJFINANCE", d:"Outlook cut to Negative. Your rule on credit_rating changes fired.", meta:"Rule: cat = credit_rating", p:2},
 {ic:"📊", t:"Promoter sale — KPITTECH", d:"0.9% promoter block. Not your pledging rule (that's collateral) — insider_trading category.", meta:"Rule: cat = insider_trading", p:2},
];

const RULES = [
 {n:"Volume spike vs 20-day average", v:2, u:"×", on:true},
 {n:"Single-day price move", v:2, u:"%", on:true},
 {n:"Material categories", v:0, u:"cats", on:true},
 {n:"Promoter pledging change", v:0, u:"cats", on:true},
 {n:"Any insider_trade filing", v:0, u:"cats", on:true},
];

/* Pull-mode research: primary-source-grounded, per brief (no news, no broker notes) */
const RESEARCH = {
 "TRENT": {
  snap:{desc:"Retail — fast-fashion (Zudio, Westside). Revenue mix: Zudio ~70% and compounding, Westside ~25%, Star/supermarket rest.",
   seg:[["Zudio / value fashion",68],["Westside",25],["Star & other",7]]},
  fin:[["Revenue (FY26E base, per AR)","₹6,813 cr"],["EBITDA margin","17.9%"],["PAT","₹1,049 cr"],["D/E","0.05×"],["ROCE","31%"],["Cash conversion (3-yr avg)","96%"]],
  traj:[["Store count","489 → 665 stores","+36%"],["Zudio revenue 3-yr CAGR","+44%"],["EBITDA margin","14.2% → 17.9%","+370 bps"],["ROCE","26% → 31%","+500 bps"]],
  bs:[["Net debt","Net cash ₹1,900 cr"],["Leverage","0.05× D/E — effectively unlevered"],["Working capital","Negative cycle — lease+supplier-funded inventory; capital-efficient growth"],["Funding","All internal accruals; no term debt"]],
  cash:[["CFO trend","₹1,286 → 1,572 → 2,005 cr (3 yrs)"],["FCF","Positive all 3 years despite 200+ store openings"],["Cash conversion","PAT→CFO ~96% — clean"]],
  narr:[
   {g:"FY26 guidance (concall, Jul)", p:"'Zudio to add 200+ net stores this year'", a:"Added 176 by Q2-annualised pace — slightly behind, flagged in Q2 call", s:"'We will add 200-plus Zudio stores this financial year.' — MD, Q1 concall", st:"mix"},
   {g:"Margin guide", p:"'Studded mix to reach low-30s% over 3 years'", a:"Q2 studded share 28.4% (+240 bps YoY) — on track", s:"Q2 investor presentation, p.12", st:"ok"},
   {g:"Star turnaround", p:"'Star losses to halve this year'", a:"H1 loss ₹68 cr vs ₹141 cr — halving achieved early", s:"Q2 results filing", st:"ok"}],
  guide:[["Zudio store adds","200+ net / FY27","On pace (176 by H1)"],["Studded mix","low-30s% in 3 yrs","On track"],["Star EBITDA","breakeven by FY28","Ahead"]],
  bull:["Zudio is the only proven sub-₹1000 value-fashion format at national scale — unit economics in AR show payback < 18 months","Negative working-capital model means growth is self-funding; ROCE 31% and rising","Real estate arbitrage: 8–10 yr leases locked pre-inflation"],
  bear:["Every competitor (Reliance Trends reboot, DM-style value) is now attacking the same format — SAM overlap rising","Store productivity per sq ft decelerating in mature Zudio cohorts (AR cohort note)","Westside growth is single-digit — the growth story is one banner"]},
 "CUMMINSIND": {
  snap:{desc:"Power solutions — engines, gensets, and the emerging power-systems (data-centre UPS, electrolyser) arm.",
   seg:[["Engine/genset",54],["Power systems (DC/UPS)",28],["Distribution & export",18]]},
  fin:[["Revenue (FY26)","₹9,875 cr"],["EBITDA margin","18.4%"],["PAT","₹1,530 cr"],["D/E","0.1×"],["ROCE","38%"],["Cash conversion","104%"]],
  traj:[["Revenue 3-yr CAGR","+19%"],["Power-systems revenue","₹1,420 → 2,765 cr — doubled"],["EBITDA margin","15.8% → 18.4%"],["Export mix","9% → 18%"]],
  bs:[["Net debt","Net cash ₹2,100 cr"],["Working capital","~45 days — inventory-led, stable"],["Funding","Internal accruals only"]],
  cash:[["CFO 3-yr trend","₹1,240 → 1,780 → 2,190 cr"],["FCF","Positive; capex cycle modest till electrolyser plant"],["Cash conversion","104% — best-in-class for cap-goods"]],
  narr:[
   {g:"Data-centre commentary", p:"'Power-systems orderbook has multi-year visibility'", a:"Orderbook ₹3,400 cr (2.1× segment revenue) — verified in AR orderbook note", s:"Q4 concall + AR orderbook note", st:"ok"},
   {g:"Hydrogen", p:"'Electrolysers to be a meaningful revenue line by FY28'", a:"Zero electrolyser revenue yet; 1 pilot order. Guidance optimistic vs delivery", s:"FY26 AR, capex note vs revenue note", st:"miss"},
   {g:"Margins", p:"'Hold 18%+ through the mix shift'", a:"18.4% maintained", s:"Q2 concall", st:"ok"}],
  guide:[["Power-systems growth",">25%/yr","Delivering (38% last FY)"],["Electrolyser revenue","'meaningful' by FY28","Not yet — zero base"],["Margins","18%+","Holding"]],
  bull:["Data-centre capex super-cycle in India is a direct orderbook read — not a narrative","Net-cash, 38% ROCE compounder with a doubling segment inside it","Genset cash cow funds the new arms without leverage"],
  bear:["Electrolyser guidance looks ahead of delivery — the narrative/numbers gap the concall glosses over","Genset core is a replacement cycle business — growth reverts to GDP once DC wave digests","Valuation embeds the new businesses before they earn anything"]},
 "PERSISTENT": {
  snap:{desc:"IT services — digital engineering, differentiated from WITCH peers by deal size mix.",
   seg:[["Healthcare & life sci",32],["Software & hi-tech",28],["Communications",22],["Others",18]]},
  fin:[["Revenue (FY26)","₹12,240 cr"],["EBITDA margin","14.6%"],["PAT","₹1,180 cr"],["D/E","0.2×"],["ROCE","24%"],["Cash conversion","88%"]],
  traj:[["Revenue 3-yr CAGR","+23% — fastest among Indian IT mid-caps"],["Top-5 client revenue","42% — concentration rising"],["Margin","14.0% → 14.6% — slow grind"],["Headcount","Flat last 2 quarters — utilisation-led growth"]],
  bs:[["Net debt","Near-zero; ₹800 cr investable cash"],["Goodwill","₹4,300 cr from 6 acquisitions since 2021 — 22% of assets"],["Funding","Accruals"]],
  cash:[["CFO trend","₹820 → 1,340 → 1,510 cr"],["Cash conversion","88% — below IT-services peers; DSO creep +40 days in 2 yrs"],["FCF","Thin after acquisition capex"]],
  narr:[
   {g:"Revenue guide (Q1 concall)", p:"'15–17% cc growth for FY27'", a:"H1 annualises to 13.8% — below the low end; management re-based to '14–16' in Q2 call", s:"Q1 and Q2 concall transcripts", st:"miss"},
   {g:"AI-led revenue", p:"'AI services to be 8% of revenue by year-end'", a:"Disclosed at 5.1% in Q2 — pace behind rhetoric", s:"Q2 investor presentation, p.9", st:"miss"},
   {g:"Margin", p:"'Towards 15% by FY27'", a:"14.6%, +30 bps H1 — plausible", s:"Q2 concall", st:"ok"}],
  guide:[["FY27 growth","14–16% cc (re-based)","H1 at 13.8% — borderline"],["AI revenue mix","8% by year-end","5.1% at H1 — behind"],["Margin","~15%","On track"]],
  bull:["Fastest structural share-gainer among Indian IT; TCV momentum genuine (book-to-bill 1.4×)","Specialist positioning commands pricing WITCH can't match"],
  bear:["Three straight guidance re-bases — the most over-promising management in the Indian IT set (verified across 4 concalls)","88% cash conversion and 40-day DSO creep quietly degrade a 'quality compounder' story","Client concentration (42%) rising while growth decelerates — a bad combination"]},
 "POLYCAB": {
  snap:{desc:"Wires & cables leader (~28% share) + FMEG. Cables are grid/data-centre/renewables-driven.",
   seg:[["Wires & cables",83],["FMEG (fans, switches…)",14],["Others",3]]},
  fin:[["Revenue (FY26)","₹18,240 cr"],["EBITDA margin","13.9%"],["PAT","₹1,780 cr"],["D/E","0.05×"],["ROCE","29%"],["Cash conversion","93%"]],
  traj:[["Revenue 3-yr CAGR","+21%"],["W&C margin","13.2% → 14.8%"],["FMEG EBITDA","Loss-making → breakeven (finally)"],["Grid/export mix","Rising — data-centre cable demand new driver"]],
  bs:[["Net debt","Net cash ₹1,300 cr"],["Working capital","~60 days — aluminium-price sensitive"],["Funding","Accruals"]],
  cash:[["CFO trend","₹1,780 → 2,420 → 2,860 cr"],["Cash conversion","93%"],["FCF","Strong; capex light"]],
  narr:[
   {g:"W&C growth", p:"'Industry volume growth 12–15%'", a:"Delivered 16% volume — ahead", s:"Q2 concall vs results filing", st:"ok"},
   {g:"FMEG", p:"'FMEG to be EBITDA-positive through FY27'", a:"Breakeven achieved one year early", s:"Q2 filing, segment note", st:"ok"},
   {g:"Exports", p:"'Exports to double in 3 years'", a:"+34% cumulative in 2 years — on pace", s:"FY26 AR export note", st:"ok"}],
  guide:[["W&C volume growth","12–15%","16% — beating"],["FMEG EBITDA","positive FY27","Achieved early"],["Exports","2× in 3 yrs","On pace"]],
  bull:["Structural grid + DC + renewables cable demand visible in orderbook, not just narrative","Operating-leverage story: every 100 bps of W&C margin ≈ ₹250 cr PAT"],
  bear:["Aluminium pass-through asymmetry — margin risk when prices spike (FY24 precedent in AR)","FMEG breakeven is fragile — one ad-spend cycle away from red"],
 },
};

/* ---------------- RENDER ---------------- */
const $=id=>document.getElementById(id);
function t(){return {1:"p1",2:"p2",3:"p3"}[arguments.callee ? arguments.callee : 0]}
const catCls={"results":"c-results","M&A":"c-ma","management_change":"c-mgmt","fund_raise":"c-fund","credit_rating":"c-ma","dividend":"c-div","insider_trading":"c-mgmt","earnings_call":"c-def","capex":"c-fund","press_release":"c-rout","agm_egm":"c-rout","litigation":"c-ma"};
function chgTxt(c){return (c>0?"+":"")+c.toFixed(1)+"%"}
function chgCls(c){return c>0?"up":c<0?"dn":""}

function annCard(a){
  const tk=PORTFOLIO.find(p=>p.sym===a.sym)||{chg:0};
  return `<div class="card tap" onclick="openAnn(${a.id})">
    <div class="prio"><div class="pbar p${a.p}"></div><div style="flex:1">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="cat ${catCls[a.cat]||'c-def'}">${a.cat.replace(/_/g,' ')}</span>
      <span><span class="tkr">${a.sym}</span> <span class="chg ${chgCls(tk.chg)}">${chgTxt(tk.chg)}</span> <span class="ameta" style="margin-left:6px">${a.h}h ago</span></span>
    </div>
    <div class="ahn">${a.t}</div>
    <div class="asum">${a.sum}</div>
    <div class="ameta" style="margin-top:7px">💡 ${a.why}</div>
    <div class="src">📎 ${a.src}</div>
    </div></div></div>`;
}

function renderFeed(){
  const hours=window.__hours||48;
  const list=ANN.filter(a=>a.h<=hours);
  const hi=list.filter(a=>a.p===1), mid=list.filter(a=>a.p===2), low=list.filter(a=>a.p===3);
  $("feedHigh").innerHTML = hi.length? hi.map(annCard).join("") : `<div class="card" style="color:var(--faint);font-size:13px">Quiet window — nothing material in the last ${hours}h.</div>`;
  $("feedMid").innerHTML = mid.map(annCard).join("");
  const routCount = 14 - Math.max(0, 14-(low.length+ROUTINE.length)) ;
  $("routineToggle").textContent = `▸ ${ROUTINE.length} routine filings collapsed — tap to peek`;
  $("routineList").innerHTML = ROUTINE.map(r=>`<div class="row"><span><span class="tkr" style="font-size:11px">${r[0]}</span> ${r[1]}</span></div>`).join("");
}
function renderAlerts(){
  $("alertFeed").innerHTML = ALERTS.map(al=>`<div class="alert-item" ${al.p===1?'onclick="openAnn(1)" style="cursor:pointer"':""}>
    <div class="ic">${al.ic}</div><div style="flex:1"><div style="font-size:13.5px;font-weight:650">${al.t}</div>
    <div style="font-size:12.5px;color:var(--muted);margin-top:2px">${al.d}</div>
    <div class="mini" style="margin-top:4px">⚙ ${al.meta}</div></div>${al.p===1?'<div style="font-size:16px;color:var(--faint)">›</div>':''}</div>`).join("");
  $("rulesCard").innerHTML = RULES.map((r,i)=>`<div class="toggle">
    <div><div class="t">${r.n}${r.u==="cats"?' <span class="mini">(category watch)</span>':""}</div>
    ${r.u==="cats"?'':`<input type="range" min="1" max="10" value="${r.v}" oninput="RULES[${i}].v=+this.value;renderRules()" style="width:170px"><span class="mini">${r.v}${r.u}</span>`}</div>
    <div class="sw ${r.on?'on':''}" onclick="RULES[${i}].on=!RULES[${i}].on;renderRules()"><i></i></div></div>`).join("");
}
function renderRules(){renderAlerts()}
function renderPF(){
  const totChg = PORTFOLIO.reduce((s,p)=>s+p.chg*p.w,0)/PORTFOLIO.reduce((s,p)=>s+p.w,0);
  $("pfSummary").innerHTML=`<div style="display:flex;justify-content:space-between;align-items:baseline">
    <div><div class="mini">Book value (mock)</div><div style="font-size:24px;font-weight:800">₹1,00,00,000</div></div>
    <div style="text-align:right"><div class="mini">Today (EOD)</div><div class="chg ${chgCls(totChg)}" style="font-size:16px">${chgTxt(totChg)}</div></div></div>
    <div class="spark">${Array.from({length:22},(_,i)=>`<i style="height:${18+Math.sin(i/2.4)*14+((i*37)%13)}%"></i>`).join("")}</div>
    <div class="mini" style="margin-top:5px">Mock portfolio — 18 NSE names across 13 sectors. Swap any ticker in engine/config.py; nothing else is hard-wired.</div>`;
  $("pfList").innerHTML=PORTFOLIO.map(p=>`<div class="pfrow" ${RESEARCH[p.sym]?`onclick="research('${p.sym}')" style="cursor:pointer"`:``}>
    <div class="sym">${p.sym}</div><div class="nm">${p.name} · ${p.sector}</div>
    <div class="px">${p.px.toLocaleString('en-IN')}</div><div class="pc ${chgCls(p.chg)}">${chgTxt(p.chg)}</div></div>`).join("")+`<div class="mini" style="padding:8px 0">Demo research covers the ad-hoc set — the engine itself runs on any NSE ticker (engine/research.py).</div>`;
}

/* ---- Detail views ---- */
function openDetail(title,body){$("dTitle").textContent=title;$("dBody").innerHTML=body;$("detail").classList.add("on");document.body.style.overflow="hidden"}
function closeDetail(){$("detail").classList.remove("on");document.body.style.overflow="";}
function openAnn(id){
  const a=ANN.find(x=>x.id===id);
  let b=`<div class="cat ${catCls[a.cat]||'c-def'}">${a.cat.replace(/_/g,' ')}</div>
  <div class="ahn" style="font-size:17px;margin-top:8px">${a.t}</div>
  <div class="ameta">${a.src}</div>
  <div class="asum" style="font-size:14px;margin-top:10px">${a.sum}</div>
  <div class="note" style="margin-top:12px">💡 <b>Why it matters:</b> ${a.why}</div>`;
  if(a.res){
    b+=`<h2 class="sec">Headline cut — from the filing</h2><div class="card">`;
    b+=`<div class="resgrid">`+a.res.rows.slice(0,4).map(r=>`<div class="metric"><div class="l">${r[0]}</div><div class="v">${r[1]}</div>
      <div class="d up">${r[2]} · ${r[3]}</div></div>`).join("")+`</div>
      <table style="width:100%;font-size:12px;margin-top:10px;border-collapse:collapse">
      <tr style="color:var(--faint);text-align:left"><th style="padding:5px 0">Line</th><th>QoQ</th><th>YoY</th></tr>`+
      a.res.rows.map(r=>`<tr style="border-top:1px solid var(--line)"><td style="padding:6px 0">${r[0]}</td><td class="${chgCls(parseFloat(r[2]))}">${r[2]}</td><td class="${chgCls(parseFloat(r[3]))}">${r[3]}</td></tr>`).join("")+
      `</table><div class="note" style="margin-top:10px">${a.res.note}</div><div class="src">📎 ${a.src} — Revenue/EBITDA/PBT/PAT defined per reference glossary; QoQ = vs prior quarter, YoY = vs same quarter last year.</div></div>`;
  }
  if(a.bio){
    b+=`<h2 class="sec">Who's coming in</h2><div class="biov"><div class="nm">${a.bio.nm}</div><div class="rl">${a.bio.rl}</div><p>${a.bio.p}</p><div class="src" style="margin-top:6px">${a.bio.src2}</div></div>`;
  }
  b+=`<h2 class="sec">Grounding</h2><div class="card"><div class="kv"><span class="k">Source document</span><span class="v">NSE/BSE filing (primary)</span></div>
  <div class="kv"><span class="k">Classification</span><span class="v">${a.cat}</span></div>
  <div class="kv"><span class="k">Extracted by</span><span class="v">cheap-model extraction (cached)</span></div>
  <div class="kv"><span class="k">Summarised by</span><span class="v">reasoning model — 1 call</span></div></div>
  <div class="note">Full filing PDF opens in the external viewer in the deployed build (NSE CDN link).</div>`;
  openDetail(a.sym+" · "+a.cat.replace(/_/g,' '),b);
}
function research(sym){
  const R=RESEARCH[sym];
  if(!R){toast(`FINN engine runs on any NSE ticker. “${sym}” isn't pre-crawled in this demo — demo set: ${ADHOC.join(", ")}.`);return}
  let b=`<div class="mini">Grounded in annual report + concall transcripts only. Every claim cites its source line.</div>`;
  b+=`<h2 class="sec">Business snapshot</h2><div class="card"><p style="font-size:13.5px">${R.snap.desc}</p>
    ${R.snap.seg.map(s=>`<div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:12px"><span>${s[0]}</span><b>${s[1]}%</b></div><div class="bar"><i style="width:${s[1]*1.3}%"></i></div></div>`).join("")}</div>`;
  b+=`<h2 class="sec">Financial snapshot</h2><div class="card">${R.fin.map(f=>`<div class="kv"><span class="k">${f[0]}</span><span class="v">${f[1]}</span></div>`).join("")}</div>`;
  b+=`<h2 class="sec">Trajectory</h2><div class="card">${R.traj.map(t2=>`<div class="kv"><span class="k">${t2[0]}</span><span class="v up">${t2[1]} <span style="font-weight:500;color:var(--faint)">${t2[2]}</span></span></div>`).join("")}</div>`;
  b+=`<h2 class="sec">Balance sheet & cash</h2><div class="card">${R.bs.map(x=>`<div class="kv"><span class="k">${x[0]}</span><span class="v">${x[1]}</span></div>`).join("")}</div>
  <div class="card">${R.cash.map(x=>`<div class="kv"><span class="k">${x[0]}</span><span class="v">${x[1]}</span></div>`).join("")}</div>`;
  b+=`<h2 class="sec">Narrative vs numbers</h2><div class="mini" style="margin-bottom:8px">What management promised vs what actually landed — primary sources only.</div>`;
  b+=R.narr.map(n=>`<div class="narr-row ${n.st}"><div class="g">${n.g}</div><div class="p">“${n.p}”</div><div class="a">Delivered: ${n.a}</div><div class="quote">${n.s}</div></div>`).join("");
  b+=`<h2 class="sec">Guidance tracker</h2><div class="card">${R.guide.map(g=>`<div class="kv"><span class="k">${g[0]}<div class="mini">guided: ${g[1]}</div></span><span class="v" style="max-width:55%">${g[2]}</span></div>`).join("")}</div>`;
  b+=`<h2 class="sec">Bull vs bear</h2><div class="vs"><div class="b bull"><h4>🐂 Bull</h4><ul>${R.bull.map(x=>`<li>${x}</li>`).join("")}</ul></div>
  <div class="b bear"><h4>🐻 Bear</h4><ul>${R.bear.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>
  <div class="note" style="margin-top:12px">Engine note: this view regenerates for any NSE ticker — extraction (cheap model, chunked over AR sections + transcripts) → synthesis (reasoning model, one pass). No news, no broker notes, no model priors.</div>`;
  openDetail(sym+" — research",b);
}

/* ---- Interaction ---- */
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t.__t);t.__t=setTimeout(()=>t.classList.remove("on"),2600)}
document.querySelectorAll(".tab").forEach(tb=>tb.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("on"));tb.classList.add("on");
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("on"));$(tb.dataset.v).classList.add("on");
});
$("periodSeg").querySelectorAll("button").forEach(b=>b.onclick=()=>{
  $("periodSeg").querySelectorAll("button").forEach(x=>x.classList.remove("on"));b.classList.add("on");
  window.__hours=+b.dataset.h;renderFeed();
  toast(b.dataset.h==="168"?"7-day window — 4 material, 2 glance, 9 routine":"Showing last "+b.dataset.h+"h — "+ANN.filter(a=>a.h<=+b.dataset.h).length+" filings, prioritised");
});
$("routineToggle").onclick=()=>{const l=$("routineList");const open=l.style.display!=="none";
  l.style.display=open?"none":"block";$("routineToggle").textContent=(open?"▸ ":"▾ ")+ROUTINE.length+" routine filings collapsed — tap to peek"};
$("resChips").innerHTML=RESEARCH[Object.keys(RESEARCH)[0]]?Object.keys(RESEARCH).map(s=>`<div class="chip" onclick="research('${s}')">${s}</div>`).join(""):"";
$("resChips2").innerHTML=ADHOC.filter(s=>RESEARCH[s]).map(s=>`<div class="chip" onclick="research('${s}')">${s}</div>`).join("")+ADHOC.filter(s=>!RESEARCH[s]).map(s=>`<div class="chip" onclick="toast('Not pre-crawled in this demo — engine generalises to any ticker.')">${s}</div>`).join("");
$("resInput").addEventListener("change",e=>research(e.target.value.trim().toUpperCase().replace(/\.NS$/,"")));
$("askInput").onclick=()=>{toast("Push already told you what matters — pull-mode search lives in the Research tab.")};
const ASKS=["DIXON results cut","TRENT narrative vs numbers","Who is the new TATAPOWER CFO?","Why did AARTIIND drop 2.3%?"];
$("askChips").innerHTML=ASKS.map(a=>`<div class="chip" onclick="toast('${a}: routed to '+(${JSON.stringify(a)}.includes('CFO')?'the push card — already in your feed':'the research engine'))">${a}</div>`).join("");

$("dateLine").textContent="Mon, 3 Nov 2026";
renderFeed();renderAlerts();renderPF();
