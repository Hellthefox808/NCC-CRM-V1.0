import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Send,
  Smile,
  Paperclip,
  Image,
  FileText,
  CheckCheck,
  Check,
  CornerUpLeft,
  Edit3,
  Trash2,
  ShieldCheck,
  Shield,
  Pin,
  PinOff,
  VolumeX,
  Volume2,
  Users,
  Info,
  X,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Loader2,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Radio,
  Download,
  BarChart2,
  CheckSquare,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";
import { useSocket } from "@frontend/hooks/useSocket";
import { CreateGroupModal } from "./CreateGroupModal";
import { NewDirectChatModal } from "./NewDirectChatModal";
import { CreatePollModal } from "./CreatePollModal";
import { ConvertToTaskModal } from "./ConvertToTaskModal";
import { AddMemberModal } from "./AddMemberModal";
import type {
  Conversation,
  ChatMessage,
  ConversationMember,
  PollData,
  MemberRole,
} from "@backend/services/messaging/chat.service";

interface CommunicationHubProps {
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
  initialConversationId?: string;
  onNavigateToRecord?: (type: string, id: string) => void;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  currentUser = {
    id: "officer_ano",
    name: "Capt. Dr. Animesh Roy (ANO)",
    role: "ADMIN",
  },
  initialConversationId,
  onNavigateToRecord,
}) => {
  // Navigation & View States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    initialConversationId || null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeMembers, setActiveMembers] = useState<ConversationMember[]>([]);
  const [activeTabFilter, setActiveTabFilter] = useState<
    "all" | "direct" | "group" | "channel" | "unread"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Layout Panels
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [mobileActiveView, setMobileActiveView] = useState<"list" | "chat">("list");
  const [showPinnedDrawer, setShowPinnedDrawer] = useState(true);

  // Composer States
  const [messageText, setMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [typingCadet, setTypingCadet] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null); // messageId or "composer"
  const [attachmentDraft, setAttachmentDraft] = useState<
    Array<{ id: string; name: string; url: string; sizeBytes: number; mimeType: string }>
  >([]);

  // Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showNewDirectModal, setShowNewDirectModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [convertingMessageToTask, setConvertingMessageToTask] = useState<ChatMessage | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Search inside active chat
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real-time Socket.IO Connection
  const { isConnected, socket } = useSocket();

  // Scroll to bottom of message list
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  // Fetch all conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await EnterpriseDataPlatform.listConversations();
      if (res.success && res.data?.conversations) {
        setConversations(res.data.conversations);
        if (!selectedConvId && res.data.conversations.length > 0) {
          setSelectedConvId(res.data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [selectedConvId]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Fetch messages and members when selected conversation changes
  useEffect(() => {
    if (!selectedConvId) return;

    setIsLoadingMessages(true);
    setReplyingTo(null);
    setEditingMessage(null);

    Promise.all([
      EnterpriseDataPlatform.listMessages(selectedConvId, { limit: 60 }),
      EnterpriseDataPlatform.getConversation(selectedConvId),
    ])
      .then(([msgRes, convRes]) => {
        if (msgRes.success && msgRes.data?.messages) {
          setMessages(msgRes.data.messages);
        }
        if (convRes.success && convRes.data?.members) {
          setActiveMembers(convRes.data.members);
        }
        // Mark conversation as read
        EnterpriseDataPlatform.markConversationRead(selectedConvId);
        // Decrement unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConvId ? { ...c, unreadCount: 0 } : c)),
        );
      })
      .catch((err) => console.error("Error loading chat data:", err))
      .finally(() => {
        setIsLoadingMessages(false);
        setTimeout(() => scrollToBottom(false), 80);
      });

    // Join Socket room
    if (socket && isConnected) {
      socket.emit("join_conversation", selectedConvId);
    }

    return () => {
      if (socket && isConnected) {
        socket.emit("leave_conversation", selectedConvId);
      }
    };
  }, [selectedConvId, socket, isConnected, scrollToBottom]);

  // Handle Real-time Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload: { conversationId: string; message: ChatMessage }) => {
      if (payload.conversationId === selectedConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.message.id)) return prev;
          return [...prev, payload.message];
        });
        setTimeout(() => scrollToBottom(true), 50);
        // Mark read immediately if viewing
        EnterpriseDataPlatform.markConversationRead(selectedConvId, payload.message.id);
      }

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === payload.conversationId) {
            return {
              ...c,
              updatedAt: payload.message.createdAt,
              lastMessage: {
                id: payload.message.id,
                content: payload.message.content,
                senderName: payload.message.senderName,
                createdAt: payload.message.createdAt,
                messageType: payload.message.messageType,
              },
              unreadCount: payload.conversationId === selectedConvId ? 0 : c.unreadCount + 1,
            };
          }
          return c;
        }),
      );
    };

    const handleMessageUpdate = (payload: { conversationId: string; update: ChatMessage }) => {
      if (payload.conversationId === selectedConvId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === payload.update.id ? { ...m, ...payload.update } : m)),
        );
      }
    };

    const handleMessageDelete = (payload: { conversationId: string; messageId: string }) => {
      if (payload.conversationId === selectedConvId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.messageId
              ? {
                  ...m,
                  isDeleted: true,
                  content: "This message was deleted",
                  attachments: [],
                }
              : m,
          ),
        );
      }
    };

    const handleReaction = (payload: {
      conversationId: string;
      reaction: { messageId: string; reactions: ChatMessage["reactions"] };
    }) => {
      if (payload.conversationId === selectedConvId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.reaction.messageId
              ? { ...m, reactions: payload.reaction.reactions }
              : m,
          ),
        );
      }
    };

    const handleTyping = (data: {
      conversationId: string;
      userId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      if (data.conversationId === selectedConvId && data.userId !== currentUser.id) {
        if (data.isTyping) {
          setTypingCadet(data.userName);
        } else {
          setTypingCadet(null);
        }
      }
    };

    const handlePollUpdated = (payload: {
      conversationId: string;
      messageId: string;
      poll: PollData;
    }) => {
      if (payload.conversationId === selectedConvId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === payload.messageId ? { ...m, poll: payload.poll } : m)),
        );
      }
    };

    const handleMessagePinned = (payload: {
      conversationId: string;
      messageId: string;
      isPinned: boolean;
    }) => {
      if (payload.conversationId === selectedConvId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === payload.messageId ? { ...m, isPinned: payload.isPinned } : m)),
        );
      }
    };

    const handleMemberChanged = (payload: {
      conversationId: string;
      member: ConversationMember;
      changeType: "add" | "remove" | "update";
    }) => {
      if (payload.conversationId === selectedConvId) {
        if (payload.changeType === "add") {
          setActiveMembers((prev) =>
            prev.some((m) => m.id === payload.member.id) ? prev : [...prev, payload.member],
          );
        } else if (payload.changeType === "remove") {
          setActiveMembers((prev) => prev.filter((m) => m.userId !== payload.member.userId));
        } else if (payload.changeType === "update") {
          setActiveMembers((prev) =>
            prev.map((m) => (m.userId === payload.member.userId ? { ...m, ...payload.member } : m)),
          );
        }
      }
    };

    const handleMessageConvertedTask = (payload: {
      conversationId: string;
      messageId: string;
      task: { taskId: string; title: string };
    }) => {
      if (payload.conversationId === selectedConvId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.messageId ? { ...m, convertedTaskId: payload.task.taskId } : m,
          ),
        );
      }
    };

    socket.on("CHAT_MESSAGE_CREATED", handleNewMessage);
    socket.on("CHAT_MESSAGE_UPDATED", handleMessageUpdate);
    socket.on("CHAT_MESSAGE_DELETED", handleMessageDelete);
    socket.on("CHAT_MESSAGE_REACTION", handleReaction);
    socket.on("USER_TYPING", handleTyping);
    socket.on("CHAT_POLL_UPDATED", handlePollUpdated);
    socket.on("CHAT_MESSAGE_PINNED", handleMessagePinned);
    socket.on("CHAT_MEMBER_CHANGED", handleMemberChanged);
    socket.on("CHAT_MESSAGE_CONVERTED_TASK", handleMessageConvertedTask);

    return () => {
      socket.off("CHAT_MESSAGE_CREATED", handleNewMessage);
      socket.off("CHAT_MESSAGE_UPDATED", handleMessageUpdate);
      socket.off("CHAT_MESSAGE_DELETED", handleMessageDelete);
      socket.off("CHAT_MESSAGE_REACTION", handleReaction);
      socket.off("USER_TYPING", handleTyping);
      socket.off("CHAT_POLL_UPDATED", handlePollUpdated);
      socket.off("CHAT_MESSAGE_PINNED", handleMessagePinned);
      socket.off("CHAT_MEMBER_CHANGED", handleMemberChanged);
      socket.off("CHAT_MESSAGE_CONVERTED_TASK", handleMessageConvertedTask);
    };
  }, [socket, selectedConvId, currentUser.id, scrollToBottom]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTabFilter === "direct") return c.type === "direct";
    if (activeTabFilter === "group") return c.type === "group";
    if (activeTabFilter === "channel") return c.isOfficial || c.type === "channel";
    if (activeTabFilter === "unread") return c.unreadCount > 0;
    return true;
  });

  const activeConversation = conversations.find((c) => c.id === selectedConvId);

  // Send or Edit Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConvId) return;

    if (!messageText.trim() && attachmentDraft.length === 0) return;

    // Handle Edit Mode
    if (editingMessage) {
      try {
        const res = await EnterpriseDataPlatform.editMessage(
          editingMessage.id,
          messageText.trim(),
          selectedConvId,
        );
        if (res.success && res.data?.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === editingMessage.id ? res.data!.message : m)),
          );
        }
      } catch (err) {
        console.error("Failed to edit message:", err);
      } finally {
        setEditingMessage(null);
        setMessageText("");
      }
      return;
    }

    // Normal Send Mode
    setIsSending(true);
    const content = messageText.trim();
    const replyToId = replyingTo?.id;
    const attachments = [...attachmentDraft];

    setMessageText("");
    setAttachmentDraft([]);
    setReplyingTo(null);

    // Stop typing indicator
    if (socket && selectedConvId) {
      socket.emit("typing_stop", { conversationId: selectedConvId });
    }

    try {
      const res = await EnterpriseDataPlatform.sendMessage(selectedConvId, {
        content,
        replyToId,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (res.success && res.data?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data!.message.id)) return prev;
          return [...prev, res.data!.message];
        });
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  // Keyboard shortcut for Enter to Send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Typing event emission
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    if (socket && selectedConvId) {
      socket.emit("typing_start", {
        conversationId: selectedConvId,
        userName: currentUser.name,
      });
    }
  };

  // Reaction Toggle
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!selectedConvId) return;
    try {
      const res = await EnterpriseDataPlatform.toggleReaction(messageId, emoji, selectedConvId);
      if (res.success && res.data?.reactions) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions: res.data!.reactions } : m)),
        );
      }
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
    } finally {
      setShowEmojiPicker(null);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConvId) return;
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await EnterpriseDataPlatform.deleteMessage(messageId, selectedConvId);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  isDeleted: true,
                  content: "This message was deleted",
                  attachments: [],
                }
              : m,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // Vote on a Poll
  const handleVotePoll = async (messageId: string, optionId: string) => {
    if (!selectedConvId) return;
    try {
      const res = await EnterpriseDataPlatform.votePoll(messageId, optionId, selectedConvId);
      if (res.success && res.data?.poll) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, poll: res.data!.poll } : m)),
        );
      }
    } catch (err) {
      console.error("Failed to vote in poll:", err);
    }
  };

  // Pin/Unpin Message
  const handleTogglePin = async (messageId: string, isPinned: boolean) => {
    if (!selectedConvId) return;
    try {
      const res = await EnterpriseDataPlatform.pinMessage(messageId, isPinned, selectedConvId);
      if (res.success && res.data?.message) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, isPinned: res.data!.message.isPinned } : m,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle pin state:", err);
    }
  };

  // Remove Group Member
  const handleRemoveMember = async (userId: string) => {
    if (!selectedConvId) return;
    if (!window.confirm("Are you sure you want to remove this cadet from the squad?")) return;
    try {
      const res = await EnterpriseDataPlatform.removeGroupMember(selectedConvId, userId);
      if (res.success) {
        setActiveMembers((prev) => prev.filter((m) => m.userId !== userId));
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  // Update Member Role
  const handleUpdateMemberRole = async (userId: string, newRole: MemberRole) => {
    if (!selectedConvId) return;
    try {
      const res = await EnterpriseDataPlatform.updateMemberRole(selectedConvId, userId, newRole);
      if (res.success && res.data?.member) {
        setActiveMembers((prev) =>
          prev.map((m) => (m.userId === userId ? { ...m, memberRole: newRole } : m)),
        );
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  // Real File Upload Handler
  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newAtt = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      sizeBytes: file.size,
      mimeType:
        file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
    };
    setAttachmentDraft((prev) => [...prev, newAtt]);
    e.target.value = "";
  };

  const triggerFilePicker = (acceptType: "doc" | "image") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        acceptType === "doc"
          ? ".pdf,.doc,.docx,application/pdf"
          : "image/png,image/jpeg,image/webp,image/*";
      fileInputRef.current.click();
    }
  };

  // Filter messages if search is open
  const displayedMessages = chatSearchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex h-[calc(100vh-5rem)] max-h-[920px] rounded-2xl border border-white/10 glass-panel shadow-2xl overflow-hidden text-zinc-100 bg-[#090f20]/90">
      {/* =========================================================================
          LEFT PANE: CONVERSATION LIST & SEARCH (320px - 380px)
          ========================================================================= */}
      <div
        className={`w-full md:w-80 lg:w-88 flex-shrink-0 border-r border-white/10 flex flex-col bg-white/[0.02] ${
          mobileActiveView === "chat" ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header with New Action Buttons */}
        <div className="p-4 border-b border-white/10 space-y-3 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white leading-tight">Cadre Messages</h2>
                <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  <span>{isConnected ? "Live Battalion Sync" : "Connecting..."}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowNewDirectModal(true)}
                className="p-1.5 glass-pill text-zinc-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Direct Message"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(true)}
                className="px-2.5 py-1.5 bg-blue-600/30 border border-blue-500/40 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                title="Create Group"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="text-[11px]">Group</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations & cadre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl glass-input border border-white/10 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px] font-extrabold scrollbar-none">
            {[
              { id: "all", label: "All" },
              { id: "direct", label: "Direct" },
              { id: "group", label: "Groups" },
              { id: "channel", label: "Official" },
              { id: "unread", label: "Unread" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabFilter(tab.id as typeof activeTabFilter)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTabFilter === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {isLoadingConversations ? (
            <div className="py-12 text-center text-xs text-zinc-400 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Loading Cadre Channels...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 px-4">
              No conversations found. Start a new direct chat or create a group!
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const isPinned = conv.currentUserMembership?.isPinned;
              const isMuted = conv.currentUserMembership?.isMuted;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    setMobileActiveView("chat");
                  }}
                  className={`p-3 cursor-pointer transition-all flex items-start space-x-3 relative ${
                    isSelected ? "bg-blue-900/30 border-l-4 border-blue-500" : "hover:bg-white/5"
                  }`}
                >
                  {/* Channel Avatar / Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${
                        conv.isOfficial
                          ? "bg-amber-900/40 border-amber-500/40 text-amber-300"
                          : conv.type === "direct"
                            ? "bg-emerald-900/40 border-emerald-500/40 text-emerald-300"
                            : "bg-blue-900/40 border-blue-500/40 text-blue-300"
                      }`}
                    >
                      {conv.isOfficial ? (
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                      ) : conv.type === "direct" ? (
                        conv.title.slice(0, 2).toUpperCase()
                      ) : (
                        <Users className="w-5 h-5 text-blue-300" />
                      )}
                    </div>
                    {conv.type === "direct" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090f20] absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="font-black text-xs text-white truncate">{conv.title}</span>
                        {conv.isOfficial && (
                          <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                            Official
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {conv.lastMessage
                          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {conv.lastMessage
                        ? `${conv.lastMessage.senderName.split(" ")[0]}: ${conv.lastMessage.content}`
                        : "No messages yet"}
                    </p>

                    <div className="flex items-center space-x-2 mt-1.5">
                      {isPinned && <Pin className="w-3 h-3 text-blue-400" />}
                      {isMuted && <VolumeX className="w-3 h-3 text-zinc-500" />}
                      {conv.crmResourceType && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 capitalize">
                          {conv.crmResourceType}
                        </span>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          CENTER PANE: ACTIVE CONVERSATION & MESSAGE STREAM
          ========================================================================= */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#070b18]/60 ${
          mobileActiveView === "list" ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-3.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileActiveView("list")}
                  className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black text-white truncate">
                      {activeConversation.title}
                    </h3>
                    {activeConversation.isOfficial && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                        ANO Directives
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {typingCadet ? (
                      <span className="text-blue-400 font-bold animate-pulse">
                        {typingCadet} is typing...
                      </span>
                    ) : (
                      `${activeMembers.length || activeConversation.memberCount} cadre members • ${activeConversation.groupType} channel`
                    )}
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setChatSearchOpen(!chatSearchOpen)}
                  className={`p-2 rounded-xl border transition-all ${
                    chatSearchOpen
                      ? "bg-blue-600/30 border-blue-500/40 text-blue-300"
                      : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                  title="Search inside chat"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowContextPanel(!showContextPanel)}
                  className={`p-2 rounded-xl border transition-all ${
                    showContextPanel
                      ? "bg-blue-600/30 border-blue-500/40 text-blue-300"
                      : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                  title="Toggle details & CRM link"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-Chat Search Bar */}
            {chatSearchOpen && (
              <div className="p-2 border-b border-white/10 bg-blue-950/20 flex items-center space-x-2 animate-fade-in">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <input
                  type="text"
                  placeholder="Filter messages in this conversation..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs text-white outline-none"
                />
                {chatSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setChatSearchQuery("")}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="py-20 text-center text-xs text-zinc-400 flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Loading Secure Messages...</span>
                </div>
              ) : displayedMessages.length === 0 ? (
                <div className="py-24 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-zinc-400">
                    {chatSearchQuery
                      ? "No messages match your search."
                      : "This is the start of the conversation. Send a message to begin."}
                  </p>
                </div>
              ) : (
                displayedMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isSystem = msg.messageType === "system";

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-zinc-400">
                          {msg.content} •{" "}
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col group relative ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender Tag (if not me) */}
                      {!isMe && (
                        <div className="flex items-center space-x-1.5 mb-1 px-1">
                          <span className="text-xs font-black text-zinc-200">{msg.senderName}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                              msg.senderRole === "ADMIN"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {msg.senderRole}
                          </span>
                        </div>
                      )}

                      {/* Quoted Reply Banner */}
                      {msg.replyToPreview && (
                        <div
                          className={`mb-1 p-2 rounded-xl text-[11px] border max-w-md ${
                            isMe
                              ? "bg-blue-950/40 border-blue-500/30 text-blue-200"
                              : "bg-white/5 border-white/10 text-zinc-300"
                          }`}
                        >
                          <p className="font-black text-[10px] text-blue-400">
                            Replying to {msg.replyToPreview.senderName}
                          </p>
                          <p className="truncate italic">"{msg.replyToPreview.content}"</p>
                        </div>
                      )}

                      {/* Message Bubble Container */}
                      <div
                        className={`max-w-lg rounded-2xl p-3 shadow-md space-y-2 border transition-all ${
                          isMe
                            ? "bg-blue-600/90 text-white border-blue-400/40 rounded-tr-sm"
                            : msg.messageType === "announcement"
                              ? "bg-amber-950/40 text-amber-100 border-amber-500/40 rounded-tl-sm"
                              : "bg-white/10 text-zinc-100 border-white/10 rounded-tl-sm"
                        }`}
                      >
                        {/* Pinned Order Badge */}
                        {msg.isPinned && (
                          <div className="flex items-center space-x-1 text-[10px] text-amber-400 font-black tracking-wider uppercase mb-1">
                            <Pin className="w-3 h-3 fill-amber-400" />
                            <span>Pinned Order {msg.pinnedBy ? `• ${msg.pinnedBy}` : ""}</span>
                          </div>
                        )}

                        {/* Converted CRM Task Badge */}
                        {msg.convertedTaskId && (
                          <div className="p-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center space-x-1.5 text-[10px] text-emerald-300 font-bold mb-1">
                            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                            <span>CRM Follow-up Task: #{msg.convertedTaskId}</span>
                          </div>
                        )}

                        {/* Text Content */}
                        {msg.content && (
                          <p
                            className={`text-xs leading-relaxed whitespace-pre-wrap ${
                              msg.isDeleted ? "italic text-zinc-400" : ""
                            }`}
                          >
                            {msg.content}
                          </p>
                        )}

                        {/* Interactive Cadre Poll */}
                        {msg.poll && (
                          <div className="p-3 my-1.5 rounded-2xl bg-black/40 border border-blue-500/30 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center space-x-1.5 text-blue-400 font-black uppercase tracking-wider">
                                <BarChart2 className="w-3.5 h-3.5" />
                                <span>Battalion Cadre Poll</span>
                              </div>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {msg.poll.totalVotes} {msg.poll.totalVotes === 1 ? "vote" : "votes"}
                              </span>
                            </div>

                            <p className="text-xs font-black text-white">{msg.poll.question}</p>

                            <div className="space-y-1.5">
                              {msg.poll.options.map((opt) => {
                                const pct =
                                  msg.poll!.totalVotes > 0
                                    ? Math.round((opt.voteCount / msg.poll!.totalVotes) * 100)
                                    : 0;
                                const hasVoted = opt.votes.some((v) => v.userId === currentUser.id);

                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleVotePoll(msg.id, opt.id)}
                                    className={`relative w-full overflow-hidden p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between group ${
                                      hasVoted
                                        ? "bg-blue-600/20 border-blue-500/60 text-white font-bold"
                                        : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                                    }`}
                                  >
                                    <div
                                      className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                                        hasVoted ? "bg-blue-600/30" : "bg-white/5"
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                    <div className="relative z-10 flex items-center space-x-2 truncate">
                                      <div
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                          hasVoted
                                            ? "border-blue-400 bg-blue-500 text-white"
                                            : "border-zinc-500 group-hover:border-zinc-400"
                                        }`}
                                      >
                                        {hasVoted && <Check className="w-2.5 h-2.5" />}
                                      </div>
                                      <span className="truncate text-[11px]">{opt.text}</span>
                                    </div>
                                    <div className="relative z-10 text-[10px] font-mono text-zinc-400 font-bold ml-2 shrink-0">
                                      {pct}% ({opt.voteCount})
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                              <span>
                                {msg.poll.allowsMultiple
                                  ? "Multiple choices allowed"
                                  : "Single choice"}
                              </span>
                              <span>Tap option to cast/toggle vote</span>
                            </div>
                          </div>
                        )}

                        {/* CRM Context Card (if present) */}
                        {msg.crmCard && (
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1 mt-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-black uppercase tracking-wider text-amber-400">
                                🎖️ {msg.crmCard.type} Record
                              </span>
                              {msg.crmCard.status && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                  {msg.crmCard.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-black text-white">{msg.crmCard.title}</p>
                            {msg.crmCard.subtitle && (
                              <p className="text-[10px] text-zinc-300">{msg.crmCard.subtitle}</p>
                            )}
                            {msg.crmCard.date && (
                              <p className="text-[10px] text-zinc-400">📅 {msg.crmCard.date}</p>
                            )}
                          </div>
                        )}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {msg.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/10 text-xs"
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                  <span className="truncate text-[11px] font-bold">{att.name}</span>
                                </div>
                                <span className="text-[10px] text-zinc-400 ml-2">
                                  {(att.sizeBytes / 1024).toFixed(0)} KB
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp & Indicators */}
                        <div className="flex items-center justify-end space-x-1 text-[10px] text-zinc-300/80 pt-0.5">
                          {msg.isEdited && <span className="italic mr-1">(edited)</span>}
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                        </div>
                      </div>

                      {/* Emoji Reactions Pill Bar */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 px-1">
                          {msg.reactions.map((r) => (
                            <button
                              key={r.emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, r.emoji)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 hover:bg-white/20 border border-white/10 flex items-center space-x-1 cursor-pointer transition-all"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-zinc-300">{r.count}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action Hover Tooltip Menu */}
                      <div
                        className={`absolute top-0 ${
                          isMe ? "right-full mr-2" : "left-full ml-2"
                        } hidden group-hover:flex items-center space-x-1 p-1 rounded-xl bg-black/80 border border-white/10 shadow-lg backdrop-blur-md z-10`}
                      >
                        {/* Quick Reaction Emojis */}
                        {["🫡", "👍", "🇮🇳", "🔥"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="p-1 hover:bg-white/10 rounded text-xs cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
                          title="Reply"
                        >
                          <CornerUpLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Pin/Unpin Message */}
                        {!msg.isDeleted && (
                          <button
                            type="button"
                            onClick={() => handleTogglePin(msg.id, !msg.isPinned)}
                            className={`p-1 rounded cursor-pointer ${
                              msg.isPinned
                                ? "text-amber-400 hover:text-amber-300"
                                : "text-zinc-400 hover:text-white"
                            }`}
                            title={msg.isPinned ? "Unpin Order" : "Pin Order"}
                          >
                            {msg.isPinned ? (
                              <PinOff className="w-3.5 h-3.5" />
                            ) : (
                              <Pin className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Convert to CRM Follow-up Task */}
                        {!msg.isDeleted && (
                          <button
                            type="button"
                            onClick={() => setConvertingMessageToTask(msg)}
                            className="p-1 text-zinc-400 hover:text-emerald-400 rounded cursor-pointer"
                            title="Convert to Task"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isMe && !msg.isDeleted && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMessage(msg);
                              setMessageText(msg.content);
                            }}
                            className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {(isMe || currentUser.role === "ADMIN") && !msg.isDeleted && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 text-red-400 hover:text-red-300 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <div className="p-3 border-t border-white/10 bg-white/5 space-y-2">
              {/* Replying or Editing Banner */}
              {(replyingTo || editingMessage) && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <CornerUpLeft className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-bold text-blue-300">
                      {editingMessage ? "Editing message" : `Replying to ${replyingTo?.senderName}`}
                    </span>
                    <span className="text-zinc-400 truncate">
                      "{editingMessage?.content || replyingTo?.content}"
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setEditingMessage(null);
                      setMessageText("");
                    }}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Pending Attachments Draft */}
              {attachmentDraft.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachmentDraft.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-xs text-blue-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{att.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachmentDraft((prev) => prev.filter((a) => a.id !== att.id))
                        }
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                {/* Textarea Input */}
                <div className="flex-1 relative rounded-xl glass-input border border-white/10 focus-within:border-blue-500 transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={`Message ${activeConversation.title}... (Enter to send, Shift+Enter for newline)`}
                    value={messageText}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2.5 text-xs text-white bg-transparent outline-none resize-none max-h-32"
                  />

                  {/* Composer Tools Bar */}
                  <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-white/5 text-zinc-400">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleRealFileUpload}
                        className="hidden"
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        onClick={() => triggerFilePicker("doc")}
                        className="hover:text-white text-[11px] flex items-center space-x-1 cursor-pointer"
                        title="Attach PDF Circular"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerFilePicker("image")}
                        className="hover:text-white text-[11px] flex items-center space-x-1 cursor-pointer"
                        title="Attach Photo"
                      >
                        <Image className="w-3.5 h-3.5" />
                        <span>Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreatePollModal(true)}
                        className="hover:text-blue-400 text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Launch Cadre Poll"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Poll</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageText((prev) => prev + " 🫡")}
                        className="hover:text-white text-xs cursor-pointer"
                      >
                        🫡
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageText((prev) => prev + " 🇮🇳")}
                        className="hover:text-white text-xs cursor-pointer"
                      >
                        🇮🇳
                      </button>
                    </div>
                    <span className="text-[10px] text-zinc-500">Press Enter to Send</span>
                  </div>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isSending || (!messageText.trim() && attachmentDraft.length === 0)}
                  className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-lg transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-zinc-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-white">Select a Conversation</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Choose an active squad channel, official ANO circular, or start a direct discussion
              with an NCC cadet.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          RIGHT PANE: COLLAPSIBLE CONTEXT & CADRE DETAILS (260px - 320px)
          ========================================================================= */}
      {showContextPanel && activeConversation && (
        <div className="hidden xl:flex w-72 flex-shrink-0 border-l border-white/10 flex-col bg-white/[0.02] p-4 space-y-5 overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b border-white/10">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-black text-base border bg-blue-900/40 border-blue-500/40 text-blue-300">
              {activeConversation.isOfficial ? (
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              ) : (
                <Users className="w-7 h-7" />
              )}
            </div>
            <div>
              <h4 className="font-black text-sm text-white">{activeConversation.title}</h4>
              <p className="text-xs text-zinc-400 capitalize">
                {activeConversation.groupType} channel
              </p>
            </div>
            {activeConversation.description && (
              <p className="text-[11px] text-zinc-400 text-left bg-white/5 p-2 rounded-xl border border-white/5">
                {activeConversation.description}
              </p>
            )}
          </div>

          {/* CRM Linked Resource Card (if linked to camp or training) */}
          {activeConversation.crmResourceType && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-black uppercase">
                <Calendar className="w-3.5 h-3.5" />
                <span>Linked CRM Schedule</span>
              </div>
              <p className="text-xs font-black text-white">
                {activeConversation.crmResourceId || "Annual Training Camp 2026"}
              </p>
              <p className="text-[10px] text-zinc-300">Authorized Battalion Cadre Event</p>
            </div>
          )}

          {/* Pinned Messages Collapsible Section */}
          {messages.some((m) => m.isPinned && !m.isDeleted) && (
            <div className="space-y-2 p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20">
              <div
                onClick={() => setShowPinnedDrawer(!showPinnedDrawer)}
                className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-400 cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <Pin className="w-3.5 h-3.5 fill-amber-400" />
                  <span>
                    Pinned Orders ({messages.filter((m) => m.isPinned && !m.isDeleted).length})
                  </span>
                </div>
                {showPinnedDrawer ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>

              {showPinnedDrawer && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                  {messages
                    .filter((m) => m.isPinned && !m.isDeleted)
                    .map((pinnedMsg) => (
                      <div
                        key={pinnedMsg.id}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-zinc-300 space-y-0.5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
                          <span>{pinnedMsg.senderName}</span>
                          <span>
                            {new Date(pinnedMsg.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="truncate font-medium text-white">{pinnedMsg.content}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Members Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-400">
              <span>Cadre Members ({activeMembers.length})</span>
              {activeConversation.type !== "direct" &&
                (activeConversation.currentUserMembership?.memberRole === "creator" ||
                  activeConversation.currentUserMembership?.memberRole === "admin" ||
                  currentUser.role === "ADMIN" ||
                  currentUser.role === "officer") && (
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Cadet</span>
                  </button>
                )}
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {activeMembers.map((member) => {
                const canManageMember =
                  activeConversation.type !== "direct" &&
                  (activeConversation.currentUserMembership?.memberRole === "creator" ||
                    activeConversation.currentUserMembership?.memberRole === "admin" ||
                    currentUser.role === "ADMIN") &&
                  member.userId !== currentUser.id &&
                  member.memberRole !== "creator";

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center font-bold text-[9px] text-blue-300">
                        {member.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="font-extrabold truncate text-white leading-tight">
                          {member.userName}
                        </p>
                        <p className="text-[9px] text-zinc-400 capitalize">{member.userRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {canManageMember ? (
                        <button
                          type="button"
                          onClick={() => {
                            const newRole: MemberRole =
                              member.memberRole === "admin" ? "member" : "admin";
                            handleUpdateMemberRole(member.userId, newRole);
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-blue-600/30 text-zinc-300 hover:text-blue-300 font-bold capitalize cursor-pointer transition-all"
                          title="Click to toggle role"
                        >
                          {member.memberRole}
                        </button>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-bold capitalize">
                          {member.memberRole}
                        </span>
                      )}

                      {canManageMember && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                          title="Remove cadet from group"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Settings / Quick Controls */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={() => {
                const nextPinned = !activeConversation.currentUserMembership?.isPinned;
                EnterpriseDataPlatform.updateConversation(activeConversation.id, {
                  isPinned: nextPinned,
                });
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeConversation.id
                      ? {
                          ...c,
                          currentUserMembership: {
                            ...c.currentUserMembership!,
                            isPinned: nextPinned,
                          },
                        }
                      : c,
                  ),
                );
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Pin className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {activeConversation.currentUserMembership?.isPinned
                    ? "Unpin Conversation"
                    : "Pin Conversation"}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextMuted = !activeConversation.currentUserMembership?.isMuted;
                EnterpriseDataPlatform.updateConversation(activeConversation.id, {
                  isMuted: nextMuted,
                });
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeConversation.id
                      ? {
                          ...c,
                          currentUserMembership: {
                            ...c.currentUserMembership!,
                            isPinned: c.currentUserMembership?.isPinned || false,
                            isMuted: nextMuted,
                          },
                        }
                      : c,
                  ),
                );
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {activeConversation.currentUserMembership?.isMuted
                    ? "Unmute Notifications"
                    : "Mute Channel"}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Group Creation Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        currentUserRole={currentUser.role}
        onCreated={(newConv) => {
          setConversations((prev) => [newConv, ...prev]);
          setSelectedConvId(newConv.id);
        }}
      />

      {/* New Direct Chat Modal */}
      <NewDirectChatModal
        isOpen={showNewDirectModal}
        onClose={() => setShowNewDirectModal(false)}
        onSelected={(conv) => {
          setConversations((prev) => {
            if (prev.some((c) => c.id === conv.id)) return prev;
            return [conv, ...prev];
          });
          setSelectedConvId(conv.id);
        }}
      />

      {/* Create Cadre Poll Modal */}
      <CreatePollModal
        isOpen={showCreatePollModal}
        conversationId={selectedConvId || ""}
        onClose={() => setShowCreatePollModal(false)}
        onCreated={(pollMsg) => {
          setMessages((prev) => [...prev, pollMsg]);
        }}
      />

      {/* Convert Message to Task Modal */}
      <ConvertToTaskModal
        isOpen={Boolean(convertingMessageToTask)}
        message={convertingMessageToTask}
        conversationId={selectedConvId || ""}
        members={activeMembers}
        onClose={() => setConvertingMessageToTask(null)}
        onConverted={(taskId, updatedMsg) => {
          setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
        }}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        conversationId={selectedConvId || ""}
        existingMemberIds={activeMembers.map((m) => m.userId)}
        onClose={() => setShowAddMemberModal(false)}
        onMemberAdded={(newMem) => {
          setActiveMembers((prev) => [...prev, newMem]);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConvId ? { ...c, memberCount: c.memberCount + 1 } : c,
            ),
          );
        }}
      />
    </div>
  );
};
