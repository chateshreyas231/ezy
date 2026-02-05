import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { ListingCard } from '@shared/types';
import { useIntent } from './useIntent';

export function useFeed() {
  const { user, profile } = useAuth();
  const { getCurrentIntent } = useIntent();

  const fetchFeed = async (): Promise<ListingCard[]> => {
    if (!user || !profile) throw new Error('Not authenticated');

    if (profile.role === 'buyer') {
      return fetchBuyerFeed();
    } else if (profile.role === 'seller') {
      return fetchSellerFeed();
    } else {
      throw new Error('Invalid role for feed');
    }
  };

  const fetchBuyerFeed = async (): Promise<ListingCard[]> => {
    const intent = await getCurrentIntent();
    if (!intent) {
      throw new Error('No buyer intent found. Please create an intent first.');
    }

    // Call matchmake edge function
    const { data, error } = await supabase.functions.invoke('matchmake', {
      body: { buyer_intent_id: intent.id },
    });

    if (error) throw error;
    return data || [];
  };

  const fetchSellerFeed = async (): Promise<ListingCard[]> => {
    // For sellers, show buyer intents (simplified for MVP)
    // In production, this would use a similar matching algorithm
    const { data, error } = await supabase
      .from('buyer_intents')
      .select('*, profiles!buyer_intents_buyer_id_fkey(*)')
      .eq('active', true)
      .limit(20);

    if (error) throw error;

    // Transform to card format (simplified)
    return (data || []).map((intent: any) => ({
      buyer_intent: intent,
      buyer_profile: intent.profiles,
    })) as any;
  };

  return { fetchFeed };
}

