import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, BookOpen, Egg, Users } from "lucide-react";
import operationsBackgroundVideo from "@/assets/operations-background-new.mp4";

const Operations = () => {
  const sections = [
    {
      title: "What's Inside",
      icon: Sparkles,
      description: "Everything you need to build faster and smarter with Excellion.",
      items: [
        "Live Expert Help — Chat with Excellion pros for fast answers and build reviews",
        "Templates Library — Grab starter apps and workflows you can clone in minutes",
        "AI Prompt Builder — Craft better prompts for builders, ads, and automations",
        "Order Tracking — See your Expert Build status, milestones, and delivery ETA"
      ]
    },
    {
      title: "Community Lanes",
      icon: Users,
      description: "Join dedicated channels where creators share, learn, and collaborate.",
      items: [
        "#announcements — Launches, updates, and limited drops",
        "#showcase — Share your builds, get feedback, earn spotlights",
        "#help-desk — Quick questions, real answers",
        "#templates — New blueprints from the team + community",
        "#prompts — High-performing prompts, crits, and upgrades",
        "#build-requests — Scope an Expert Build, get a quote"
      ]
    },
    {
      title: "Build With Us",
      icon: BookOpen,
      description: "Get hands-on support whether you're DIY-ing or want expert help.",
      items: [
        "DIY Fast-Track — Step-by-step mini guides and 'copy → paste → ship' snippets",
        "Expert Build Queue — Priority intake, clear scope, transparent timelines",
        "Creator Perks — Beta access, partner slots, and first dibs on new features"
      ]
    },
    {
      title: "Learn & Level Up",
      icon: BookOpen,
      description: "Proven flows, powerful skills, and practical tooling to ship better work.",
      items: [
        "Micro-Workshops — 10–15 min sessions on one powerful skill",
        "Playbooks — Proven flows for creators, founders, and agencies",
        "Tooling Tips — Wire Excellion with your stack (Blink, Typeform, etc.)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
        >
          <source src={operationsBackgroundVideo} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10">
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
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Operations
            </h1>
            
            <p className="text-xl text-accent italic mt-4">
              Command center of Excellion's digital realm
            </p>

            <p className="text-lg text-white font-semibold max-w-3xl mx-auto leading-relaxed mt-6">
              Welcome to Operations — Excellion's connected hub for creators. Chat with the community, explore app templates, use our AI prompt builder, and track your orders. Talk directly with Excellion experts through our Discord server, get instant customer service for our DIY bot, or reach real founder support — all in one powerful space built for you.
            </p>

            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg mt-8"
            >
              Join the Future?
            </Button>
          </div>
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

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">
              Need Help?
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-8">
              Ping @Excellion Support in #help-desk or open a ticket—human support when you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://discord.gg/tmDTkwVY9u" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
                >
                  Enter the Server
                </Button>
              </a>
              <Button 
                size="lg"
                variant="outline"
                className="font-semibold px-8"
              >
                Browse Templates
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="font-semibold px-8"
              >
                Request Expert Build
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Operations;
