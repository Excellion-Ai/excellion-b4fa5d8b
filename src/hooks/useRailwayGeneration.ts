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
      // 1. Get current user (required for RLS)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ title: 'Sign in required', description: 'Please sign in to generate websites.', variant: 'destructive' });
        setIsGenerating(false);
        return null;
      }

      // 2. Save the order in Supabase
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
      console.log('[RailwayGen] Order created:', order.id);

      // 3. Set up Realtime listener for when Railway updates the order
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      
      channelRef.current = supabase
        .channel(`generated_sites_${order.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'generated_sites', filter: `id=eq.${order.id}` },
          (payload) => {
            const record = payload.new as GeneratedSite;
            setStatus(record.status);
            if (record.status === 'completed' && record.code) {
              setGeneratedCode(record.code);
              setIsGenerating(false);
              toast({ title: 'Website generated!', description: 'Your website code is ready.' });
            } else if (record.status === 'failed') {
              setIsGenerating(false);
              toast({ title: 'Generation failed', description: 'Something went wrong.', variant: 'destructive' });
            }
          }
        )
        .subscribe();

      // 4. Tell Railway to start cooking
      fetch(RAILWAY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, row_id: order.id }),
      });

      console.log('Kitchen is cooking!');
      toast({ title: 'Generating...', description: "We'll notify you when it's ready." });

      return order.id;
    } catch (error) {
      console.error('[RailwayGen] Error:', error);
      toast({ title: 'Error', description: 'Failed to start generation.', variant: 'destructive' });
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
