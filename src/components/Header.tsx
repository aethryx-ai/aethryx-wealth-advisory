import { FC } from "react";
import {
  ShieldAlert,
  Calendar,
  Building2,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Zap,
  Clock,
  Compass
} from "lucide-react";
import { RM_PROFILE, TODAY } from "../data/jbWealthData";

interface HeaderProps {
  activeTab: "book" | "deepdive" | "events" | "scenario" | "assistant";
  setActiveTab: (tab: "book" | "deepdive" | "events" | "scenario" | "assistant") => void;
  selectedClientId: string;
  totalAumUsd: number;
  callTodayCount: number;
  criticalMarginCount: number;
  onOpenAssistant: () => void;
}

export const Header: FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalAumUsd,
  callTodayCount,
  criticalMarginCount,
  onOpenAssistant
}) => {
  return (
    <header className="bg-[#002E5D] text-white border-b-2 border-[#C5A059] shadow-md">
      {/* Top Brand Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Desk Info */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold tracking-tight text-white font-serif">JULIUS BAER</div>
            <div className="h-6 w-[1px] bg-white/25"></div>
            <div className="text-xs font-semibold text-[#C5A059] uppercase tracking-widest hidden sm:block">
              Wealth Intelligence Workbench
            </div>
          </div>
        </div>

        {/* RM Profile & Global Context */}
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-white/70 tracking-wider">
              Relationship Manager
            </div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{RM_PROFILE.name}</span>
              <span className="text-[10px] text-white/60 font-normal">({RM_PROFILE.desk})</span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-white/20 hidden sm:block"></div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-white/70 tracking-wider">
              System As-Of Date
            </div>
            <div className="text-sm font-semibold font-mono text-[#00FFCC] tracking-tight">
              {TODAY}
            </div>
          </div>

          {/* AI Trigger */}
          <button
            onClick={onOpenAssistant}
            className="bg-[#C5A059] hover:bg-[#b08e4d] text-[#002E5D] font-bold px-3.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 shadow-sm ml-1"
            title="Open Gemini Wealth Intelligence Copilot"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Ticker Ribbon */}
      <div className="bg-[#002244] border-t border-white/10 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5 text-white/90">
              <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-white/70">Total Book AUM:</span>
              <span className="font-mono font-bold text-white">
                USD {(totalAumUsd / 1e6).toFixed(1)}m
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-white/90">
              <UserCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-white/70">Clients Managed:</span>
              <span className="font-mono font-bold text-white">20</span>
              <span className="text-white/60 text-[11px]">(24 Portfolios)</span>
            </div>

            {callTodayCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-200 bg-red-950/70 border border-red-500/60 px-2.5 py-0.5 rounded">
                <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="font-bold">{callTodayCount} Priority Actions Today</span>
              </div>
            )}

            {criticalMarginCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-200 bg-amber-950/70 border border-amber-500/60 px-2.5 py-0.5 rounded">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-bold">{criticalMarginCount} Lombard Facilities Near Trigger</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-white/70 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00FFCC]"></span>
            <span>Relational Intelligence: 1,015 holdings • 16 audited events</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 pt-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("book")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "book"
              ? "border-[#C5A059] text-[#C5A059] bg-white/10 rounded-t-md font-semibold"
              : "border-transparent text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>RM Book Prioritisation</span>
          {callTodayCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">
              {callTodayCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("deepdive")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "deepdive"
              ? "border-[#C5A059] text-[#C5A059] bg-white/10 rounded-t-md font-semibold"
              : "border-transparent text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Client Portfolio Deep Dive</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "events"
              ? "border-[#C5A059] text-[#C5A059] bg-white/10 rounded-t-md font-semibold"
              : "border-transparent text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>2026 Macro Event Attribution</span>
        </button>

        <button
          onClick={() => setActiveTab("scenario")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "scenario"
              ? "border-[#C5A059] text-[#C5A059] bg-white/10 rounded-t-md font-semibold"
              : "border-transparent text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Scenario & Stress Testing</span>
        </button>

        <button
          onClick={() => setActiveTab("assistant")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "assistant"
              ? "border-[#C5A059] text-[#C5A059] bg-white/10 rounded-t-md font-semibold"
              : "border-transparent text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>AI Advisory Copilot</span>
        </button>
      </div>
    </header>
  );
};
