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
import { Check, Sparkles, ArrowRight, Zap, Phone, Loader2 } from "lucide-react";
import excellionLogo from "@/assets/excellion-logo.png";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Stripe Price IDs
const PRICE_IDS = {
  starter: "price_1Sfw4OPCTHzXvqDgdFp9vMUR",
  pro: "price_1Sfw4iPCTHzXvqDgFQqJmiAW",
  agency: "price_1Sfw4yPCTHzXvqDgtGCn2iWD",
};
const aiBuilderPlans = [
  {
    name: "Free",
    description: "Discover what Excellion can do for you",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 Project (Draft only)",
      "Excellion subdomain + watermark",
      "Basic templates",
      "Mobile responsive editing",
      "Community support/docs",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
    description: "For launching your first website",
    monthlyPrice: 15,
    yearlyPrice: 150,
    features: [
      "1 Published Site (custom domain)",
      "No watermark",
      "Basic SEO (Title/Meta/OG)",
      "Simple analytics (views/visitors)",
      "500 AI credits/mo",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "Designed for serious builders",
    monthlyPrice: 29,
    yearlyPrice: 290,
    badge: "Best Seller",
    features: [
      "Unlimited drafts + 1 published site",
      "High AI credits (2–3 rebuilds/mo)",
      "Integrations: Stripe, Calendly, Mailchimp",
      "Advanced components: pricing, CMS, galleries",
      "Code export (Annual only)",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Agency",
    description: "For teams managing multiple clients",
    monthlyPrice: 129,
    yearlyPrice: 1290,
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
    answer: "A published site is a live website connected to your own custom domain (like yourbusiness.com). Draft sites are only accessible via an Excellion subdomain and include our watermark.",
  },
  {
    question: "Do credits roll over?",
    answer: "No, credits reset each month. However, on annual plans you get bonus credits that provide a buffer for busy months.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. You can cancel your subscription at any time. Your site will remain live until the end of your billing period.",
  },
  {
    question: "What's included in code export?",
    answer: "Code export gives you the full React/Tailwind source code of your site. You can host it anywhere or continue development with your own team.",
  },
  {
    question: "Can I upgrade or downgrade later?",
    answer: "Absolutely. You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at your next billing cycle.",
  },
];

const BuilderPricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing | Excellion AI Website Builder</title>
        <meta name="description" content="Choose your plan. AI-powered website builder starting free, or let our team build it for you." />
      </Helmet>

      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <img src={excellionLogo} alt="Excellion AI" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-foreground">Excellion AI</span>
            </button>
            <div className="hidden md:flex items-center gap-6">
              <a href="#ai-builder" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                AI Builder
              </a>
              <a href="#done-for-you" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Done-for-you
              </a>
            </div>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/secret-builder-hub")}>
              Studio
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free. Upgrade to get the capacity that exactly matches your needs.
          </p>
        </div>

        {/* AI Builder Pricing */}
        <section id="ai-builder" className="mb-24 scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">AI Builder Plans</h2>
            <p className="text-muted-foreground">Build it yourself with AI assistance</p>
          </div>

          {/* Sprint Pass Banner */}
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Sprint Pass — $9 for 7 days</p>
                  <p className="text-sm text-muted-foreground">First time only. Full Pro access. Auto-renews to Pro $29/mo.</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                Try Sprint Pass
              </Button>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
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

          {/* AI Builder Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiBuilderPlans.map((plan) => (
              <Card 
                key={plan.name}
                id={plan.name.toLowerCase()}
                className={`relative flex flex-col scroll-mt-24 ${
                  plan.highlighted 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
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
                
                <CardHeader className="pb-4">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{getPrice(plan)}</span>
                    <span className="text-muted-foreground ml-1">per month</span>
                  </div>
                  {isAnnual && getSavings(plan) && (
                    <p className="text-sm text-accent mt-1">{getSavings(plan)}</p>
                  )}
                  {plan.monthlyPrice === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">Free forever</p>
                  )}
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    className={`w-full ${plan.highlighted ? '' : 'variant-outline'}`}
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
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BuilderPricing;
