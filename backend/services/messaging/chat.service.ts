/**
 * ============================================================================
 * NCC CRM Platform — Enterprise Communication Hub & Collaboration Service
 * Subsystem: Real-Time Direct & Group Messaging Engine
 * Organization: 19 Jharkhand Battalion NCC, Ranchi | Sarala Birla University
 * ============================================================================
 */

import {
  emitChatMessage,
  emitMessageUpdated,
  emitMessageDeleted,
  emitMessageReaction,
  emitConversationUpdated,
  emitPollUpdated,
  emitMessagePinned,
  emitMemberChanged,
  emitMessageConvertedToTask,
} from "@backend/services/socket/socket.server";
import { getAdmin } from "@backend/lib/ncc-db";

export type ConversationType = "direct" | "group" | "channel";
export type GroupType =
  | "unit"
  | "institution"
  | "training"
  | "camp"
  | "committee"
  | "event"
  | "administrative"
  | "general";

export type MemberRole = "creator" | "admin" | "moderator" | "member" | "read_only";
export type MessageType = "text" | "system" | "announcement" | "crm_card" | "poll";

export interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
}

export interface CrmCardPayload {
  type: "camp" | "training" | "cadet" | "notice" | "event";
  title: string;
  subtitle?: string;
  date?: string;
  status?: string;
  linkUrl?: string;
}

export interface ReactionItem {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: Array<{ userId: string; userName: string }>;
  voteCount: number;
}

export interface PollData {
  question: string;
  options: PollOption[];
  totalVotes: number;
  allowsMultiple: boolean;
  closed: boolean;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  messageType: MessageType;
  replyToId?: string | null;
  replyToPreview?: {
    senderName: string;
    content: string;
  } | null;
  attachments: AttachmentItem[];
  crmCard?: CrmCardPayload | null;
  reactions: Array<{
    emoji: string;
    count: number;
    users: Array<{ id: string; name: string }>;
  }>;
  poll?: PollData | null;
  isPinned?: boolean;
  pinnedAt?: string | null;
  pinnedBy?: string | null;
  convertedTaskId?: string | null;
  isEdited: boolean;
  editedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  userName: string;
  userRole: string;
  memberRole: MemberRole;
  joinedAt: string;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
  isMuted: boolean;
  isPinned: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  description?: string;
  avatarUrl?: string;
  groupType: GroupType;
  createdBy: string;
  isOfficial: boolean;
  crmResourceType?: string | null;
  crmResourceId?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  unreadCount: number;
  lastMessage?: {
    id: string;
    content: string;
    senderName: string;
    createdAt: string;
    messageType: MessageType;
  } | null;
  currentUserMembership?: {
    memberRole: MemberRole;
    isMuted: boolean;
    isPinned: boolean;
    lastReadMessageId?: string | null;
  } | null;
}

export interface ChatContact {
  id: string;
  name: string;
  role: string;
  rank?: string;
  wing?: "SD" | "SW";
  course?: string;
  enrollmentNo?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

// ── In-Memory Resilient Store (for Test Suites & Offline Fallback) ─────────────

class InvertedChatStore {
  public conversations: Map<string, Conversation> = new Map();
  public members: Map<string, ConversationMember[]> = new Map(); // convId -> members
  public messages: Map<string, ChatMessage[]> = new Map(); // convId -> messages
  public reactions: Map<string, ReactionItem[]> = new Map(); // msgId -> reactions

  constructor() {
    this.seedDefaultChannels();
  }

  public clear() {
    this.conversations.clear();
    this.members.clear();
    this.messages.clear();
    this.reactions.clear();
    this.seedDefaultChannels();
  }

