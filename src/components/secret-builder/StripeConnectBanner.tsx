import { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function StripeConnectBanner() {
  const [profile, setProfile] = useState<{ stripe_account_id: string | null; stripe_onboarding_complete: boolean } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('stripe_account_id, stripe_onboarding_complete')
          .eq('id', user.id)
          .single();
        setProfile(data as any);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  // Handle return from Stripe onboarding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe') === 'success') {
      // Re-check onboarding status
      async function checkStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('stripe_account_id, stripe_onboarding_complete')
            .eq('id', user.id)
            .single();
          setProfile(data as any);
          if ((data as any)?.stripe_onboarding_complete) {
            toast.success('Stripe account connected successfully!');
          }
        }
      }
      checkStatus();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (isLoading || !profile || profile.stripe_onboarding_complete) return null;

  async function handleConnect() {
    setIsConnecting(true);

    const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
      body: {
        return_url: window.location.origin + '/secret-builder-hub?stripe=success',
        refresh_url: window.location.origin + '/secret-builder-hub?stripe=refresh',
      },
    });

    if (error) {
      toast.error('Failed to connect Stripe');
      setIsConnecting(false);
      return;
    }

    if (data?.already_complete) {
      setProfile(prev => prev ? { ...prev, stripe_onboarding_complete: true } : prev);
      toast.success('Stripe account is already connected!');
      setIsConnecting(false);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    } else {
      toast.error('Failed to start Stripe onboarding');
      setIsConnecting(false);
    }
  }

  return (
    <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/40 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Connect Stripe to Get Paid
            </h3>
            <p className="text-muted-foreground text-sm">
              Set up your payout account to start earning from course sales.
            </p>
          </div>
        </div>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Stripe'
          )}
        </Button>
      </div>
    </div>
  );
}
