import { FC, useState } from "react";
import {
  AlertOctagon,
  Calendar,
  Compass,
  Filter,
  Flame,
  Globe,
  Landmark,
  Layers,
  Search,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";
import { eventLogData, marketContextData, TODAY } from "../data/jbWealthData";

export const MacroEventTimeline: FC = () => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredEvents = eventLogData.filter((ev) => {
    if (filterType !== "ALL" && ev.event_type !== filterType) return false;
    if (selectedSeverity !== "ALL" && ev.severity !== selectedSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ev.description.toLowerCase().includes(q) ||
        ev.region.toLowerCase().includes(q) ||
        ev.primary_transmission.toLowerCase().includes(q) ||
        ev.event_date.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#002E5D]/10 text-[#002E5D] border border-[#002E5D]/20 mb-2">
              <Compass className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="uppercase tracking-wider">Auditable Macroeconomic Grounding Engine</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#002E5D] tracking-tight">
              2026 Geopolitical, Policy & Market Event Log
            </h2>
            <p className="text-gray-600 text-sm mt-1 max-w-3xl">
              Julius Baer portfolio explanations are strictly grounded in controlled, audited events. Connecting
              headline transmission shocks directly to client portfolio holdings and lending collateral health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center min-w-[120px]">
              <div className="text-2xl font-bold font-mono text-[#002E5D]">{eventLogData.length}</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Audited Events</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center min-w-[120px]">
              <div className="text-2xl font-bold font-mono text-red-700">
                {eventLogData.filter((e) => e.severity === "Severe").length}
              </div>
              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wide">Severe Shocks</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === "ALL"
                  ? "bg-[#002E5D] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType("Geopolitical")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterType === "Geopolitical"
                  ? "bg-red-700 text-white shadow-sm"
                  : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Geopolitical</span>
            </button>
            <button
              onClick={() => setFilterType("Market")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterType === "Market"
                  ? "bg-[#C5A059] text-white shadow-sm"
                  : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Market Shocks</span>
            </button>
            <button
              onClick={() => setFilterType("Policy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterType === "Policy"
                  ? "bg-[#002E5D] text-white shadow-sm"
                  : "bg-blue-50 border border-blue-200 text-[#002E5D] hover:bg-blue-100"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Central Bank / Policy</span>
            </button>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword or transmission channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#002E5D] shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Event Cards Chronological Timeline */}
      <div className="space-y-3.5">
        {filteredEvents.map((ev, index) => {
          const isSevere = ev.severity === "Severe";
          const isHigh = ev.severity === "High";

          return (
            <div
              key={index}
              className={`bg-white border rounded-xl p-5 transition-all shadow-sm hover:shadow-md ${
                isSevere
                  ? "border-l-4 border-l-red-600 border-gray-200"
                  : isHigh
                  ? "border-l-4 border-l-[#C5A059] border-gray-200"
                  : "border-l-4 border-l-[#002E5D] border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#002E5D] border border-blue-200">
                      {ev.event_date}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        ev.event_type === "Geopolitical"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : ev.event_type === "Policy"
                          ? "bg-blue-100 text-[#002E5D] border border-blue-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {ev.event_type}
                    </span>
                    <span className="text-xs text-gray-600 px-2 py-0.5 rounded bg-gray-100 border border-gray-200 font-medium">
                      Region: {ev.region}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSevere
                          ? "bg-red-600 text-white"
                          : isHigh
                          ? "bg-[#C5A059] text-[#002E5D]"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {ev.severity} Severity
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#002E5D] tracking-tight font-serif">
                    {ev.description}
                  </h3>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                    <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">
                      Transmission Channel & Portfolio Attribution:
                    </div>
                    <div className="text-gray-800 font-medium leading-relaxed">{ev.primary_transmission}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
