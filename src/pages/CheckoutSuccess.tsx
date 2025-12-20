import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!showConfetti) {
      setShowConfetti(true);
      // Trigger confetti celebration
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#C9A962', '#8B5CF6', '#10B981'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#C9A962', '#8B5CF6', '#10B981'],
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Welcome to Excellion! | Subscription Activated</title>
        <meta name="description" content="Your subscription is now active" />
      </Helmet>

      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Excellion!</h1>
          <p className="text-muted-foreground">
            Your subscription is now active. You're ready to build amazing websites with AI.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-accent">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Your credits have been added</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Start building your first website now. Your credits are ready to use.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate("/secret-builder-hub")}
          >
            Start Building
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/billing")}
          >
            View Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
