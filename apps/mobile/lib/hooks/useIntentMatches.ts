import { useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { getAssetUri } from '../utils/assetLoader';

type IntentContext = {
  id: string;
  budget_min: number;
  budget_max: number;
  beds_min: number;
  baths_min: number;
  property_types: string[];
  must_haves: string[];
  active: boolean;
} | null;

export type IntentMatchMedia = {
  id: string;
  uri: string;
  type: 'image' | 'video';
  orderIndex: number;
};

export type IntentMatchListing = {
  id: string;
  listingId: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number | null;
  propertyType: string;
  address: string;
  score: number;
  reason: string;
  createdAt: string;
  dealRoomId: string | null;
  media: IntentMatchMedia[];
};

type FetchIntentMatchesResult = {
  intent: IntentContext;
  matches: IntentMatchListing[];
};

function normalizeScore(rawScore: unknown): number {
  const numericScore = Number(rawScore);
  if (!Number.isFinite(numericScore)) return 0;
  if (numericScore <= 1) return Math.max(0, Math.min(100, Math.round(numericScore * 100)));
  return Math.max(0, Math.min(100, Math.round(numericScore)));
}

function createFallbackReason(
  listing: {
    price: number;
    beds: number;
    baths: number;
    property_type: string;
  },
  intent: IntentContext
): string {
  const reasons: string[] = [];

  if (intent) {
    if (intent.budget_min && intent.budget_max) {
      if (listing.price >= intent.budget_min && listing.price <= intent.budget_max) {
        reasons.push('Price is within your target budget.');
      }
    }

    if (intent.beds_min && listing.beds >= intent.beds_min) {
      reasons.push(`Has at least ${intent.beds_min} bedrooms.`);
    }

    if (intent.baths_min && listing.baths >= intent.baths_min) {
      reasons.push(`Meets your ${intent.baths_min}+ bathroom preference.`);
    }

    const allowedTypes = intent.property_types || [];
    if (
      allowedTypes.length > 0 &&
      allowedTypes.some((type) => type.toLowerCase() === listing.property_type.toLowerCase())
    ) {
      reasons.push(`Matches your preferred property type (${listing.property_type}).`);
    }
  }

  if (reasons.length === 0) {
    return 'Strong overall fit based on your buying intent and activity.';
  }

  return reasons.slice(0, 2).join(' ');
}

function listingFitsIntent(
  listing: {
    price: number;
    beds: number;
    baths: number;
    propertyType: string;
  },
  intent: IntentContext
): boolean {
  if (!intent) return true;

  if (intent.budget_min && listing.price < intent.budget_min) return false;
  if (intent.budget_max && listing.price > intent.budget_max) return false;
  if (intent.beds_min && listing.beds < intent.beds_min) return false;
  if (intent.baths_min && listing.baths < intent.baths_min) return false;

  if (intent.property_types?.length) {
    const allowedTypes = intent.property_types.map((type) => type.toLowerCase());
    if (!allowedTypes.includes(listing.propertyType.toLowerCase())) return false;
  }

  return true;
}

export function useIntentMatches() {
  const { user } = useAuth();

  const fetchIntentMatches = useCallback(
    async (intentId: string): Promise<FetchIntentMatchesResult> => {
      if (!user) throw new Error('Not authenticated');

      const { data: intentData, error: intentError } = await supabase
        .from('buyer_intents')
        .select('id, budget_min, budget_max, beds_min, baths_min, property_types, must_haves, active')
        .eq('id', intentId)
        .eq('buyer_id', user.id)
        .maybeSingle();

      if (intentError) throw intentError;

      const intent = (intentData || null) as IntentContext;

      const { data: rawMatches, error: matchesError } = await supabase
        .from('matches')
        .select(
          `
          id,
          listing_id,
          match_score,
          explanation,
          created_at,
          listing:listings (
            id,
            title,
            price,
            beds,
            baths,
            sqft,
            address_public,
            property_type
          )
        `
        )
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;
      if (!rawMatches || rawMatches.length === 0) {
        return { intent, matches: [] };
      }

      const matchIds = rawMatches.map((match: any) => match.id);
      const listingIds = rawMatches.map((match: any) => match.listing_id);

      const [{ data: dealRooms, error: dealRoomsError }, { data: mediaRows, error: mediaError }] =
        await Promise.all([
          supabase.from('deal_rooms').select('id, match_id').in('match_id', matchIds),
          supabase
            .from('listing_media')
            .select('id, listing_id, storage_path, media_type, order_index')
            .in('listing_id', listingIds)
            .order('order_index', { ascending: true }),
        ]);

      if (dealRoomsError) throw dealRoomsError;
      if (mediaError) throw mediaError;

      const dealRoomByMatchId = new Map<string, string>(
        (dealRooms || []).map((room: any) => [room.match_id as string, room.id as string])
      );

      const mediaByListingId = new Map<string, IntentMatchMedia[]>();
      for (const media of mediaRows || []) {
        const listingId = media.listing_id as string;
        const current = mediaByListingId.get(listingId) || [];
        current.push({
          id: media.id as string,
          uri: getAssetUri(media.storage_path as string, media.media_type as 'image' | 'video'),
          type: media.media_type as 'image' | 'video',
          orderIndex: media.order_index as number,
        });
        mediaByListingId.set(listingId, current);
      }

      const normalizedMatches: IntentMatchListing[] = rawMatches
        .map((match: any) => {
          const listing = Array.isArray(match.listing) ? match.listing[0] : match.listing;
          if (!listing) return null;

          const reason =
            typeof match.explanation === 'string' && match.explanation.trim().length > 0
              ? match.explanation.trim()
              : createFallbackReason(listing, intent);

          return {
            id: match.id as string,
            listingId: listing.id as string,
            title: listing.title as string,
            price: listing.price as number,
            beds: listing.beds as number,
            baths: listing.baths as number,
            sqft: (listing.sqft as number | null) ?? null,
            propertyType: listing.property_type as string,
            address: (listing.address_public as string) || 'Address available after connection',
            score: normalizeScore(match.match_score),
            reason,
            createdAt: match.created_at as string,
            dealRoomId: dealRoomByMatchId.get(match.id as string) || null,
            media: mediaByListingId.get(listing.id as string) || [],
          };
        })
        .filter(Boolean) as IntentMatchListing[];

      const intentScopedMatches = normalizedMatches.filter((listing) => listingFitsIntent(listing, intent));

      intentScopedMatches.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return {
        intent,
        matches: intentScopedMatches,
      };
    },
    [user]
  );

  return { fetchIntentMatches };
}
