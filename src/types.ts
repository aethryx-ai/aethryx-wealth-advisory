export type SnapshotDate = "2025-12-31" | "2026-02-27" | "2026-03-31" | "2026-06-30" | "2026-08-26";

export interface Client {
  client_id: string;
  client_name: string;
  age: number | string;
  gender: string;
  nationality: string;
  country_of_residence: string;
  tax_domicile: string;
  booking_centre: string; // Singapore or Hong Kong
  rm_id: string;
  rm_name: string;
  rm_desk: string;
  base_currency: string;
  wealth_band: "HNW" | "UHNW";
  total_aum_usd: number;
  life_stage: string;
  source_of_wealth: string;
  risk_profile: string; // Conservative, Moderate, Balanced, Growth, Aggressive
  risk_tolerance_score: number; // 1 to 10
  investment_horizon_years: number;
  liquidity_needs: "Low" | "Medium" | "High";
  objectives: string;
  kyc_review_due: string;
  client_since?: string;
  pep_status?: string;
  reporting_language?: string;
}

export interface Portfolio {
  portfolio_id: string;
  client_id: string;
  portfolio_name: string;
  mandate_code: string;
  mandate_name: string;
  service_model: "Discretionary" | "Advisory" | "Custody";
  base_currency: string;
  inception_date: string;
  benchmark: string;
  "aum_2025-12-31": number;
  "aum_2026-02-27": number;
  "aum_2026-03-31": number;
  "aum_2026-06-30": number;
  "aum_2026-08-26": number;
  aum_usd_current: number;
}

export interface Holding {
  snapshot_date: SnapshotDate;
  portfolio_id: string;
  client_id: string;
  instrument_id: string;
  instrument_name: string;
  asset_class: string;
  sub_asset_class?: string;
  sector?: string;
  region?: string;
  portfolio_ccy?: string;
  acquired_date?: string;
  quantity: number | string;
  price_local: number | string;
  instrument_ccy: string;
  market_value_local: number;
  market_value_base: number;
  market_value_usd: number;
  weight_pct: number;
  avg_cost_local?: number | string;
  cost_basis_base?: number | string;
  unrealised_pnl_base?: number | string;
  unrealised_pnl_pct?: number | string;
  lending_value_base: number;
  advance_rate_pct: number;
  liquidity_tier: "Daily" | "Weekly" | "Monthly" | "Quarterly Gate" | "Illiquid";
  valuation_date: string;
}

export interface Instrument {
  instrument_id: string;
  instrument_name: string;
  asset_class: string;
  sub_asset_class: string;
  sector: string;
  region: string;
  currency: string;
  liquidity_tier: string;
  underlying_reference: string;
  sustainability_excluded: "Y" | "N";
  concentration_limit_applies: "Y" | "N";
  "price_2025-12-31": number;
  "price_2026-02-27": number;
  "price_2026-03-31": number;
  "price_2026-06-30": number;
  "price_2026-08-26": number;
}

export interface Mandate {
  mandate_code: string;
  mandate_name: string;
  asset_class: string;
  min_pct: number;
  target_pct: number;
  max_pct: number;
  max_single_position_pct: number;
  mandate_notes: string;
}

export interface CreditFacility {
  facility_id: string;
  client_id: string;
  collateral_portfolio_id: string;
  facility_type: string;
  facility_ccy: string;
  credit_limit: number;
  interest_rate_pct: number;
  margin_call_ltv_pct: number;
  "drawn_2025-12-31": number;
  "collateral_market_value_2025-12-31": number;
  "lending_value_2025-12-31": number;
  "ltv_pct_2025-12-31": number;
  "headroom_2025-12-31": number;
  "drawn_2026-02-27": number;
  "collateral_market_value_2026-02-27": number;
  "lending_value_2026-02-27": number;
  "ltv_pct_2026-02-27": number;
  "headroom_2026-02-27": number;
  "drawn_2026-03-31": number;
  "collateral_market_value_2026-03-31": number;
  "lending_value_2026-03-31": number;
  "ltv_pct_2026-03-31": number;
  "headroom_2026-03-31": number;
  "drawn_2026-06-30": number;
  "collateral_market_value_2026-06-30": number;
  "lending_value_2026-06-30": number;
  "ltv_pct_2026-06-30": number;
  "headroom_2026-06-30": number;
  "drawn_2026-08-26": number;
  "collateral_market_value_2026-08-26": number;
  "lending_value_2026-08-26": number;
  "ltv_pct_2026-08-26": number;
  "headroom_2026-08-26": number;
  utilisation_pct_current: number;
}

