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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";

const Billing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { 
    authenticated, 
    balance, 
    plan, 
    totalEarned, 
    totalSpent,
    loading: creditsLoading, 
    fetchCredits 
  } = useCredits();

  const [transactions, setTransactions] = useState<{
    id: string;
    amount: number;
    type: string;
    action_type: string | null;
    description: string | null;
    created_at: string;
  }[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Fetch recent transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const { data, error } = await supabase
          .from('credit_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    if (authenticated) {
      fetchTransactions();
    }
  }, [authenticated]);

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
    { name: "Free", credits: 20, price: "$0", current: plan === 'free' },
    { name: "Starter", credits: 50, price: "$15", current: plan === 'starter' },
    { name: "Pro", credits: 100, price: "$29", current: plan === 'pro', badge: plan === 'pro' ? "Current Plan" : undefined },
    { name: "Agency", credits: 500, price: "$129", current: plan === 'agency' },
  ];

  // Calculate usage percentage (used / earned)
  const usagePercentage = totalEarned > 0 ? ((totalEarned - balance) / totalEarned) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionTypeLabel = (type: string, actionType: string | null) => {
    if (type === 'bonus') return 'Bonus Credits';
    if (type === 'purchase') return 'Purchased';
    if (type === 'rollover') return 'Monthly Rollover';
    if (type === 'refund') return 'Refund';
    if (type === 'usage' && actionType) {
      const labels: Record<string, string> = {
        chat: 'AI Chat',
        generation: 'Site Generation',
        edit: 'Site Edit',
        image: 'Image Generation',
        export: 'Code Export',
        publish: 'Publish',
      };
      return labels[actionType] || 'Usage';
    }
    return 'Usage';
  };

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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Billing & Credits</h1>
            <p className="text-muted-foreground">Manage your subscription and usage</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => fetchCredits()}
            disabled={creditsLoading}
          >
            <RefreshCw className={`w-4 h-4 ${creditsLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {!authenticated ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Sign in to view your credits and billing</p>
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="w-5 h-5 text-primary" />
                    Current Plan
                  </CardTitle>
                  <Badge variant="outline" className="border-primary text-primary capitalize">
                    {plan}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground capitalize">{plan}</span>
                  <span className="text-muted-foreground">plan</span>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleManageSubscription} disabled={loading}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {loading ? "Loading..." : "Manage Subscription"}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/builder-pricing")}>
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
                  Credit Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {creditsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-4xl font-bold text-foreground">{balance}</span>
                        <span className="text-muted-foreground ml-2">credits remaining</span>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Earned: {totalEarned}</div>
                        <div>Spent: {totalSpent}</div>
                      </div>
                    </div>
                    <Progress 
                      value={100 - usagePercentage} 
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground">
                      Credits roll over forever. Unused credits never expire.
                    </p>
                    
                    {/* Credit costs reference */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Credit Costs</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {Object.entries(CREDIT_COSTS).map(([action, cost]) => (
                          <div key={action} className="flex items-center justify-between bg-secondary/50 rounded px-2 py-1">
                            <span className="text-muted-foreground capitalize">{action}</span>
                            <span className="font-medium text-foreground">{cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
                  {plans.map((p) => (
                    <div 
                      key={p.name}
                      className={`p-4 rounded-lg border transition-colors ${
                        p.current 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{p.name}</span>
                        {p.current && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-2xl font-bold text-foreground">{p.price}</p>
                      <p className="text-xs text-muted-foreground">/month</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                        <Sparkles className="w-3 h-3" />
                        {p.credits} credits
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx, index) => (
                      <div key={tx.id}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-green-500/10' : 'bg-secondary'}`}>
                              {tx.amount > 0 ? (
                                <Sparkles className="w-4 h-4 text-green-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {getTransactionTypeLabel(tx.type, tx.action_type)}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                          </div>
                        </div>
                        {index < transactions.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-muted-foreground"
                  onClick={handleManageSubscription}
                >
                  View All in Stripe Portal
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
