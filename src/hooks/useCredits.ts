import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CreditActionType = 'chat' | 'generation' | 'edit' | 'image' | 'export' | 'publish';

export const CREDIT_COSTS: Record<CreditActionType, number> = {
  chat: 1,
  generation: 5,
  edit: 3,
  image: 2,
  export: 2,
  publish: 0,
};

export interface CreditState {
  authenticated: boolean;
  balance: number;
  plan: string;
  canUseAI: boolean;
  totalEarned: number;
  totalSpent: number;
  loading: boolean;
  error: string | null;
}

export function useCredits() {
  const [state, setState] = useState<CreditState>({
    authenticated: false,
    balance: 0,
    plan: 'free',
    canUseAI: false,
    totalEarned: 0,
    totalSpent: 0,
    loading: true,
    error: null,
  });

  const fetchCredits = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.functions.invoke('check-credits');
      
      if (error) {
        console.error('Error fetching credits:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return;
      }

      setState({
        authenticated: data.authenticated ?? false,
        balance: data.balance ?? 0,
        plan: data.plan ?? 'free',
        canUseAI: data.canUseAI ?? false,
        totalEarned: data.total_earned ?? 0,
        totalSpent: data.total_spent ?? 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error in fetchCredits:', err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }));
    }
  }, []);

  // Check credits on mount and auth state change
  useEffect(() => {
    fetchCredits();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCredits();
    });

    return () => subscription.unsubscribe();
  }, [fetchCredits]);

  // Refresh credits periodically (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, [fetchCredits]);

  const checkCredits = useCallback((action: CreditActionType): boolean => {
    const cost = CREDIT_COSTS[action];
    return state.balance >= cost;
  }, [state.balance]);

  const getCost = useCallback((action: CreditActionType): number => {
    return CREDIT_COSTS[action];
  }, []);

  // Optimistic update for local state after deduction
  const deductLocal = useCallback((action: CreditActionType) => {
    const cost = CREDIT_COSTS[action];
    setState(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance - cost),
      totalSpent: prev.totalSpent + cost,
      canUseAI: prev.balance - cost > 0,
    }));
  }, []);

  return {
    ...state,
    fetchCredits,
    checkCredits,
    getCost,
    deductLocal,
  };
}
