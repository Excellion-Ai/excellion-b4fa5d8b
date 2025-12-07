import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare,
  Layout,
  Rocket,
  Check,
  AlertCircle,
  ChevronRight,
  Phone,
  UtensilsCrossed,
  Wrench,
  Users,
  ShoppingBag,
  Mail
} from "lucide-react";
import excellionLogo from "@/assets/excellion-logo.png";

const suggestionChips = [
  "Restaurant taking online orders",
  "Local home services business", 
  "Online coach selling packages"
];

const exampleSites = [
  {
    title: "Local restaurant",
    body: "Online menu, order buttons, and mobile-first layout – started from a 3-minute conversation.",
    icon: UtensilsCrossed,
    gradient: "from-amber-500/20 to-red-500/20"
  },
  {
    title: "Home services",
    body: "Lead-focused pages for contractors with quote forms and clear calls to book.",
    icon: Wrench,
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "Coaches & consultants",
    body: "Packages, testimonials, and booking links for 1:1 or group programs.",
    icon: Users,
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "E-commerce & digital products",
    body: "Product grids with checkout links to your existing tools.",
    icon: ShoppingBag,
    gradient: "from-green-500/20 to-teal-500/20"
  }
];

const greatAtItems = [
  "Designs clean, modern layouts based on your business type.",
  "Writes conversion-focused copy for leads, bookings, or orders.",
  "Suggests pages and sections you might be missing.",
  "Sets you up with clear calls-to-action and forms."
];

const notMagicItems = [
  "Still needs your input on what you offer and how you work.",
  "Won't replace a full brand designer for pixel-perfect identity.",
  "Doesn't run your ads or marketing for you – it focuses on the site."
];

const faqItems = [
  {
    question: "Do I need any technical skills to use this?",
    answer: "No. You answer questions in plain language, and Excellion AI handles the layout, copy, and page structure. You'll only need to approve things and connect your domain when you're ready."
  },
  {
    question: "What happens after the AI builds my site?",
    answer: "You can edit the text and sections yourself, or hand it off to our team to refine the design, plug in integrations, and launch."
  },
  {
    question: "Can I talk to a real person if I get stuck?",
    answer: "Yes. You can book a short call and we'll walk through your site, answer questions, and help you decide whether to keep it DIY or move to a done-for-you build."
  },
  {
    question: "Who owns the website once it's built?",
    answer: "You do. Your content, branding, and domain are yours, and you're free to move or export if your needs change later."
  },
  {
    question: "How is this different from Wix or Squarespace?",
    answer: "Instead of dragging blocks around from scratch, you talk to Excellion AI and start from a tailored draft with pages, copy, and structure already done for your business type."
  }
];

