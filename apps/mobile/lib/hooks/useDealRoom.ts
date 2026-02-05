import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { DealRoom } from '@shared/types';

export function useDealRoom() {
  const { user } = useAuth();

  const fetchDealRoom = async (dealRoomId: string): Promise<DealRoom> => {
    if (!user) throw new Error('Not authenticated');

    // Strategy 1: Try to fetch deal room directly (uses deal_rooms RLS policy)
    const { data: dealRoom, error: dealRoomError } = await supabase
      .from('deal_rooms')
      .select('*')
      .eq('id', dealRoomId)
      .single();

    if (!dealRoomError && dealRoom) {
      return dealRoom;
    }

    console.log('Deal room direct fetch failed, trying alternative methods...', dealRoomError);

    // Strategy 2: Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('deal_participants')
      .select('deal_room_id, profile_id')
      .eq('deal_room_id', dealRoomId)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (participantError) {
      console.error('Failed to check participant access:', participantError);
    }

    if (participant) {
      // User is a participant, try fetching deal room again
      // The RLS should allow this since we verified participant status
      const { data: retryDealRoom, error: retryError } = await supabase
        .from('deal_rooms')
        .select('*')
        .eq('id', dealRoomId)
        .single();

      if (!retryError && retryDealRoom) {
        return retryDealRoom;
      }
      console.error('Failed to fetch deal room even though user is participant:', retryError);
    }

    // Strategy 3: Check if user is buyer/seller in the match
    // Get the deal room's match_id first (this might work if RLS allows)
    const { data: dealRoomWithMatch, error: matchCheckError } = await supabase
      .from('deal_rooms')
      .select('match_id')
      .eq('id', dealRoomId)
      .maybeSingle();

    if (!matchCheckError && dealRoomWithMatch?.match_id) {
      // Check if user is in this match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('buyer_id, seller_id')
        .eq('id', dealRoomWithMatch.match_id)
        .single();

      if (!matchError && match) {
        if (match.buyer_id === user.id || match.seller_id === user.id) {
          // User is in the match, try fetching deal room one more time
          const { data: finalDealRoom, error: finalError } = await supabase
            .from('deal_rooms')
            .select('*')
            .eq('id', dealRoomId)
            .single();

          if (!finalError && finalDealRoom) {
            return finalDealRoom;
          }
        }
      }
    }

    // If all strategies fail, provide a helpful error message
    const errorMessage = dealRoomError?.code === 'PGRST116' 
      ? 'Access denied: Deal room not found or you do not have permission to access it'
      : `Access denied: ${dealRoomError?.message || 'Unknown error'}`;
    
    throw new Error(errorMessage);
  };

  return { fetchDealRoom };
}

