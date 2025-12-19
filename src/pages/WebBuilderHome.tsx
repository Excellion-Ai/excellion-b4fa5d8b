import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Mail
} from "lucide-react";
import homeBackgroundVideo from "@/assets/home-background.mp4";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { AnimatedPlaceholder } from "@/components/AnimatedPlaceholder";

const placeholderSuggestions = [
  "A local restaurant with online ordering and menu...",
  "A roofing contractor website with quote forms...",
  "A fitness coach selling training packages...",
  "A hair salon with booking and services...",
  "A law firm with practice areas and contact...",
  "An online store for handmade jewelry...",
];

const suggestionChips = [
  "Restaurant taking online orders",
  "Local home services business", 
  "Online coach selling packages"
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


const WebBuilderHome = () => {
  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 0.75;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log("Video autoplay prevented:", error);
      }
    };

    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('loadeddata', playVideo, { once: true });
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && video.paused) {
        playVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleStart = () => {
    if (prompt.trim()) {
      navigate("/secret-builder-hub", { state: { initialIdea: prompt, autoGenerate: true } });
    } else {
      navigate("/secret-builder-hub");
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

      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className="w-full h-full object-cover"
            style={{ 
              backfaceVisibility: 'hidden', 
              objectPosition: 'center 20%', 
              transform: 'translateZ(0) scale(1.0)', 
              minWidth: '100%', 
              minHeight: '100%',
              WebkitTransform: 'translateZ(0) scale(1.0)',
              filter: 'contrast(1.05) saturate(1.1) brightness(1.02)',
              contain: 'paint',
              willChange: 'transform',
            } as React.CSSProperties}
          >
            <source src={homeBackgroundVideo} type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="bg-background/50 backdrop-blur-sm px-4 md:px-8 py-6 md:py-10 rounded-lg border border-border/50">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Website Builder</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Your dream website, generated in{" "}
              <span className="text-accent">seconds.</span>
            </h1>
            <p className="text-base sm:text-xl text-accent max-w-3xl mx-auto mb-8 font-semibold">
              From a simple text prompt to a live, multi-page website in minutes. No templates, no coding, just results.
            </p>

            {/* Prompt Input */}
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-3">
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-0 bg-transparent text-base min-h-[48px] max-h-[200px] px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none overflow-hidden"
                    rows={1}
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                    }}
                  />
                  {!prompt && (
                    <div className="absolute top-0 left-0 px-4 py-3 pointer-events-none text-base text-left">
                      <AnimatedPlaceholder 
                        suggestions={placeholderSuggestions}
                        typingSpeed={25}
                        deletingSpeed={15}
                        pauseDuration={2000}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end mt-3">
                  <Button onClick={handleStart} size="icon" className="h-10 w-10">
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {suggestionChips.map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => handleChipClick(chip)}
                    className="px-3 py-1.5 rounded-full text-sm bg-background/50 text-foreground/80 hover:bg-background/70 hover:text-foreground border border-border/50 transition-colors backdrop-blur-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <p className="text-xs text-foreground/60 mt-4 font-light">
                No credit card required to start. You'll see your draft before you decide anything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 border-t border-border/50 scroll-mt-20">
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
                You launch – it's that simple
              </h3>
              <p className="text-muted-foreground text-sm">
                Publish your site with one click. Connect your domain and go live whenever you're ready.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Two Ways to Launch / Pricing Section */}
      <section id="pricing" className="py-20 px-4 border-t border-border/50">
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
                  Best if you want to stay hands-on without starting from a blank page.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Answer a few questions and get a full site draft in minutes.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Edit pages, sections, and copy directly inside the builder.
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 mb-4">
                Start free with a draft site. Only pay when you're ready to launch.
              </p>
              <Button onClick={() => navigate("/secret-builder-hub")} className="w-full">
                Studio
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
      <Footer />

    </div>
  );
};

export default WebBuilderHome;
