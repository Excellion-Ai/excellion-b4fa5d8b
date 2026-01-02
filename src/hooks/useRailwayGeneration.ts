import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RAILWAY_API_URL = 'https://ai-brain-production-0e19.up.railway.app/generate';
const GENERATION_TIMEOUT_MS = 90000; // 90 seconds

interface GeneratedSite {
  id: string;
  user_id: string;
  prompt: string;
  status: string;
  code: string | null;
  created_at: string;
  updated_at: string;
}

export function useRailwayGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [currentRowId, setCurrentRowId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Cleanup subscription and timeout on unmount
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
    };
  }, []);

  // Manual status check for debugging
  const checkStatus = useCallback(async (rowId: string) => {
    console.log('[RailwayGen] Manually checking status for:', rowId);
    const { data, error } = await supabase
      .from('generated_sites')
      .select('*')
      .eq('id', rowId)
      .single();
    
    if (error) {
      console.error('[RailwayGen] Status check error:', error);
      return null;
    }
    
    console.log('[RailwayGen] Current status:', data?.status, 'Code length:', data?.code?.length || 0);
    
    if (data?.status === 'completed' && data?.code) {
      setGeneratedCode(data.code);
      setStatus('completed');
      setIsGenerating(false);
      toast({ title: 'Website generated!', description: 'Your website code is ready.' });
    }
    
    return data;
  }, [toast]);

  const generateSite = useCallback(async (prompt: string): Promise<string | null> => {
    setIsGenerating(true);
    setGeneratedCode(null);
    setStatus('pending');
    setHasTimedOut(false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      // 1. Get current user (required for RLS)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ title: 'Sign in required', description: 'Please sign in to generate websites.', variant: 'destructive' });
        setIsGenerating(false);
        return null;
      }

      // 2. Save the order in Supabase
      console.log('[RailwayGen] Creating order with prompt:', prompt.substring(0, 100) + '...');
      const { data: order, error } = await supabase
        .from('generated_sites')
        .insert([{ user_id: user.id, prompt, status: 'pending' }])
        .select()
        .single();

      if (error || !order) {
        console.error('[RailwayGen] Insert error:', error);
        toast({ title: 'Error', description: 'Failed to start generation.', variant: 'destructive' });
        setIsGenerating(false);
        return null;
      }

      setCurrentRowId(order.id);
      console.log('[RailwayGen] Order created:', order.id, 'at', new Date().toISOString());

      // 3. Set up Realtime listener for when Railway updates the order
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      
      channelRef.current = supabase
        .channel(`generated_sites_${order.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'generated_sites', filter: `id=eq.${order.id}` },
          (payload) => {
            console.log('[RailwayGen] Realtime update received:', payload);
            const record = payload.new as GeneratedSite;
            setStatus(record.status);
            
            // Clear timeout on any status update
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            
            if (record.status === 'completed' && record.code) {
              console.log('[RailwayGen] Generation completed, code length:', record.code.length);
              setGeneratedCode(record.code);
              setIsGenerating(false);
              toast({ title: 'Website generated!', description: 'Your website code is ready.' });
            } else if (record.status === 'failed') {
              console.error('[RailwayGen] Generation failed');
              setIsGenerating(false);
              toast({ title: 'Generation failed', description: 'Something went wrong.', variant: 'destructive' });
            }
          }
        )
        .subscribe((status) => {
          console.log('[RailwayGen] Realtime subscription status:', status);
        });

      // 4. Tell Railway to start cooking
      console.log('[RailwayGen] Sending request to Railway:', RAILWAY_API_URL);
      const railwayPayload = { prompt, row_id: order.id };
      console.log('[RailwayGen] Payload:', JSON.stringify(railwayPayload));
      
      try {
        const response = await fetch(RAILWAY_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(railwayPayload),
        });
        console.log('[RailwayGen] Railway response status:', response.status);
        const responseText = await response.text();
        console.log('[RailwayGen] Railway response body:', responseText.substring(0, 200));
      } catch (fetchError) {
        console.error('[RailwayGen] Railway fetch error:', fetchError);
      }

      // 5. Set up timeout
      timeoutRef.current = setTimeout(() => {
        console.warn('[RailwayGen] Generation timed out after', GENERATION_TIMEOUT_MS / 1000, 'seconds');
        setHasTimedOut(true);
        setIsGenerating(false);
        toast({ 
          title: 'Generation taking longer than expected', 
          description: 'You can check status manually or try again.',
          variant: 'destructive'
        });
      }, GENERATION_TIMEOUT_MS);

      console.log('[RailwayGen] Kitchen is cooking! Timeout set for', GENERATION_TIMEOUT_MS / 1000, 'seconds');
      toast({ title: 'Generating...', description: "We'll notify you when it's ready." });

      return order.id;
    } catch (error) {
      console.error('[RailwayGen] Error:', error);
      toast({ title: 'Error', description: 'Failed to start generation.', variant: 'destructive' });
      setIsGenerating(false);
      return null;
    }
  }, [toast]);

  const retry = useCallback(async (prompt: string) => {
    console.log('[RailwayGen] Retrying generation...');
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
