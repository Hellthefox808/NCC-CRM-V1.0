import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, User, X, RotateCcw, Shield, Award } from "lucide-react";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";

interface AiCadreAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const NccLogoAvatar: React.FC<{ size?: string }> = ({ size = "w-10 h-10" }) => (
  <div
    className={`relative ${size} rounded-full bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 p-[1.5px] shadow-sm flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-[#8C5E3C]/30`}
  >
    <div className="w-full h-full rounded-full bg-[#FAF7F2] p-0.5 flex items-center justify-center overflow-hidden">
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
      <div className="hidden w-full h-full bg-[#FAF4EC] rounded-full flex items-center justify-center text-[#8C5E3C] font-extrabold text-[9px]">
        NCC
      </div>
    </div>
    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
  </div>
);

export const AiCadreAssistant: React.FC<AiCadreAssistantProps> = ({ isOpen, onClose }) => {
  const getFormattedTime = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: "Jai Hind! I am Subedar Major AI Assistant for 19 Jharkhand Battalion NCC (SBU Ranchi). Powered by Google Gemini AI, how can I assist you today regarding NCC Enrollment 2026-27, physical fitness benchmarks, 'C' certificate SSB entry, or squad drill training?",
      timestamp: getFormattedTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "🏃 Physical test criteria for SD & SW?",
    "🏅 How 'C' Certificate gives direct SSB?",
    "📄 Required documents for physical test?",
    "🗣️ Basic squad drill words of command?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: getFormattedTime(),
    };

    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await EnterpriseDataPlatform.sendAiMessage(prompt, historyPayload, true);
      const aiReply =
        res.data?.reply ||
        "Jai Hind! Please visit 19 JHR BN NCC office at Sarala Birla University for further assistance.";
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiReply,
          timestamp: getFormattedTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "Jai Hind! Applications for NCC 19 Jharkhand Battalion at SBU Ranchi are open. Please contact Associate NCC Officer (ANO) at SBU campus.",
          timestamp: getFormattedTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: "ai",
        text: "Jai Hind! Conversation reset. How can I assist you with 19 JHR BN NCC Enrollment, Physical fitness benchmarks, 'C' Certificate, or squad drill commands?",
        timestamp: getFormattedTime(),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 25 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="bg-[#FAF7F2] text-[#3B281C] rounded-3xl max-w-xl w-full h-[88vh] max-h-[680px] flex flex-col shadow-2xl border border-[#8C5E3C]/30 overflow-hidden text-left relative ring-1 ring-black/5"
          >
            {/* Authentic NCC Tricolor Bar (Navy Blue + Army Red + Air Force Sky Blue) */}
            <div className="h-1.5 w-full grid grid-cols-3 shrink-0">
              <div className="bg-[#1E3A8A]" title="Navy Blue - Indian Navy Wing" />
              <div className="bg-[#DC2626]" title="Army Red - Indian Army Wing" />
              <div className="bg-[#0284C7]" title="Light Blue - Indian Air Force Wing" />
            </div>

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#FAF4EC] via-[#FFFBF5] to-[#FAF4EC] p-4 flex justify-between items-center border-b border-[#E8DDD1] shadow-xs shrink-0">
              <div className="flex items-center space-x-3">
                <NccLogoAvatar size="w-10 h-10" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm sm:text-base font-black text-[#3B281C] tracking-tight flex items-center gap-1.5">
                      <span>Subedar Major AI Assistant</span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#5C3D26] font-bold flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0" />
                    <span>19 Jharkhand Battalion NCC</span>
                    <span className="text-[#A08875]">•</span>
                    <span>SBU Ranchi</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-[#5C3D26] hover:text-[#3B281C] bg-[#F5ECE3] hover:bg-[#EBDDD0] px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all border border-[#D6C5B3]"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8C5E3C]" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-[#5C3D26] hover:text-[#3B281C] hover:bg-black/5 p-2 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FFFBF7] text-xs sm:text-sm scrollbar-thin scrollbar-thumb-[#D6C5B3] scrollbar-track-transparent">
              {messages.map((m) => (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  key={m.id}
                  className={`flex items-start gap-3 ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.sender === "ai" && <NccLogoAvatar size="w-8 h-8" />}

                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-gradient-to-r from-[#8C5E3C] to-[#6E472D] text-white rounded-tr-xs font-medium shadow-md border border-[#5C3D26]/20"
                        : "bg-white text-[#3B281C] border-l-4 border-l-[#DC2626] border border-[#E8DDD1] rounded-tl-xs shadow-sm font-normal"
                    }`}
                  >
                    {m.sender === "ai" && (
                      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#F0E6DC] text-[10px] text-[#8C5E3C] font-extrabold uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5 text-[#8C5E3C]" />
                        <span>19 JHR BN NCC • Cadre Command</span>
                      </div>
                    )}
                    <p className="text-xs sm:text-sm leading-relaxed">{m.text}</p>
                    <div
                      className={`text-[10px] mt-2 text-right ${
                        m.sender === "user" ? "text-amber-100/90" : "text-[#9E8B7C]"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-[#8C5E3C] text-white flex items-center justify-center shrink-0 shadow-sm border border-[#6E472D]/30">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <NccLogoAvatar size="w-8 h-8" />
                  <div className="bg-white text-[#3B281C] border-l-4 border-l-[#DC2626] border border-[#E8DDD1] p-3.5 rounded-2xl rounded-tl-xs shadow-sm flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#8C5E3C] animate-spin shrink-0" />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C5E3C]">
                      <span>Subedar Major AI is analyzing</span>
                      <span className="flex gap-1 items-center ml-1">
                        <span className="w-1.5 h-1.5 bg-[#8C5E3C] rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-[#8C5E3C] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-[#8C5E3C] rounded-full animate-bounce [animation-delay:0.4s]" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="p-2.5 bg-[#F5ECE3]/90 backdrop-blur-md border-t border-b border-[#E8DDD1] flex gap-2 overflow-x-auto no-scrollbar">
              {quickPrompts.map((qp, qIdx) => (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  key={qIdx}
                  onClick={() => handleSend(qp)}
                  className="bg-white text-[#5C3D26] hover:bg-[#8C5E3C] hover:text-white border border-[#D6C5B3] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1"
                >
                  <span>{qp}</span>
                </motion.button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-[#FAF4EC] border-t border-[#E8DDD1] flex gap-2.5 items-center shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI about NCC Enrollment, Physical tests, C Certificate..."
                className="flex-1 bg-white border border-[#D6C5B3] rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-[#3B281C] placeholder:text-[#A08875] focus:outline-none focus:border-[#8C5E3C] focus:ring-2 focus:ring-[#8C5E3C]/20 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                id="ai-chat-input"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-[#DC2626] via-[#1E3A8A] to-[#0284C7] hover:brightness-110 text-white font-black px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-md transition-all uppercase tracking-wider"
                id="ai-chat-send-btn"
              >
                <Send className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
