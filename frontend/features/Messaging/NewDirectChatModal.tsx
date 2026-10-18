import React, { useState, useEffect } from "react";
import { X, MessageSquare, Search, Loader2, AlertCircle, Shield, User } from "lucide-react";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";
import type { ChatContact, Conversation } from "@backend/services/messaging/chat.service";

interface NewDirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelected: (conversation: Conversation) => void;
}

export const NewDirectChatModal: React.FC<NewDirectChatModalProps> = ({
  isOpen,
  onClose,
  onSelected,
}) => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
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
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Failed to load directory");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.rank && c.rank.toLowerCase().includes(search.toLowerCase())) ||
      (c.role && c.role.toLowerCase().includes(search.toLowerCase())),
  );

  const handleStartChat = async (contact: ChatContact) => {
    setIsStarting(true);
    setError(null);
    try {
      const res = await EnterpriseDataPlatform.createConversation({
        type: "direct",
        recipientId: contact.id,
        recipientName: contact.name,
        recipientRole: contact.role,
      });

      if (res.success && res.data?.conversation) {
        onSelected(res.data.conversation);
        onClose();
      } else {
        setError(res.error || "Failed to start direct conversation.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start conversation");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden border border-white/10 rounded-2xl glass-panel shadow-2xl bg-[#0b1329]/95 text-zinc-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white">Start Direct Conversation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, rank, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input border border-white/10 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {error && (
            <div className="flex items-center space-x-2 p-2.5 text-xs text-red-300 bg-red-950/40 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-400 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Loading Battalion Directory...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 italic">
              No contacts found matching search.
            </div>
          ) : (
            filtered.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleStartChat(contact)}
                disabled={isStarting}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/40 border border-emerald-400/30 flex items-center justify-center font-bold text-xs text-emerald-300">
                      {contact.name.slice(0, 2).toUpperCase()}
                    </div>
                    {contact.isOnline && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b1329] absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-white group-hover:text-emerald-300 transition-colors">
                      {contact.name}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {contact.rank || contact.role} {contact.wing ? `• ${contact.wing}` : ""}
                    </p>
                    {contact.enrollmentNo && (
                      <p className="text-[9px] font-mono text-zinc-500">{contact.enrollmentNo}</p>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 group-hover:text-zinc-300 font-bold">
                  Message →
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
