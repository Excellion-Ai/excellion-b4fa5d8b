import { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle, ArrowRight, Building2, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type OnboardingStep = 'connect' | 'details' | 'complete';

export function StripeConnectBanner() {
  const [profile, setProfile] = useState<{ stripe_account_id: string | null; stripe_onboarding_complete: boolean } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

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
            toast.success('Stripe account connected! You can now accept payments.');
          }
        }
      }
      checkStatus();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (isLoading || !profile || dismissed) return null;

  // Determine current step
  const currentStep: OnboardingStep = profile.stripe_onboarding_complete
    ? 'complete'
    : profile.stripe_account_id
      ? 'details'
      : 'connect';

  // Hide after completion with a brief celebratory state
  if (currentStep === 'complete') {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Payouts Active</p>
              <p className="text-xs text-muted-foreground">Your Stripe account is connected. You'll receive payouts automatically.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="text-muted-foreground text-xs">
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  const steps: { id: OnboardingStep; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'connect', label: 'Create account', icon: CreditCard, description: 'Start Stripe onboarding' },
    { id: 'details', label: 'Add bank details', icon: Building2, description: 'Enter payout info' },
    { id: 'complete', label: 'Verified', icon: ShieldCheck, description: 'Ready to earn' },
  ];

  const stepIndex = steps.findIndex(s => s.id === currentStep);

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
    <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border border-primary/30 rounded-xl p-5 mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {currentStep === 'connect' ? 'Connect Stripe to Get Paid' : 'Finish Stripe Setup'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {currentStep === 'connect'
                ? 'Link your bank account so you can receive earnings from course sales.'
                : 'Complete your account details to start accepting payments.'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isDone = i < stepIndex;
          const isCurrent = i === stepIndex;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? 'bg-green-500/20 text-green-500'
                    : isCurrent
                      ? 'bg-primary/20 text-primary ring-2 ring-primary/40'
                      : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className={`text-xs font-medium truncate ${isCurrent ? 'text-foreground' : isDone ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${isDone ? 'bg-green-500/40' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Opening Stripe...
          </>
        ) : currentStep === 'connect' ? (
          <>
            Connect Stripe
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>
            Continue Setup
            <ExternalLink className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
