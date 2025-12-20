import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Sparkles,
  Calendar,
  ExternalLink,
  Zap,
  Crown,
  Check,
  Clock,
  Receipt,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Billing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    renewDate: string;
    creditsUsed: number;
    creditsTotal: number;
  } | null>(null);

  useEffect(() => {
    // Mock subscription data - in production this would come from check-subscription
    setSubscription({
      plan: "Pro",
      status: "active",
      renewDate: "January 20, 2025",
      creditsUsed: 45,
      creditsTotal: 100,
    });
  }, []);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to manage subscription");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Failed to open subscription portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { name: "Free", credits: 20, price: "$0", current: false },
    { name: "Starter", credits: 50, price: "$15", current: false },
    { name: "Pro", credits: 100, price: "$29", current: true, badge: "Current Plan" },
    { name: "Agency", credits: 500, price: "$129", current: false },
  ];

  const invoices = [
    { date: "Dec 20, 2024", amount: "$29.00", status: "Paid", id: "INV-001" },
    { date: "Nov 20, 2024", amount: "$29.00", status: "Paid", id: "INV-002" },
    { date: "Oct 20, 2024", amount: "$29.00", status: "Paid", id: "INV-003" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Billing & Credits | Excellion AI</title>
        <meta name="description" content="Manage your subscription and credits" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/secret-builder-hub")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Credits</h1>
            <p className="text-muted-foreground">Manage your subscription and usage</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Plan Card */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="w-5 h-5 text-primary" />
                  Current Plan
                </CardTitle>
                <Badge variant="outline" className="border-primary text-primary">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{subscription?.plan || "Pro"}</span>
                <span className="text-muted-foreground">plan</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Renews {subscription?.renewDate || "January 20, 2025"}</span>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleManageSubscription} disabled={loading}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? "Loading..." : "Manage Subscription"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/pricing")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credits Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-accent" />
                Credits This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used this billing period</span>
                <span className="font-medium text-foreground">
                  {subscription?.creditsUsed || 45} / {subscription?.creditsTotal || 100} credits
                </span>
              </div>
              <Progress 
                value={((subscription?.creditsUsed || 45) / (subscription?.creditsTotal || 100)) * 100} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                Credits roll over forever. Unused credits never expire.
              </p>
            </CardContent>
          </Card>

          {/* Quick Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5" />
                Plans Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <div 
                    key={plan.name}
                    className={`p-4 rounded-lg border transition-colors ${
                      plan.current 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{plan.name}</span>
                      {plan.current && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-2xl font-bold text-foreground">{plan.price}</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                      <Sparkles className="w-3 h-3" />
                      {plan.credits} credits
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="w-5 h-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice, index) => (
                  <div key={invoice.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{invoice.date}</p>
                          <p className="text-xs text-muted-foreground">{invoice.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-foreground">{invoice.amount}</span>
                        <Badge variant="secondary" className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                    {index < invoices.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-muted-foreground"
                onClick={handleManageSubscription}
              >
                View All Invoices
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
