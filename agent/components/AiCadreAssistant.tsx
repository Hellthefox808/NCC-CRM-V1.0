import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";

interface AiCadreAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

const NccLogoAvatar: React.FC<{ size?: string }> = ({ size = "w-8 h-8" }) => (
  <div
    className={`relative ${size} rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 border border-blue-500 overflow-hidden ring-1 ring-blue-500/40`}
  >
    <img
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10"
      alt="19 JHR BN NCC Crest"
      className="w-full h-full object-contain rounded-full"
      referrerPolicy="no-referrer"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        if (e.currentTarget.nextElementSibling) {
          (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
        }
      }}
    />
    <div className="hidden w-full h-full bg-[#18181B] rounded-full flex items-center justify-center text-blue-500 font-bold text-[8px]">
      NCC
    </div>
  </div>
);

export const AiCadreAssistant: React.FC<AiCadreAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Jai Hind! I am Subedar Major AI Assistant for 19 Jharkhand Battalion NCC (SBU Ranchi). Powered by Google Gemini AI, how can I assist you today regarding NCC Enrollment 2026-27, physical fitness benchmarks, 'C' certificate SSB entry, or squad drill training?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "What are physical criteria for SD/SW cadets?",
    "How does 'C' certificate help in direct SSB interview?",
    "What documents are needed for physical verification?",
    "Explain basic words of command in squad drill",
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt) return;

    const userMsg: ChatMessage = { sender: "user", text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await EnterpriseDataPlatform.sendAiMessage(prompt, true);
      const aiReply =
        res.data?.reply ||
        "Jai Hind! Please visit 19 JHR BN NCC office at Sarala Birla University for further assistance.";
      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Jai Hind! Applications for NCC 19 Jharkhand Battalion at SBU Ranchi are open. Please contact Associate NCC Officer (ANO) at SBU campus.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full h-[85vh] max-h-[620px] flex flex-col shadow-2xl border border-white/40 overflow-hidden text-left relative ring-1 ring-black/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#18181B] via-[#09090B] to-[#09090B] backdrop-blur-md text-white p-4 flex justify-between items-center border-b border-blue-600/40">
              <div className="flex items-center space-x-3">
                <NccLogoAvatar size="w-10 h-10" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center space-x-2">
                    <span>Subedar Major AI Assistant</span>
                    <span className="bg-blue-500/20 text-blue-300 text-[9px] px-2 py-0.5 rounded-full border border-blue-500/50 uppercase font-black tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-blue-300" />
                      Gemini 3.1 Pro (High Thinking)
                    </span>
                  </h3>
                  <p className="text-[11px] text-blue-300/90 font-medium">
                    19 Jharkhand Battalion NCC • SBU Ranchi
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        sender: "ai",
                        text: "Jai Hind! Chat reset. How can I assist you with 19 JHR BN NCC Enrollment, Physical fitness benchmarks, 'C' Certificate, or squad drill commands?",
                      },
                    ])
                  }
                  className="text-blue-300 hover:text-white hover:bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border border-blue-500/30"
                  title="Reset conversation"
                >
                  Reset
                </button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-zinc-300 hover:text-white hover:bg-white/10 p-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4.5 overflow-y-auto space-y-3.5 bg-zinc-50/70 backdrop-blur-xs text-xs sm:text-sm">
              {messages.map((m, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={idx}
                  className={`flex items-start space-x-2.5 ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.sender === "ai" && <NccLogoAvatar size="w-7 h-7" />}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-[#18181B] backdrop-blur-sm text-white rounded-tr-none font-semibold shadow-xs"
                        : "bg-white/95 backdrop-blur-sm text-zinc-800 border border-zinc-200/90 rounded-tl-none shadow-2xs font-normal"
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.sender === "user" && (
                    <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0 mt-1 border border-zinc-300">
                      <User className="w-4 h-4 text-zinc-700" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 text-zinc-700 text-xs font-semibold italic bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-zinc-200/80 w-fit shadow-2xs">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Subedar Major AI is analyzing with Gemini AI Engine...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-3 bg-zinc-100/90 backdrop-blur-md border-t border-zinc-200/80 overflow-x-auto flex gap-2 whitespace-nowrap">
              {quickPrompts.map((qp, qIdx) => (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  key={qIdx}
                  onClick={() => handleSend(qp)}
                  className="bg-white/90 hover:bg-blue-100/90 backdrop-blur-xs text-zinc-800 hover:text-[#18181B] border border-zinc-300/80 hover:border-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {qp}
                </motion.button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white/90 backdrop-blur-md border-t border-zinc-200/80 flex space-x-2.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI about NCC Enrollment, Physical tests, C Certificate..."
                className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 focus:ring-2 focus:ring-[#18181B] focus:border-[#18181B] focus:outline-hidden"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                id="ai-chat-input"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-zinc-950 font-black px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm transition-all uppercase tracking-wider"
                id="ai-chat-send-btn"
              >
                <Send className="w-4 h-4 text-zinc-950" />
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
