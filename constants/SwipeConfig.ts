// constants/SwipeConfig.ts
// Configuration for swipe directions (Tinder/TikTok style)
// LEFT = YES (like/accept), RIGHT = NO (pass/archive)

export const SWIPE_CONFIG = {
  // Swipe direction mapping
  LEFT: 'yes' as const,   // Swipe LEFT = YES (like/accept)
  RIGHT: 'no' as const,   // Swipe RIGHT = NO (pass/archive)
  
  // Visual feedback
  SWIPE_THRESHOLD: 50,    // Minimum distance to trigger swipe (pixels)
  ANIMATION_DURATION: 300, // Animation duration in ms
  
  // Verification requirements
  BUYER_SWIPE_YES_REQUIRES_VERIFICATION: 3, // Buyers need L3 to swipe YES
  SELLER_ACCEPT_REQUIRES_VERIFICATION: 2,   // Sellers need L2 or listing_verified
  
  // Auto-accept thresholds (for sellers)
  AUTO_ACCEPT_ENABLED: true,
  AUTO_ACCEPT_MATCH_SCORE_THRESHOLD: 0.85, // Auto-accept if match score >= 0.85
} as const;

export type SwipeDirection = typeof SWIPE_CONFIG.LEFT | typeof SWIPE_CONFIG.RIGHT;

