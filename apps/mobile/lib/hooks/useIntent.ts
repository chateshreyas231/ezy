import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { BuyerIntent } from '@shared/types';

export function useIntent() {
  const { user } = useAuth();

  const createIntent = async (intentData: Omit<BuyerIntent, 'id' | 'buyer_id' | 'active' | 'created_at'>) => {
    if (!user) throw new Error('Not authenticated');

    // Ensure profile exists before creating intent (foreign key constraint)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found. Please complete your profile setup first.');
    }

    const { data, error } = await supabase
      .from('buyer_intents')
      .insert({
        ...intentData,
        buyer_id: user.id,
        active: true,
      })
      .select()
      .single();

    if (error) {
      // Provide more helpful error message for foreign key constraint
      if (error.code === '23503' || error.message.includes('foreign key constraint')) {
        throw new Error('Profile not found. Please refresh and try again, or contact support if the issue persists.');
      }
      throw error;
    }
    return data;
  };

  const getCurrentIntent = async () => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('buyer_intents')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };

  const updateIntent = async (intentId: string, updates: Partial<Omit<BuyerIntent, 'id' | 'buyer_id' | 'created_at'>>) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('buyer_intents')
      .update(updates)
      .eq('id', intentId)
      .eq('buyer_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { createIntent, getCurrentIntent, updateIntent };
}

