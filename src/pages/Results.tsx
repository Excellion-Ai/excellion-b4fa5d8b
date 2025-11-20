import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Results = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Essential",
      price: "$600–$1,000",
      description: "Perfect for getting started quickly",
      features: [
        "1-3 pages",
        "Mobile responsive",
        "Contact form",
        "Fast launch (2-3 days)",
        "Basic SEO setup"
      ],
      highlighted: false
    },
    {
      name: "Core",
      price: "$1,200–$2,800",
      description: "Best for growth-focused businesses",
      features: [
        "3-6 pages",
        "Lead capture system",
        "Newsletter integration",
        "Advanced SEO",
        "Analytics setup",
        "Social media links"
      ],
      highlighted: true,
      badge: "Recommended"
    },
    {
      name: "Premium",
      price: "$3,000+",
      description: "Complete solution for serious growth",
      features: [
        "Unlimited pages",
        "E-commerce ready",
        "Custom integrations",
        "Payment processing",
        "Booking system",
        "Strategy consultation",
        "Priority support"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Excellion</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Thanks! We've Generated Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Based on your responses, here's what we recommend
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className={`h-full relative ${
                  plan.highlighted 
                    ? 'border-accent border-2 shadow-lg shadow-accent/20' 
                    : 'border-border'
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-accent mt-2">{plan.price}</div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto text-center bg-card border border-border rounded-2xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to See Your Free Mockup?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            We'll walk through your plan, show you a mockup, and finalize your exact quote.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/booking')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 animate-pulse"
          >
            Book Your 30-Minute Build Call
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Excellion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Results;
