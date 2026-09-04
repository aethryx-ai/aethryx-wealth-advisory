import { FC, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  CreditCard,
  FileCheck,
  FileText,
  Layers,
  PieChart,
  Shield,
  ShieldAlert,
  TrendingUp,
  Zap
} from "lucide-react";
import {
  clientsData,
  mandatesData,
  instrumentsData,
  eventLogData,
  SNAPSHOT_DATES,
  TODAY
} from "../data/jbWealthData";
import {
  getClientHoldings,
  getClientPortfolios,
  getClientCreditFacility,
  getClientCommitments,
  getClientCashNeeds,
  getClientNotes,
  generateClientAlerts
} from "../services/intelligenceEngine";

interface ClientDeepDiveProps {
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onOpenMeetingDossier: (client: any) => void;
  onOpenAssistant: () => void;
}

export const ClientDeepDive: FC<ClientDeepDiveProps> = ({
  selectedClientId,
  onSelectClient,
  onOpenMeetingDossier,
  onOpenAssistant
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "mandate" | "lookthrough" | "attribution" | "collateral" | "liquidity" | "notes"
  >("overview");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("ALL");
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>(TODAY);

  const client = clientsData.find((c) => c.client_id === selectedClientId) || clientsData[0];
  const portfolios = getClientPortfolios(client.client_id);
  const facility = getClientCreditFacility(client.client_id);
  const commitments = getClientCommitments(client.client_id);
  const cashNeeds = getClientCashNeeds(client.client_id);
  const notes = getClientNotes(client.client_id);
  const alerts = generateClientAlerts(client);

  // Filtered holdings
  const allHoldingsToday = getClientHoldings(client.client_id, selectedSnapshot as any);
  const displayedHoldings =
    selectedPortfolioId === "ALL"
      ? allHoldingsToday
      : allHoldingsToday.filter((h) => h.portfolio_id === selectedPortfolioId);

  // Asset class breakdown
  const totalDisplayValue = displayedHoldings.reduce((sum, h) => sum + h.market_value_usd, 0);
  const assetClassMap: Record<string, { value: number; weight: number }> = {};
  displayedHoldings.forEach((h) => {
    if (!assetClassMap[h.asset_class]) {
      assetClassMap[h.asset_class] = { value: 0, weight: 0 };
    }
    assetClassMap[h.asset_class].value += h.market_value_usd;
  });
  Object.keys(assetClassMap).forEach((ac) => {
    assetClassMap[ac].weight = totalDisplayValue > 0 ? (assetClassMap[ac].value / totalDisplayValue) * 100 : 0;
  });

  // Calculate YTD Change across snapshots
  const decAum = portfolios.reduce((sum, p) => sum + (p["aum_2025-12-31"] || 0), 0);
  const currentAum = portfolios.reduce((sum, p) => sum + (p["aum_2026-08-26"] || 0), 0);
  const ytdChangePct = decAum > 0 ? ((currentAum - decAum) / decAum) * 100 : 0;
  const ytdDeltaUsd = currentAum - decAum;

  // Mandate evaluation for primary portfolio
  const primaryPortfolio = portfolios[0];
  const relevantMandates = mandatesData.filter((m) => m.mandate_code === primaryPortfolio?.mandate_code);

  return (
    <div className="space-y-6">
      {/* Client Selector & High-Level Dossier Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#002E5D]/10 border border-[#002E5D]/20 text-[#002E5D] font-serif text-2xl font-bold flex items-center justify-center shrink-0">
              {client.client_name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Client Select dropdown */}
                <select
                  value={client.client_id}
                  onChange={(e) => onSelectClient(e.target.value)}
                  className="bg-white border border-gray-300 text-[#002E5D] font-serif text-xl sm:text-2xl font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#002E5D] cursor-pointer shadow-inner"
                >
                  {clientsData.map((c) => (
                    <option key={c.client_id} value={c.client_id}>
                      {c.client_id} - {c.client_name} ({c.wealth_band}, {c.booking_centre})
                    </option>
                  ))}
                </select>

                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  {client.client_id}
                </span>

                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#002E5D] border border-blue-200 font-semibold">
                  {client.wealth_band} • {client.booking_centre} Desk
                </span>

                {facility && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${
                      facility.margin_call_ltv_pct - facility["ltv_pct_2026-08-26"] <= 1.0
                        ? "bg-red-100 text-red-700 border-red-200 animate-pulse"
                        : "bg-blue-100 text-[#002E5D] border-blue-200"
                    }`}
                  >
                    Lombard Facility Active (LTV {facility["ltv_pct_2026-08-26"]}%)
                  </span>
                )}
              </div>

              {/* Client Profile Badges */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-600 mt-2.5">
                <div>
                  <span className="text-gray-400 font-medium">Source of Wealth:</span>{" "}
                  <span className="text-gray-900 font-medium">{client.source_of_wealth}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Risk Profile:</span>{" "}
                  <span className="text-[#002E5D] font-bold">{client.risk_profile}</span>{" "}
                  <span className="text-gray-400">({client.risk_tolerance_score}/10)</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Tax Domicile:</span>{" "}
                  <span className="text-gray-900 font-medium">{client.tax_domicile}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Horizon:</span>{" "}
                  <span className="text-gray-900 font-medium">{client.investment_horizon_years} Years</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">KYC Review:</span>{" "}
                  <span className="font-mono text-gray-700 font-medium">{client.kyc_review_due}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
            <button
              onClick={() => onOpenMeetingDossier({ client, portfolios, creditFacility: facility })}
              className="px-4 py-2 bg-[#002E5D] hover:bg-[#002244] text-white font-bold text-xs rounded shadow-sm transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>Prepare Advisory Note</span>
            </button>

            <button
              onClick={onOpenAssistant}
              className="px-4 py-2 bg-white border border-[#002E5D] text-[#002E5D] hover:bg-blue-50 font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-4 h-4 text-[#C5A059]" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>

        {/* Client KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Client AUM</div>
            <div className="text-2xl font-bold font-mono text-[#002E5D] mt-0.5">
              USD {(client.total_aum_usd / 1e6).toFixed(2)}m
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">Base Currency: {client.base_currency}</div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">2026 YTD Attribution</div>
            <div
              className={`text-2xl font-bold font-mono mt-0.5 flex items-center gap-1 ${
                ytdChangePct >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {ytdChangePct >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              <span>
                {ytdChangePct >= 0 ? "+" : ""}
                {ytdChangePct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Net Delta: USD {(ytdDeltaUsd / 1e6).toFixed(2)}m
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Daily Liquid Reserves</div>
            <div className="text-2xl font-bold font-mono text-[#002E5D] mt-0.5">
              USD{" "}
              {(
                allHoldingsToday
                  .filter((h) => h.liquidity_tier === "Daily" || h.asset_class === "Cash & Cash Equivalents")
                  .reduce((sum, h) => sum + h.market_value_usd, 0) / 1e6
              ).toFixed(2)}
              m
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {commitments.length > 0 ? `${commitments.length} PE commitments` : "No pending PE capital calls"}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Governance & Triggers</div>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-0.5">
              {alerts.length} <span className="text-xs font-semibold text-gray-500">signals</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {alerts.filter((a) => a.severity === "CRITICAL").length} critical •{" "}
              {alerts.filter((a) => a.severity === "HIGH").length} high priority
            </div>
          </div>
        </div>
      </div>

      {/* Critical Intelligence Alert Cards (Executive Dark Card Pattern from Design HTML) */}
      {alerts.length > 0 && (
        <div className="bg-[#151619] rounded-xl shadow-lg p-5 text-white flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C5A059]" />
              <h3 className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">
                Critical Alerts & Governance Triggers
              </h3>
            </div>
            <span className="text-[10px] text-gray-400 italic">Audit-Controlled Transmission Channel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === "CRITICAL"
                    ? "border-l-4 border-l-red-500 bg-white/5 border-red-500/30"
                    : alert.severity === "HIGH"
                    ? "border-l-4 border-l-[#C5A059] bg-white/5 border-amber-500/30"
                    : "border-l-4 border-l-emerald-400 bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : alert.severity === "HIGH"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{alert.category}</span>
                </div>

                <div className="text-xs font-bold text-white mb-1">{alert.title}</div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-2">{alert.description}</p>

                {alert.groundedEvent && (
                  <div className="text-[10px] text-[#C5A059] italic mb-2">
                    Event Grounding: {alert.groundedEvent}
                  </div>
                )}

                <div className="pt-2 border-t border-white/10">
                  <div className="text-[10px] font-bold text-[#00FFCC]">AI RECOMMENDED ACTION:</div>
                  <div className="text-xs text-gray-200 mt-0.5">{alert.recommendedAction}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "overview"
                ? "bg-[#002E5D] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Holdings & Allocation</span>
          </button>

          <button
            onClick={() => setActiveSubTab("lookthrough")}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "lookthrough"
                ? "bg-[#002E5D] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Structured Look-Through</span>
          </button>

          <button
            onClick={() => setActiveSubTab("mandate")}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "mandate"
                ? "bg-[#002E5D] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Mandate Governance & Drift</span>
          </button>

          <button
            onClick={() => setActiveSubTab("attribution")}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "attribution"
                ? "bg-[#002E5D] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>5-Snapshot History & Transmission</span>
          </button>

          {facility && (
            <button
              onClick={() => setActiveSubTab("collateral")}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === "collateral"
                  ? "bg-[#002E5D] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Lombard Facility ({facility.margin_call_ltv_pct}% Margin)</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab("liquidity")}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "liquidity"
                ? "bg-[#002E5D] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Liquidity & Commitments</span>
          </button>

          <button
            onClick={() => setActiveSubTab("notes")}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "notes"
                ? "bg-[#002E5D] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RM Notes & Dynamics ({notes.length})</span>
          </button>
        </div>

        {/* Portfolio & Snapshot selector controls */}
        <div className="flex items-center gap-2">
          {portfolios.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 font-medium">Portfolio:</span>
              <select
                value={selectedPortfolioId}
                onChange={(e) => setSelectedPortfolioId(e.target.value)}
                className="bg-white border border-gray-300 text-gray-800 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-[#002E5D] shadow-inner"
              >
                <option value="ALL">Consolidated ({portfolios.length} Portfolios)</option>
                {portfolios.map((p) => (
                  <option key={p.portfolio_id} value={p.portfolio_id}>
                    {p.portfolio_id} - {p.portfolio_name} ({p.service_model})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium">Snapshot:</span>
            <select
              value={selectedSnapshot}
              onChange={(e) => setSelectedSnapshot(e.target.value)}
              className="bg-white border border-gray-300 font-mono text-gray-800 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-[#002E5D] shadow-inner font-semibold"
            >
              {SNAPSHOT_DATES.map((d) => (
                <option key={d} value={d}>
                  {d} {d === TODAY ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Holdings & Allocation */}
      {activeSubTab === "overview" && (
        <div className="space-y-5">
          {/* Asset Allocation Distribution Bars */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Asset Allocation Breakdown ({selectedSnapshot})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(assetClassMap).map(([assetClass, data]) => (
                <div key={assetClass} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-[11px] text-gray-500 font-medium truncate" title={assetClass}>
                    {assetClass}
                  </div>
                  <div className="text-base font-bold font-mono text-[#002E5D] mt-1">
                    {data.weight.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    USD {(data.value / 1e6).toFixed(1)}m
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#002E5D]">
                  Holdings Ledger ({displayedHoldings.length} Positions)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing authoritative valuations as of {selectedSnapshot} in Base Currency & USD equivalent
                </p>
              </div>

              <div className="text-xs text-gray-600 font-mono">
                Total Value: <span className="font-bold text-[#002E5D]">USD {(totalDisplayValue / 1e6).toFixed(2)}m</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Instrument</th>
                    <th className="p-3">Asset Class</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Market Value (USD)</th>
                    <th className="p-3">Local Price</th>
                    <th className="p-3">Unrealised PnL</th>
                    <th className="p-3">Advance Rate</th>
                    <th className="p-3">Liquidity Tier</th>
                    <th className="p-3">Acquired</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {displayedHoldings.map((h, i) => {
                    const inst = instrumentsData.find((ins) => ins.instrument_id === h.instrument_id);
                    const pnlNum = typeof h.unrealised_pnl_pct === "number" ? h.unrealised_pnl_pct : Number(h.unrealised_pnl_pct || 0);

                    return (
                      <tr key={`${h.instrument_id}-${i}`} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-[#002E5D]">{h.instrument_name}</div>
                          <div className="font-mono text-[10px] text-gray-500 flex items-center gap-2">
                            <span>{h.instrument_id}</span>
                            <span>•</span>
                            <span>{h.instrument_ccy}</span>
                            {inst?.underlying_reference && (
                              <>
                                <span>•</span>
                                <span className="text-[#C5A059] font-semibold">Ref: {inst.underlying_reference}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-medium">
                            {h.asset_class}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-gray-900">
                          {h.weight_pct.toFixed(2)}%
                        </td>
                        <td className="p-3 font-mono font-bold text-[#002E5D]">
                          ${(h.market_value_usd / 1e3).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
                        </td>
                        <td className="p-3 font-mono text-gray-600">
                          {typeof h.price_local === "number" ? h.price_local.toLocaleString() : h.price_local}
                        </td>
                        <td className="p-3 font-mono">
                          {h.unrealised_pnl_pct !== "" && h.unrealised_pnl_pct !== undefined ? (
                            <span
                              className={`font-bold ${
                                pnlNum >= 0 ? "text-emerald-700" : "text-red-700"
                              }`}
                            >
                              {pnlNum >= 0 ? "+" : ""}
                              {pnlNum.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-gray-700 font-semibold">{h.advance_rate_pct}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              h.liquidity_tier === "Daily"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : h.liquidity_tier === "Weekly" || h.liquidity_tier === "Monthly"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {h.liquidity_tier}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-gray-500 text-[11px]">
                          {h.acquired_date || "Legacy"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Structured Look-Through */}
      {activeSubTab === "lookthrough" && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[#C5A059]" />
              <h3 className="text-sm font-bold text-[#002E5D]">
                Underlying Reference Look-Through & Economic Exposure Analysis
              </h3>
            </div>
            <p className="text-xs text-gray-600 max-w-3xl">
              Private banking structured notes and alternative sleeves often appear diversified on an asset class level,
              but mask heavy correlation to the client's operating business or cyclical macro triggers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {displayedHoldings
                .filter((h) => {
                  const inst = instrumentsData.find((i) => i.instrument_id === h.instrument_id);
                  return Boolean(inst?.underlying_reference) || h.asset_class.includes("Structured");
                })
                .map((h, idx) => {
                  const inst = instrumentsData.find((i) => i.instrument_id === h.instrument_id);
                  return (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#002E5D] font-bold">{h.instrument_id}</span>
                        <span className="text-xs font-mono text-gray-600 font-semibold">
                          USD {(h.market_value_usd / 1e6).toFixed(2)}m ({h.weight_pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="font-bold text-gray-900 text-sm">{h.instrument_name}</div>
                      <div className="bg-white border border-gray-200 rounded p-2.5 text-xs text-gray-800 shadow-sm">
                        <span className="text-gray-500 font-medium">True Underlying Reference:</span>{" "}
                        <span className="font-bold text-[#002E5D]">{inst?.underlying_reference}</span>
                      </div>
                      <div className="text-[11px] text-gray-600">
                        Sector: <span className="text-gray-900 font-medium">{inst?.sector}</span> • Region:{" "}
                        <span className="text-gray-900 font-medium">{inst?.region}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Mandate Governance & Drift */}
      {activeSubTab === "mandate" && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#002E5D]">
                  Mandate Compliance Bands: {primaryPortfolio?.mandate_name} ({primaryPortfolio?.mandate_code})
                </h3>
                <p className="text-xs text-gray-500">
                  Checking actual weight against contractual Min, Target, and Max allocation boundaries
                </p>
              </div>
              <div className="text-xs px-2.5 py-1 rounded bg-gray-100 border border-gray-200 text-gray-700 font-medium">
                Service Model: {primaryPortfolio?.service_model}
              </div>
            </div>

            <div className="space-y-4">
              {relevantMandates.map((m) => {
                const currentWeight = assetClassMap[m.asset_class]?.weight || 0;
                const isUnderMin = currentWeight < m.min_pct;
                const isOverMax = currentWeight > m.max_pct;
                const isBreach = isUnderMin || isOverMax;

                return (
                  <div
                    key={m.asset_class}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{m.asset_class}</span>
                        {isBreach ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold">
                            {isUnderMin ? "BELOW MIN" : "EXCEEDS MAX"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                            IN MANDATE
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-xs text-gray-600">
                        Actual: <span className="font-bold text-gray-900">{currentWeight.toFixed(1)}%</span> • Target:{" "}
                        <span className="text-[#C5A059] font-bold">{m.target_pct}%</span> • Range: [{m.min_pct}% - {m.max_pct}%]
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isBreach ? "bg-red-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${Math.min(currentWeight, 100)}%` }}
                      ></div>
                    </div>

                    {m.mandate_notes && (
                      <div className="text-[11px] text-gray-500 italic">Note: {m.mandate_notes}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Performance Attribution Across 5 Snapshots */}
      {activeSubTab === "attribution" && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#002E5D] mb-2">
              Chronological Performance & Geopolitical Transmission Timeline
            </h3>
            <p className="text-xs text-gray-600 mb-4 max-w-3xl">
              Tracking total portfolio value across all 5 audited snapshots in 2026. Every quarterly delta is grounded
              in specific transmission channels recorded in the authoritative Event Log.
            </p>

            {/* 5 snapshot timeline cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {SNAPSHOT_DATES.map((snapDate, idx) => {
                const snapHoldings = getClientHoldings(client.client_id, snapDate);
                const totalVal = snapHoldings.reduce((sum, h) => sum + h.market_value_usd, 0);
                const prevDate = idx > 0 ? SNAPSHOT_DATES[idx - 1] : null;
                const prevVal = prevDate
                  ? getClientHoldings(client.client_id, prevDate).reduce((sum, h) => sum + h.market_value_usd, 0)
                  : totalVal;
                const deltaPct = prevVal > 0 ? ((totalVal - prevVal) / prevVal) * 100 : 0;

                // Match with event log in this period
                const periodEvents = eventLogData.filter((e) => {
                  if (!prevDate) return e.event_date <= snapDate;
                  return e.event_date > prevDate && e.event_date <= snapDate;
                });

                return (
                  <div
                    key={snapDate}
                    className={`rounded-xl border p-3.5 space-y-2 ${
                      selectedSnapshot === snapDate
                        ? "bg-blue-50/70 border-[#002E5D] shadow-sm"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-600 font-bold">{snapDate}</span>
                      {snapDate === TODAY && (
                        <span className="px-1.5 py-0.5 rounded bg-[#002E5D] text-white font-bold text-[9px]">
                          TODAY
                        </span>
                      )}
                    </div>

                    <div className="text-lg font-bold font-mono text-[#002E5D]">
                      ${(totalVal / 1e6).toFixed(2)}m
                    </div>

                    {idx > 0 && (
                      <div
                        className={`text-xs font-mono font-bold flex items-center gap-1 ${
                          deltaPct >= 0 ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {deltaPct >= 0 ? "+" : ""}
                        {deltaPct.toFixed(2)}% vs prior
                      </div>
                    )}

                    {periodEvents.length > 0 && (
                      <div className="pt-2 border-t border-gray-200 text-[10px] text-gray-700 space-y-1">
                        <div className="text-[#C5A059] font-bold uppercase tracking-wider text-[9px]">
                          Macro Transmission
                        </div>
                        {periodEvents.slice(0, 2).map((ev, ei) => (
                          <div key={ei} className="line-clamp-2" title={ev.description}>
                            • {ev.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 5: Lombard Facility & Collateral Health */}
      {activeSubTab === "collateral" && facility && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#002E5D] border border-blue-200">
                  {facility.facility_id}
                </span>
                <h3 className="text-base font-bold text-[#002E5D] mt-1 font-serif">
                  Lombard Facility Risk Monitor: {facility.facility_type} ({facility.facility_ccy})
                </h3>
                <p className="text-xs text-gray-500">
                  Collateral Account: {facility.collateral_portfolio_id} • Interest Rate: {facility.interest_rate_pct}% p.a.
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium">Margin Call Trigger</div>
                <div className="text-xl font-bold font-mono text-red-700">{facility.margin_call_ltv_pct}% LTV</div>
              </div>
            </div>

            {/* LTV History Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {SNAPSHOT_DATES.map((date) => {
                const ltv = facility[`ltv_pct_${date}` as keyof typeof facility] as number;
                const drawn = facility[`drawn_${date}` as keyof typeof facility] as number;
                const colVal = facility[`collateral_market_value_${date}` as keyof typeof facility] as number;
                const isBreached = ltv >= facility.margin_call_ltv_pct;

                return (
                  <div
                    key={date}
                    className={`rounded-lg border p-3 ${
                      isBreached
                        ? "bg-red-50 border-red-300 text-red-900"
                        : "bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="text-[10px] font-mono text-gray-500 font-semibold">{date}</div>
                    <div
                      className={`text-lg font-bold font-mono mt-1 ${
                        isBreached ? "text-red-700" : "text-[#002E5D]"
                      }`}
                    >
                      {ltv}% LTV
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      Drawn: {(drawn / 1e6).toFixed(1)}m
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Collateral: {(colVal / 1e6).toFixed(1)}m
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 6: Liquidity & Commitments */}
      {activeSubTab === "liquidity" && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#002E5D] mb-3">
              Liquidity Waterfall & Capital Obligations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Uncalled Commitments */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-xs uppercase tracking-wider font-bold text-[#C5A059] mb-2">
                  Uncalled Private Equity / Debt Commitments
                </div>
                {commitments.length === 0 ? (
                  <p className="text-xs text-gray-500">No active private market uncalled commitments.</p>
                ) : (
                  <div className="space-y-3">
                    {commitments.map((c) => (
                      <div key={c.commitment_id} className="border-b border-gray-200 pb-2 text-xs">
                        <div className="font-bold text-gray-900">{c.fund_name}</div>
                        <div className="flex justify-between text-gray-600 mt-1">
                          <span>Uncalled: <span className="font-mono text-[#002E5D] font-bold">{c.currency} {(c.uncalled / 1e6).toFixed(1)}m</span></span>
                          <span>Expected: {c.expected_call_window}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Planned Cash Needs */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-xs uppercase tracking-wider font-bold text-[#002E5D] mb-2">
                  Known Planned Liabilities & Tax Deadlines
                </div>
                {cashNeeds.length === 0 ? (
                  <p className="text-xs text-gray-500">No active planned cash liabilities recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {cashNeeds.map((n) => (
                      <div key={n.need_id} className="border-b border-gray-200 pb-2 text-xs">
                        <div className="font-bold text-gray-900">{n.description}</div>
                        <div className="flex justify-between text-gray-600 mt-1">
                          <span>Amount: <span className="font-mono text-red-700 font-bold">{n.currency} {(n.amount / 1e6).toFixed(1)}m</span></span>
                          <span>Due: {n.due_from} to {n.due_to}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 7: RM Notes & Relationship Dynamics */}
      {activeSubTab === "notes" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#002E5D] mb-2">
              Relationship Manager Intelligence Log: Priscilla Ong
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Where client words conflict with quantitative holdings, real wealth advisory begins.
            </p>

            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.note_id} className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#002E5D]">{n.note_date}</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 text-[10px] font-semibold">
                      {n.channel} • {n.rm_name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed font-sans">{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
