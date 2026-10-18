import React, { useState } from "react";
import { X, BarChart2, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";
import type { ChatMessage } from "@backend/services/messaging/chat.service";

interface CreatePollModalProps {
  isOpen: boolean;
  conversationId: string;
  onClose: () => void;
  onCreated: (pollMessage: ChatMessage) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  conversationId,
  onClose,
  onCreated,
}) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowsMultiple, setAllowsMultiple] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions((prev) => [...prev, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Please specify a poll question.");
      return;
    }

    const cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (cleanOptions.length < 2) {
      setError("Please provide at least 2 distinct choices.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await EnterpriseDataPlatform.createPoll(conversationId, {
        question: question.trim(),
        options: cleanOptions,
        allowsMultiple,
      });

      if (res.success && res.data?.message) {
        onCreated(res.data.message);
        onClose();
        setQuestion("");
        setOptions(["", ""]);
      } else {
        setError(res.error || "Failed to launch poll.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating poll";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden border border-white/10 rounded-2xl glass-panel shadow-2xl bg-[#0b1329]/95 text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Create Cadre Poll</h3>
              <p className="text-[11px] text-zinc-400">
                Collect real-time consensus from unit members
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Poll Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Preferred timing for weekend 1600m time trial?"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              maxLength={150}
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300">
                Choices ({options.length}/5)
              </label>
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Choice</span>
                </button>
              )}
            </div>

            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-bold text-zinc-500 w-4 text-center">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  maxLength={80}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center space-x-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={allowsMultiple}
                onChange={(e) => setAllowsMultiple(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Allow members to choose multiple options</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !question.trim()}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white shadow-lg flex items-center space-x-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Launching...</span>
                </>
              ) : (
                <span>Launch Poll</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
