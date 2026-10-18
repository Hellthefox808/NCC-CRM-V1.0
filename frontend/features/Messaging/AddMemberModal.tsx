import React, { useState, useEffect } from "react";
import { X, UserPlus, Search, Shield, Loader2, AlertCircle } from "lucide-react";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";
import type {
  ChatContact,
  ConversationMember,
  MemberRole,
} from "@backend/services/messaging/chat.service";

interface AddMemberModalProps {
  isOpen: boolean;
  conversationId: string;
  existingMemberIds: string[];
  onClose: () => void;
  onMemberAdded: (member: ConversationMember) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  conversationId,
  existingMemberIds,
  onClose,
  onMemberAdded,
}) => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [selectedRole, setSelectedRole] = useState<MemberRole>("member");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      EnterpriseDataPlatform.getEligibleContacts()
        .then((res) => {
          if (res.success && res.data?.contacts) {
            setContacts(res.data.contacts);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const eligibleCandidates = contacts.filter((c) => !existingMemberIds.includes(c.id));
  const filteredCandidates = eligibleCandidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.rank && c.rank.toLowerCase().includes(search.toLowerCase())) ||
      (c.role && c.role.toLowerCase().includes(search.toLowerCase())),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) {
      setError("Please select a cadet to add.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await EnterpriseDataPlatform.addGroupMember(conversationId, {
        userId: selectedContact.id,
        name: selectedContact.name,
        role: selectedContact.role,
        memberRole: selectedRole,
      });

      if (res.success && res.data?.member) {
        onMemberAdded(res.data.member);
        onClose();
      } else {
        setError(res.error || "Failed to add member to group.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error adding member";
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Add Cadet to Squad</h3>
              <p className="text-[11px] text-zinc-400">Enroll new participants into this channel</p>
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

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by name, rank, or wing..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Candidates List */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : filteredCandidates.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-500">
                No eligible candidates available to add.
              </p>
            ) : (
              filteredCandidates.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-7 h-7 rounded-full bg-blue-900/60 flex items-center justify-center font-bold text-[10px] text-blue-300">
                        {contact.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="font-bold truncate text-white">{contact.name}</p>
                        <p className="text-[10px] text-zinc-400">
                          {contact.rank || contact.role} {contact.wing ? `• ${contact.wing}` : ""}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500 text-white font-bold">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <label className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>Assigned Channel Role</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as MemberRole)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="member">Cadet Member (Send & Read)</option>
              <option value="moderator">Squad Moderator (Pin & Manage)</option>
              <option value="admin">Group Administrator (Full Control)</option>
              <option value="read_only">Read-Only Observer</option>
            </select>
          </div>

          {/* Actions */}
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
              disabled={isSubmitting || !selectedContact}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white shadow-lg flex items-center space-x-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add to Squad</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
