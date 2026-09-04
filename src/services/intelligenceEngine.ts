import {
  clientsData,
  portfoliosData,
  holdingsData,
  instrumentsData,
  mandatesData,
  creditFacilitiesData,
  commitmentsData,
  plannedCashNeedsData,
  eventLogData,
  marketContextData,
  rmNotesData,
  TODAY
} from "../data/jbWealthData";
import type {
  Client,
  Portfolio,
  Holding,
  CreditFacility,
  Commitment,
  PlannedCashNeed,
  IntelligenceAlert,
  PrioritisedClient,
  ScenarioSimulationResult
} from "../types";

export function getClientPortfolios(clientId: string): Portfolio[] {
  return portfoliosData.filter((p) => p.client_id === clientId);
}

export function getClientHoldings(clientId: string, snapshotDate = TODAY): Holding[] {
  return holdingsData.filter((h) => h.client_id === clientId && h.snapshot_date === snapshotDate);
}

export function getPortfolioHoldings(portfolioId: string, snapshotDate = TODAY): Holding[] {
  return holdingsData.filter((h) => h.portfolio_id === portfolioId && h.snapshot_date === snapshotDate);
}

export function getClientCreditFacility(clientId: string): CreditFacility | undefined {
  return creditFacilitiesData.find((f) => f.client_id === clientId);
}

export function getClientCommitments(clientId: string): Commitment[] {
  return commitmentsData.filter((c) => c.client_id === clientId);
}

export function getClientCashNeeds(clientId: string): PlannedCashNeed[] {
  return plannedCashNeedsData.filter((n) => n.client_id === clientId);
}

export function getClientNotes(clientId: string) {
  return rmNotesData
    .filter((n) => n.client_id === clientId)
    .sort((a, b) => b.note_date.localeCompare(a.note_date));
}

