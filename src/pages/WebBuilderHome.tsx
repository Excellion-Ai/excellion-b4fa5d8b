import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare,
  Zap,
  Globe,
  PenTool,
  Check,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  Users,
  BarChart3,
} from "lucide-react";
import homeBackgroundVideo from "@/assets/home-background.mp4";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InterviewStepper } from "@/components/InterviewStepper";
import { useInterviewIntake } from "@/hooks/useInterviewIntake";

const suggestionChips = [
  "Beginner photography course",
  "Freelance business bootcamp", 
  "Learn Notion in 30 days"
];

const features = [
  {
    icon: Zap,
    title: "AI-Generated Curriculum",
    description: "Get a complete course outline with modules, lessons, and learning objectives in seconds."
  },
  {
    icon: PenTool,
    title: "Sales Copy That Converts",
    description: "Compelling headlines, benefit-driven copy, and clear calls-to-action written for you."
  },
  {
    icon: Globe,
    title: "Publish Instantly",
    description: "One-click publishing with custom domains. Your course is live in minutes, not weeks."
  },
  {
    icon: GraduationCap,
    title: "Student-Ready Pages",
    description: "Professional landing pages, curriculum views, and checkout flows out of the box."
  },
  {
    icon: Users,
    title: "Built for Creators",
    description: "Coaches, educators, and experts use Excellion to launch courses without technical skills."
  },
  {
    icon: BarChart3,
    title: "Analytics Included",
    description: "Track enrollments, page views, and conversions to optimize your course business."
  }
];

const faqItems = [
  {
    question: "Do I need technical skills to use Excellion?",
    answer: "No. Excellion is designed for course creators, not developers. You describe your course idea in plain language, and the AI generates everything for you. Edit with simple clicks, not code."
  },
  {
    question: "What types of courses can I create?",
    answer: "Any type — video courses, text-based lessons, cohort programs, coaching programs, bootcamps, or self-paced courses. Excellion adapts to your format and audience."
  },
  {
    question: "How long does it take to create a course?",
    answer: "Most users go from idea to published course in under 10 minutes. The AI generates your curriculum and landing page instantly. You just review and customize."
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes. Connect any custom domain you own. Your course will be accessible at yourdomain.com with SSL included."
  },
  {
    question: "Is there a free plan?",
    answer: "Yes. Start for free and generate your first course draft at no cost. Upgrade when you're ready to publish and sell."
  }
];

