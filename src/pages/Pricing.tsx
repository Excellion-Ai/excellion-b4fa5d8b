import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Excellion Coach Plan — the only plan
const PRICE_IDS = {
  monthly: "price_1T1YnuPCTHzXvqDgZwElpsRS",  // $79/mo (coupon makes first month $19)
  annual: "price_1T1YjxPCTHzXvqDg3Plq3gtT",    // $790/yr
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const features = [
    "Up to 3 active courses",
    "Unlimited page views",
    "Custom domain",
    "Intake & check-ins",
    "Student portal",
    "Built-in analytics",
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
        navigate("/auth?redirect=/pricing");
        return;
      }

      const priceId = billingPeriod === "annual" ? PRICE_IDS.annual : PRICE_IDS.monthly;
      const planType = billingPeriod === "annual" ? "coach_annual" : "coach_monthly";

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, planType },
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
              One plan for fitness course creators.
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
                  onClick={() => setBillingPeriod("annual")}
                  className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 touch-manipulation ${
                    billingPeriod === "annual"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span className="text-[10px] sm:text-xs bg-primary/20 text-primary px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                    Save $158
                  </span>
                </button>
              </div>

              {/* Price display */}
              <div className="mb-2">
                {billingPeriod === "monthly" ? (
                  <>
                    <span className="text-4xl sm:text-5xl font-bold text-foreground">$19</span>
                    <span className="text-lg text-muted-foreground ml-2">first month</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl sm:text-5xl font-bold text-foreground">$790</span>
                    <span className="text-lg text-muted-foreground ml-2">/year</span>
                  </>
                )}
              </div>

              {billingPeriod === "monthly" ? (
                <p className="text-sm text-muted-foreground">
                  then $79/month · or{" "}
                  <button
                    onClick={() => setBillingPeriod("annual")}
                    className="underline hover:text-foreground transition-colors"
                  >
                    $790/year
                  </button>{" "}
                  <span className="text-primary">(save $158)</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  That's ~$66/month billed annually
                </p>
              )}

              <p className="text-muted-foreground mt-4">
                Everything included. Cancel anytime.
              </p>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
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
                ) : billingPeriod === "monthly" ? (
                  "Start for $19"
                ) : (
                  "Start for $790/year"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Trust line */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            No hidden fees. Just build and sell your course.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
