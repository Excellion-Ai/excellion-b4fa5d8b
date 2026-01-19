import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

interface PurchaseData {
  verified: boolean;
  status: string;
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  message?: string;
}

export default function PurchaseSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const sessionId = searchParams.get("session_id");
  const courseSlug = searchParams.get("course");

  const verifyPurchase = async () => {
    if (!sessionId) {
      setError("No session ID found");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("verify-course-purchase", {
        body: { session_id: sessionId },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.verified) {
        setPurchaseData(data);
        setIsLoading(false);
        // Trigger confetti celebration
        triggerConfetti();
      } else if (data.status === "pending" && retryCount < maxRetries) {
        // Retry after delay
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      } else {
        setPurchaseData(data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Verification error:", err);
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      } else {
        setError("Failed to verify purchase. Please contact support.");
        setIsLoading(false);
      }
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

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
  };

  useEffect(() => {
    verifyPurchase();
  }, [retryCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Processing Purchase... | Excellion</title>
        </Helmet>
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Processing your purchase...</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your payment.
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Attempt {retryCount + 1} of {maxRetries + 1}...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !purchaseData?.verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Purchase Issue | Excellion</title>
        </Helmet>
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">
              {error || purchaseData?.message || "Unable to verify purchase"}
            </h2>
            <p className="text-muted-foreground">
              Your payment may still be processing. Please check your email for confirmation or contact support.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  setRetryCount(0);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate(courseSlug ? `/course/${courseSlug}` : "/")}
              >
                Return to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Purchase Successful! | Excellion</title>
        <meta name="description" content="Thank you for your purchase" />
      </Helmet>

      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Purchase Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. You now have full access to the course.
            </p>
          </div>

          {purchaseData.course && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">You've enrolled in:</p>
              <p className="font-semibold text-lg text-foreground">
                {purchaseData.course.title}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => navigate(`/learn/${purchaseData.course?.slug || courseSlug}`)}
            >
              Start Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/dashboard/student")}
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
