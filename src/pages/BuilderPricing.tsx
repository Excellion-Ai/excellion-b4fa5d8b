import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Loader2, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Stripe Price IDs - TODO: Replace with actual IDs
const PRICE_IDS = {
  monthly: "price_coach_monthly",  // $79/mo
  annual: "price_coach_annual",    // $790/yr
};

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

const faqItems = [
  {
    question: "What does '3 active offers' mean?",
    answer: "You can have up to 3 published program pages live at once. This covers most coaches—a main offer, a challenge, and a waitlist or lead magnet. If you need more, just archive an old one to make room.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Cancel whenever you want. Your pages stay live until the end of your billing period, then go offline. No cancellation fees.",
  },
  {
    question: "What's included in the plan?",
    answer: "Everything. Offer pages, intake forms, check-ins, client portal access, custom domain, analytics, and SSL. No upsells or hidden add-ons.",
  },
  {
    question: "Is there a free trial?",
    answer: "You can generate and preview your first offer page for free in the builder. Subscribe when you're ready to publish and start taking clients.",
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes. Connect any custom domain you own (like yourname.com). SSL is included and set up automatically.",
  },
  {
    question: "What if I need help?",
    answer: "Email support is included. Most questions are answered within 24 hours.",
  },
];

const BuilderPricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to subscribe");
        navigate("/auth?redirect=/checkout?plan=coach" + (billingPeriod === "yearly" ? "&annual=true" : ""));
        return;
      }

      navigate(`/checkout?plan=coach${billingPeriod === "yearly" ? "&annual=true" : ""}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing | Excellion for Fitness Coaches</title>
        <meta name="description" content="One plan. Works for any fitness coach. $79/month or $790/year. Everything included." />
      </Helmet>

      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            One plan. Works for any fitness coach.
          </p>
        </div>

        {/* Single Plan Card */}
        <Card className="relative bg-card border-2 border-primary mb-16">
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
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
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
        <p className="text-center text-sm text-muted-foreground mb-16">
          No hidden fees. No credit limits. Just build your coaching offer.
        </p>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Questions
          </h2>
          
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, idx) => (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`}
                className="border border-border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* More Questions Link */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/builder-faq")}
            className="touch-manipulation"
          >
            More Questions
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BuilderPricing;
