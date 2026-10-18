-- ============================================================================
-- NCC CRM Platform — Migration: 20260812000000_communication_hub.sql
-- Subsystem: Enterprise Communication Hub & Real-time Collaboration Engine
-- Organization: 19 Jharkhand Battalion NCC, Ranchi | Sarala Birla University
-- ============================================================================

-- 1. Conversation Entities
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'channel')),
    title VARCHAR(120),
    description TEXT,
    avatar_url TEXT,
    group_type VARCHAR(30) DEFAULT 'general' CHECK (group_type IN (
        'unit', 'institution', 'training', 'camp', 'committee', 'event', 'administrative', 'general'
    )),
    created_by TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    crm_resource_type VARCHAR(40), -- 'camp', 'training', 'event', 'cadet', 'notice'
    crm_resource_id TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversation Members
CREATE TABLE IF NOT EXISTS conversation_members (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(30) NOT NULL DEFAULT 'CADET',
    member_role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (member_role IN (
        'creator', 'admin', 'moderator', 'member', 'read_only'
    )),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_message_id TEXT,
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_conv_member UNIQUE (conversation_id, user_id)
);

-- 3. Messages
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_role VARCHAR(30) NOT NULL DEFAULT 'CADET',
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN (
        'text', 'system', 'announcement', 'crm_card'
    )),
    reply_to_id TEXT,
    reply_to_preview JSONB,
    attachments JSONB DEFAULT '[]'::jsonb,
    crm_card JSONB,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Message Reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    emoji VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_message_reaction UNIQUE (message_id, user_id, emoji)
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conv ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_message_reactions_msg ON message_reactions(message_id);

-- 6. Row Level Security (RLS) Enablement
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Service Role Bypass (Full access for server functions)
CREATE POLICY "service_role_conversations" ON conversations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_members" ON conversation_members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_messages" ON messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_reactions" ON message_reactions FOR ALL TO service_role USING (true) WITH CHECK (true);
