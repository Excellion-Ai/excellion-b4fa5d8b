import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  ArrowRight, 
  Paperclip, 
  Palette,
  ExternalLink,
  Heart,
  ChevronRight
} from "lucide-react";

const templates = [
  { name: "Business Website", desc: "Professional company site", color: "from-blue-500/20 to-purple-500/20" },
  { name: "Portfolio", desc: "Showcase your work", color: "from-pink-500/20 to-orange-500/20" },
  { name: "E-commerce Store", desc: "Sell products online", color: "from-green-500/20 to-teal-500/20" },
  { name: "Restaurant", desc: "Menu & reservations", color: "from-amber-500/20 to-red-500/20" },
  { name: "Landing Page", desc: "Convert visitors", color: "from-violet-500/20 to-indigo-500/20" },
  { name: "Blog", desc: "Share your stories", color: "from-cyan-500/20 to-blue-500/20" },
];

const showcaseApps = [
  { name: "TechStartup Pro", desc: "Modern SaaS landing page", likes: 342 },
  { name: "FitnessFuel", desc: "Gym & fitness website", likes: 289 },
  { name: "ArtisanCafe", desc: "Coffee shop website", likes: 256 },
  { name: "DevPortfolio", desc: "Developer showcase", likes: 234 },
  { name: "LegalEase", desc: "Law firm website", likes: 198 },
  { name: "PetCare Plus", desc: "Veterinary clinic site", likes: 187 },
];

const WebBuilderHome = () => {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (prompt.trim()) {
      // Could pass prompt as state to the bot
      navigate("/bot-experiment", { state: { initialPrompt: prompt } });
    } else {
      navigate("/bot-experiment");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStart();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Website Builder AI | Build Your Site with AI</title>
      </Helmet>

      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">BuilderAI</span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Templates
              </a>
              <a href="#discover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Discover
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Community
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/bot-experiment")}>
                Get started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Website Builder</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Build something{" "}
            <span className="text-primary">amazing</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Create professional websites by chatting with AI. No coding required.
          </p>

          {/* Prompt Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-muted/50 rounded-2xl border border-border p-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask BuilderAI to create a website for..."
                className="border-0 bg-transparent text-base h-12 px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center justify-between mt-2 px-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
                    <Paperclip className="w-4 h-4 mr-1" />
                    Attach
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
                    <Palette className="w-4 h-4 mr-1" />
                    Theme
                  </Button>
                </div>
                <Button onClick={handleStart} className="h-8">
                  Start Building
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-16 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Discover templates</h2>
              <p className="text-muted-foreground mt-1">Start your next project with a template</p>
            </div>
            <Button variant="ghost" className="text-muted-foreground">
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => navigate("/bot-experiment", { state: { template: template.name } })}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-border bg-muted/30 hover:border-primary/50 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${template.color}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{template.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section id="discover" className="py-16 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Discover apps</h2>
              <p className="text-muted-foreground mt-1">Explore what others are building</p>
            </div>
            <Button variant="ghost" className="text-muted-foreground">
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {showcaseApps.map((app, index) => (
              <div
                key={index}
                className="group rounded-xl border border-border bg-muted/30 p-4 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-3 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary/50" />
                </div>
                <h3 className="font-medium text-foreground text-sm truncate">{app.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{app.desc}</p>
                <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                  <Heart className="w-3 h-3" />
                  <span className="text-xs">{app.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to build your website?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of creators building with AI. No credit card required.
          </p>
          <Button size="lg" onClick={() => navigate("/bot-experiment")}>
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">BuilderAI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Build beautiful websites with AI. No coding required.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#templates" className="hover:text-foreground transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Learn</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © 2024 BuilderAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebBuilderHome;
