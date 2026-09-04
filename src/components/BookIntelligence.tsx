import { FC, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Flame,
  Layers,
  Search,
  Shield,
  Zap
} from "lucide-react";
import type { PrioritisedClient } from "../types";

interface BookIntelligenceProps {
  clients: PrioritisedClient[];
  onSelectClient: (clientId: string) => void;
  onOpenMeetingDossier: (client: PrioritisedClient) => void;
}

export const BookIntelligence: FC<BookIntelligenceProps> = ({
  clients,
  onSelectClient,
  onOpenMeetingDossier
}) => {
  const [filterTier, setFilterTier] = useState<"ALL" | "CALL_TODAY" | "THIS_WEEK" | "MARGIN" | "LIQUIDITY" | "MULTI">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter((pc) => {
    // Search filter
    const matchesSearch =
      pc.client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pc.client.client_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pc.topRationale.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTier === "CALL_TODAY") return pc.priorityTier === "CALL_TODAY";
    if (filterTier === "THIS_WEEK") return pc.priorityTier === "THIS_WEEK";
    if (filterTier === "MARGIN") return Boolean(pc.creditFacility);
    if (filterTier === "LIQUIDITY") return pc.uncalledCommitmentsUsd > 0 || pc.upcomingCashNeedsUsd > 0;
    if (filterTier === "MULTI") return pc.portfolios.length > 1;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategy Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#002E5D]/10 text-[#002E5D] border border-[#002E5D]/20 mb-2">
              <Flame className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="uppercase tracking-wider">Relationship Manager Action Radar</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#002E5D] tracking-tight">
              Prioritized Client Book & Advisory Intelligence
            </h2>
            <p className="text-gray-600 text-sm mt-1 max-w-3xl">
              Risk-weighted triage across all 20 Asia desk clients. Dynamically prioritised by contractual margin call proximity,
              unfunded capital commitments, mandate drift waivers, and time-critical client notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-red-50/80 border border-red-200 rounded-lg p-3 text-center min-w-[110px]">
              <div className="text-2xl font-bold font-mono text-red-700">
                {clients.filter((c) => c.priorityTier === "CALL_TODAY").length}
              </div>
              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wide">Call Today</div>
            </div>
            <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-center min-w-[110px]">
              <div className="text-2xl font-bold font-mono text-amber-700">
                {clients.filter((c) => c.priorityTier === "THIS_WEEK").length}
              </div>
              <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">This Week</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center min-w-[110px]">
              <div className="text-2xl font-bold font-mono text-gray-700">
                {clients.filter((c) => c.priorityTier === "ROUTINE_MONITOR").length}
              </div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Routine</div>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterTier("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterTier === "ALL"
                  ? "bg-[#002E5D] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              All Clients ({clients.length})
            </button>
            <button
              onClick={() => setFilterTier("CALL_TODAY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterTier === "CALL_TODAY"
                  ? "bg-red-700 text-white shadow-sm"
                  : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Call Today ({clients.filter((c) => c.priorityTier === "CALL_TODAY").length})</span>
            </button>
            <button
              onClick={() => setFilterTier("THIS_WEEK")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterTier === "THIS_WEEK"
                  ? "bg-[#C5A059] text-white shadow-sm"
                  : "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>This Week ({clients.filter((c) => c.priorityTier === "THIS_WEEK").length})</span>
            </button>
            <button
              onClick={() => setFilterTier("MARGIN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterTier === "MARGIN"
                  ? "bg-[#002E5D] text-white shadow-sm"
                  : "bg-blue-50 border border-blue-200 text-[#002E5D] hover:bg-blue-100"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Lombard Watch (5)</span>
            </button>
            <button
              onClick={() => setFilterTier("LIQUIDITY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterTier === "LIQUIDITY"
                  ? "bg-[#002E5D] text-white shadow-sm"
                  : "bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Liquidity / Tax Clifflines</span>
            </button>
            <button
              onClick={() => setFilterTier("MULTI")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterTier === "MULTI"
                  ? "bg-purple-700 text-white shadow-sm"
                  : "bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Portfolio Accounts</span>
            </button>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 20 clients, rationale, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#002E5D] shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Main Prioritised Client Cards / Table */}
      <div className="space-y-3.5">
        {filteredClients.map((item) => {
          const { client, portfolios, priorityScore, priorityTier, topRationale, nextMeetingNeed, creditFacility } = item;
          const isCritical = priorityTier === "CALL_TODAY";
          const isThisWeek = priorityTier === "THIS_WEEK";

          return (
            <div
              key={client.client_id}
              className={`rounded-xl border transition-all p-4.5 bg-white shadow-sm hover:shadow-md ${
                isCritical
                  ? "border-l-4 border-l-red-600 border-gray-200"
                  : isThisWeek
                  ? "border-l-4 border-l-[#C5A059] border-gray-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Client info and Priority Badge */}
                <div className="flex items-start gap-3.5">
                  <div className="pt-0.5">
                    {isCritical ? (
                      <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-700 shadow-sm">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                    ) : isThisWeek ? (
                      <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {client.client_id}
                      </span>
                      <h3
                        onClick={() => onSelectClient(client.client_id)}
                        className="text-base font-bold text-[#002E5D] hover:underline cursor-pointer transition-colors font-serif"
                      >
                        {client.client_name}
                      </h3>
                      {isCritical && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded border border-red-200">
                          CALL TODAY
                        </span>
                      )}
                      {isThisWeek && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded border border-amber-200">
                          THIS WEEK
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                        {client.wealth_band} • {client.booking_centre}
                      </span>
                      {portfolios.length > 1 && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-[#002E5D] border border-blue-200 font-medium">
                          {portfolios.length} Portfolios
                        </span>
                      )}
                    </div>

                    {/* Rationale Headline */}
                    <p className="text-sm text-gray-800 mt-1.5 flex items-start gap-1.5 leading-snug">
                      <span className="text-[#002E5D] font-bold shrink-0">Priority Rationale:</span>
                      <span className="font-medium">{topRationale}</span>
                    </p>

                    {/* Metadata Subline */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                      <div>
                        <span className="text-gray-400 font-medium">Source of Wealth:</span> {client.source_of_wealth}
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Risk Profile:</span> {client.risk_profile} (Score: {client.risk_tolerance_score}/10)
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Total AUM:</span>{" "}
                        <span className="font-mono font-bold text-gray-900">
                          USD {(client.total_aum_usd / 1e6).toFixed(1)}m
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Key Quantitative Indicators & Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 lg:self-center shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                  {/* Lombard Trigger Indicator */}
                  {creditFacility && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[130px]">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">LTV / Trigger</div>
                      <div
                        className={`font-mono text-xs font-bold ${
                          creditFacility.margin_call_ltv_pct - creditFacility["ltv_pct_2026-08-26"] <= 1.0
                            ? "text-red-600 animate-pulse"
                            : creditFacility["ltv_pct_2026-08-26"] > creditFacility.margin_call_ltv_pct
                            ? "text-red-600"
                            : "text-[#002E5D]"
                        }`}
                      >
                        {creditFacility["ltv_pct_2026-08-26"]}% / {creditFacility.margin_call_ltv_pct}%
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Buffer: {(creditFacility.margin_call_ltv_pct - creditFacility["ltv_pct_2026-08-26"]).toFixed(1)}%
                      </div>
                    </div>
                  )}

                  {/* Priority Score */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Score</div>
                    <div
                      className={`font-mono text-sm font-bold ${
                        isCritical ? "text-red-600" : isThisWeek ? "text-amber-700" : "text-gray-700"
                      }`}
                    >
                      {priorityScore} pts
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {isCritical ? "Tier 1: Today" : isThisWeek ? "Tier 2: Week" : "Tier 3: Monitor"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenMeetingDossier(item)}
                      className="px-3.5 py-2 bg-white border border-[#002E5D] text-[#002E5D] hover:bg-blue-50 text-xs font-bold rounded shadow-sm flex items-center gap-1.5 transition-colors"
                      title="Generate Julius Baer Executive Meeting Prep Brief"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Prepare Note</span>
                    </button>

                    <button
                      onClick={() => onSelectClient(client.client_id)}
                      className="px-3.5 py-2 bg-[#002E5D] hover:bg-[#002244] text-white text-xs font-bold rounded shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <span>Deep Dive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Meeting Prompt */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-[#C5A059] font-bold">Next Meeting Objective:</span>
                  <span className="text-gray-700 font-medium">{nextMeetingNeed}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>
                    YTD Return:{" "}
                    <span
                      className={`font-mono font-bold ${
                        item.ytdReturnPct >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {item.ytdReturnPct >= 0 ? "+" : ""}
                      {item.ytdReturnPct.toFixed(2)}%
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Daily Cash:{" "}
                    <span className="font-mono font-bold text-gray-900">
                      USD {(item.dailyLiquidCashUsd / 1e6).toFixed(1)}m
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
