import { FC, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  Clipboard,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  User,
  Zap
} from "lucide-react";
import { clientsData, TODAY } from "../data/jbWealthData";

interface AdvisoryAIAssistantProps {
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export const AdvisoryAIAssistant: FC<AdvisoryAIAssistantProps> = ({
  selectedClientId,
  onSelectClient
}) => {
  const client = clientsData.find((c) => c.client_id === selectedClientId) || clientsData[0];
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: `Welcome, Executive Director Priscilla Ong. I am your Julius Baer Wealth Advisory Intelligence Copilot on **26 August 2026**.\n\nI have complete look-through across your 20 Asia desk clients, their 24 portfolios, 5 Lombard credit lines, uncalled private equity commitments, and audited 2026 macroeconomic events.\n\nSelect a client or quick prompt below to draft defensible client talking points, prepare for difficult margin conversations, or stress-test liquidity plans.`,
      timestamp: "09:00 AM"
    }
  ]);

  const quickPrompts = [
    {
      label: "Arthur Pendelton (CL-0012) Bond Drawdown Script",
      clientId: "CL-0012",
      prompt: "Arthur Pendelton is 71 and distraught seeing $5.6m duration losses on his 2045 Treasuries while withdrawing living expenses. Draft an empathetic, mathematically sound talking script for our meeting today."
    },
    {
      label: "Adrian Fong (CL-0014) 69.41% Margin Call Deleveraging",
      clientId: "CL-0014",
      prompt: "Adrian Fong's Lombard facility is at 69.41% LTV vs 70.0% trigger, and his Golden Harbour accumulator is underwater with double-up active. Provide 3 concrete deleveraging solutions to present right now."
    },
    {
      label: "Marcus Sterling (CL-0004) Cash-Drag Counter-Proposal",
      clientId: "CL-0004",
      prompt: "Marcus emailed wanting to dump all $24m into bank cash. Formulate our advisory response showing the multi-million dollar cash drag over a 10-year retirement horizon and propose an income ladder."
    },
    {
      label: "Beatrix von Berg (CL-0003) EUR 3.4m Tax Liquidation",
      clientId: "CL-0003",
      prompt: "Dr. Beatrix von Berg has a EUR 3.4m German inheritance tax deadline due before year-end. How should we execute an orderly liquidation while respecting her conservative risk profile?"
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          clientContext: {
            client_id: client.client_id,
            client_name: client.client_name,
            wealth_band: client.wealth_band,
            booking_centre: client.booking_centre,
            total_aum_usd: client.total_aum_usd,
            risk_profile: client.risk_profile,
            risk_tolerance_score: client.risk_tolerance_score,
            source_of_wealth: client.source_of_wealth,
            objectives: client.objectives
          }
        })
      });

      const data = await response.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.text || data.error || "Unable to generate advisory response.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `Advisory Engine fallback:\n\nFor ${client.client_name} (${client.client_id}):\n- Ground your discussion in the 26 August 2026 audited event timeline.\n- Address upcoming liquidity needs and verify signed suitability waivers on file.\n- Maintain an empathetic tone prioritizing capital preservation.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#002E5D]/10 text-[#002E5D] border border-[#002E5D]/20 mb-2">
              <Zap className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="uppercase tracking-wider">Julius Baer Wealth Intelligence Copilot</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#002E5D] tracking-tight">
              Advisory Copilot & Meeting Strategy Engine
            </h2>
            <p className="text-gray-600 text-sm mt-1 max-w-3xl">
              Equipping Priscilla Ong with immediate, compliant, and empathetic talking points, client pushback
              rebuttals, and cross-portfolio look-through reasoning powered by Gemini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Context Client:</span>
            <select
              value={selectedClientId}
              onChange={(e) => onSelectClient(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#002E5D] font-bold shadow-inner"
            >
              {clientsData.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.client_id} - {c.client_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => {
                onSelectClient(qp.clientId);
                handleSendMessage(qp.prompt);
              }}
              className="text-xs bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-[#002E5D] border border-gray-200 hover:border-[#002E5D]/30 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 text-left font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Chat Window */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[580px]">
        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/50">
          {messages.map((m) => {
            const isAI = m.sender === "ai";
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAI ? "justify-start" : "justify-end"}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-[#002E5D]/10 border border-[#002E5D]/20 text-[#002E5D] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                    isAI
                      ? "bg-white border border-gray-200 text-gray-800"
                      : "bg-[#002E5D] text-white font-medium ml-auto"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[10px] text-right font-mono ${
                      isAI ? "text-gray-400" : "text-blue-200"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-lg bg-gray-200 border border-gray-300 text-gray-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#002E5D]/10 border border-[#002E5D]/20 text-[#002E5D] flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin text-[#C5A059]" />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 shadow-sm">
                Julius Baer Wealth Intelligence Engine is synthesizing client telemetry & compliance rules...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask advisory question or simulate dialogue for ${client.client_name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#002E5D] shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#002E5D] hover:bg-[#002244] disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Advise</span>
              <Send className="w-3.5 h-3.5 text-[#C5A059]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
