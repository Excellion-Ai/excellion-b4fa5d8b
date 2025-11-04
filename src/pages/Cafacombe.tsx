import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, BookOpen, Egg, Users } from "lucide-react";

const Cafacombe = () => {
  const sections = [
    {
      title: "Hidden Features",
      icon: Sparkles,
      description: "Explore experimental features and early access to upcoming tools that are shaping the future of Excellion.",
      items: [
        "AI-Powered Design Suggestions",
        "Advanced Analytics Engine",
        "Automation Studio Beta"
      ]
    },
    {
      title: "Knowledge Base",
      icon: BookOpen,
      description: "Deep dive into advanced tutorials, architectural decisions, and the philosophy behind Excellion's design.",
      items: [
        "System Architecture Guide",
        "Performance Optimization Tips",
        "Custom Integrations Guide"
      ]
    },
    {
      title: "Easter Eggs",
      icon: Egg,
      description: "Secret shortcuts, hidden commands, and fun surprises scattered throughout Excellion for the curious explorer.",
      items: [
        "Developer Console Commands",
        "Hidden Keyboard Shortcuts",
        "Secret Achievements"
      ]
    },
    {
      title: "Community Secrets",
      icon: Users,
      description: "Shared discoveries from the Excellion community, pro tips, and tricks from power users.",
      items: [
        "User Contributed Plugins",
        "Advanced Workflow Templates",
        "Performance Leaderboard"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-20">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Catacombs
          </h1>
          
          <p className="text-xl text-accent italic">
            Hidden depths of Excellion's digital realm
          </p>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Welcome to The Catacombs — Excellion's connected hub for creators. Chat with the community, explore app templates, use our AI prompt builder, and track your orders. Talk directly with Excellion experts through our Discord server, get instant customer service for our DIY bot, or reach real founder support — all in one powerful space built for you.
          </p>

          <Button 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg mt-8"
          >
            Join the Future?
          </Button>
        </div>

        {/* Feature Sections */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card 
                key={index}
                className="bg-card border-border hover:border-accent/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li 
                        key={idx}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quote Section */}
        <div className="max-w-3xl mx-auto text-center py-12">
          <blockquote className="text-2xl md:text-3xl font-medium text-foreground italic">
            "In the depths, wisdom awaits those who venture beyond the surface."
          </blockquote>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cafacombe;
