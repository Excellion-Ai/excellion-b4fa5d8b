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

// Stripe Price IDs
const PRICE_IDS = {
  starter: "price_1Sfw4OPCTHzXvqDgdFp9vMUR",
  pro: "price_1Sfw4iPCTHzXvqDgFQqJmiAW",
  agency: "price_1Sfw4yPCTHzXvqDgtGCn2iWD",
  sprint: "price_sprint_placeholder", // TODO: Add Sprint Pass price ID
};

const aiBuilderPlans = [
  {
    name: "Free",
    description: "Discover what Excellion can do",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 20,
    features: [
      "1 project (draft-only)",
      "Drafts + editing in Studio",
      "Basic templates",
      "Mobile responsive editing",
      "Community support/docs",
    ],
    note: "Publishing requires Starter or higher.",
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
    description: "Launch your first website",
    monthlyPrice: 15,
    yearlyPrice: 150,
    credits: 50,
    features: [
      "1 published site (custom domain)",
      "No watermark",
      "Basic SEO (Title/Meta/OG)",
      "Simple analytics (views/visitors)",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For serious builders",
    monthlyPrice: 29,
    yearlyPrice: 290,
    credits: 100,
    badge: "Best Seller",
    features: [
      "Unlimited drafts + 1 published site",
      "Integrations: Stripe, Calendly, Mailchimp",
      "Advanced components: pricing, CMS, galleries",
      "Code export (Annual only)",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Agency",
    description: "For teams managing clients",
    monthlyPrice: 129,
    yearlyPrice: 1290,
    credits: 500,
    features: [
      "10 published sites",
      "White-label dashboard",
      "Team seats + roles",
      "Client management & billing transfer",
      "Priority build queue",
      "Full code export included",
    ],
    cta: "Get Started",
    highlighted: false,
  },
];

const dfyPlans = [
  {
    name: "Essential",
    priceRange: "$600 – $1,000",
    description: "Perfect for simple landing pages",
    features: [
      "1–3 pages",
      "1 revision round",
      "Basic SEO setup",
      "Full launch support",
    ],
  },
  {
    name: "Core",
    priceRange: "$1,000 – $1,800",
    description: "For growing businesses",
    features: [
      "5–7 pages",
      "2 revision rounds",
      "Booking OR payments integration",
      "Enhanced SEO",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    priceRange: "$1,800 – $3,500",
    description: "Full-featured professional sites",
    features: [
      "10–15 pages",
      "3 revision rounds",
      "Automations & integrations",
      "Advanced SEO & analytics",
    ],
  },
];

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
        navigate("/auth");
        return;
      }

      const planType = planName.toLowerCase() as keyof typeof PRICE_IDS;
      const priceId = PRICE_IDS[planType];
      
      if (!priceId) {
        toast.error("Invalid plan selected");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, planType },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL received");
      }
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
        <title>Pricing | Excellion AI Website Builder</title>
        <meta name="description" content="Choose your plan. AI-powered website builder starting free, or let our team build it for you." />
      </Helmet>

      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free. Upgrade when you're ready to publish.
          </p>
        </div>

        {/* AI Builder Pricing */}
        <section id="ai-builder" className="mb-24 scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">AI Builder Plans</h2>
            <p className="text-muted-foreground">Build it yourself with AI assistance</p>
          </div>

          {/* Sprint Pass Banner */}
          <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/20">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Sprint Pass — $9 for 7 days</p>
                  <p className="text-sm text-muted-foreground">
                    First-time only. Includes +35 credits. Full Pro access for 7 days. Auto-renews to Pro $29/mo unless you cancel.
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
                        <span className="text-foreground">+35 credits (rollover forever)</span>
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
                        <span className="text-foreground">Auto-renews to Pro ($29/mo) after 7 days unless canceled</span>
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
          <div className="flex flex-col items-center gap-3 mb-8">
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
          </div>

          {/* AI Builder Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
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
                
                <CardHeader className="pb-4 h-[210px] flex flex-col">
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
                      {plan.credits} AI credits/mo • rollover
                    </span>
                  </div>
                  <div className="h-6 mt-2">
                    {plan.monthlyPrice === 0 && (
                      <p className="text-sm text-muted-foreground">Free forever</p>
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

        {/* Done-for-you Pricing */}
        <section id="done-for-you" className="mb-24 scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Done-for-you Pricing</h2>
            <p className="text-muted-foreground">We design, build, and launch it for you</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {dfyPlans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.highlighted 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                    : 'border-border bg-card'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-accent">{plan.priceRange}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button 
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => navigate("/book-call")}
                  >
                    Book a 15-minute call
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

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
