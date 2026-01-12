import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Price IDs for annual plans
const ANNUAL_PRICE_IDS = {
  starter: "price_1SgKPjPCTHzXvqDgQP63Wygw", // $156/year
  pro: "price_1SgKQHPCTHzXvqDgNxuBVF8D",     // $288/year  
  agency: "price_1SgKQdPCTHzXvqDgCsz1sXw5",  // $1,296/year
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const plans = [
    {
      name: "Free",
      id: "free",
      credits: "10 credits",
      monthlyPrice: "Free",
      yearlyPrice: "Free",
      description: "For getting started",
      features: [
        "10 credits",
        "Public projects",
        "Basic templates",
        "Community support",
        "SSL included"
      ],
      annualPriceId: null,
      annualSavings: null,
    },
    {
      name: "Starter",
      id: "starter",
      credits: "50 credits",
      monthlyPrice: 15,
      yearlyPrice: 156,
      description: "For small businesses building their own site",
      features: [
        "50 credits per month",
        "Private projects",
        "Premium templates",
        "Email support",
        "Custom domain"
      ],
      annualPriceId: ANNUAL_PRICE_IDS.starter,
      annualSavings: 24,
    },
    {
      name: "Pro",
      id: "pro",
      credits: "100 credits",
      monthlyPrice: 29,
      yearlyPrice: 288,
      description: "For teams and growing businesses",
      features: [
        "100 credits per month",
        "Everything in Starter",
        "Priority support",
        "Advanced analytics",
        "Team collaboration"
      ],
      annualPriceId: ANNUAL_PRICE_IDS.pro,
      annualSavings: 60,
      popular: true,
    },
    {
      name: "Agency",
      id: "agency",
      credits: "500 credits",
      monthlyPrice: 129,
      yearlyPrice: 1296,
      description: "For agencies and power users",
      features: [
        "500 credits per month",
        "Everything in Pro",
        "White-label option",
        "Dedicated support",
        "Custom integrations"
      ],
      annualPriceId: ANNUAL_PRICE_IDS.agency,
      annualSavings: 252,
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === "Free") return "Free";
    if (billingPeriod === "yearly" && typeof plan.yearlyPrice === "number") {
      const monthlyEquivalent = Math.floor(plan.yearlyPrice / 12);
      return `$${monthlyEquivalent}`;
    }
    return `$${plan.monthlyPrice}`;
  };

  const getPeriodText = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === "Free") return "";
    return "/ month";
  };

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (!plan.annualPriceId || billingPeriod !== "yearly") {
      toast({
        title: "Coming Soon",
        description: "Monthly billing is coming soon. Please select yearly billing.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPlan(plan.id);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.annualPriceId },
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
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-3 sm:mb-4">
              DIY
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
              Start for free. Upgrade as you go.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-1 sm:gap-3 p-1 bg-secondary rounded-lg">
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
                  Save up to 16%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative flex flex-col bg-background/10 backdrop-blur-md border-white/20 ${
                  plan.popular ? "ring-2 ring-accent" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-foreground/80">{plan.credits}</CardDescription>
                  <div className="mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div>
                        <span className="text-3xl sm:text-4xl font-bold text-accent">{getPrice(plan)}</span>
                        <span className="text-sm text-foreground/70 ml-1 sm:ml-2">{getPeriodText(plan)}</span>
                      </div>
                      {billingPeriod === "yearly" && plan.annualSavings && (
                        <span className="text-[10px] sm:text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                          SAVE ${plan.annualSavings}
                        </span>
                      )}
                    </div>
                    {plan.monthlyPrice !== "Free" && typeof plan.yearlyPrice === "number" && billingPeriod === "yearly" && (
                      <p className="text-xs sm:text-sm text-foreground/50 mt-1">
                        ${plan.yearlyPrice}/year billed annually
                      </p>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/70 mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-grow p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="space-y-2.5 sm:space-y-3">
                    <p className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">What you get:</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
                  {plan.monthlyPrice === "Free" ? (
                    <Button 
                      className="w-full h-11 sm:h-10 touch-manipulation"
                      variant="outline"
                    >
                      Get Started
                    </Button>
                  ) : billingPeriod === "yearly" ? (
                    <Button 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 sm:h-10 touch-manipulation"
                      onClick={() => handleCheckout(plan)}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? "Loading..." : "Subscribe Now"}
                    </Button>
                  ) : (
                    <Button 
                      disabled 
                      className="w-full bg-accent/50 text-accent-foreground cursor-not-allowed hover:bg-accent/50 h-11 sm:h-10"
                    >
                      Coming Soon
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
