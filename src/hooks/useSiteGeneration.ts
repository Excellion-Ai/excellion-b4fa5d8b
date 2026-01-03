import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const GENERATION_TIMEOUT_MS = 120000; // 2 minutes for two-step generation
const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds

interface GeneratedSite {
  id: string;
  user_id: string;
  prompt: string;
  status: string;
  code: string | null;
  created_at: string;
  updated_at: string;
}

export function useSiteGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [currentRowId, setCurrentRowId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  // Poll for status updates (fallback for realtime)
  const checkStatus = useCallback(async (rowId: string): Promise<GeneratedSite | null> => {
    console.log('[SiteGen] Polling status for:', rowId);
    const { data, error } = await supabase
      .from('generated_sites')
      .select('*')
      .eq('id', rowId)
      .maybeSingle();
    
    if (error) {
      console.error('[SiteGen] Status check error:', error);
      return null;
    }
    
    if (!data) {
      console.warn('[SiteGen] No data found for row:', rowId);
      return null;
    }
    
    console.log('[SiteGen] Poll result - Status:', data.status, 'Code length:', data.code?.length || 0);
    
    if (data.status === 'completed' && data.code) {
      // Stop polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setGeneratedCode(data.code);
      setStatus('completed');
      setIsGenerating(false);
      toast({ title: 'Website generated!', description: 'Your website code is ready.' });
    } else if (data.status === 'failed') {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      
      setStatus('failed');
      setIsGenerating(false);
      toast({ title: 'Generation failed', description: 'Something went wrong.', variant: 'destructive' });
    } else if (data.status === 'processing') {
      setStatus('processing');
    }
    
    return data;
  }, [toast]);

  // Start polling
  const startPolling = useCallback((rowId: string) => {
    console.log('[SiteGen] Starting polling every', POLLING_INTERVAL_MS / 1000, 'seconds');
    
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    pollingRef.current = setInterval(() => {
      checkStatus(rowId);
    }, POLLING_INTERVAL_MS);
  }, [checkStatus]);

  const generateSite = useCallback(async (prompt: string): Promise<string | null> => {
    setIsGenerating(true);
    setGeneratedCode(null);
    setStatus('pending');
    setHasTimedOut(false);

    // Clear any existing timeout and polling
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ title: 'Sign in required', description: 'Please sign in to generate websites.', variant: 'destructive' });
        setIsGenerating(false);
        return null;
      }

      // Create the order in Supabase
      console.log('[SiteGen] Creating order...');
      const { data: order, error } = await supabase
        .from('generated_sites')
        .insert([{ user_id: user.id, prompt, status: 'pending' }])
        .select()
        .single();

      if (error || !order) {
        console.error('[SiteGen] Insert error:', error);
        toast({ title: 'Error', description: 'Failed to start generation.', variant: 'destructive' });
        setIsGenerating(false);
        return null;
      }

      setCurrentRowId(order.id);
      console.log('[SiteGen] Order created:', order.id);

      // Set up Realtime listener
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      
      channelRef.current = supabase
        .channel(`generated_sites_${order.id}`)
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'generated_sites', filter: `id=eq.${order.id}` },
          (payload) => {
            console.log('[SiteGen] Realtime update:', payload);
            const record = payload.new as GeneratedSite;
            setStatus(record.status);
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            
            if (record.status === 'completed' && record.code) {
              console.log('[SiteGen] Completed via Realtime');
              setGeneratedCode(record.code);
              setIsGenerating(false);
              toast({ title: 'Website generated!', description: 'Your website code is ready.' });
            } else if (record.status === 'failed') {
              console.error('[SiteGen] Failed via Realtime');
              setIsGenerating(false);
              toast({ title: 'Generation failed', description: 'Something went wrong.', variant: 'destructive' });
            }
          }
        )
        .subscribe();

      // Call the Edge Function (fire and forget - it updates the DB)
      console.log('[SiteGen] Invoking generate-site edge function...');
      
      supabase.functions.invoke('generate-site', {
        body: { prompt, row_id: order.id }
      }).then(({ data, error: fnError }) => {
        if (fnError) {
          console.error('[SiteGen] Edge function error:', fnError);
          // Don't set failed here - let the polling/realtime handle it
        } else {
          console.log('[SiteGen] Edge function response:', data);
        }
      }).catch((err) => {
        console.error('[SiteGen] Edge function call failed:', err);
      });

      // Start polling as fallback
      startPolling(order.id);

      // Set up timeout
      timeoutRef.current = setTimeout(() => {
        console.warn('[SiteGen] Generation timed out');
        setHasTimedOut(true);
        setIsGenerating(false);
        
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        
        toast({ 
          title: 'Generation taking longer than expected', 
          description: 'You can check status manually or try again.',
          variant: 'destructive'
        });
      }, GENERATION_TIMEOUT_MS);

      toast({ title: 'Generating...', description: 'The AI is designing your website.' });

      return order.id;
    } catch (error) {
      console.error('[SiteGen] Error:', error);
      toast({ title: 'Error', description: 'Failed to start generation.', variant: 'destructive' });
      setIsGenerating(false);
      return null;
    }
  }, [toast, startPolling]);

  const retry = useCallback(async (prompt: string) => {
    console.log('[SiteGen] Retrying...');
    reset();
    return generateSite(prompt);
  }, [generateSite]);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setGeneratedCode(null);
    setCurrentRowId(null);
    setStatus(null);
    setHasTimedOut(false);
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  return {
    generateSite,
    isGenerating,
    generatedCode,
    currentRowId,
    status,
    hasTimedOut,
    checkStatus,
    retry,
    reset,
  };
}
