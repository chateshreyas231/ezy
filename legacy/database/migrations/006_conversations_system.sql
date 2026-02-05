-- Migration 006: Conversations and Pre-Deal Messaging
-- Creates conversations and conversation_messages tables for listing inquiries

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_post_id UUID NOT NULL REFERENCES listing_posts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure one conversation per buyer-listing pair
  UNIQUE(listing_post_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',     -- e.g. 'text', 'image', etc.
  message_label TEXT,                  -- AI triage label, e.g. 'QUESTION', 'SCHEDULING', 'OFFER'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on conversations tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_post_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender ON conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_label ON conversation_messages(message_label);

-- Trigger for updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

