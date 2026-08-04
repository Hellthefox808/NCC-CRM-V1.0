import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { EnterpriseDataPlatform } from "../services/dataPlatform";

interface AiCadreAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

const NccLogoAvatar: React.FC<{ size?: string }> = ({ size = "w-8 h-8" }) => (
  <div className={`relative ${size} rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400 overflow-hidden ring-1 ring-amber-400/40`}>
    <img 
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10" 
      alt="19 JHR BN NCC Crest" 
      className="w-full h-full object-contain rounded-full"
      referrerPolicy="no-referrer"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        if (e.currentTarget.nextElementSibling) {
          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
        }
      }}
    />
    <div className="hidden w-full h-full bg-[#002147] rounded-full flex items-center justify-center text-amber-400 font-bold text-[8px]">
      NCC
    </div>
  </div>
);

export const AiCadreAssistant: React.FC<AiCadreAssistantProps> = ({
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Jai Hind! I am Subedar Major AI Assistant for 19 Jharkhand Battalion NCC (SBU Ranchi). Powered by Google Gemini AI, how can I assist you today regarding NCC Enrollment 2026-27, physical fitness benchmarks, 'C' certificate SSB entry, or squad drill training?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "What are physical criteria for SD/SW cadets?",
    "How does 'C' certificate help in direct SSB interview?",
    "What documents are needed for physical verification?",
    "Explain basic words of command in squad drill"
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt) return;

    const userMsg: ChatMessage = { sender: "user", text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await EnterpriseDataPlatform.sendAiMessage(prompt, true);
      const aiReply = res.data?.reply || "Jai Hind! Please visit 19 JHR BN NCC office at Sarala Birla University for further assistance.";
      setMessages(prev => [...prev, { sender: "ai", text: aiReply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: "Jai Hind! Applications for NCC 19 Jharkhand Battalion at SBU Ranchi are open. Please contact Associate NCC Officer (ANO) at SBU campus." }
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
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full h-[85vh] max-h-[620px] flex flex-col shadow-2xl border border-white/40 overflow-hidden text-left relative ring-1 ring-black/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#002147] via-[#001838] to-[#000d20] backdrop-blur-md text-white p-4 flex justify-between items-center border-b border-amber-500/40">
              <div className="flex items-center space-x-3">
                <NccLogoAvatar size="w-10 h-10" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Subedar Major AI Assistant
                  </h3>
                  <p className="text-[11px] text-amber-300/90 font-medium">19 Jharkhand Battalion NCC • SBU Ranchi</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-slate-300 hover:text-white hover:bg-white/10 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4.5 overflow-y-auto space-y-3.5 bg-slate-50/70 backdrop-blur-xs text-xs sm:text-sm">
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
                  {m.sender === "ai" && (
                    <NccLogoAvatar size="w-7 h-7" />
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-[#002147] backdrop-blur-sm text-white rounded-tr-none font-semibold shadow-xs"
                        : "bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-200/90 rounded-tl-none shadow-2xs font-normal"
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.sender === "user" && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 mt-1 border border-slate-300">
                      <User className="w-4 h-4 text-slate-700" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 text-slate-700 text-xs font-semibold italic bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/80 w-fit shadow-2xs">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>
                    Subedar Major AI is analyzing with Gemini AI Engine...
                  </span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-3 bg-slate-100/90 backdrop-blur-md border-t border-slate-200/80 overflow-x-auto flex gap-2 whitespace-nowrap">
              {quickPrompts.map((qp, qIdx) => (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  key={qIdx}
                  onClick={() => handleSend(qp)}
                  className="bg-white/90 hover:bg-yellow-100/90 backdrop-blur-xs text-slate-800 hover:text-[#002147] border border-slate-300/80 hover:border-yellow-500 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {qp}
                </motion.button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white/90 backdrop-blur-md border-t border-slate-200/80 flex space-x-2.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI about NCC Enrollment, Physical tests, C Certificate..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#002147] focus:border-[#002147] focus:outline-hidden"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                id="ai-chat-input"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm transition-all uppercase tracking-wider"
                id="ai-chat-send-btn"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
