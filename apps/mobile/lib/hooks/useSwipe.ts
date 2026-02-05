import { supabase } from '../supabaseClient';

type SwipeParams = {
  target_type: 'listing' | 'buyer_intent';
  target_id: string;
  direction: 'yes' | 'no';
};

export function useSwipe() {
  const createSwipe = async (params: SwipeParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-swipe', {
        body: JSON.stringify(params),
      } as any);

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('createSwipe error:', err);
      throw err;
    }
  };

  return { createSwipe };
}

