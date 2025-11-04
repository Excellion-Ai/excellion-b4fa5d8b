import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 5 pages",
        "Mobile responsive design",
        "Basic SEO optimization",
        "Contact form integration",
        "1 month support"
      ]
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 15 pages",
        "Advanced animations",
        "Full SEO optimization",
        "Database integration",
        "User authentication",
        "3 months support",
        "Priority updates"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$599",
      period: "/month",
      description: "For large-scale applications",
      features: [
        "Unlimited pages",
        "Custom integrations",
        "Advanced security",
        "Dedicated support",
        "Performance optimization",
        "12 months support",
        "Custom features"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="container mx-auto px-6 py-32">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Simple, Transparent <span className="text-accent">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-accent/10 border-2 border-accent"
                  : "bg-card border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-accent">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Pricing;