export interface Commitment {
  commitment_id: string;
  client_id: string;
  portfolio_id: string;
  fund_name: string;
  currency: string;
  committed: number;
  called_to_date: number;
  uncalled: number;
  expected_call_window: string;
}

export interface PlannedCashNeed {
  need_id: string;
  client_id: string;
  description: string;
  currency: string;
  amount: number;
  due_from: string;
  due_to: string;
  recurrence: string;
  certainty: string;
}

export interface EventLogEntry {
  event_date: string;
  event_type: "Market" | "Geopolitical" | "Policy";
  region: string;
  description: string;
  primary_transmission: string;
  severity: "Medium" | "High" | "Severe";
}

export interface MarketContextSeries {
  snapshot_date: SnapshotDate;
  series_id: string;
  series_name: string;
  category: string;
  unit: string;
  value: number;
  snapshot_label?: string;
}

export interface RMNote {
  note_id: string;
  client_id: string;
  note_date: string;
  rm_id: string;
  rm_name: string;
  channel: "Meeting" | "Call" | "Email";
  note: string;
}

export interface Transaction {
  transaction_id: string;
  trade_date: string;
  settlement_date: string;
  portfolio_id: string;
  client_id: string;
  transaction_type: string;
  instrument_id: string;
  instrument_name: string;
  quantity: number | string;
  price_local: number | string;
  currency: string;
  amount: number | string;
  narrative: string;
}

// Intelligence Layer Types
export type RiskCategory =
  | "COLLATERAL_MARGIN"
  | "CONCENTRATION_LOOKTHROUGH"
  | "MANDATE_DRIFT"
  | "LIQUIDITY_GAP"
  | "CURRENCY_MISMATCH"
  | "SUSTAINABILITY_BREACH"
  | "SUCCESSION_GOVERNANCE";

export interface IntelligenceAlert {
  id: string;
  clientId: string;
  portfolioId?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "OPPORTUNITY";
  category: RiskCategory;
  title: string;
  description: string;
  groundedEvent?: string;
  metrics?: { label: string; value: string; trigger?: string };
  recommendedAction: string;
  isClientDirected?: boolean;
  waiverOnFile?: boolean;
}

export interface PrioritisedClient {
  client: Client;
  portfolios: Portfolio[];
  priorityScore: number;
  priorityTier: "CALL_TODAY" | "THIS_WEEK" | "ROUTINE_MONITOR";
  criticalAlertCount: number;
  highAlertCount: number;
  nextMeetingNeed: string;
  topRationale: string;
  ytdReturnPct: number;
  ytdPnlUsd: number;
  creditFacility?: CreditFacility;
  uncalledCommitmentsUsd: number;
  upcomingCashNeedsUsd: number;
  dailyLiquidCashUsd: number;
  notes: RMNote[];
}

export interface ScenarioSimulationResult {
  scenarioName: string;
  description: string;
  oilPriceChangePct: number;
  ratesChangeBps: number;
  techEquitiesChangePct: number;
  goldChangePct: number;
  projectedPortfolioImpactPct: number;
  projectedPnlUsd: number;
  marginCallRisk: "LOW" | "ELEVATED" | "TRIGGER_BREACH";
  keyVulnerabilities: string[];
  strategicAdvisoryAngle: string;
}
