// logic/matchingLogic.ts
// Core matching algorithm for buyer need ↔ listing
import type { BuyerNeedPost, ListingPost } from '../src/types/types';

/**
 * Calculate match score between a buyer need and listing
 * Returns score 0-100, where 0 means no match
 */
export function calculateMatchScore(
  buyerNeed: BuyerNeedPost,
  listing: ListingPost
): number {
  let score = 0;
  let factors = 0;

  // State match (required)
  if (buyerNeed.state !== listing.state) {
    return 0; // Must be in same state
  }
  score += 20; // Base score for state match
  factors++;

  // Location match
  if (buyerNeed.city && listing.city && buyerNeed.city === listing.city) {
    score += 30;
    factors++;
  } else if (buyerNeed.zip && listing.zip && buyerNeed.zip === listing.zip) {
    score += 25;
    factors++;
  } else if (buyerNeed.city || listing.city) {
    // Partial location match
    score += 10;
    factors++;
  }

  // Price match
  if (buyerNeed.price_min && buyerNeed.price_max && listing.list_price) {
    if (listing.list_price >= buyerNeed.price_min && listing.list_price <= buyerNeed.price_max) {
      score += 30;
      factors++;
    } else {
      // Price is close but outside range
      const diff = Math.min(
        Math.abs(listing.list_price - buyerNeed.price_min),
        Math.abs(listing.list_price - buyerNeed.price_max)
      );
      const range = buyerNeed.price_max - buyerNeed.price_min;
      if (diff <= range * 0.1) {
        score += 15; // Within 10% of range
        factors++;
      }
    }
  }

  // Property type match
  if (buyerNeed.property_type && listing.property_type) {
    if (buyerNeed.property_type === listing.property_type) {
      score += 10;
      factors++;
    }
  }

  // Beds match
  if (buyerNeed.beds && listing.beds) {
    if (buyerNeed.beds === listing.beds) {
      score += 5;
      factors++;
    } else if (Math.abs(buyerNeed.beds - listing.beds) <= 1) {
      score += 2;
      factors++;
    }
  }

  // Baths match
  if (buyerNeed.baths && listing.baths) {
    if (Math.abs(buyerNeed.baths - listing.baths) <= 0.5) {
      score += 5;
      factors++;
    }
  }

  // Normalize score to 0-100 range
  if (factors === 0) return 0;
  return Math.min(100, Math.round(score));
}