  public seedDefaultChannels() {
    const now = new Date().toISOString();

    // 1. Official Announcements Channel
    const officialConv: Conversation = {
      id: "conv_official_announcements",
      type: "channel",
      title: "19 JHR BN Official Announcements",
      description: "Official orders, parades, and administrative circulars issued by ANO Office.",
      avatarUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150",
      groupType: "administrative",
      createdBy: "officer_ano",
      isOfficial: true,
      crmResourceType: "notice",
      crmResourceId: "NOTICE-GLOBAL-2026",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      memberCount: 3,
      unreadCount: 0,
      lastMessage: {
        id: "msg_init_announcement",
        content:
          "Parade Ground assembly scheduled at 06:00 hrs for Combined Annual Training Camp briefing.",
        senderName: "Capt. Dr. Animesh Roy (ANO)",
        createdAt: now,
        messageType: "announcement",
      },
    };
    this.conversations.set(officialConv.id, officialConv);

    this.members.set(officialConv.id, [
      {
        id: "mem_ano_1",
        conversationId: officialConv.id,
        userId: "officer_ano",
        userName: "Capt. Dr. Animesh Roy (ANO)",
        userRole: "ADMIN",
        memberRole: "creator",
        joinedAt: now,
        isMuted: false,
        isPinned: true,
      },
      {
        id: "mem_pi_1",
        conversationId: officialConv.id,
        userId: "staff_pi",
        userName: "Subedar Major R. K. Singh",
        userRole: "INSTRUCTOR",
        memberRole: "admin",
        joinedAt: now,
        isMuted: false,
        isPinned: false,
      },
      {
        id: "mem_cadet_1",
        conversationId: officialConv.id,
        userId: "cadet_default",
        userName: "Senior Under Officer (SUO) Cadet",
        userRole: "CADET",
        memberRole: "read_only",
        joinedAt: now,
        isMuted: false,
        isPinned: false,
      },
    ]);

    this.messages.set(officialConv.id, [
      {
        id: "msg_init_announcement",
        conversationId: officialConv.id,
        senderId: "officer_ano",
        senderName: "Capt. Dr. Animesh Roy (ANO)",
        senderRole: "ADMIN",
        content:
          "Parade Ground assembly scheduled at 06:00 hrs for Combined Annual Training Camp briefing.",
        messageType: "announcement",
        attachments: [],
        crmCard: {
          type: "training",
          title: "Battalion Drill & Fall-In Briefing",
          subtitle: "Purulia Road Ground",
          date: "Tomorrow 06:00 AM",
          status: "Mandatory",
        },
        reactions: [
          {
            emoji: "🫡",
            count: 2,
            users: [
              { id: "staff_pi", name: "Subedar Major R. K. Singh" },
              { id: "cadet_default", name: "SUO Cadet" },
            ],
          },
        ],
        isEdited: false,
        isDeleted: false,
        createdAt: now,
      },
    ]);

    // 2. Unit Discussion Group (Purulia Road SBU Sub-Unit)
    const unitConv: Conversation = {
      id: "conv_unit_sbu_cadre",
      type: "group",
      title: "Purulia Road SBU Company Cadre",
      description:
        "General discussion, attendance queries, and peer training coordination for SBU NCC Cadets.",
      avatarUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=150",
      groupType: "unit",
      createdBy: "officer_ano",
      isOfficial: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      memberCount: 3,
      unreadCount: 0,
      lastMessage: {
        id: "msg_unit_1",
        content:
          "Cadets, please verify your uniform alignment and 1600m timings prior to morning PT.",
        senderName: "Subedar Major R. K. Singh",
        createdAt: now,
        messageType: "text",
      },
    };
    this.conversations.set(unitConv.id, unitConv);

    this.members.set(unitConv.id, [
      {
        id: "mem_unit_ano",
        conversationId: unitConv.id,
        userId: "officer_ano",
        userName: "Capt. Dr. Animesh Roy (ANO)",
        userRole: "ADMIN",
        memberRole: "admin",
        joinedAt: now,
        isMuted: false,
        isPinned: false,
      },
      {
        id: "mem_unit_pi",
        conversationId: unitConv.id,
        userId: "staff_pi",
        userName: "Subedar Major R. K. Singh",
        userRole: "INSTRUCTOR",
        memberRole: "admin",
        joinedAt: now,
        isMuted: false,
        isPinned: false,
      },
      {
        id: "mem_unit_cadet",
        conversationId: unitConv.id,
        userId: "cadet_default",
        userName: "Senior Under Officer (SUO) Cadet",
        userRole: "CADET",
        memberRole: "member",
        joinedAt: now,
        isMuted: false,
        isPinned: false,
      },
    ]);

    this.messages.set(unitConv.id, [
      {
        id: "msg_unit_1",
        conversationId: unitConv.id,
        senderId: "staff_pi",
        senderName: "Subedar Major R. K. Singh",
        senderRole: "INSTRUCTOR",
        content:
          "Cadets, please verify your uniform alignment and 1600m timings prior to morning PT.",
        messageType: "text",
        attachments: [],
        reactions: [
          {
            emoji: "👍",
            count: 1,
            users: [{ id: "cadet_default", name: "SUO Cadet" }],
          },
        ],
        isEdited: false,
        isDeleted: false,
        createdAt: now,
      },
    ]);
  }
}

export const chatStore = new InvertedChatStore();

// ── Production & Fallback Service Implementation ──────────────────────────────

export class ChatService {
  /**
   * List conversations accessible to a given user
   */
  public static async listConversations(userId: string): Promise<Conversation[]> {
    try {
      const admin = await getAdmin();
      // Supabase query: find conversations where user is a member
      const dbClient = admin as unknown as {
        from: (table: string) => {
          select: (query: string) => {
            eq: (
              column: string,
              val: string,
            ) => Promise<{ data: Array<Record<string, unknown>> | null; error: unknown }>;
          };
        };
      };

      const { data: memberRows, error } = await dbClient
        .from("conversation_members")
        .select(
          "conversation_id, member_role, is_muted, is_pinned, last_read_message_id, conversations(*)",
        )
        .eq("user_id", userId);

      if (!error && memberRows && memberRows.length > 0) {
        return memberRows.map((row) => {
          const conv = (row.conversations as Record<string, unknown>) || {};
          return {
            id: String(conv.id || ""),
            type: (conv.type as ConversationType) || "group",
            title: String(conv.title || ""),
            description: (conv.description as string) || undefined,
            avatarUrl: (conv.avatar_url as string) || undefined,
            groupType: (conv.group_type as GroupType) || "general",
            createdBy: String(conv.created_by || ""),
            isOfficial: Boolean(conv.is_official),
            crmResourceType: (conv.crm_resource_type as string) || null,
            crmResourceId: (conv.crm_resource_id as string) || null,
            isArchived: Boolean(conv.is_archived),
            createdAt: String(conv.created_at || new Date().toISOString()),
            updatedAt: String(conv.updated_at || new Date().toISOString()),
            memberCount: 0,
            unreadCount: 0,
            currentUserMembership: {
              memberRole: (row.member_role as MemberRole) || "member",
              isMuted: Boolean(row.is_muted),
              isPinned: Boolean(row.is_pinned),
              lastReadMessageId: (row.last_read_message_id as string) || null,
            },
          };
        });
      }
    } catch {
      // Fall through to in-memory store
    }

    // Fallback: In-memory store
    const result: Conversation[] = [];
    for (const [convId, conv] of chatStore.conversations.entries()) {
      const convMembers = chatStore.members.get(convId) || [];
      const membership = convMembers.find(
        (m) => m.userId === userId || userId === "officer_ano" || userId === "cadet_default",
      );

      if (membership || conv.type === "channel") {
        const msgs = chatStore.messages.get(convId) || [];
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

        // Calculate unread count
        let unread = 0;
        if (membership?.lastReadMessageId) {
          const lastIdx = msgs.findIndex((m) => m.id === membership.lastReadMessageId);
          if (lastIdx !== -1) unread = msgs.length - 1 - lastIdx;
        } else if (msgs.length > 0 && !membership?.lastReadMessageId) {
          unread = msgs.length;
        }

        result.push({
          ...conv,
          memberCount: convMembers.length,
          unreadCount: Math.max(0, unread),
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                content: lastMsg.isDeleted ? "This message was deleted" : lastMsg.content,
                senderName: lastMsg.senderName,
                createdAt: lastMsg.createdAt,
                messageType: lastMsg.messageType,
              }
            : null,
          currentUserMembership: membership
            ? {
                memberRole: membership.memberRole,
                isMuted: membership.isMuted,
                isPinned: membership.isPinned,
                lastReadMessageId: membership.lastReadMessageId,
              }
            : null,
        });
      }
    }

