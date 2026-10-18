import React, { useState, useEffect } from "react";
import { X, Users, ShieldCheck, Check, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";
import type {
  ChatContact,
  Conversation,
  GroupType,
} from "@backend/services/messaging/chat.service";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newConversation: Conversation) => void;
  currentUserRole?: string;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  currentUserRole = "CADET",
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("unit");
  const [isOfficial, setIsOfficial] = useState(false);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchContact, setSearchContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOfficer = currentUserRole === "ADMIN" || currentUserRole === "officer";

  useEffect(() => {
    if (isOpen) {
      EnterpriseDataPlatform.getEligibleContacts()
        .then((res) => {
          if (res.success && res.data?.contacts) {
            setContacts(res.data.contacts);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      (c.rank && c.rank.toLowerCase().includes(searchContact.toLowerCase())) ||
      (c.role && c.role.toLowerCase().includes(searchContact.toLowerCase())),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a group title.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await EnterpriseDataPlatform.createConversation({
        type: isOfficial ? "channel" : "group",
        title: title.trim(),
        description: description.trim() || undefined,
        groupType,
        isOfficial,
        memberIds: selectedMemberIds,
      });

      if (res.success && res.data?.conversation) {
        onCreated(res.data.conversation);
        onClose();
      } else {
        setError(res.error || "Failed to create group.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error creating group";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden border border-white/10 rounded-2xl glass-panel shadow-2xl bg-[#0b1329]/95 text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Create Communication Group</h3>
              <p className="text-xs text-zinc-400">19 JHR BN NCC Cadet & Officer Collaboration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-xs font-semibold text-red-300 bg-red-950/40 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
              Group Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Purulia Road Platoon Alpha / ATC-VI Logistics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border border-white/10 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={groupType}
                onChange={(e) => setGroupType(e.target.value as GroupType)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input border border-white/10 focus:border-blue-500 outline-none"
              >
                <option value="unit" className="bg-[#0b1329] text-white">
                  Unit Platoon
                </option>
                <option value="training" className="bg-[#0b1329] text-white">
                  Training / Drill
                </option>
                <option value="camp" className="bg-[#0b1329] text-white">
                  Camp Logistics
                </option>
                <option value="committee" className="bg-[#0b1329] text-white">
                  Special Committee
                </option>
                <option value="event" className="bg-[#0b1329] text-white">
                  Parade / Event
                </option>
                <option value="general" className="bg-[#0b1329] text-white">
                  General Discussion
                </option>
                {isOfficer && (
                  <option value="administrative" className="bg-[#0b1329] text-white">
                    Administrative (ANO Staff)
                  </option>
                )}
              </select>
            </div>

            {isOfficer && (
              <div>
                <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                  Announcement Mode
                </label>
                <label className="flex items-center space-x-2 mt-2 cursor-pointer text-xs font-semibold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isOfficial}
                    onChange={(e) => setIsOfficial(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-0"
                  />
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Official Read-Only Channel</span>
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="State the objective, operational rules, or parade timing for this channel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl glass-input border border-white/10 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Member Selection Section */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                Select Members ({selectedMemberIds.length} selected)
              </label>
              <input
                type="text"
                placeholder="Search cadre..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="px-2.5 py-1 text-[11px] rounded-lg glass-input border border-white/10 w-36 outline-none"
              />
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1.5 p-1 border border-white/5 rounded-xl bg-white/[0.02]">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500 italic">
                  No matching contacts found.
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedMemberIds.includes(contact.id);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => toggleMember(contact.id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-all ${
                        isSelected
                          ? "bg-blue-600/30 border border-blue-500/40 text-white"
                          : "hover:bg-white/5 text-zinc-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-900/40 border border-blue-400/30 flex items-center justify-center font-bold text-[10px] text-blue-300">
                          {contact.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold leading-tight">{contact.name}</p>
                          <p className="text-[10px] text-zinc-400">
                            {contact.rank || contact.role} {contact.wing ? `• ${contact.wing}` : ""}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected
                            ? "bg-blue-600 border-blue-400 text-white"
                            : "border-white/20 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Channel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