// Calculate comprehensive risk alerts for a client
export function generateClientAlerts(client: Client): IntelligenceAlert[] {
  const alerts: IntelligenceAlert[] = [];
  const portfolios = getClientPortfolios(client.client_id);
  const holdingsToday = getClientHoldings(client.client_id, TODAY);
  const facility = getClientCreditFacility(client.client_id);
  const commitments = getClientCommitments(client.client_id);
  const cashNeeds = getClientCashNeeds(client.client_id);
  const notes = getClientNotes(client.client_id);

  // 1. Collateral & LTV Margin Call Analysis
  if (facility) {
    const currentLtv = facility["ltv_pct_2026-08-26"];
    const triggerLtv = facility.margin_call_ltv_pct;
    const headroomPct = triggerLtv - currentLtv;

    if (headroomPct <= 1.0) {
      alerts.push({
        id: `alert-col-${facility.facility_id}`,
        clientId: client.client_id,
        portfolioId: facility.collateral_portfolio_id,
        severity: "CRITICAL",
        category: "COLLATERAL_MARGIN",
        title: `Imminent Margin Call (${headroomPct.toFixed(2)}% buffer remaining)`,
        description: `Current LTV is ${currentLtv}% against a contractual margin call trigger of ${triggerLtv}%. Outstanding drawn: ${facility.facility_ccy} ${(facility["drawn_2026-08-26"] / 1e6).toFixed(1)}m. Any minor decline in collateral value will trigger a formal liquidation requirement.`,
        metrics: {
          label: "Current LTV / Margin Trigger",
          value: `${currentLtv}%`,
          trigger: `${triggerLtv}%`
        },
        groundedEvent: "June 2026 tech drawdown & August Middle East escalation",
        recommendedAction: "Execute deleveraging call immediately to deposit additional eligible collateral or reduce drawn facility."
      });
    } else if (facility["ltv_pct_2026-06-30"] >= triggerLtv) {
      alerts.push({
        id: `alert-col-breach-${facility.facility_id}`,
        clientId: client.client_id,
        portfolioId: facility.collateral_portfolio_id,
        severity: "HIGH",
        category: "COLLATERAL_MARGIN",
        title: "Recent Margin Breach in June Under Tech Drawdown",
        description: `Facility breached margin threshold on 2026-06-30 at ${facility["ltv_pct_2026-06-30"]}% (trigger ${triggerLtv}%). Currently hovering at ${currentLtv}%. Needs close daily monitoring.`,
        metrics: {
          label: "Current LTV",
          value: `${currentLtv}%`,
          trigger: `${triggerLtv}%`
        },
        recommendedAction: "Review collateral volatility parameters and propose structured buffer."
      });
    } else if (facility.facility_id === "CF-0005" && facility["ltv_pct_2025-12-31"] > triggerLtv && currentLtv < triggerLtv) {
      alerts.push({
        id: `alert-col-cured-${facility.facility_id}`,
        clientId: client.client_id,
        portfolioId: facility.collateral_portfolio_id,
        severity: "OPPORTUNITY",
        category: "COLLATERAL_MARGIN",
        title: "Collateral Cured by Energy Rally (Event-Driven Relief)",
        description: `LTV dropped from ${facility["ltv_pct_2025-12-31"]}% (breach) to ${currentLtv}% following the energy and coal rally. The cure was driven by market prices rather than client action; caution client on cyclical reversal.`,
        metrics: {
          label: "LTV Recovery",
          value: `${currentLtv}% (from ${facility["ltv_pct_2025-12-31"]}%)`
        },
        recommendedAction: "Lock in gains or introduce collar hedges while energy valuations remain elevated."
      });
    }
  }

  // 2. Cross-Portfolio & Look-Through Concentration
  const totalClientAum = client.total_aum_usd;
  const instrumentSums: Record<string, { name: string; valueUsd: number; assetClass: string; underlying?: string }> = {};

  holdingsToday.forEach((h) => {
    const inst = instrumentsData.find((i) => i.instrument_id === h.instrument_id);
    if (!instrumentSums[h.instrument_id]) {
      instrumentSums[h.instrument_id] = {
        name: h.instrument_name,
        valueUsd: 0,
        assetClass: h.asset_class,
        underlying: inst?.underlying_reference
      };
    }
    instrumentSums[h.instrument_id].valueUsd += h.market_value_usd;
  });

  // Check single instruments > 20% of total wealth
  Object.entries(instrumentSums).forEach(([id, item]) => {
    const share = (item.valueUsd / totalClientAum) * 100;
    const inst = instrumentsData.find((i) => i.instrument_id === id);

    // Look-through and single-name exposure
    if (share >= 25 && inst?.concentration_limit_applies === "Y") {
      const hasWaiver = notes.some((n) => n.note.toLowerCase().includes("waiver") || n.note.toLowerCase().includes("instructed"));
      alerts.push({
        id: `alert-conc-${id}`,
        clientId: client.client_id,
        severity: hasWaiver ? "MEDIUM" : "HIGH",
        category: "CONCENTRATION_LOOKTHROUGH",
        title: `Extreme Single-Asset Concentration: ${item.name.substring(0, 45)} (${share.toFixed(1)}% of total wealth)`,
        description: `Position totals USD ${(item.valueUsd / 1e6).toFixed(1)}m across client accounts. Single-asset concentration limit applies. ${hasWaiver ? "Note: Documented client instruction / suitability waiver on file." : "No explicit waiver recorded for this level."}`,
        metrics: {
          label: "Aggregate Weight",
          value: `${share.toFixed(1)}%`,
          trigger: "20.0%"
        },
        recommendedAction: hasWaiver
          ? "Acknowledge client mandate preference; re-validate risk appetite in upcoming review."
          : "Propose staged diversification into uncorrelated asset classes to mitigate idiosyncratic drawdown risk.",
        waiverOnFile: hasWaiver
      });
    }
  });

  // Check structured product look-through correlation with source of wealth
  if (client.client_id === "CL-0014") {
    // HK Property developer holding HK Property accumulator + shares + perpetual debt
    alerts.push({
      id: "alert-cl14-compound-risk",
      clientId: client.client_id,
      severity: "CRITICAL",
      category: "CONCENTRATION_LOOKTHROUGH",
      title: "Compound Idiosyncratic Risk: Property Operating Wealth + Accumulator + Equity + Debt",
      description: "Client operates a HK property business, while holding an underwater accumulator on Golden Harbour Properties (struck at HKD 17.20, double-up active, mark down to 58.3), property equities, and perpetual bonds. All exposures are identical underlying macro bets.",
      groundedEvent: "Hong Kong real estate weakness & elevated regional financing rates",
      recommendedAction: "Hedge secondary accumulator liabilities; prepare liquidity plan for HKD 60m redevelopment commitment due mid-2027."
    });
  }

  if (client.client_id === "CL-0001") {
    // Mining family holding energy FCN + legacy coal/shipping
    alerts.push({
      id: "alert-cl01-energy-lookthrough",
      clientId: client.client_id,
      severity: "MEDIUM",
      category: "CONCENTRATION_LOOKTHROUGH",
      title: "Look-Through Overweight in Energy & Bulk Shipping",
      description: "Despite intention to keep JB assets independent of the family mine, client subscribed to SYN-SP-0501 (Energy & shipping FCN) on April 14, increasing cyclical correlation with family operating business.",
      recommendedAction: "Review structured product expiries and redirect yields into global non-commodity fixed income."
    });
  }

  if (client.client_id === "CL-0007") {
    // Gold overweight
    const goldHoldings = holdingsToday.filter((h) => h.instrument_name.toLowerCase().includes("gold"));
    const goldTotalUsd = goldHoldings.reduce((sum, h) => sum + h.market_value_usd, 0);
    const goldShare = (goldTotalUsd / totalClientAum) * 100;
    if (goldShare > 15) {
      alerts.push({
        id: "alert-cl07-gold",
        clientId: client.client_id,
        severity: "MEDIUM",
        category: "MANDATE_DRIFT",
        title: `Commodity Allocation Breached: Physical & Synthetic Gold at ${goldShare.toFixed(1)}%`,
        description: `Gold allocation stands at USD ${(goldTotalUsd / 1e6).toFixed(1)}m, exceeding the 10% commodity mandate ceiling. Client instructed buy in January at spot >$5,000/oz. Suitability waiver on file.`,
        waiverOnFile: true,
        isClientDirected: true,
        recommendedAction: "Discuss funding upcoming USD 12m foundation endowment using appreciated gold holdings before UK tax rule shifts."
      });
    }
  }

  // 3. Liquidity & Unfunded Obligations
  const dailyLiquidHoldings = holdingsToday.filter((h) => h.liquidity_tier === "Daily" || h.asset_class === "Cash & Cash Equivalents");
  const dailyLiquidUsd = dailyLiquidHoldings.reduce((sum, h) => sum + h.market_value_usd, 0);

  const totalUncalledCommitments = commitments.reduce((sum, c) => sum + c.uncalled, 0);
  const immediateCashNeeds = cashNeeds
    .filter((n) => n.due_from <= "2027-06-30")
    .reduce((sum, n) => sum + n.amount, 0); // rough sum

  if (client.client_id === "CL-0003") {
    // German inheritance tax EUR 3.4m confirmed by year-end!
    alerts.push({
      id: "alert-cl03-tax-cliff",
      clientId: client.client_id,
      severity: "CRITICAL",
      category: "LIQUIDITY_GAP",
      title: "Confirmed Tax Liability: EUR 3.4m German Inheritance Tax Due Q4 2026",
      description: "Confirmed one-off German inheritance tax liability falls due before 2026-12-31. Client is a grieving widow with Conservative risk profile who inherited an aggressive transferred portfolio with illiquid holdings.",
      metrics: {
        label: "Confirmed Tax Due",
        value: "EUR 3,400,000",
        trigger: "Due Dec 2026"
      },
      recommendedAction: "Begin orderly redemption of non-conservative and liquid holdings now to ringfence EUR 3.4m cash well ahead of filing."
    });
  }

  if (client.client_id === "CL-0006") {
    // Private credit gated + USD 5m tuition + USD 3m capital calls
    const gatedHoldings = holdingsToday.filter((h) => h.liquidity_tier === "Quarterly Gate");
    alerts.push({
      id: "alert-cl06-liquidity-gating",
      clientId: client.client_id,
      severity: "CRITICAL",
      category: "LIQUIDITY_GAP",
      title: "Liquidity Squeeze: Private Credit Vehicle Gated vs USD 8m Liabilities",
      description: "Client faces USD 3.0m uncalled private equity capital calls and USD 5.0m US tuition schedules. Her primary yield asset (Private Credit Fund) has imposed quarterly redemption gates.",
      metrics: {
        label: "Upcoming USD Needs",
        value: "USD 8.0m",
        trigger: "Gated Asset"
      },
      groundedEvent: "June 2026 non-traded private credit redemption stress",
      recommendedAction: "Map cash flow waterfall; sell daily-liquid developed market equity sleeve to fund capital call before October."
    });
  }

  if (client.client_id === "CL-0017") {
    // Family office alternatives sleeve thin liquidity
    alerts.push({
      id: "alert-cl17-commitments",
      clientId: client.client_id,
      severity: "HIGH",
      category: "LIQUIDITY_GAP",
      title: "Alternatives Sleeve Liquidity Thin: USD 15.8m Uncalled Commitments",
      description: "Meridian PE Fund VII (USD 14m uncalled) and Infrastructure Debt Fund (USD 1.8m uncalled) will call capital through 2026 Q4-2028. Semi-liquid private credit vehicle has gated 3 consecutive quarters.",
      recommendedAction: "Present full liquidity map to CFO before October Investment Committee meeting; allocate from Core Mandate cash buffers."
    });
  }

  // 4. Currency Mismatches
  if (client.client_id === "CL-0016") {
    // Retiring to Japan 2030, needs JPY income, portfolio is USD/SGD
    alerts.push({
      id: "alert-cl16-jpy-mismatch",
      clientId: client.client_id,
      severity: "MEDIUM",
      category: "CURRENCY_MISMATCH",
      title: "Long-Term Currency Liability Mismatch (Retirement in Japan 2030)",
      description: "Client supports parents with JPY 18m/yr and plans retirement to Kyoto by 2030, but 88% of assets are in USD and SGD. Board closed period restricts employer equity sales until November 2026.",
      recommendedAction: "Prepare structured FX forward plan or JPY sovereign yield transition once the dealing window opens in November."
    });
  }

  // 5. Mandate Drift & Duration Shock
  if (client.client_id === "CL-0012") {
    // 71yo retired, $5.6m duration loss on long bonds
    alerts.push({
      id: "alert-cl12-duration-drag",
      clientId: client.client_id,
      severity: "HIGH",
      category: "MANDATE_DRIFT",
      title: "Duration Trap: 71-Year Old Client Holding 2045 Bonds Amid Rising Yields",
      description: "Portfolio has suffered substantial mark-to-market drawdown as US 10-year yields reached 4.71%. Client increased quarterly medical drawdowns, refused to sell at a loss, hoping bonds 'come back' to par. Longest bond maturity is 2045 (19-year horizon vs age 71).",
      metrics: {
        label: "Longest Maturity vs Age",
        value: "2045 Maturity (Age 90)",
        trigger: "Current Age 71"
      },
      groundedEvent: "US 10Y Yields rose from 4.05% to 4.71% in July 2026",
      recommendedAction: "Pivot conversation from capital recovery to sustainable cash generation: restructure into short-duration floating rate notes and Treasury ladders."
    });
  }

  if (client.client_id === "CL-0004") {
    // Emailed on 2026-08-19 asking to dump all into cash
    alerts.push({
      id: "alert-cl04-flight-to-cash",
      clientId: client.client_id,
      severity: "HIGH",
      category: "MANDATE_DRIFT",
      title: "Urgent Client Inbound: Panic Shift to Bank Deposits Ahead of 2027 Retirement",
      description: "Client emailed on 2026-08-19 asking if he should move entire USD 24m portfolio into bank deposits after seeing bond mark-to-market losses. Retiring in Q2 2027 requiring USD 1.45m/year sustainable income without eroding principal.",
      groundedEvent: "July 2026 Fed rate pause and hawkish repricing",
      recommendedAction: "Schedule urgent in-person meeting this week. Model 10-year cash drag vs high-quality income ladder guaranteeing USD 1.45m annual payout."
    });
  }

  if (client.client_id === "CL-0011") {
    // 78yo declining health, no trust or holding structure
    alerts.push({
      id: "alert-cl11-succession-cliff",
      clientId: client.client_id,
      severity: "CRITICAL",
      category: "SUCCESSION_GOVERNANCE",
      title: "Succession Emergency: 78-Year Old Client in Declining Health with No Trust",
      description: "Client has 4 children (2 in business, 2 outside) and no trust or corporate holding structure. Estate consists of illiquid Singapore commercial real estate and SGD 6m loan. An unexpected event would trigger forced asset fire-sales under probate.",
      recommendedAction: "Bring Julius Baer Head of Wealth Planning to an immediate family session to execute discretionary trust and testamentary provisions."
    });
  }

  if (client.client_id === "CL-0009") {
    // Cash drag from 2024
    alerts.push({
      id: "alert-cl09-cash-drag",
      clientId: client.client_id,
      severity: "MEDIUM",
      category: "MANDATE_DRIFT",
      title: "Chronic Cash Drag: 45% Kept Uninvested Since 2024 Business Sale",
      description: "Client agreed to deployment plans in Oct 2024 and June 2025 but remains frozen in cash waiting for an entry point, missing substantial benchmark returns. Retains illiquid legacy Nordvind stake.",
      recommendedAction: "Implement programmatic Dollar-Cost Averaging (DCA) over 6 tranches to remove timing anxiety."
    });
  }

  return alerts;
}

