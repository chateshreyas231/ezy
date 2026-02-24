export type UserRole =
  | 'buyer'
  | 'seller'
  | 'buyer_agent'
  | 'seller_agent'
  | 'support'
  | 'client'
  | 'agent'
  | 'vendor';

export type LoginPortal = 'client' | 'agent' | 'broker_vendor';

export type ExtendedRole = UserRole | 'broker';

export type AppProfile = {
  id: string;
  role: UserRole;
  display_name: string | null;
  verification_level: number;
  buyer_verified?: boolean;
  seller_verified?: boolean;
  readiness_score?: number;
  created_at: string;
};

export type ListingWithMedia = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  beds: number;
  baths: number;
  sqft: number | null;
  property_type: string;
  features: string[];
  status: string;
  created_at: string;
  address_public: string | null;
  listing_media: Array<{
    id: string;
    storage_path: string;
    media_type: 'image' | 'video';
    order_index: number;
  }>;
};

export type MatchRecord = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  match_score: number | null;
  explanation?: string | null;
  created_at: string;
  listing?: {
    title: string;
    price: number;
    beds: number;
    baths: number;
  } | null;
};

export type DealRoomRecord = {
  id: string;
  match_id: string;
  status: string;
  created_at: string;
};
