/**
 * Verification level requirements
 */
export const VERIFICATION_LEVELS = {
  EMAIL_ONLY: 0,        // L0: Email verified (can browse)
  ID_VERIFIED: 1,       // L1: ID verified
  PREAPPROVAL: 2,       // L2: Pre-approval verified
  FULLY_VERIFIED: 3,    // L3: Fully verified (can swipe YES)
} as const;

/**
 * Minimum verification level to swipe YES as buyer
 */
export const MIN_VERIFICATION_FOR_BUYER_YES = VERIFICATION_LEVELS.FULLY_VERIFIED;

/**
 * Minimum verification level to make listing active as seller
 * OR listing_verified=true
 */
export const MIN_VERIFICATION_FOR_ACTIVE_LISTING = VERIFICATION_LEVELS.PREAPPROVAL;

