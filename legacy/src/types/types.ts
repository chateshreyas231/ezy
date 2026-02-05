export type Role =
  | 'buyerAgent'
  | 'listingAgent'
  | 'vendor'
  | 'buyer'
  | 'seller'
  | 'guest'
  | 'selfRepresentedAgent'
  | 'vendorAttorney'
  | 'admin'
  | 'fsboSeller'
  | 'teamLead';

export type RoleRules = {
  [key: string]: boolean;
};

export type Compliance = {
  [state: string]: {
    [role in Role]?: RoleRules;
  };
};

// User types
export interface User {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: Role;
  state: string | null;
  is_verified_agent: boolean;
  verification_level: number;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

// Post types
export interface BuyerNeedPost {
  id: string;
  agent_id: string;
  state: string;
  city: string | null;
  zip: string | null;
  radius_miles: number | null;
  price_min: number | null;
  price_max: number | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  features: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ListingPost {
  id: string;
  agent_id: string;
  state: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  list_price: number;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  features: Record<string, any>;
  verified: boolean;
  last_verified_at: string | null;
  listing_status: string | null;
  created_at: string;
  updated_at: string;
}

// Match types
export interface Match {
  id: string;
  buyer_need_post_id: string;
  listing_post_id: string;
  score: number;
  explanation: string | null;
  created_at: string;
}

export interface MatchUnlock {
  id: string;
  user_id: string;
  buyer_need_post_id: string;
  listing_post_id: string;
  unlocked_at: string;
}

// Offer Room types
export interface OfferRoom {
  id: string;
  buyer_need_post_id: string | null;
  listing_post_id: string | null;
  match_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  offer_room_id: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  created_at: string;
}

export interface IntentEntry {
  id: string;
  offer_room_id: string;
  user_id: string;
  intent_text: string | null;
  offer_amount: number | null;
  created_at: string;
}

export interface CompensationDeclaration {
  id: string;
  offer_room_id: string;
  user_id: string;
  role: string;
  description: string | null;
  created_at: string;
}

// Scheduling types
export interface Appointment {
  id: string;
  creator_id: string;
  related_match_id: string | null;
  offer_room_id: string | null;
  scheduled_time: string;
  location: string | null;
  qr_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Checkin {
  id: string;
  appointment_id: string;
  user_id: string;
  checked_in_at: string;
  location_snapshot: Record<string, any> | null;
}

// Activity Log types
export interface ActivityLog {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  meta: Record<string, any>;
  created_at: string;
}

// Task types
export interface Task {
  id: string;
  context_type: 'listing' | 'deal' | null;
  listing_post_id: string | null;
  deal_id: string | null;
  offer_room_id: string | null; // Legacy support
  assigned_role: string;
  title: string;
  description: string | null;
  due_at: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  ai_generated: boolean;
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

// Conversation types
export interface Conversation {
  id: string;
  listing_post_id: string;
  buyer_id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  message_label: string | null;
  created_at: string;
}

// Deal types
export type DealStage =
  | 'active_search'
  | 'touring'
  | 'offer_submitted'
  | 'offer_negotiation'
  | 'under_contract'
  | 'inspection'
  | 'appraisal'
  | 'title'
  | 'closing'
  | 'closed';

export interface Deal {
  id: string;
  listing_post_id: string;
  buyer_id: string;
  seller_id: string | null;
  buyer_agent_id: string | null;
  seller_agent_id: string | null;
  offer_room_id: string | null;
  stage: DealStage;
  created_at: string;
  updated_at: string;
}

// Workflow Template types
export interface WorkflowTemplate {
  id: string;
  template_key: string;
  stage: string;
  assigned_role: string;
  title: string;
  description: string | null;
  due_in_days: number | null;
  dependency_titles: string[];
  created_at: string;
  updated_at: string;
}

// Form input types
export interface CreateBuyerNeedInput {
  state: string;
  city?: string;
  zip?: string;
  radius_miles?: number;
  price_min?: number;
  price_max?: number;
  property_type?: string;
  beds?: number;
  baths?: number;
  features?: Record<string, any>;
}

export interface CreateListingInput {
  state: string;
  address?: string;
  city?: string;
  zip?: string;
  list_price: number;
  property_type?: string;
  beds?: number;
  baths?: number;
  features?: Record<string, any>;
}
