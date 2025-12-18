import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import pricingBackgroundVideo from "@/assets/pricing-background.mp4";

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 0.75;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log("Video autoplay prevented:", error);
      }
    };

    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('loadeddata', playVideo, { once: true });
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && video.paused) {
        playVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const plans = [
    {
      name: "Free",
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
      ]
    },
    {
      name: "Builder",
      credits: "100 credits",
      monthlyPrice: 20,
      yearlyPrice: 192,
      description: "For small businesses building their own site",
      features: [
        "100 credits per month",
        "Coming soon"
      ]
    },
    {
      name: "Groups",
      credits: "200 credits",
      monthlyPrice: 40,
      yearlyPrice: 384,
      description: "For teams and growing businesses",
      features: [
        "200 credits per month",
        "Coming soon"
      ]
    },
    {
      name: "Agency",
      credits: "400 credits",
      monthlyPrice: 80,
      yearlyPrice: 768,
      description: "For agencies and power users",
      features: [
        "400 credits per month",
        "Coming soon"
      ]
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === "Free") return "Free";
    if (billingPeriod === "yearly" && typeof plan.yearlyPrice === "number") {
      // Show monthly equivalent for yearly plans
      const monthlyEquivalent = Math.floor(plan.yearlyPrice / 12);
      return `$${monthlyEquivalent}`;
    }
    return `$${plan.monthlyPrice}`;
  };

  const getPeriodText = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === "Free") return "";
    return "/ month";
  };

  const getYearlyTotal = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === "Free" || billingPeriod === "monthly") return null;
    if (typeof plan.yearlyPrice === "number") {
      return `$${plan.yearlyPrice}/year total`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ 
            transform: 'translateZ(0)',
            filter: 'contrast(1.05) saturate(1.1) brightness(1.02)',
          }}
          onError={(e) => console.error("Video error:", e)}
          src={pricingBackgroundVideo}
        />
      </div>

      <div className="relative z-10">
        <Navigation />
        <main className="container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              DIY
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Start for free. Upgrade as you go.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1 bg-secondary rounded-lg opacity-50 cursor-not-allowed">
              <button
                disabled
                className="px-6 py-2 rounded-md text-sm font-medium bg-accent text-accent-foreground shadow-sm cursor-not-allowed"
              >
                Monthly
              </button>
              <button
                disabled
                className="px-6 py-2 rounded-md text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-not-allowed"
              >
                Yearly
                <span className="text-xs bg-accent/20 px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className="relative flex flex-col bg-background/10 backdrop-blur-md border-white/20"
              >
                
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-sm text-foreground/80">{plan.credits}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-4xl font-bold text-accent">{getPrice(plan)}</span>
                        <span className="text-foreground/70 ml-2">{getPeriodText(plan)}</span>
                      </div>
                      {billingPeriod === "monthly" && plan.monthlyPrice !== "Free" && (
                        <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">
                          COMING SOON!
                        </span>
                      )}
                    </div>
                    {getYearlyTotal(plan) && (
                      <p className="text-xs text-foreground/60 mt-2">
                        {getYearlyTotal(plan)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70 mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-grow">
                  {plan.monthlyPrice !== "Free" && (
                    <div className="mb-6 pb-6 border-b border-white/20">
                      <p className="text-sm font-medium text-foreground mb-2">Super Credits Add-on</p>
                      <p className="text-xs text-foreground/60 mb-3">For video generation (recurring monthly)</p>
                      <select disabled className="w-full px-3 py-2 bg-background/20 border border-white/20 rounded-md text-sm text-foreground opacity-50 cursor-not-allowed">
                        <option>None</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground mb-3">What you get:</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    disabled 
                    className="w-full bg-accent/50 text-accent-foreground cursor-not-allowed hover:bg-accent/50"
                  >
                    Coming Soon
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      </div>
    </div>
  );
};

export default Pricing;
