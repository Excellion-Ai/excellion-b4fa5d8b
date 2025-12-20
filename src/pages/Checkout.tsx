import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Shield, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

// Stripe publishable key
const stripePromise = loadStripe("pk_live_51Sfw2PPCTHzXvqDgF5hSFN8VJyO5SJWbpMJHPNKCiIEvXIcQy5fOFLdN4EsOqJEP6vpSqqEwKH6nJYnlbxmM99BV00Hl1d5vfU");

const PLAN_DETAILS: Record<string, { name: string; price: string; credits: number; features: string[] }> = {
  starter: {
    name: "Starter",
    price: "$15",
    credits: 50,
    features: [
      "1 published site",
      "Custom domain",
      "No watermark",
      "Basic SEO",
    ],
  },
  pro: {
    name: "Pro",
    price: "$29",
    credits: 100,
    features: [
      "Unlimited drafts + 1 published site",
      "Integrations: Stripe, Calendly, Mailchimp",
      "Advanced components",
      "Code export (Annual)",
    ],
  },
  agency: {
    name: "Agency",
    price: "$129",
    credits: 500,
    features: [
      "10 published sites",
      "White-label dashboard",
      "Team seats + roles",
      "Priority build queue",
    ],
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const plan = searchParams.get("plan") || "pro";
  const planDetails = PLAN_DETAILS[plan] || PLAN_DETAILS.pro;

  const fetchClientSecret = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to continue");
        navigate("/auth?redirect=/checkout?plan=" + plan);
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-embedded-checkout", {
        body: { planType: plan },
      });

      if (error) throw error;
      
      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error("No client secret received");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to initialize checkout");
      toast.error("Failed to initialize checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [plan, navigate]);

  useEffect(() => {
    fetchClientSecret();
  }, [fetchClientSecret]);

  const options = clientSecret ? { 
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorBackground: '#0a0a0a',
        colorPrimary: '#a855f7',
      }
    }
  } : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Checkout | Excellion AI</title>
        <meta name="description" content="Complete your subscription" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/pricing")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Complete your {planDetails.name} subscription</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{planDetails.name} Plan</span>
                  <span className="text-2xl font-bold text-foreground">{planDetails.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-accent">
                  <Sparkles className="w-4 h-4" />
                  {planDetails.credits} credits/month
                </div>
              </div>

              <ul className="space-y-3">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Secure Checkout</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your payment is processed securely by Stripe. We never store your card details.
              </p>
            </div>
          </div>

          {/* Stripe Embedded Checkout */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Initializing checkout...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4 p-6 text-center">
                  <p className="text-destructive">{error}</p>
                  <Button onClick={() => { setLoading(true); setError(null); fetchClientSecret(); }}>
                    Try Again
                  </Button>
                </div>
              ) : clientSecret && options ? (
                <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
