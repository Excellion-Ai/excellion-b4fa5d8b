import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

// Global cache to prevent duplicate fetches across hook instances
let globalCreditCache: CreditState | null = null;
let globalFetchPromise: Promise<void> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

// Low credit warning threshold
const LOW_CREDIT_THRESHOLD = 15;
let hasShownLowCreditWarning = false;

export function useCredits() {
  const [state, setState] = useState<CreditState>(() => globalCreditCache || {
    authenticated: false,
    balance: 0,
    plan: 'free',
    canUseAI: false,
    totalEarned: 0,
    totalSpent: 0,
    loading: true,
    error: null,
  });
  
  const mountedRef = useRef(true);

  const fetchCredits = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Return cached data if fresh enough (unless forced)
    if (!force && globalCreditCache && now - lastFetchTime < CACHE_DURATION) {
      if (mountedRef.current) {
        setState(globalCreditCache);
      }
      return;
    }
    
    // If already fetching, wait for that promise
    if (globalFetchPromise) {
      await globalFetchPromise;
      if (globalCreditCache && mountedRef.current) {
        setState(globalCreditCache);
      }
      return;
    }

    globalFetchPromise = (async () => {
      try {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, loading: true, error: null }));
        }
        
        const { data, error } = await supabase.functions.invoke('check-credits');
        
        if (error) {
          console.error('Error fetching credits:', error);
          if (mountedRef.current) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
          }
          return;
        }

        const newState: CreditState = {
          authenticated: data.authenticated ?? false,
          balance: data.balance ?? 0,
          plan: data.plan ?? 'free',
          canUseAI: data.canUseAI ?? false,
          totalEarned: data.total_earned ?? 0,
          totalSpent: data.total_spent ?? 0,
          loading: false,
          error: null,
        };
        
        globalCreditCache = newState;
        lastFetchTime = Date.now();
        
        // Show low credit warning once per session
        if (
          newState.authenticated &&
          newState.balance <= LOW_CREDIT_THRESHOLD &&
          newState.balance > 0 &&
          !hasShownLowCreditWarning
        ) {
          hasShownLowCreditWarning = true;
          toast.warning(
            `You're running low on credits (${newState.balance} remaining). Consider upgrading your plan to continue using AI features.`,
            {
              duration: 8000,
              action: {
                label: 'Upgrade',
                onClick: () => window.location.href = '/pricing',
              },
            }
          );
        }
        
        // Reset warning flag if balance goes above threshold (user purchased more)
        if (newState.balance > LOW_CREDIT_THRESHOLD) {
          hasShownLowCreditWarning = false;
        }
        
        if (mountedRef.current) {
          setState(newState);
        }
      } catch (err) {
        console.error('Error in fetchCredits:', err);
        if (mountedRef.current) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          }));
        }
      } finally {
        globalFetchPromise = null;
      }
    })();
    
    await globalFetchPromise;
  }, []);

  // Check credits on mount and auth state change
  useEffect(() => {
    mountedRef.current = true;
    fetchCredits();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCredits(true); // Force refresh on auth change
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchCredits]);

  // Refresh credits periodically (every 2 minutes instead of 1 minute)
  useEffect(() => {
    const interval = setInterval(() => fetchCredits(), 120000);
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
    const newState = {
      ...state,
      balance: Math.max(0, state.balance - cost),
      totalSpent: state.totalSpent + cost,
      canUseAI: state.balance - cost > 0,
    };
    globalCreditCache = newState;
    setState(newState);
  }, [state]);

  return {
    ...state,
    fetchCredits,
    checkCredits,
    getCost,
    deductLocal,
  };
}
