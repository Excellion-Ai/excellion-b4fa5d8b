import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RAILWAY_API_URL = 'https://ai-brain-production.up.railway.app/generate';

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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { toast } = useToast();

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const generateSite = useCallback(async (prompt: string): Promise<string | null> => {
    setIsGenerating(true);
    setGeneratedCode(null);
    setStatus('pending');

    try {
      // Step 1: Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to generate websites.',
          variant: 'destructive',
        });
        setIsGenerating(false);
        return null;
      }

      // Step 2: Insert new row into generated_sites with status 'pending'
      const { data: insertedRow, error: insertError } = await supabase
        .from('generated_sites')
        .insert({
          user_id: user.id,
          prompt: prompt,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError || !insertedRow) {
        console.error('[RailwayGen] Insert error:', insertError);
        toast({
          title: 'Error',
          description: 'Failed to start generation. Please try again.',
          variant: 'destructive',
        });
        setIsGenerating(false);
        return null;
      }

      const rowId = insertedRow.id;
      setCurrentRowId(rowId);
      console.log('[RailwayGen] Created row:', rowId);

      // Step 3: Set up Realtime subscription BEFORE sending to Railway
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`generated_sites_${rowId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'generated_sites',
            filter: `id=eq.${rowId}`,
          },
          (payload) => {
            console.log('[RailwayGen] Realtime update:', payload);
            const newRecord = payload.new as GeneratedSite;
            setStatus(newRecord.status);

            if (newRecord.status === 'completed' && newRecord.code) {
              console.log('[RailwayGen] Generation completed!');
              setGeneratedCode(newRecord.code);
              setIsGenerating(false);
              toast({
                title: 'Website generated!',
                description: 'Your website code is ready.',
              });
            } else if (newRecord.status === 'failed') {
              console.error('[RailwayGen] Generation failed');
              setIsGenerating(false);
              toast({
                title: 'Generation failed',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('[RailwayGen] Subscription status:', status);
        });

      channelRef.current = channel;

      // Step 4: Send POST request to Railway API (fire and forget)
      fetch(RAILWAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          row_id: rowId,
        }),
      }).then((response) => {
        console.log('[RailwayGen] Railway API response status:', response.status);
      }).catch((error) => {
        console.error('[RailwayGen] Railway API error:', error);
        // Don't set error state here - the realtime subscription will handle status updates
      });

      toast({
        title: 'Generating website...',
        description: 'This may take a moment. We\'ll notify you when it\'s ready.',
      });

      return rowId;
    } catch (error) {
      console.error('[RailwayGen] Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start generation. Please try again.',
        variant: 'destructive',
      });
      setIsGenerating(false);
      return null;
    }
  }, [toast]);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setGeneratedCode(null);
    setCurrentRowId(null);
    setStatus(null);
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return {
    generateSite,
    isGenerating,
    generatedCode,
    currentRowId,
    status,
    reset,
  };
}
