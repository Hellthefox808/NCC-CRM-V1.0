import React, { useState } from "react";
import { X, CheckSquare, Calendar, User, Flag, Loader2, AlertCircle } from "lucide-react";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";
import type { ChatMessage, ConversationMember } from "@backend/services/messaging/chat.service";

interface ConvertToTaskModalProps {
  isOpen: boolean;
  message: ChatMessage | null;
  conversationId: string;
  members: ConversationMember[];
  onClose: () => void;
  onConverted: (taskId: string, updatedMessage: ChatMessage) => void;
}

export const ConvertToTaskModal: React.FC<ConvertToTaskModalProps> = ({
  isOpen,
  message,
  conversationId,
  members,
  onClose,
  onConverted,
}) => {
  const [title, setTitle] = useState(
    message ? message.content.slice(0, 80).replace(/\n/g, " ") : "",
  );
  const [assignedTo, setAssignedTo] = useState<string>(
    members.length > 0 ? members[0].userName : "All Cadre",
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !message) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await EnterpriseDataPlatform.convertMessageToTask(message.id, {
        title: title.trim(),
        assignedTo,
        priority,
        dueDate,
        conversationId,
      });

      if (res.success && res.data) {
        onConverted(res.data.taskId, res.data.message);
        onClose();
      } else {
        setError(res.error || "Failed to create task from message.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error converting task";
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
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Convert to CRM Task</h3>
              <p className="text-[11px] text-zinc-400">Track action items and squad follow-ups</p>
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

          {/* Source Message Preview */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-zinc-300">
            <span className="font-bold text-zinc-400 block mb-1">
              Source Message ({message.senderName}):
            </span>
            <p className="italic truncate">&ldquo;{message.content}&rdquo;</p>
          </div>

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kote Room Rifle Verification"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              maxLength={120}
              autoFocus
            />
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Assignee</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All Cadre">All Cadre / Squad</option>
              {members.map((m) => (
                <option key={m.id} value={m.userName}>
                  {m.userName} ({m.userRole})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
                <Flag className="w-3.5 h-3.5 text-zinc-400" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
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
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white shadow-lg flex items-center space-x-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <span>Create Task</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
