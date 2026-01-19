import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Price IDs for the single plan
const PRICE_IDS = {
  monthly: "price_coach_monthly",  // $79/mo - TODO: Replace with actual Stripe Price ID
  annual: "price_coach_annual",    // $790/yr - TODO: Replace with actual Stripe Price ID
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const features = [
    "Up to 3 active offers at once",
    "Unlimited page views",
    "Custom domain support",
    "Intake forms & check-ins",
    "Client access portal",
    "Built-in analytics",
    "SSL included",
    "Cancel anytime",
  ];

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Sign in required",
          description: "Please sign in to subscribe",
          variant: "destructive",
        });
        navigate("/auth?redirect=/checkout?plan=coach" + (billingPeriod === "yearly" ? "&annual=true" : ""));
        return;
      }

      const priceId = billingPeriod === "yearly" ? PRICE_IDS.annual : PRICE_IDS.monthly;
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              Pricing
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground">
              One plan. Works for any fitness coach.
            </p>
          </div>

          {/* Single Plan Card */}
          <Card className="relative bg-card border-2 border-primary">
            <CardHeader className="text-center p-6 sm:p-8 pb-4">
              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-1 p-1 bg-secondary rounded-lg mx-auto mb-6">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all touch-manipulation ${
                    billingPeriod === "monthly"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 touch-manipulation ${
                    billingPeriod === "yearly"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span className="text-[10px] sm:text-xs bg-green-500/20 text-green-400 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                    Save $158
                  </span>
                </button>
              </div>

              <div className="mb-2">
                <span className="text-4xl sm:text-5xl font-bold text-foreground">
                  {billingPeriod === "yearly" ? "$790" : "$79"}
                </span>
                <span className="text-lg text-muted-foreground ml-2">
                  {billingPeriod === "yearly" ? "/year" : "/month"}
                </span>
              </div>
              
              {billingPeriod === "yearly" && (
                <p className="text-sm text-muted-foreground">
                  That's ~$66/month billed annually
                </p>
              )}
              
              <p className="text-muted-foreground mt-4">
                Everything included. Cancel anytime.
              </p>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0">
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="p-6 sm:p-8 pt-0">
              <Button 
                className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Trust line */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            No hidden fees. No credit limits. Just build your coaching offer.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