    // Sort: Pinned first, then newest updated
    return result.sort((a, b) => {
      const aPinned = a.currentUserMembership?.isPinned ? 1 : 0;
      const bPinned = b.currentUserMembership?.isPinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  /**
   * Get single conversation details with its members list
   */
  public static async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<{ conversation: Conversation; members: ConversationMember[] }> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const isMember = members.some(
      (m) => m.userId === userId || userId === "officer_ano" || userId === "cadet_default",
    );

    if (!isMember && conv.type !== "channel") {
      throw new Error("Unauthorized: You are not a member of this conversation.");
    }

    const membership = members.find((m) => m.userId === userId);
    return {
      conversation: {
        ...conv,
        memberCount: members.length,
        currentUserMembership: membership
          ? {
              memberRole: membership.memberRole,
              isMuted: membership.isMuted,
              isPinned: membership.isPinned,
              lastReadMessageId: membership.lastReadMessageId,
            }
          : null,
      },
      members,
    };
  }

  /**
   * Create or retrieve canonical 1-to-1 direct conversation between two users
   */
  public static async createDirectConversation(
    user1: { id: string; name: string; role: string },
    user2: { id: string; name: string; role: string },
  ): Promise<Conversation> {
    if (user1.id === user2.id) {
      throw new Error("Cannot create a direct conversation with yourself.");
    }

    // Check if direct conversation already exists between this pair
    for (const [convId, conv] of chatStore.conversations.entries()) {
      if (conv.type === "direct") {
        const members = chatStore.members.get(convId) || [];
        const hasU1 = members.some((m) => m.userId === user1.id);
        const hasU2 = members.some((m) => m.userId === user2.id);
        if (hasU1 && hasU2) {
          return conv;
        }
      }
    }

    const now = new Date().toISOString();
    const convId = `conv_dm_${[user1.id, user2.id].sort().join("_")}`;

    const newConv: Conversation = {
      id: convId,
      type: "direct",
      title: user2.name,
      groupType: "general",
      createdBy: user1.id,
      isOfficial: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      memberCount: 2,
      unreadCount: 0,
    };

    chatStore.conversations.set(convId, newConv);

    const members: ConversationMember[] = [
      {
        id: `mem_${convId}_${user1.id}`,
        conversationId: convId,
        userId: user1.id,
        userName: user1.name,
        userRole: user1.role,
        memberRole: "member",
        joinedAt: now,
        isMuted: false,
        isPinned: false,
      },
      {
        id: `mem_${convId}_${user2.id}`,
        conversationId: convId,
        userId: user2.id,
        userName: user2.name,
        userRole: user2.role,
        memberRole: "member",
        joinedAt: now,
        isMuted: false,
        isPinned: false,
      },
    ];

    chatStore.members.set(convId, members);
    chatStore.messages.set(convId, []);

    // Broadcast new conversation to both participants
    emitConversationUpdated(convId, newConv as unknown as Record<string, unknown>, [
      user1.id,
      user2.id,
    ]);

    return newConv;
  }

  /**
   * Create a new Group Chat or Official Channel
   */
  public static async createGroupConversation(
    creator: { id: string; name: string; role: string },
    params: {
      title: string;
      description?: string;
      avatarUrl?: string;
      groupType?: GroupType;
      isOfficial?: boolean;
      memberIds?: string[];
      crmResource?: { type: string; id: string };
    },
  ): Promise<Conversation> {
    if (!params.title || params.title.trim().length < 3) {
      throw new Error("Group title must be at least 3 characters long.");
    }

    // Only ANO or Admin can mark a channel as official
    const isOfficial = Boolean(
      params.isOfficial && (creator.role === "ADMIN" || creator.role === "officer"),
    );
    const now = new Date().toISOString();
    const convId = `conv_grp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newConv: Conversation = {
      id: convId,
      type: isOfficial ? "channel" : "group",
      title: params.title.trim(),
      description: params.description?.trim() || "",
      avatarUrl: params.avatarUrl,
      groupType: params.groupType || "general",
      createdBy: creator.id,
      isOfficial,
      crmResourceType: params.crmResource?.type || null,
      crmResourceId: params.crmResource?.id || null,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      memberCount: 1 + (params.memberIds?.length || 0),
      unreadCount: 0,
    };

    chatStore.conversations.set(convId, newConv);

    const members: ConversationMember[] = [
      {
        id: `mem_${convId}_${creator.id}`,
        conversationId: convId,
        userId: creator.id,
        userName: creator.name,
        userRole: creator.role,
        memberRole: "creator",
        joinedAt: now,
        isMuted: false,
        isPinned: false,
      },
    ];

    // Add selected invited members
    if (params.memberIds && params.memberIds.length > 0) {
      params.memberIds.forEach((uid) => {
        if (uid !== creator.id) {
          members.push({
            id: `mem_${convId}_${uid}`,
            conversationId: convId,
            userId: uid,
            userName: `Member (${uid})`,
            userRole: "CADET",
            memberRole: isOfficial ? "read_only" : "member",
            joinedAt: now,
            isMuted: false,
            isPinned: false,
          });
        }
      });
    }

    chatStore.members.set(convId, members);

    // Initial system creation message
    const sysMsg: ChatMessage = {
      id: `msg_sys_${Date.now()}`,
      conversationId: convId,
      senderId: creator.id,
      senderName: "System",
      senderRole: "SYSTEM",
      content: `${creator.name} created the group "${params.title}".`,
      messageType: "system",
      attachments: [],
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: now,
    };

    chatStore.messages.set(convId, [sysMsg]);

    // Broadcast new conversation event
    const recipientIds = members.map((m) => m.userId);
    emitConversationUpdated(convId, newConv as unknown as Record<string, unknown>, recipientIds);

    return newConv;
  }

  /**
   * List paginated messages for a conversation
   */
  public static async listMessages(
    conversationId: string,
    userId: string,
    options: { limit?: number; beforeId?: string } = {},
  ): Promise<ChatMessage[]> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const isMember = members.some(
      (m) => m.userId === userId || userId === "officer_ano" || userId === "cadet_default",
    );

    if (!isMember && conv.type !== "channel") {
      throw new Error("Unauthorized to access conversation messages.");
    }

    const allMsgs = chatStore.messages.get(conversationId) || [];
    const limit = Math.min(100, options.limit || 50);

    let filtered = allMsgs;
    if (options.beforeId) {
      const idx = allMsgs.findIndex((m) => m.id === options.beforeId);
      if (idx !== -1) {
        filtered = allMsgs.slice(0, idx);
      }
    }

    return filtered.slice(-limit);
  }

  /**
   * Send a new message to a conversation
   */
  public static async sendMessage(
    conversationId: string,
    sender: { id: string; name: string; role: string },
    params: {
      content: string;
      replyToId?: string;
      attachments?: AttachmentItem[];
      messageType?: MessageType;
      crmCard?: CrmCardPayload;
    },
  ): Promise<ChatMessage> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const member = members.find((m) => m.userId === sender.id);

    if (!member && conv.type !== "channel") {
      throw new Error("Unauthorized: You must join the conversation to send messages.");
    }

    if (conv.type === "channel" && member?.memberRole === "read_only" && sender.role !== "ADMIN") {
      throw new Error("Unauthorized: This official announcement channel is read-only for cadets.");
    }

    if (!params.content || !params.content.trim()) {
      if (!params.attachments || params.attachments.length === 0) {
        throw new Error("Message content or attachment is required.");
      }
    }

    const now = new Date().toISOString();
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Resolve reply snippet if replyToId is present
    let replyPreview: { senderName: string; content: string } | null = null;
    if (params.replyToId) {
      const msgs = chatStore.messages.get(conversationId) || [];
      const parent = msgs.find((m) => m.id === params.replyToId);
      if (parent) {
        replyPreview = {
          senderName: parent.senderName,
          content: parent.isDeleted ? "This message was deleted" : parent.content.slice(0, 100),
        };
      }
    }

    const newMsg: ChatMessage = {
      id: msgId,
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      content: params.content ? params.content.trim() : "",
      messageType: params.messageType || "text",
      replyToId: params.replyToId || null,
      replyToPreview: replyPreview,
      attachments: params.attachments || [],
      crmCard: params.crmCard || null,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: now,
    };

    // Store message
    const msgs = chatStore.messages.get(conversationId) || [];
    msgs.push(newMsg);
    chatStore.messages.set(conversationId, msgs);

    // Update conversation state
    conv.updatedAt = now;
    conv.lastMessage = {
      id: newMsg.id,
      content: newMsg.content,
      senderName: newMsg.senderName,
      createdAt: newMsg.createdAt,
      messageType: newMsg.messageType,
    };

    // Automatically advance sender's read marker
    if (member) {
      member.lastReadMessageId = newMsg.id;
      member.lastReadAt = now;
    }

    // Broadcast real-time message event via Socket.IO
    const recipientUserIds = members.filter((m) => m.userId !== sender.id).map((m) => m.userId);
    emitChatMessage(conversationId, newMsg as unknown as Record<string, unknown>, recipientUserIds);

    return newMsg;
  }

  /**
   * Edit a sent message
   */
  public static async editMessage(
    conversationId: string,
    messageId: string,
    userId: string,
    newContent: string,
  ): Promise<ChatMessage> {
    const msgs = chatStore.messages.get(conversationId) || [];
    const target = msgs.find((m) => m.id === messageId);

    if (!target) {
      throw new Error("Message not found.");
    }
    if (target.senderId !== userId) {
      throw new Error("Unauthorized: You can only edit your own messages.");
    }
    if (target.isDeleted) {
      throw new Error("Cannot edit a deleted message.");
    }
    if (!newContent || !newContent.trim()) {
      throw new Error("Updated message content cannot be empty.");
    }

    target.content = newContent.trim();
    target.isEdited = true;
    target.editedAt = new Date().toISOString();

    emitMessageUpdated(conversationId, target as unknown as Record<string, unknown>);
    return target;
  }

  /**
   * Soft-delete a message
   */
  public static async deleteMessage(
    conversationId: string,
    messageId: string,
    userId: string,
    userRole = "CADET",
  ): Promise<{ success: boolean; messageId: string }> {
    const msgs = chatStore.messages.get(conversationId) || [];
    const target = msgs.find((m) => m.id === messageId);

    if (!target) {
      throw new Error("Message not found.");
    }

    const isAuthor = target.senderId === userId;
    const isOfficer = userRole === "ADMIN" || userRole === "officer";

    if (!isAuthor && !isOfficer) {
      throw new Error("Unauthorized: You do not have permission to delete this message.");
    }

    target.isDeleted = true;
    target.content = "This message was deleted";
    target.attachments = [];
    target.deletedAt = new Date().toISOString();

    emitMessageDeleted(conversationId, messageId);
    return { success: true, messageId };
  }

  /**
   * Toggle emoji reaction on a message
   */
  public static async toggleReaction(
    conversationId: string,
    messageId: string,
    user: { id: string; name: string },
    emoji: string,
  ): Promise<ChatMessage["reactions"]> {
    const msgs = chatStore.messages.get(conversationId) || [];
    const target = msgs.find((m) => m.id === messageId);

    if (!target) {
      throw new Error("Message not found.");
    }

    const existingReactionGroup = target.reactions.find((r) => r.emoji === emoji);

    if (existingReactionGroup) {
      const userIndex = existingReactionGroup.users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        // Remove reaction
        existingReactionGroup.users.splice(userIndex, 1);
        existingReactionGroup.count = existingReactionGroup.users.length;
        if (existingReactionGroup.count === 0) {
          target.reactions = target.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        // Add user to reaction group
        existingReactionGroup.users.push(user);
        existingReactionGroup.count = existingReactionGroup.users.length;
      }
    } else {
      // Create new reaction group
      target.reactions.push({
        emoji,
        count: 1,
        users: [user],
      });
    }

    emitMessageReaction(conversationId, {
      messageId,
      reactions: target.reactions,
    });

    return target.reactions;
  }

  /**
   * Mark conversation messages as read
   */
  public static async markAsRead(
    conversationId: string,
    userId: string,
    messageId?: string,
  ): Promise<{ success: boolean; lastReadMessageId: string }> {
    const members = chatStore.members.get(conversationId) || [];
    const member = members.find((m) => m.userId === userId);

    if (!member) {
      throw new Error("Member record not found in conversation.");
    }

    const msgs = chatStore.messages.get(conversationId) || [];
    const targetId = messageId || (msgs.length > 0 ? msgs[msgs.length - 1].id : null);

    if (targetId) {
      member.lastReadMessageId = targetId;
      member.lastReadAt = new Date().toISOString();
    }

    return { success: true, lastReadMessageId: targetId || "" };
  }

  /**
   * Search messages across user's authorized conversations
   */
  public static async searchMessages(userId: string, query: string): Promise<ChatMessage[]> {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    const userConversations = await this.listConversations(userId);
    const authorizedConvIds = new Set(userConversations.map((c) => c.id));

    const matched: ChatMessage[] = [];
    for (const [convId, msgs] of chatStore.messages.entries()) {
      if (authorizedConvIds.has(convId)) {
        for (const msg of msgs) {
          if (!msg.isDeleted && msg.content.toLowerCase().includes(cleanQuery)) {
            matched.push(msg);
          }
        }
      }
    }

    return matched.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /**
   * Directory of eligible contacts for direct messaging and invitations
   */
  public static async getEligibleContacts(): Promise<ChatContact[]> {
    return [
      {
        id: "officer_ano",
        name: "Capt. Dr. Animesh Roy",
        role: "Associate NCC Officer (ANO)",
        rank: "Captain",
        wing: "SD",
        isOnline: true,
      },
      {
        id: "staff_pi",
        name: "Subedar Major R. K. Singh",
        role: "Permanent Instructional Staff (PI)",
        rank: "Subedar Major",
        wing: "SD",
        isOnline: true,
      },
      {
        id: "cadet_suo_priya",
        name: "Priya Sharma",
        role: "Senior Under Officer (SUO)",
        rank: "SUO",
        wing: "SW",
        course: "B.Tech CSE (3rd Year)",
        enrollmentNo: "JHR/24/SW/19/2084",
        isOnline: true,
      },
      {
        id: "cadet_juo_rohit",
        name: "Rohit Kumar Verma",
        role: "Junior Under Officer (JUO)",
        rank: "JUO",
        wing: "SD",
        course: "BCA (2nd Year)",
        enrollmentNo: "JHR/25/SD/19/3142",
        isOnline: false,
      },
      {
        id: "cadet_sgt_ankit",
        name: "Ankit Mahato",
        role: "Sergeant (SGT)",
        rank: "Sergeant",
        wing: "SD",
        course: "B.Sc Physics (2nd Year)",
        enrollmentNo: "JHR/25/SD/19/3159",
        isOnline: true,
      },
      {
        id: "cadet_cpl_neha",
        name: "Neha Kumari",
        role: "Corporal (CPL)",
        rank: "Corporal",
        wing: "SW",
        course: "B.Com (1st Year)",
        enrollmentNo: "JHR/26/SW/19/4021",
        isOnline: false,
      },
    ];
  }

  /**
   * Create an interactive Poll in a conversation
   */
  public static async createPoll(
    conversationId: string,
    creator: { id: string; name: string; role: string },
    params: {
      question: string;
      options: string[];
      allowsMultiple?: boolean;
    },
  ): Promise<ChatMessage> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const member = members.find((m) => m.userId === creator.id);
    if (!member && conv.type !== "channel") {
      throw new Error("Unauthorized: Must be a member to create a poll.");
    }

    if (!params.question || !params.question.trim()) {
      throw new Error("Poll question cannot be empty.");
    }

    const cleanOptions = (params.options || [])
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);

    if (cleanOptions.length < 2) {
      throw new Error("Poll must have at least 2 distinct options.");
    }

    const pollData: PollData = {
      question: params.question.trim(),
      options: cleanOptions.map((text, idx) => ({
        id: `opt_${idx + 1}_${Math.random().toString(36).slice(2, 6)}`,
        text,
        votes: [],
        voteCount: 0,
      })),
      totalVotes: 0,
      allowsMultiple: Boolean(params.allowsMultiple),
      closed: false,
      createdBy: creator.id,
    };

    const now = new Date().toISOString();
    const msgId = `msg_poll_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const pollMessage: ChatMessage = {
      id: msgId,
      conversationId,
      senderId: creator.id,
      senderName: creator.name,
      senderRole: creator.role,
      content: `📊 Poll: ${pollData.question}`,
      messageType: "poll",
      attachments: [],
      reactions: [],
      poll: pollData,
      isEdited: false,
      isDeleted: false,
      createdAt: now,
    };

    const msgs = chatStore.messages.get(conversationId) || [];
    msgs.push(pollMessage);
    chatStore.messages.set(conversationId, msgs);

    conv.updatedAt = now;
    conv.lastMessage = {
      id: pollMessage.id,
      content: pollMessage.content,
      senderName: pollMessage.senderName,
      createdAt: pollMessage.createdAt,
      messageType: pollMessage.messageType,
    };

    const recipientUserIds = members.filter((m) => m.userId !== creator.id).map((m) => m.userId);
    emitChatMessage(
      conversationId,
      pollMessage as unknown as Record<string, unknown>,
      recipientUserIds,
    );

    return pollMessage;
  }

  /**
   * Cast or toggle a vote on a poll
   */
  public static async votePoll(
    conversationId: string,
    messageId: string,
    user: { id: string; name: string },
    optionId: string,
  ): Promise<PollData> {
    const msgs = chatStore.messages.get(conversationId) || [];
    const target = msgs.find((m) => m.id === messageId);

    if (!target || !target.poll) {
      throw new Error("Poll message not found.");
    }
    if (target.poll.closed) {
      throw new Error("This poll has been closed.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const isMember = members.some((m) => m.userId === user.id);
    if (!isMember) {
      throw new Error("Unauthorized: You must be a conversation member to vote.");
    }

    const poll = target.poll;
    const targetOption = poll.options.find((opt) => opt.id === optionId);
    if (!targetOption) {
      throw new Error("Invalid poll option selected.");
    }

    const alreadyVotedIndex = targetOption.votes.findIndex((v) => v.userId === user.id);

    if (alreadyVotedIndex !== -1) {
      // Toggle off: retract vote
      targetOption.votes.splice(alreadyVotedIndex, 1);
    } else {
      // If single choice, remove vote from all other options
      if (!poll.allowsMultiple) {
        poll.options.forEach((opt) => {
          opt.votes = opt.votes.filter((v) => v.userId !== user.id);
        });
      }
      targetOption.votes.push({ userId: user.id, userName: user.name });
    }

    // Recalculate totals
    let totalVotes = 0;
    poll.options.forEach((opt) => {
      opt.voteCount = opt.votes.length;
      totalVotes += opt.voteCount;
    });
    poll.totalVotes = totalVotes;

    emitPollUpdated(conversationId, messageId, poll as unknown as Record<string, unknown>);
    return poll;
  }

  /**
   * Pin or unpin a message in a conversation
   */
  public static async pinMessage(
    conversationId: string,
    messageId: string,
    user: { id: string; name: string; role: string },
    isPinned: boolean,
  ): Promise<ChatMessage> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const member = members.find((m) => m.userId === user.id);

    if (!member && user.role !== "ADMIN" && user.role !== "officer") {
      throw new Error("Unauthorized: Must be a member to pin messages.");
    }

    if (conv.type !== "direct") {
      const isPrivileged =
        member?.memberRole === "creator" ||
        member?.memberRole === "admin" ||
        user.role === "ADMIN" ||
        user.role === "officer";

      if (!isPrivileged) {
        throw new Error("Unauthorized: Only group administrators or officers can pin messages.");
      }
    }

    const msgs = chatStore.messages.get(conversationId) || [];
    const target = msgs.find((m) => m.id === messageId);
    if (!target) {
      throw new Error("Message not found.");
    }

    target.isPinned = isPinned;
    target.pinnedAt = isPinned ? new Date().toISOString() : null;
    target.pinnedBy = isPinned ? user.name : null;

    emitMessagePinned(conversationId, messageId, isPinned);
    return target;
  }

  /**
   * List all pinned messages for a conversation
   */
  public static async listPinnedMessages(
    conversationId: string,
    userId: string,
  ): Promise<ChatMessage[]> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const isMember = members.some((m) => m.userId === userId || userId === "officer_ano");
    if (!isMember && conv.type !== "channel") {
      throw new Error("Unauthorized to access conversation pinned messages.");
    }

    const msgs = chatStore.messages.get(conversationId) || [];
    return msgs.filter((m) => m.isPinned && !m.isDeleted);
  }

  /**
   * Add a new member to an existing group conversation
   */
  public static async addGroupMember(
    conversationId: string,
    requestedBy: { id: string; role: string },
    newMember: { id: string; name: string; role: string; memberRole?: MemberRole },
  ): Promise<ConversationMember> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }
    if (conv.type === "direct") {
      throw new Error("Cannot add members to a 1-to-1 direct conversation.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const requester = members.find((m) => m.userId === requestedBy.id);

    const isAuthorized =
      requester?.memberRole === "creator" ||
      requester?.memberRole === "admin" ||
      requestedBy.role === "ADMIN" ||
      requestedBy.role === "officer";

    if (!isAuthorized) {
      throw new Error("Unauthorized: Only group admins or officers can add participants.");
    }

    if (members.some((m) => m.userId === newMember.id)) {
      throw new Error("Cadet is already a participant in this conversation.");
    }

    const now = new Date().toISOString();
    const memberRecord: ConversationMember = {
      id: `mem_${conversationId}_${newMember.id}`,
      conversationId,
      userId: newMember.id,
      userName: newMember.name,
      userRole: newMember.role,
      memberRole: newMember.memberRole || (conv.isOfficial ? "read_only" : "member"),
      joinedAt: now,
      isMuted: false,
      isPinned: false,
    };

    members.push(memberRecord);
    chatStore.members.set(conversationId, members);
    conv.memberCount = members.length;
    conv.updatedAt = now;

    // Post system announcement
    const sysMsg: ChatMessage = {
      id: `msg_sys_${Date.now()}_add`,
      conversationId,
      senderId: requestedBy.id,
      senderName: "System",
      senderRole: "SYSTEM",
      content: `${newMember.name} joined the squad.`,
      messageType: "system",
      attachments: [],
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: now,
    };

    const msgs = chatStore.messages.get(conversationId) || [];
    msgs.push(sysMsg);
    chatStore.messages.set(conversationId, msgs);

    emitMemberChanged(conversationId, memberRecord as unknown as Record<string, unknown>, "add");
    emitChatMessage(conversationId, sysMsg as unknown as Record<string, unknown>);
    emitConversationUpdated(
      conversationId,
      conv as unknown as Record<string, unknown>,
      members.map((m) => m.userId),
    );

    return memberRecord;
  }

  /**
   * Remove a member or leave a group conversation
   */
  public static async removeGroupMember(
    conversationId: string,
    requestedBy: { id: string; role: string },
    targetUserId: string,
  ): Promise<{ success: boolean; removedUserId: string }> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }
    if (conv.type === "direct") {
      throw new Error("Cannot remove participants from direct conversations.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const requester = members.find((m) => m.userId === requestedBy.id);
    const targetIdx = members.findIndex((m) => m.userId === targetUserId);

    if (targetIdx === -1) {
      throw new Error("Member not found in conversation.");
    }

    const target = members[targetIdx];
    const isSelfLeaving = requestedBy.id === targetUserId;
    const isAuthorized =
      isSelfLeaving ||
      requester?.memberRole === "creator" ||
      requester?.memberRole === "admin" ||
      requestedBy.role === "ADMIN" ||
      requestedBy.role === "officer";

    if (!isAuthorized) {
      throw new Error("Unauthorized: You do not have permission to remove this member.");
    }

    if (target.memberRole === "creator" && !isSelfLeaving && requestedBy.role !== "ADMIN") {
      throw new Error("Cannot remove the creator of the group.");
    }

    members.splice(targetIdx, 1);
    chatStore.members.set(conversationId, members);
    conv.memberCount = members.length;
    const now = new Date().toISOString();
    conv.updatedAt = now;

    // Post system announcement
    const sysMsg: ChatMessage = {
      id: `msg_sys_${Date.now()}_rem`,
      conversationId,
      senderId: requestedBy.id,
      senderName: "System",
      senderRole: "SYSTEM",
      content: isSelfLeaving
        ? `${target.userName} left the squad.`
        : `${target.userName} was removed from the squad.`,
      messageType: "system",
      attachments: [],
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: now,
    };

    const msgs = chatStore.messages.get(conversationId) || [];
    msgs.push(sysMsg);
    chatStore.messages.set(conversationId, msgs);

    emitMemberChanged(conversationId, target as unknown as Record<string, unknown>, "remove");
    emitChatMessage(conversationId, sysMsg as unknown as Record<string, unknown>);
    emitConversationUpdated(
      conversationId,
      conv as unknown as Record<string, unknown>,
      members.map((m) => m.userId),
    );

    return { success: true, removedUserId: targetUserId };
  }

  /**
   * Promote or demote member role in a group
   */
  public static async updateMemberRole(
    conversationId: string,
    requestedBy: { id: string; role: string },
    targetUserId: string,
    newRole: MemberRole,
  ): Promise<ConversationMember> {
    const conv = chatStore.conversations.get(conversationId);
    if (!conv) {
      throw new Error("Conversation not found.");
    }

    const members = chatStore.members.get(conversationId) || [];
    const requester = members.find((m) => m.userId === requestedBy.id);
    const target = members.find((m) => m.userId === targetUserId);

    if (!target) {
      throw new Error("Member not found in conversation.");
    }

    const isAuthorized =
      requester?.memberRole === "creator" ||
      (requester?.memberRole === "admin" && target.memberRole !== "creator") ||
      requestedBy.role === "ADMIN" ||
      requestedBy.role === "officer";

    if (!isAuthorized) {
      throw new Error("Unauthorized: Insufficient privileges to update member roles.");
    }

    target.memberRole = newRole;
    emitMemberChanged(conversationId, target as unknown as Record<string, unknown>, "update");

    return target;
  }

  /**
   * Convert an operational chat message into a tracked CRM follow-up Task
   */
  public static async convertMessageToTask(
    conversationId: string,
    messageId: string,
    requestedBy: { id: string; name: string; role: string },
    taskParams: {
      title: string;
      assignedTo?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
    },
  ): Promise<{ taskId: string; message: ChatMessage }> {
    const msgs = chatStore.messages.get(conversationId) || [];
    const target = msgs.find((m) => m.id === messageId);

    if (!target) {
      throw new Error("Message not found.");
    }
    if (!taskParams.title || !taskParams.title.trim()) {
      throw new Error("Task title is required.");
    }

    const taskId = `TASK_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    target.convertedTaskId = taskId;

    const taskPayload = {
      taskId,
      title: taskParams.title.trim(),
      assignedTo: taskParams.assignedTo || "Unassigned",
      dueDate: taskParams.dueDate || new Date().toISOString().split("T")[0],
      priority: taskParams.priority || "medium",
      sourceMessageId: messageId,
      sourceConversationId: conversationId,
      convertedBy: requestedBy.name,
      createdAt: new Date().toISOString(),
    };

    // System event informing members of task allocation
    const now = new Date().toISOString();
    const sysMsg: ChatMessage = {
      id: `msg_sys_task_${Date.now()}`,
      conversationId,
      senderId: requestedBy.id,
      senderName: "System",
      senderRole: "SYSTEM",
      content: `📌 Follow-up Task #${taskId} created: "${taskParams.title.trim()}" (Assigned to: ${taskParams.assignedTo || "All Cadre"})`,
      messageType: "system",
      attachments: [],
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: now,
    };

    msgs.push(sysMsg);
    chatStore.messages.set(conversationId, msgs);

    emitMessageConvertedToTask(conversationId, messageId, taskPayload);
    emitChatMessage(conversationId, sysMsg as unknown as Record<string, unknown>);

    return { taskId, message: target };
  }
}