const WebBuilderHome = () => {
  const [prompt, setPrompt] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const interview = useInterviewIntake();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      navigate("/secret-builder-hub", { 
        state: { 
          initialIdea: prompt, 
          autoGenerate: true
        } 
      });
    } else {
      navigate("/secret-builder-hub");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  };

  const handleChipClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  // Handle Build Assist interview submission
  const handleInterviewSubmit = useCallback(() => {
    if (interview.canSubmit && interview.composedPrompt) {
      sessionStorage.setItem('pendingBuilderData', JSON.stringify({
        prompt: interview.composedPrompt,
        answers: interview.answers,
        source: 'build-assist'
      }));
      setInterviewOpen(false);
      navigate("/secret-builder-hub");
    }
  }, [interview.canSubmit, interview.composedPrompt, interview.answers, navigate]);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Excellion",
    "applicationCategory": "Course Builder",
    "description": "AI-powered course creation platform that generates curriculum, landing pages, and sales copy.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Excellion — AI Course Builder | Create & Sell Online Courses</title>
        <meta name="description" content="Create professional online courses in minutes with AI. Excellion generates your curriculum, landing page, and sales copy. Start free, publish instantly." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://excellion.dev" />
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      <Navigation />

      {/* Hero Section */}
      <main>
        <section 
          className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-16"
          aria-label="Hero section"
        >
          {/* Video Background - No dark overlay */}
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
              aria-hidden="true"
              style={{ 
                backfaceVisibility: 'hidden', 
                objectPosition: 'center 20%', 
                transform: 'translateZ(0) scale(1.0)', 
                minWidth: '100%', 
                minHeight: '100%',
                filter: 'contrast(1.05) saturate(1.1) brightness(1.02)',
                contain: 'paint',
                willChange: 'transform',
              }}
            >
              <source src={homeBackgroundVideo} type="video/mp4" />
            </video>
          </div>

          {/* Transparent Glass Box Container */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-background/70 backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Course Builder</span>
                </div>
              </div>

              {/* H1 - Main SEO Target */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-center">
                Turn your knowledge into a course site your audience can buy from.{" "}
                <span className="text-primary">Fast.</span>
              </h1>

              {/* H2 Subheadline */}
              <h2 className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-normal leading-relaxed text-center">
                Excellion builds a course website that sells from a short chat, including the landing page, curriculum outline, pricing, and conversion copy. You refine and publish.
              </h2>

              {/* Prompt Input */}
              <div className="w-full">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Help [WHO] achieve [RESULT] in [TIMEFRAME] — without getting stuck or confused."
                  aria-label="Describe your course idea"
                  className="w-full border border-white/10 bg-background/50 text-base min-h-[120px] p-4 focus-visible:ring-1 focus-visible:ring-primary resize-none rounded-xl"
                  rows={4}
                />
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={() => setInterviewOpen(true)}
                    size="lg"
                    variant="outline"
                    className="flex-1 h-12 text-base gap-2 border-primary/30 hover:bg-primary/10"
                  >
                    <Zap className="w-4 h-4" />
                    Build Assist
                  </Button>
                  <Button 
                    onClick={handleStart} 
                    size="lg"
                    className="flex-1 h-12 text-base gap-2"
                  >
                    Generate Course
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Example Chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {suggestionChips.map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => handleChipClick(chip)}
                    className="px-4 py-2 rounded-full text-sm bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-4 border-t border-border/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
              How Excellion Works
            </h2>
            <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
              Three steps from idea to published course
            </p>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Step 1</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Describe your course
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Tell us what you teach, who it's for, and the outcome students will achieve.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                  <Zap className="w-7 h-7" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Step 2</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  AI generates everything
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Get a complete curriculum, landing page, and sales copy in seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                  <Globe className="w-7 h-7" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Step 3</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Customize and publish
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Edit anything, connect your domain, and go live when you're ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 bg-muted/30 border-t border-border/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
              Built for Course Creators
            </h2>
            <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
              Everything you need to create, launch, and sell online courses
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-4 border-t border-border/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
              Pricing Plans
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Start free. Upgrade when you're ready to publish.
            </p>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Free Plan */}
              <div className="p-8 rounded-2xl bg-card border border-border">
                <div className="text-sm font-medium text-muted-foreground mb-2">Free</div>
                <div className="text-4xl font-bold text-foreground mb-1">$0</div>
                <div className="text-muted-foreground text-sm mb-6">Forever free</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    Generate unlimited course drafts
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    AI curriculum generation
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    Preview before publishing
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/secret-builder-hub")}
                >
                  Get Started
                </Button>
              </div>

              {/* Sprint Pass */}
              <div className="p-8 rounded-2xl bg-card border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Best Value
                </div>
                <div className="text-sm font-medium text-primary mb-2">Sprint Pass</div>
                <div className="text-4xl font-bold text-foreground mb-1">$9</div>
                <div className="text-muted-foreground text-sm mb-6">one-time</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    150 generation credits
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    Publish your course site
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    Custom domain support
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    No subscription required
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    Renews to Pro if you want more
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/pricing")}
                >
                  View Pricing
                </Button>
              </div>
            </div>

            <p className="text-center mt-8 text-sm text-muted-foreground">
              <Link to="/pricing" className="text-primary hover:underline">
                See full pricing details →
              </Link>
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-4 bg-muted/30 border-t border-border/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Everything you need to know about Excellion
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left text-foreground hover:no-underline py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 border-t border-border/30">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to create your course?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of creators who use Excellion to build and sell online courses.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="h-12 px-8 gap-2"
                onClick={() => navigate("/secret-builder-hub")}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="h-12 px-8"
                onClick={() => user ? navigate("/auth") : navigate("/auth")}
              >
                Login
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Build Assist Dialog */}
      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Build Assist</DialogTitle>
          </DialogHeader>
          <InterviewStepper
            step={interview.step}
            totalSteps={interview.totalSteps}
            answers={interview.answers}
            canProceed={interview.canProceed}
            canSubmit={interview.canSubmit}
            onUpdateAnswer={interview.updateAnswer}
            onUpdateOffer={interview.updateOffer}
            onNext={interview.nextStep}
            onBack={interview.prevStep}
            onSkip={interview.skipStep}
            onSubmit={handleInterviewSubmit}
            onSwitchToQuickPrompt={() => {
              setInterviewOpen(false);
              navigate("/secret-builder-hub");
            }}
            isGenerating={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebBuilderHome;
