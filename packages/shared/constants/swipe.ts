/**
 * Swipe direction mapping configuration
 * Can be flipped later if needed
 */
export const SWIPE_DIRECTIONS = {
  LEFT: 'yes',   // Swipe LEFT = YES (like)
  RIGHT: 'no',   // Swipe RIGHT = NO (pass)
} as const;

export type SwipeDirection = typeof SWIPE_DIRECTIONS[keyof typeof SWIPE_DIRECTIONS];

