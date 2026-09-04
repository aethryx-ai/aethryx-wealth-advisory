import { FC, useState } from "react";
import {
  Check,
  Clipboard,
  Clock,
  Download,
  FileCheck,
  FileText,
  HelpCircle,
  MessageSquare,
  Shield,
  User,
  X,
  Zap
} from "lucide-react";
import { RM_PROFILE, TODAY } from "../data/jbWealthData";
import { generateClientAlerts } from "../services/intelligenceEngine";

interface MeetingDossierModalProps {
  clientData: any;
  onClose: () => void;
  onOpenAssistantWithPrompt?: (prompt: string) => void;
}

export const MeetingDossierModal: FC<MeetingDossierModalProps> = ({
  clientData,
  onClose,
  onOpenAssistantWithPrompt
}) => {
  const [copied, setCopied] = useState(false);
  const client = clientData.client;
  const portfolios = clientData.portfolios || [];
  const facility = clientData.creditFacility;
  const alerts = generateClientAlerts(client);

  const totalAum = client.total_aum_usd;

  // Curate tailor-made talking points based on specific client context
  let conversationStarters: string[] = [];
  let strategicPlaybook: string[] = [];
  let complianceReminders: string[] = [];

  if (client.client_id === "CL-0012") {
    // 71yo retired client with $5.6m duration loss on 2045 bonds
    conversationStarters = [
      "Acknowledge the emotional burden of the recent bond mark-to-market drop with empathy: 'Arthur, I understand seeing long-dated US Treasuries reprice as yields touched 4.71% has been deeply frustrating.'",
      "Gently reframe the long-term horizon: 'Your 2045 bonds have 19 years until par maturity. At age 71, our priority is funding your living expenses and medical care comfortably without forcing capital lock-up.'",
      "Present cash generation over capital recovery: 'Rather than waiting decades for long bonds to recover to par, let us transition a tranche into short-dated 5.2% floating rate notes to directly pay your quarterly living transfers.'"
    ];
    strategicPlaybook = [
      "Do NOT recommend selling the entire position in a single fire-sale.",
      "Propose staged duration shortening: sell 30% of 2045 maturities into 3-month Treasury bills and investment grade floating rate paper.",
      "Re-calibrate quarterly cash withdrawal schedule to match coupon dates."
    ];
    complianceReminders = [
      "Review client risk tolerance suitability score (currently 4/10 Moderate).",
      "Check that medical living withdrawal mandate is documented in file."
    ];
  } else if (client.client_id === "CL-0004") {
    // Marcus Sterling: Inbound email on Aug 19 panic shift to cash
    conversationStarters = [
      "Address the August 19 email directly: 'Marcus, I received your note regarding moving the entire portfolio into bank deposits. I wanted to meet immediately so we can evaluate the math together.'",
      "Illustrate the 10-year cash drag: 'While cash deposits feel safe today, inflation and future rate cuts will erode purchasing power by over USD 3.8m over your first 8 years of retirement.'",
      "Deliver a concrete income solution: 'To guarantee your USD 1.45m annual retirement income starting Q2 2027, we can build a dedicated high-grade sovereign and corporate bond ladder rather than taking equity risk.'"
    ];
    strategicPlaybook = [
      "Validate the client's genuine retirement horizon (retiring Q2 2027).",
      "Present side-by-side simulation: 100% Cash Deposits vs Dedicated Cash-Flow Matching Ladder.",
      "Secure mandate transition agreement before year-end."
    ];
    complianceReminders = [
      "File RM interaction note documenting reason for meeting following client's panic email.",
      "If client insists on 100% cash, issue formal Cash Drag & Reinvestment Risk Acknowledgment."
    ];
  } else if (client.client_id === "CL-0014") {
    // Adrian Fong: HK developer, margin call proximity 69.41% vs 70% trigger
    conversationStarters = [
      "Open with immediate governance clarity: 'Adrian, we need to address your CF-0002 facility. As of today, your LTV stands at 69.41% against a strict margin call trigger of 70.0%.'",
      "Address compound idiosyncratic property risk: 'Your operating business, your direct equity, and your SYN-SP-0504 accumulator are all exposed to the same Hong Kong property market downturn.'",
      "Propose actionable deleveraging options: 'We have 3 options: inject USD 1.2m cash buffer, pledge unencumbered Singapore liquid assets, or restructure the underwater accumulator.'"
    ];
    strategicPlaybook = [
      "Mandatory action: Prevent formal contractual margin call liquidation under credit policy.",
      "Hedge underwater accumulator (double-up active at HKD 17.20 vs current market ~10.1).",
      "Model liquidity schedule for HKD 60m redevelopment commitment due mid-2027."
    ];
    complianceReminders = [
      "Credit Risk Committee pre-notification logged.",
      "Sign margin maintenance covenant agreement."
    ];
  } else if (client.client_id === "CL-0003") {
    // Beatrix von Berg: German inheritance tax EUR 3.4m due Dec 2026
    conversationStarters = [
      "Reiterate support during her bereavement: 'Dr. von Berg, our primary duty is ensuring your late husband's estate settlement proceeds smoothly without any tax penalties.'",
      "Confirm tax filing requirement: 'We have confirmed the EUR 3,400,000 German inheritance tax liability falls due before December 31, 2026.'",
      "Ringfence liquid tax reserves now: 'Let us begin orderly liquidation of the volatile equity and alternative tranches so the tax amount sits safely in EUR money market funds by November.'"
    ];
    strategicPlaybook = [
      "Execute orderly sale of liquid developed market equities to raise EUR 3.4m.",
      "Align remaining portfolio with client's genuine Conservative risk profile.",
      "Audit German tax domicile vs Singapore booking centre tax treaty."
    ];
    complianceReminders = [
      "Obtain client signature on tax distribution instruction.",
      "Verify German probate documents and tax counsel confirmation."
    ];
  } else {
    // General client briefing
    conversationStarters = [
      `Review macroeconomic developments since our last review, specifically the Strait of Hormuz energy price movements and US Treasury yield shifts.`,
      `Discuss portfolio performance relative to the ${portfolios[0]?.benchmark || "Benchmark"} and check if current asset allocation matches your investment objectives.`,
      `Review any upcoming planned cash requirements or family milestone events for the next 12 months.`
    ];
    strategicPlaybook = [
      "Review single-name concentrations and verify all active suitability waivers.",
      "Evaluate opportunities to harvest elevated yields in short-duration credit.",
      "Confirm liquidity buffer against upcoming capital calls."
    ];
    complianceReminders = [
      "Ensure Annual KYC review is up-to-date (Due: " + client.kyc_review_due + ").",
      "Review suitability profile and investment horizon alignment."
    ];
  }

  const generateFullText = () => {
    return `BANK JULIUS BAER — EXECUTIVE CLIENT BRIEFING PACK
Generated for: Priscilla Ong (Senior Relationship Manager, Executive Director)
Booking Centre: ${client.booking_centre} Desk
As-of Date: ${TODAY}

============================================================
CLIENT OVERVIEW
============================================================
Client ID: ${client.client_id}
Client Name: ${client.client_name}
Wealth Band: ${client.wealth_band} (Total AUM: USD ${(totalAum / 1e6).toFixed(2)}m)
Age / Gender: ${client.age || "N/A"} / ${client.gender}
Source of Wealth: ${client.source_of_wealth}
Risk Profile: ${client.risk_profile} (Score: ${client.risk_tolerance_score}/10)
Tax Domicile: ${client.tax_domicile} | Nationality: ${client.nationality}
Investment Horizon: ${client.investment_horizon_years} Years
KYC Review Due: ${client.kyc_review_due}

============================================================
ACCOUNTS & PORTFOLIOS
============================================================
${portfolios.map((p: any) => `- ${p.portfolio_id}: ${p.portfolio_name} (${p.service_model}, Mandate: ${p.mandate_name}, AUM: USD ${(p.aum_usd_current / 1e6).toFixed(2)}m)`).join("\n")}

============================================================
ACTIVE INTELLIGENCE ALERTS & GOVERNANCE
============================================================
${alerts.map((a: any) => `[${a.severity}] ${a.title}\n  Description: ${a.description}\n  Recommended Action: ${a.recommendedAction}`).join("\n\n")}

============================================================
EMPATHETIC CONVERSATION STARTERS & CLIENT-CENTRIC TALKING POINTS
============================================================
${conversationStarters.map((s, i) => `${i + 1}. ${s}`).join("\n\n")}

============================================================
STRATEGIC ADVISORY PLAYBOOK
============================================================
${strategicPlaybook.map((p, i) => `• ${p}`).join("\n")}

============================================================
GOVERNANCE & COMPLIANCE CHECKLIST
============================================================
${complianceReminders.map((c, i) => `[ ] ${c}`).join("\n")}

Strictly Confidential — Bank Julius Baer & Co. Ltd.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#002E5D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#002E5D]/10 border border-[#002E5D]/20 text-[#002E5D] flex items-center justify-center font-bold shadow-sm">
              <FileText className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#C5A059] font-bold">
                Julius Baer Wealth Intelligence • Meeting Preparation Dossier
              </div>
              <h3 className="text-xl font-bold font-serif text-[#002E5D] tracking-tight">
                {client.client_name} ({client.client_id})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#002E5D] text-xs font-bold border border-gray-300 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Dossier!" : "Copy Full Brief"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-800">
          {/* Executive Summary Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4.5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Client & Wealth Band</div>
              <div className="font-bold text-gray-900 text-sm mt-0.5">{client.client_name}</div>
              <div className="text-gray-600 font-medium">{client.wealth_band} • {client.booking_centre} Desk</div>
            </div>
            <div>
              <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Total Book Value</div>
              <div className="font-bold text-[#002E5D] font-mono text-base mt-0.5">
                USD {(totalAum / 1e6).toFixed(2)}m
              </div>
              <div className="text-gray-600 font-medium">{portfolios.length} accounts under custody/mandate</div>
            </div>
            <div>
              <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Meeting Urgency</div>
              <div className="font-bold text-red-700 text-sm mt-0.5 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Scheduled for Discussion Today</span>
              </div>
              <div className="text-gray-600 font-medium">KYC Due: {client.kyc_review_due}</div>
            </div>
          </div>

          {/* Section 1: Conversation Starters (Empathetic & Defensible) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#002E5D]">
              <MessageSquare className="w-4 h-4 text-[#C5A059]" />
              <span>Recommended Empathetic Conversation Starters</span>
            </div>
            <div className="space-y-2.5">
              {conversationStarters.map((starter, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-3.5 text-xs text-gray-800 leading-relaxed border-l-4 border-l-[#C5A059] shadow-sm font-sans"
                >
                  <span className="font-bold text-[#002E5D]">Point {i + 1}: </span>
                  {starter}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Strategic Advisory Playbook */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#002E5D]">
              <Zap className="w-4 h-4 text-[#C5A059]" />
              <span>Relationship Manager Action Playbook</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-xs">
              {strategicPlaybook.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-gray-800 font-medium">
                  <span className="text-[#002E5D] font-bold">•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Governance & Compliance Review */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#002E5D]">
              <Shield className="w-4 h-4 text-[#C5A059]" />
              <span>Private Banking Governance & Compliance Audit</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-xs">
              {complianceReminders.map((reminder, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-700">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{reminder}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div>Audited Event Grounding Source: 2026 Julius Baer Wealth Intelligence Engine</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#002E5D] hover:bg-[#002244] text-white font-bold transition-colors shadow-sm"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
