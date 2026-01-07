import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Sparkles, ArrowRight, Zap, Loader2, Info } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Stripe Price IDs - Monthly
const PRICE_IDS = {
  starter: "price_1SmmvRPCTHzXvqDgcuiCxcqD",       // $19/mo
  pro: "price_1SmmvnPCTHzXvqDgbSE6wxMV",           // $39/mo
  agency: "price_1Smmy1PCTHzXvqDg1t7EjziF",        // $99/mo
  sprint: "price_1SgsMOPCTHzXvqDg7Q23a28h",
};

// Stripe Price IDs - Annual
const ANNUAL_PRICE_IDS = {
  starter: "price_1SmmyuPCTHzXvqDgr8k0y8s6",       // $192/yr ($16/mo)
  pro: "price_1Smn0VPCTHzXvqDgXLwyNKJ3",           // $396/yr ($33/mo)
  agency: "price_1Smn33PCTHzXvqDgxuGNuQkT",        // $996/yr ($83/mo)
};

const aiBuilderPlans = [
  {
    name: "Free",
    description: "Try it before you pay.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 20,
    features: [
      "1 draft course site (not published)",
      "Generate a course landing page + lesson sections",
      "Edit content and structure in Studio",
    ],
    note: "Publishing requires Starter or higher.",
    cta: "Get Started",
    highlighted: false,
    subtext: "Free forever",
  },
  {
    name: "Starter",
    description: "Launch your course.",
    monthlyPrice: 19,
    yearlyPrice: 192,  // $16/mo annual
    credits: 200,
    features: [
      "Publish your course site + connect your domain",
      "Enough build credits for a full first draft + edits",
      "Basic SEO + simple analytics",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "Grow and iterate faster.",
    monthlyPrice: 39,
    yearlyPrice: 396,  // $33/mo annual
    credits: 500,
    badge: "Best Seller",
    features: [
      "More build credits for frequent edits",
      "Multiple pages and offers (upsells, waitlist, lead magnet)",
      "More advanced sections and layouts",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Agency",
    description: "For teams and high volume.",
    monthlyPrice: 99,
    yearlyPrice: 996,  // $83/mo annual
    credits: 3000,
    features: [
      "Highest build credits for heavy use",
      "Multiple team seats",
      "White-label options + export tools",
    ],
    cta: "Get Started",
    highlighted: false,
  },
];

// DFY plans archived to database table: archived_pricing_tiers

const faqItems = [
  {
    question: "What's a published site?",
    answer: "A published site is a live website connected to your own custom domain (like yourbusiness.com). Draft sites are only accessible in the Studio and cannot be shared publicly.",
  },
  {
    question: "Do credits roll over?",
    answer: "Yes! Credits roll over forever with no expiry or cap. Free credits are always spendable on Free (draft-only). Paid credits are spendable while you have an active paid plan—if you cancel, they're preserved and unlock when you resubscribe.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. You can cancel your subscription at any time. Your site will remain live until the end of your billing period, and your paid credits will be preserved for when you resubscribe.",
  },
  {
    question: "What's included in code export?",
    answer: "Code export gives you the full React/Tailwind source code of your site. You can host it anywhere or continue development with your own team.",
  },
  {
    question: "Can I upgrade or downgrade later?",
    answer: "Absolutely. You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at your next billing cycle.",
  },
  {
    question: "What happens to my credits if I cancel?",
    answer: "Your paid credits are preserved but 'frozen' until you resubscribe. Free credits (20/mo) remain spendable in draft mode on Free.",
  },
];

const BuilderPricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const navigate = useNavigate();

  const getPrice = (plan: typeof aiBuilderPlans[0]) => {
    if (plan.monthlyPrice === 0) return "$0";
    return isAnnual 
      ? `$${Math.round(plan.yearlyPrice / 12)}` 
      : `$${plan.monthlyPrice}`;
  };

  const getSavings = (plan: typeof aiBuilderPlans[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.yearlyPrice;
    if (savings > 0) return `Save $${savings}/yr`;
    return null;
  };

  const handleCheckout = async (planName: string) => {
    // Free plan goes directly to builder
    if (planName.toLowerCase() === "free") {
      navigate("/secret-builder-hub");
      return;
    }

    setLoadingPlan(planName);
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to subscribe");
        navigate("/auth?redirect=/checkout?plan=" + planName.toLowerCase() + (isAnnual ? "&annual=true" : ""));
        return;
      }

      const planType = planName.toLowerCase() as keyof typeof PRICE_IDS;
      
      if (!PRICE_IDS[planType]) {
        toast.error("Invalid plan selected");
        return;
      }

      // Navigate to embedded checkout page with annual flag
      navigate(`/checkout?plan=${planType}${isAnnual ? "&annual=true" : ""}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSprintCheckout = async () => {
    setLoadingPlan("sprint");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to try Sprint Pass");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: PRICE_IDS.sprint, planType: "sprint" },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Sprint checkout error:", error);
      toast.error("Failed to start Sprint Pass checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing | Excellion AI Course Builder</title>
        <meta name="description" content="Choose your plan. AI-powered course builder starting free. Create and publish complete online courses." />
      </Helmet>

      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            AI Course Builder Plans
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build your course site with AI — then edit and launch.
          </p>
        </div>

        {/* AI Builder Pricing */}
        <section id="ai-builder" className="mb-24 scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you're ready to publish.</p>
          </div>

          {/* Sprint Pass Banner */}
          <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/20">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Sprint Pass — $9 for 30 days</p>
                  <p className="text-sm text-muted-foreground">
                    Launch fast for cheap. Includes 150 build credits for generating and editing your course site for 30 days. Renews to Pro ($39/mo) unless you cancel.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Dialog open={sprintModalOpen} onOpenChange={setSprintModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Sprint Pass Details
                      </DialogTitle>
                    </DialogHeader>
                    <ul className="space-y-3 mt-4">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">150 build credits (rollover forever)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">Publishing + custom domain enabled during Sprint</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">First-time only — one Sprint Pass per account</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">Auto-renews to Pro ($39/mo) after 30 days unless canceled</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSprintModalOpen(false);
                          handleSprintCheckout();
                        }}
                        disabled={loadingPlan === "sprint"}
                      >
                        {loadingPlan === "sprint" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Try Sprint Pass — $9"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  size="sm" 
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleSprintCheckout}
                  disabled={loadingPlan === "sprint"}
                >
                  {loadingPlan === "sprint" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Try Sprint Pass"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Annual
              </span>
              {isAnnual && (
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-medium">
                  Save up to 17%
                </span>
              )}
            </div>
            
            {/* How Credits Work Link */}
            <Dialog open={creditsModalOpen} onOpenChange={setCreditsModalOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-4 h-4" />
                  How credits work
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>How Credits Work</DialogTitle>
                </DialogHeader>
                <ul className="space-y-4 mt-4">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-foreground">Credits are used for AI actions (generation, rewrites, rebuilds).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-foreground">Credits roll over forever (no expiry, no cap).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-foreground">Free credits are always spendable on Free (draft-only).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-foreground">Paid credits are spendable only while a paid plan is active; if you cancel, your paid credits are preserved and unlock again when you resubscribe.</span>
                  </li>
                </ul>
              </DialogContent>
            </Dialog>
            
            {/* Credits explanation */}
            <p className="text-sm text-muted-foreground">
              Build credits are used when you generate and edit your course site.
            </p>
          </div>

          {/* AI Builder Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mt-8">
            {aiBuilderPlans.map((plan) => (
              <Card 
                key={plan.name}
                id={plan.name.toLowerCase()}
                className={`relative flex flex-col scroll-mt-24 h-full ${
                  plan.highlighted 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                    : 'border-border bg-card'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <CardHeader className="pb-4 flex flex-col">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{getPrice(plan)}</span>
                    <span className="text-muted-foreground ml-1">/ month</span>
                  </div>
                  <div className="h-5 mt-1">
                    {isAnnual && getSavings(plan) && (
                      <p className="text-sm text-accent">{getSavings(plan)}</p>
                    )}
                  </div>
                  {/* Credits Badge */}
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-accent/15 text-accent px-2.5 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      {plan.credits} build credits / month (rolls over)
                    </span>
                  </div>
                  <div className="h-6 mt-2">
                    {plan.subtext && (
                      <p className="text-sm text-muted-foreground">{plan.subtext}</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-grow pb-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.note && (
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      {plan.note}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="pt-4 mt-auto">
                  <Button 
                    className={`w-full ${plan.highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => handleCheckout(plan.name)}
                    disabled={loadingPlan === plan.name}
                  >
                    {loadingPlan === plan.name ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* DFY Pricing section removed - data archived in database */}

        {/* FAQ Section */}
        <section id="faq" className="max-w-3xl mx-auto scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate("/builder-faq")}
              className="gap-2"
            >
              More FAQs <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BuilderPricing;