const WebBuilderHome = () => {
  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (prompt.trim()) {
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

  const handleChipClick = (suggestion: string) => {
    setPrompt(`Create a website for a ${suggestion.toLowerCase()}`);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire to existing email capture mechanism
    console.log("Email submitted:", email);
    setEmail("");
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
            <div className="flex items-center gap-2">
              <img src={excellionLogo} alt="Excellion AI" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-foreground">Excellion AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </a>
              <a href="#examples" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Examples
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={() => navigate("/bot-experiment")}>
                Start building
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Website Builder</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Describe your business.{" "}
            <span className="text-primary">Get a working website in minutes.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Excellion AI turns a short conversation into a real website with pages, copy, forms, and a clear launch plan – no coding or templates required.
          </p>

          {/* Prompt Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-card rounded-2xl border border-border p-3">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Excellion AI to create a website for… (e.g. local restaurant, roofing contractor, fitness coach)"
                className="border-0 bg-transparent text-base h-12 px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center justify-end mt-3">
                <Button onClick={handleStart} className="h-10">
                  Start with a free draft site
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {suggestionChips.map((chip, index) => (
                <button
                  key={index}
                  onClick={() => handleChipClick(chip)}
                  className="px-3 py-1.5 rounded-full text-sm bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              No credit card required to start. You'll see your draft before you decide anything.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            How Excellion AI builds your site
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Three simple steps from idea to launch
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-xl bg-card border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-primary uppercase tracking-wide">01</span>
              <h3 className="text-xl font-semibold text-foreground mt-1 mb-2">
                You chat in plain language
              </h3>
              <p className="text-muted-foreground text-sm">
                Tell Excellion what you do, what you sell, and what your site needs to accomplish – more leads, bookings, or online orders.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-xl bg-card border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Layout className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-primary uppercase tracking-wide">02</span>
              <h3 className="text-xl font-semibold text-foreground mt-1 mb-2">
                It drafts a custom website
              </h3>
              <p className="text-muted-foreground text-sm">
                The bot creates a full layout with pages, sections, headlines, and copy tailored to your business type and goals.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-xl bg-card border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-primary uppercase tracking-wide">03</span>
              <h3 className="text-xl font-semibold text-foreground mt-1 mb-2">
                You launch or hand off
              </h3>
              <p className="text-muted-foreground text-sm">
                Tweak the draft yourself, or hand it to our team to connect your domain, polish the design, and launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Sites Section */}
      <section id="examples" className="py-20 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            Sites started from a short chat
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Real examples of what Excellion AI can build
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleSites.map((site, index) => (
              <div
                key={index}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all"
              >
                <div className={`aspect-video bg-gradient-to-br ${site.gradient} flex items-center justify-center`}>
                  <site.icon className="w-12 h-12 text-foreground/30" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{site.title}</h3>
                  <p className="text-sm text-muted-foreground">{site.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Ways to Launch Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            Two ways to launch with Excellion
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Choose the path that fits your style
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Builder Card */}
            <div className="p-6 rounded-xl bg-card border border-border flex flex-col">
              <span className="text-xs font-medium text-primary uppercase tracking-wide mb-2">AI Builder</span>
              <h3 className="text-xl font-semibold text-foreground mb-4">Build with Excellion AI</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Best if you want to stay hands-on but skip the blank page.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Answer a few questions and get a full site draft in minutes.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Edit sections, text, and pages directly inside the builder.
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 mb-4">
                Start free with a draft site. Only pay when you're ready to launch.
              </p>
              <Button onClick={() => navigate("/bot-experiment")} className="w-full">
                Start with AI
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Done-For-You Card */}
            <div className="p-6 rounded-xl bg-card border border-border flex flex-col">
              <span className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Done-for-you</span>
              <h3 className="text-xl font-semibold text-foreground mb-4">Have our team build it</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Best if you want us to handle the heavy lifting end-to-end.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  We design, refine, and launch your site based on a quick call.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Perfect for busy owners who want a polished, ready-to-go result.
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 mb-4">
                Most projects land between $600–$3,500 depending on pages and features.
              </p>
              <Button variant="outline" onClick={() => navigate("/book-call")} className="w-full">
                Book a 15-minute call
                <Phone className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            What Excellion AI is great at
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Great At */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                Great at
              </h3>
              <ul className="space-y-3">
                {greatAtItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Magic */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                Not magic
              </h3>
              <ul className="space-y-3">
                {notMagicItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Frequently asked questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg border border-border bg-card px-4"
              >
                <AccordionTrigger className="text-foreground hover:no-underline text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-xl mx-auto text-center">
          <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Not ready to build today?
          </h2>
          <p className="text-muted-foreground mb-6">
            Drop your email and we'll send you example sites and a short guide on what your website needs to convert in 2025.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1"
              required
            />
            <Button type="submit">
              Send me examples
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={excellionLogo} alt="Excellion AI" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg text-foreground">Excellion AI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Build beautiful websites with AI. No coding required.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
                <li><a href="#examples" className="hover:text-foreground transition-colors">Examples</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/dfy" className="hover:text-foreground transition-colors">Done for you</a></li>
                <li><a href="/book-call" className="hover:text-foreground transition-colors">Book a call</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/legal" className="hover:text-foreground transition-colors">Privacy & Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Excellion AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebBuilderHome;
