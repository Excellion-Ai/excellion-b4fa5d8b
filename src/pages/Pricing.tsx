import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Real Stripe Price IDs
const PRICE_IDS = {
  monthly: "price_1T1YnuPCTHzXvqDgZwElpsRS",  // $79/mo (with coupon = $19 first month)
  annual: "price_1T1YjxPCTHzXvqDg3Plq3gtT",    // $790/yr
};

const Pricing = () => {
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
        navigate("/auth?redirect=/pricing");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: PRICE_IDS.monthly, planType: "coach_monthly" },
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
              <div className="mb-2">
                <span className="text-4xl sm:text-5xl font-bold text-foreground">
                  $19
                </span>
                <span className="text-lg text-muted-foreground ml-2">
                  first month
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                then $79/month · or $790/year{" "}
                <span className="text-emerald-400/90">(save $158)</span>
              </p>
              
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
                ) : (
                  "Start for $19"
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
