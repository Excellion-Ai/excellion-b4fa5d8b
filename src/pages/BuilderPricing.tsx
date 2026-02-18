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

const PRICE_IDS = {
  monthly: "price_1T1YnuPCTHzXvqDgZwElpsRS",
  annual: "price_1T1YjxPCTHzXvqDg3Plq3gtT",
};

const features = [
  "Up to 3 active courses",
  "Unlimited page views",
  "Custom domain support",
  "Intake & check-ins",
  "Student portal",
  "Built-in analytics",
  "SSL included",
  "Cancel anytime",
];

const faqItems = [
  {
    question: "What does '3 active courses' mean?",
    answer: "You can have up to 3 published course pages live at once. This covers most coaches—a main course, a challenge, and a waitlist or lead magnet. If you need more, just archive an old one to make room.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Cancel whenever you want. Your pages stay live until the end of your billing period, then go offline. No cancellation fees.",
  },
  {
    question: "What's included in the plan?",
    answer: "Everything. Course pages, intake forms, check-ins, student portal access, custom domain, analytics, and SSL. No upsells or hidden add-ons.",
  },
  {
    question: "Is there a free trial?",
    answer: "You can generate and preview your first course page for free in the builder. Subscribe when you're ready to publish and start taking students.",
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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please sign in to subscribe");
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
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing | Excellion for Fitness Coaches</title>
        <meta name="description" content="One plan. Works for any fitness coach. Start for $19 your first month, then $79/month or $790/year." />
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
                onClick={() => setBillingPeriod("annual")}
                className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 touch-manipulation ${
                  billingPeriod === "annual"
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
              ) : billingPeriod === "monthly" ? (
                "Start for $19"
              ) : (
                "Start for $790/year"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Trust line */}
        <p className="text-center text-sm text-muted-foreground mb-16">
          No hidden fees. No credit limits. Just build your coaching course.
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