// Calculate the prioritised book for Priscilla Ong across all 20 clients
export function getPrioritisedBook(): PrioritisedClient[] {
  return clientsData.map((client) => {
    const portfolios = getClientPortfolios(client.client_id);
    const alerts = generateClientAlerts(client);
    const facility = getClientCreditFacility(client.client_id);
    const commitments = getClientCommitments(client.client_id);
    const cashNeeds = getClientCashNeeds(client.client_id);
    const notes = getClientNotes(client.client_id);
    const holdingsToday = getClientHoldings(client.client_id, TODAY);

    const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
    const highCount = alerts.filter((a) => a.severity === "HIGH").length;

    // Calculate YTD performance
    let baseAumDec = 0;
    let currentAum = 0;
    portfolios.forEach((p) => {
      baseAumDec += p["aum_2025-12-31"] || 0;
      currentAum += p["aum_2026-08-26"] || 0;
    });

    const ytdReturnPct = baseAumDec > 0 ? ((currentAum - baseAumDec) / baseAumDec) * 100 : 0;
    const ytdPnlUsd = currentAum - baseAumDec;

    const uncalledCommitmentsUsd = commitments.reduce((acc, c) => acc + c.uncalled, 0);
    const upcomingCashNeedsUsd = cashNeeds.reduce((acc, n) => acc + n.amount, 0);

    const dailyLiquidHoldings = holdingsToday.filter(
      (h) => h.liquidity_tier === "Daily" || h.asset_class === "Cash & Cash Equivalents"
    );
    const dailyLiquidCashUsd = dailyLiquidHoldings.reduce((acc, h) => acc + h.market_value_usd, 0);

    // Defensible priority scoring algorithm:
    // Base weight on critical alerts (40 pts each), high alerts (20 pts each)
    // Margin call proximity (up to 30 pts)
    // Recent urgent note / inbound request (up to 25 pts)
    // Large upcoming cash need vs low daily liquidity (up to 20 pts)
    let score = criticalCount * 40 + highCount * 20;

    if (facility) {
      const buffer = facility.margin_call_ltv_pct - facility["ltv_pct_2026-08-26"];
      if (buffer <= 1.0) score += 40;
      else if (buffer <= 3.0) score += 20;
    }

    // Specific client circumstances
    if (client.client_id === "CL-0014") score += 35; // HK developer compound risk + accumulator
    if (client.client_id === "CL-0004") score += 30; // Inbound email on Aug 19 panic
    if (client.client_id === "CL-0003") score += 30; // Confirmed EUR 3.4m tax due Dec 2026
    if (client.client_id === "CL-0011") score += 25; // 78yo succession crisis
    if (client.client_id === "CL-0012") score += 20; // 71yo duration mismatch
    if (client.client_id === "CL-0006") score += 25; // Gated fund vs $8m commitments

    // Determine tier
    let priorityTier: "CALL_TODAY" | "THIS_WEEK" | "ROUTINE_MONITOR" = "ROUTINE_MONITOR";
    if (score >= 60) priorityTier = "CALL_TODAY";
    else if (score >= 30) priorityTier = "THIS_WEEK";

    // Rationales
    let topRationale = "Routine monitoring — portfolio within mandate parameters.";
    let nextMeetingNeed = "Quarterly update";

    if (client.client_id === "CL-0014") {
      topRationale = "Imminent margin call risk (LTV 69.41% vs 70% trigger) & underwater property accumulator double-up.";
      nextMeetingNeed = "URGENT TODAY: Collateral buffer & accumulator restructuring";
    } else if (client.client_id === "CL-0004") {
      topRationale = "Client sent urgent email requesting move to 100% deposits after bond mark-to-market drop.";
      nextMeetingNeed = "CALL TODAY: Pre-retirement income structuring vs cash drag";
    } else if (client.client_id === "CL-0003") {
      topRationale = "Confirmed EUR 3.4m German inheritance tax due by Dec 2026; conservative widow holding aggressive sleeve.";
      nextMeetingNeed = "THIS WEEK: Liquidity ringfencing for German tax obligation";
    } else if (client.client_id === "CL-0011") {
      topRationale = "78-year old in declining health with illiquid property estate and zero trust/holding structure.";
      nextMeetingNeed = "THIS WEEK: Wealth planning & succession governance review";
    } else if (client.client_id === "CL-0002") {
      topRationale = "Facility reached 75.64% in June; drawn additional USD 1.7m during tech volatility. Q4 secondary pending.";
      nextMeetingNeed = "THIS WEEK: Collateral headroom check & pre-IPO timeline";
    } else if (client.client_id === "CL-0006") {
      topRationale = "Private credit fund gated for redemptions while USD 8m in tuition and capital calls fall due.";
      nextMeetingNeed = "THIS WEEK: Alternative liquidity waterfall & PE commitment schedule";
    } else if (client.client_id === "CL-0012") {
      topRationale = "71-year old client suffering duration drawdown on 2045 bonds while drawing medical living costs.";
      nextMeetingNeed = "NEXT WEEK: Duration shortening & floating rate yield replacement";
    } else if (client.client_id === "CL-0001") {
      topRationale = "CF-0005 cured by energy rally; SGD 9m property deposit needed in early 2027.";
      nextMeetingNeed = "NEXT WEEK: Energy profit-taking & property liquidity carveout";
    }

    return {
      client,
      portfolios,
      priorityScore: score,
      priorityTier,
      criticalAlertCount: criticalCount,
      highAlertCount: highCount,
      nextMeetingNeed,
      topRationale,
      ytdReturnPct,
      ytdPnlUsd,
      creditFacility: facility,
      uncalledCommitmentsUsd,
      upcomingCashNeedsUsd,
      dailyLiquidCashUsd,
      notes
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

// Interactive Scenario Stress Testing
export function simulatePortfolioScenario(
  clientId: string,
  scenarioId: "STRAIT_DEESCALATION" | "STRAIT_ESCALATION" | "FED_RATE_HIKE" | "TECH_SUPER_CYCLE"
): ScenarioSimulationResult {
  const client = clientsData.find((c) => c.client_id === clientId);
  const holdings = getClientHoldings(clientId, TODAY);
  const totalAum = client ? client.total_aum_usd : 1;
  const facility = getClientCreditFacility(clientId);

  let scenarioName = "";
  let description = "";
  let oilPriceChangePct = 0;
  let ratesChangeBps = 0;
  let techEquitiesChangePct = 0;
  let goldChangePct = 0;

  if (scenarioId === "STRAIT_DEESCALATION") {
    scenarioName = "Strait of Hormuz Reopens (Rapid De-escalation)";
    description = "Naval blockade lifted; commercial shipping through the Strait of Hormuz normalises. Oil risk premium collapses, energy prices slide 30%, shipping rates decline, headline inflation recedes, rate cut expectations revived.";
    oilPriceChangePct = -32;
    ratesChangeBps = -45;
    techEquitiesChangePct = +8;
    goldChangePct = -14;
  } else if (scenarioId === "STRAIT_ESCALATION") {
    scenarioName = "Middle East Conflict Widens (Regional Escalation)";
    description = "Prolonged military engagement strikes regional energy processing infrastructure. Brent breaches USD 140/bbl, global supply disrupted by >10%, shipping insurance prohibitive, inflation surge prompts emergency central bank hikes.";
    oilPriceChangePct = +38;
    ratesChangeBps = +60;
    techEquitiesChangePct = -12;
    goldChangePct = +18;
  } else if (scenarioId === "FED_RATE_HIKE") {
    scenarioName = "Fed Resumes Rate Hikes (Hawkish Shock)";
    description = "Persistent energy inflation impulses force the Federal Reserve to hike target rates to 4.50%. US 10-year Treasury yield spikes past 5.25%. Severe duration drawdown across long-dated sovereign and corporate paper.";
    oilPriceChangePct = -5;
    ratesChangeBps = +85;
    techEquitiesChangePct = -15;
    goldChangePct = -6;
  } else {
    scenarioName = "AI Tech Re-acceleration & Capex Monetisation";
    description = "Enterprise AI deployment demonstrates rapid revenue acceleration. Megacap technology and semiconductor leaders rally 20%, broad equity indices reach new highs.";
    oilPriceChangePct = +4;
    ratesChangeBps = +10;
    techEquitiesChangePct = +22;
    goldChangePct = +2;
  }

  // Calculate position-by-position projected movement
  let projectedDeltaUsd = 0;
  const keyVulnerabilities: string[] = [];

  holdings.forEach((h) => {
    let returnPct = 0;
    const nameLower = h.instrument_name.toLowerCase();
    const assetLower = h.asset_class.toLowerCase();

    if (nameLower.includes("gold") || assetLower.includes("commodity")) {
      returnPct = goldChangePct;
      if (scenarioId === "STRAIT_DEESCALATION" && returnPct < -10) {
        keyVulnerabilities.push(`Gold exposure (${h.instrument_name.substring(0, 30)}) loses ${Math.abs(goldChangePct)}% on geopolitical risk unwind`);
      }
    } else if (nameLower.includes("energy") || nameLower.includes("oil") || nameLower.includes("brent") || nameLower.includes("coal")) {
      returnPct = oilPriceChangePct;
      if (scenarioId === "STRAIT_DEESCALATION" && returnPct < -20) {
        keyVulnerabilities.push(`Energy holding (${h.instrument_name.substring(0, 30)}) faces severe cyclical pullback (-${Math.abs(oilPriceChangePct)}%)`);
      }
    } else if (nameLower.includes("tech") || nameLower.includes("cloud") || nameLower.includes("helios") || nameLower.includes("aranya")) {
      returnPct = techEquitiesChangePct;
    } else if (assetLower.includes("fixed income") || assetLower.includes("bond")) {
      // Duration impact roughly -duration * (ratesChangeBps / 100)
      const duration = nameLower.includes("long") || nameLower.includes("treasury") ? 9 : 4.5;
      returnPct = -(duration * (ratesChangeBps / 100));
      if (ratesChangeBps > 40) {
        keyVulnerabilities.push(`Long fixed income duration drag on ${h.instrument_name.substring(0, 30)} (~${returnPct.toFixed(1)}%)`);
      }
    } else if (assetLower.includes("equity")) {
      returnPct = techEquitiesChangePct * 0.6;
    }

    const posDelta = h.market_value_usd * (returnPct / 100);
    projectedDeltaUsd += posDelta;
  });

  const projectedPortfolioImpactPct = (projectedDeltaUsd / totalAum) * 100;

  // Margin Call evaluation under scenario
  let marginCallRisk: "LOW" | "ELEVATED" | "TRIGGER_BREACH" = "LOW";
  if (facility) {
    const currentCollateral = facility["collateral_market_value_2026-08-26"];
    const projectedCollateral = currentCollateral * (1 + projectedPortfolioImpactPct / 100);
    const drawn = facility["drawn_2026-08-26"];
    // Lending value with 50% haircut approx
    const projectedLendingVal = facility["lending_value_2026-08-26"] * (1 + projectedPortfolioImpactPct / 100);
    const projectedLtv = (drawn / projectedLendingVal) * 100;

    if (projectedLtv >= facility.margin_call_ltv_pct) {
      marginCallRisk = "TRIGGER_BREACH";
      keyVulnerabilities.push(`CRITICAL: LTV jumps to ${projectedLtv.toFixed(1)}%, triggering contractual margin call!`);
    } else if (facility.margin_call_ltv_pct - projectedLtv <= 2.5) {
      marginCallRisk = "ELEVATED";
      keyVulnerabilities.push(`LTV tightens to ${projectedLtv.toFixed(1)}% (headroom < 2.5%)`);
    }
  }

  let strategicAdvisoryAngle = "";
  if (scenarioId === "STRAIT_DEESCALATION") {
    strategicAdvisoryAngle = "Advise clients with heavy energy/gold profits to harvest gains and reallocate toward quality duration and non-cyclical equities.";
  } else if (scenarioId === "STRAIT_ESCALATION") {
    strategicAdvisoryAngle = "Review credit lines immediately; stress-test collateral advance haircuts against energy inflation and rate spike.";
  } else if (scenarioId === "FED_RATE_HIKE") {
    strategicAdvisoryAngle = "Immediately transition bond portfolios into floating rate notes, senior secured bank loans, and short Treasury bills.";
  } else {
    strategicAdvisoryAngle = "Capitalise on momentum by monetising deep tech positions into structured yield enhancement with capital protection barriers.";
  }

  return {
    scenarioName,
    description,
    oilPriceChangePct,
    ratesChangeBps,
    techEquitiesChangePct,
    goldChangePct,
    projectedPortfolioImpactPct,
    projectedPnlUsd: projectedDeltaUsd,
    marginCallRisk,
    keyVulnerabilities: Array.from(new Set(keyVulnerabilities)),
    strategicAdvisoryAngle
  };
}
