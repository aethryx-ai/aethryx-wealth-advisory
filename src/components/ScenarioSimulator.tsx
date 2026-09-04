import { FC, useState } from "react";
import {
  Activity,
  AlertOctagon,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Compass,
  DollarSign,
  Flame,
  Percent,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";
import { clientsData } from "../data/jbWealthData";
import {
  simulatePortfolioScenario,
  getClientPortfolios,
  getClientCreditFacility
} from "../services/intelligenceEngine";

export const ScenarioSimulator: FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>("CL-0014");
  const [scenarioId, setScenarioId] = useState<
    "STRAIT_DEESCALATION" | "STRAIT_ESCALATION" | "FED_RATE_HIKE" | "TECH_SUPER_CYCLE"
  >("STRAIT_DEESCALATION");

  const client = clientsData.find((c) => c.client_id === selectedClientId) || clientsData[0];
  const facility = getClientCreditFacility(client.client_id);
  const result = simulatePortfolioScenario(client.client_id, scenarioId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#002E5D]/10 text-[#002E5D] border border-[#002E5D]/20 mb-2">
              <Activity className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="uppercase tracking-wider">Interactive Stress Testing & Scenario Laboratory</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#002E5D] tracking-tight">
              Macro Shock Simulator & Lombard Sensitivity
            </h2>
            <p className="text-gray-600 text-sm mt-1 max-w-3xl">
              Model client portfolio resilience and Lombard credit line solvency under plausible forward scenarios:
              Strait of Hormuz de-escalation vs escalation, US Federal Reserve rate shocks, and technology equity cycles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center min-w-[140px]">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Client Under Test</div>
              <div className="font-mono font-bold text-[#002E5D] text-sm mt-0.5">{client.client_id}</div>
              <div className="text-[11px] text-[#C5A059] font-bold truncate max-w-[130px]">{client.client_name}</div>
            </div>
          </div>
        </div>

        {/* Client & Scenario Selector */}
        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">
              1. Select Client Portfolio:
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#002E5D] font-medium shadow-inner"
            >
              {clientsData.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.client_id} - {c.client_name} (AUM: USD {(c.total_aum_usd / 1e6).toFixed(1)}m, {c.risk_profile})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">
              2. Select Macroeconomic Scenario:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScenarioId("STRAIT_DEESCALATION")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                  scenarioId === "STRAIT_DEESCALATION"
                    ? "bg-blue-50/80 text-[#002E5D] border-[#002E5D] shadow-sm font-bold"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="font-bold">Hormuz De-escalation</div>
                <div className="text-[10px] text-gray-500">Oil -32%, Rates -45bps</div>
              </button>

              <button
                onClick={() => setScenarioId("STRAIT_ESCALATION")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                  scenarioId === "STRAIT_ESCALATION"
                    ? "bg-red-50 text-red-700 border-red-400 shadow-sm font-bold"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="font-bold">Regional Escalation</div>
                <div className="text-[10px] text-gray-500">Brent $140, Rates +60bps</div>
              </button>

              <button
                onClick={() => setScenarioId("FED_RATE_HIKE")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                  scenarioId === "FED_RATE_HIKE"
                    ? "bg-amber-50 text-amber-800 border-amber-400 shadow-sm font-bold"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="font-bold">Fed Hawkish Shock</div>
                <div className="text-[10px] text-gray-500">10Y Yields &gt;5.25%</div>
              </button>

              <button
                onClick={() => setScenarioId("TECH_SUPER_CYCLE")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                  scenarioId === "TECH_SUPER_CYCLE"
                    ? "bg-purple-50 text-purple-800 border-purple-400 shadow-sm font-bold"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="font-bold">AI Tech Super-Cycle</div>
                <div className="text-[10px] text-gray-500">Tech Equities +22%</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Simulation Impact Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#C5A059] uppercase tracking-wider">
              Stress Test Parameters
            </span>
            <h3 className="text-xl font-bold text-[#002E5D] mt-0.5 font-serif">{result.scenarioName}</h3>
            <p className="text-xs text-gray-600 mt-1 max-w-3xl leading-relaxed">{result.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
              <div className="text-[10px] text-gray-500 font-bold uppercase">Oil Price</div>
              <div
                className={`font-mono text-xs font-bold ${
                  result.oilPriceChangePct >= 0 ? "text-red-700" : "text-emerald-700"
                }`}
              >
                {result.oilPriceChangePct >= 0 ? "+" : ""}
                {result.oilPriceChangePct}%
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
              <div className="text-[10px] text-gray-500 font-bold uppercase">10Y Rates</div>
              <div
                className={`font-mono text-xs font-bold ${
                  result.ratesChangeBps >= 0 ? "text-red-700" : "text-emerald-700"
                }`}
              >
                {result.ratesChangeBps >= 0 ? "+" : ""}
                {result.ratesChangeBps} bps
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
              <div className="text-[10px] text-gray-500 font-bold uppercase">Tech Equities</div>
              <div
                className={`font-mono text-xs font-bold ${
                  result.techEquitiesChangePct >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {result.techEquitiesChangePct >= 0 ? "+" : ""}
                {result.techEquitiesChangePct}%
              </div>
            </div>
          </div>
        </div>

        {/* Projected Outcome Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Projected Portfolio Impact
            </div>
            <div
              className={`text-2xl font-bold font-mono mt-1.5 flex items-center gap-1.5 ${
                result.projectedPortfolioImpactPct >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {result.projectedPortfolioImpactPct >= 0 ? (
                <ArrowUpRight className="w-6 h-6" />
              ) : (
                <ArrowDownRight className="w-6 h-6" />
              )}
              <span>
                {result.projectedPortfolioImpactPct >= 0 ? "+" : ""}
                {result.projectedPortfolioImpactPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1 font-mono">
              Estimated Delta:{" "}
              <span className="text-gray-900 font-bold">
                USD {(result.projectedPnlUsd / 1e6).toFixed(2)}m
              </span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Lombard Facility Solvency
            </div>
            <div className="mt-2 flex items-center gap-2">
              {result.marginCallRisk === "TRIGGER_BREACH" ? (
                <span className="px-3 py-1 rounded-md bg-red-600 text-white font-bold text-xs uppercase animate-pulse">
                  Contractual Margin Breach
                </span>
              ) : result.marginCallRisk === "ELEVATED" ? (
                <span className="px-3 py-1 rounded-md bg-amber-600 text-white font-bold text-xs uppercase">
                  Elevated Warning (Buffer &lt; 2.5%)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-md bg-emerald-600 text-white font-bold text-xs uppercase">
                  Sufficient Headroom
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-2 font-mono">
              {facility ? `Facility: ${facility.facility_id} (${facility.facility_type})` : "No active leverage"}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Relationship Manager Mandate
            </div>
            <div className="text-xs text-[#002E5D] font-bold mt-2 leading-relaxed">
              {result.strategicAdvisoryAngle}
            </div>
          </div>
        </div>

        {/* Key Vulnerabilities checklist */}
        {result.keyVulnerabilities.length > 0 && (
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>Specific Asset Vulnerabilities Identified Under This Scenario</span>
            </div>
            <div className="space-y-1.5">
              {result.keyVulnerabilities.map((vuln, i) => (
                <div key={i} className="text-xs text-red-900 flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="font-medium">{vuln}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
