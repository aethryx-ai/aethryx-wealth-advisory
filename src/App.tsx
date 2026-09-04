import { useState } from "react";
import { Header } from "./components/Header";
import { BookIntelligence } from "./components/BookIntelligence";
import { ClientDeepDive } from "./components/ClientDeepDive";
import { MacroEventTimeline } from "./components/MacroEventTimeline";
import { ScenarioSimulator } from "./components/ScenarioSimulator";
import { AdvisoryAIAssistant } from "./components/AdvisoryAIAssistant";
import { MeetingDossierModal } from "./components/MeetingDossierModal";
import { getPrioritisedBook } from "./services/intelligenceEngine";
import { clientsData, TODAY } from "./data/jbWealthData";
import type { PrioritisedClient } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"book" | "deepdive" | "events" | "scenario" | "assistant">("book");
  const [selectedClientId, setSelectedClientId] = useState<string>("CL-0014");
  const [dossierClient, setDossierClient] = useState<any | null>(null);

  const prioritisedBook = getPrioritisedBook();
  const totalAumUsd = clientsData.reduce((sum, c) => sum + c.total_aum_usd, 0);
  const callTodayCount = prioritisedBook.filter((c) => c.priorityTier === "CALL_TODAY").length;
  const criticalMarginCount = prioritisedBook.filter(
    (c) => c.creditFacility && c.creditFacility.margin_call_ltv_pct - c.creditFacility["ltv_pct_2026-08-26"] <= 2.0
  ).length;

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab("deepdive");
  };

  const handleOpenDossier = (clientItem: any) => {
    setDossierClient(clientItem);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#002E5D]/20 selection:text-[#002E5D]">
      {/* Julius Baer Navigation & Context Banner */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedClientId={selectedClientId}
        totalAumUsd={totalAumUsd}
        callTodayCount={callTodayCount}
        criticalMarginCount={criticalMarginCount}
        onOpenAssistant={() => setActiveTab("assistant")}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "book" && (
          <BookIntelligence
            clients={prioritisedBook}
            onSelectClient={handleSelectClient}
            onOpenMeetingDossier={handleOpenDossier}
          />
        )}

        {activeTab === "deepdive" && (
          <ClientDeepDive
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onOpenMeetingDossier={handleOpenDossier}
            onOpenAssistant={() => setActiveTab("assistant")}
          />
        )}

        {activeTab === "events" && <MacroEventTimeline />}

        {activeTab === "scenario" && <ScenarioSimulator />}

        {activeTab === "assistant" && (
          <AdvisoryAIAssistant
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
          />
        )}
      </main>

      {/* Professional Polish Footer */}
      <footer className="border-t border-gray-200 bg-white py-3 text-xs text-gray-500 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-4 text-gray-500">
            <span className="font-semibold text-[#002E5D]">BANK JULIUS BAER & CO. LTD.</span>
            <span>•</span>
            <span>SECURE RM SESSION: ACTIVE</span>
            <span>•</span>
            <span>BOOKING CENTRES: SINGAPORE & HONG KONG</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-gray-400">
            <span className="text-gray-600 font-medium italic">Human-in-the-loop: All advisory insights subject to RM verification.</span>
            <span>•</span>
            <span className="text-[#002E5D] font-semibold">v4.2.0</span>
          </div>
        </div>
      </footer>

      {/* Meeting Dossier Modal */}
      {dossierClient && (
        <MeetingDossierModal
          clientData={dossierClient}
          onClose={() => setDossierClient(null)}
          onOpenAssistantWithPrompt={(prompt) => {
            setDossierClient(null);
            setActiveTab("assistant");
          }}
        />
      )}
    </div>
  );
}
