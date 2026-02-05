/**
 * Shared TypeScript types for Ezriya platform
 */

export type UserRole = 'buyer' | 'seller' | 'buyer_agent' | 'seller_agent' | 'support';

export type ListingStatus = 'draft' | 'active' | 'pending' | 'sold' | 'inactive';

export type SwipeDirection = 'yes' | 'no';
export type SwipeTargetType = 'listing' | 'buyer_intent';

export type DealRoomStatus = 'matched' | 'touring' | 'offer_made' | 'under_contract' | 'closed' | 'cancelled';

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskCategory = 'pre_offer' | 'due_diligence' | 'financing' | 'closing' | 'general';

export type MediaType = 'image' | 'video';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  verification_level: number;
  created_at: string;
}

export interface BuyerIntent {
  id: string;
  buyer_id: string;
  budget_min: number;
  budget_max: number;
  beds_min: number;
  baths_min: number;
  property_types: string[];
  must_haves: string[];
  dealbreakers: string[];
  areas: any; // jsonb - place_ids or polygons
  commute_anchors: any; // jsonb - lat, lng, label, max_minutes
  active: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  address_public: string | null;
  address_private: string | null;
  price: number;
  beds: number;
  baths: number;
  sqft: number | null;
  property_type: string;
  features: string[];
  status: ListingStatus;
  listing_verified: boolean;
  listing_number: string | null;
  freshness_verified_at: string | null;
  created_at: string;
}

export interface ListingMedia {
  id: string;
  listing_id: string;
  storage_path: string;
  media_type: MediaType;
  order_index: number;
  created_at: string;
}

export interface Swipe {
  id: string;
  actor_id: string;
  target_type: SwipeTargetType;
  target_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface Match {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  match_score: number;
  explanation: string;
  created_at: string;
}

export interface DealRoom {
  id: string;
  match_id: string;
  status: DealRoomStatus;
  created_at: string;
}

export interface DealParticipant {
  id: string;
  deal_room_id: string;
  profile_id: string;
  role_in_deal: string;
  created_at: string;
}

export interface Task {
  id: string;
  deal_room_id: string;
  assignee_profile_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: TaskCategory;
  order_index: number;
  due_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_profile_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  uploader_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface TaskMention {
  id: string;
  task_comment_id: string;
  mentioned_profile_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  deal_room_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  content: string;
  created_at: string;
}

export interface ListingCard {
  listing: Listing;
  media: ListingMedia[];
  score?: number;
  explanation?: string;
  commute_est_minutes?: number;
}

export interface BuyerIntentCard {
  buyer_intent: BuyerIntent;
  buyer_profile: Profile;
  score?: number;
  explanation?: string;
}

