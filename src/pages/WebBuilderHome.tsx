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
  X,
  Mic,
  Play,
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
  "6-week fat loss course",
  "Beginner strength course", 
  "Home workout fundamentals course"
];

const features = [
  {
    icon: Zap,
    title: "Course Sales Page (Drafted for You)",
    description: "A ready-to-edit sales page that explains who the course is for, the outcome, what's included, and how to enroll."
  },
  {
    icon: Users,
    title: "Student Portal Included",
    description: "Give students a clean place to access lessons, follow the plan, and stay on track."
  },
  {
    icon: Globe,
    title: "Publish on Your Link or Domain",
    description: "Go live on your link or your own domain when you're ready."
  },
  {
    icon: PenTool,
    title: "Student Intake + Check-ins",
    description: "Collect goals, starting point, preferences, and ongoing updates without chasing messages."
  },
  {
    icon: GraduationCap,
    title: "Built for Real Fitness Niches",
    description: "Great for fat loss, strength, muscle gain, postpartum, runners, busy professionals, and beginners."
  },
  {
    icon: BarChart3,
    title: "Built-in Analytics",
    description: "See visits, clicks, and signups so you know what's working and what to improve."
  }
];

const faqItems = [
  {
    question: "Can I really launch in 1 weekend?",
    answer: "Yes. Excellion generates your course outline, lesson structure, and sales page copy in minutes. The '1 weekend' promise includes your time to review, film any video content, and publish."
  },
  {
    question: "What types of fitness courses can I create?",
    answer: "Any type — fat loss, strength, muscle gain, home workouts, postpartum, running programs, or beginner fitness. Excellion adapts to your niche and audience."
  },
  {
    question: "Do I need technical skills?",
    answer: "No. Describe your course idea in plain language and Excellion generates everything. Edit with simple clicks, not code."
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes. Connect any custom domain you own. Your course will be accessible at yourdomain.com with SSL included."
  },
  {
    question: "How does pricing work?",
    answer: "Your first month is $19, then $79/month (or $790/year to save $158). One plan, everything included. An active course is any published course currently available to students. You can have up to 3 at once. Cancel anytime."
  }
];

const WebBuilderHome = () => {
  const [prompt, setPrompt] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const interview = useInterviewIntake();

  const placeholderText = "Help [AUDIENCE] achieve [RESULT] in [TIMEFRAME]";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Typing and deleting animation for placeholder
  useEffect(() => {
    if (prompt) return; // Don't animate if user has typed something
    
    let timeout: NodeJS.Timeout;
    const typeSpeed = 25;
    const deleteSpeed = 15;
    const pauseBeforeDelete = 1500;
    const pauseBeforeType = 300;

    if (!isDeleting) {
      if (animatedPlaceholder.length < placeholderText.length) {
        timeout = setTimeout(() => {
          setAnimatedPlaceholder(placeholderText.slice(0, animatedPlaceholder.length + 1));
        }, typeSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseBeforeDelete);
      }
    } else {
      if (animatedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setAnimatedPlaceholder(animatedPlaceholder.slice(0, -1));
        }, deleteSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
        }, pauseBeforeType);
      }
    }

    return () => clearTimeout(timeout);
  }, [animatedPlaceholder, isDeleting, prompt, placeholderText]);

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
    "applicationCategory": "AI Course Builder",
    "description": "AI-powered course builder for fitness influencers and creators. Generate your course outline, sales page, and student portal in 1 weekend.",
    "offers": {
      "@type": "Offer",
      "price": "19",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Excellion — AI Course Builder for Fitness Creators</title>
        <meta name="description" content="Launch your fitness course in 1 weekend. Excellion generates your course outline, lesson plan, sales page copy, and student portal. Start for $19." />
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
          className="relative min-h-[100svh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-16"
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
          <div className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6">
            <div className="bg-background/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 lg:p-12 shadow-2xl">
              {/* Badge */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 border border-primary/30 text-xs sm:text-sm text-primary">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>AI Course Builder for Fitness Creators</span>
                </div>
              </div>

              {/* H1 - Main SEO Target */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight text-center">
                Launch your fitness course in{" "}
                <span className="text-primary">1 weekend.</span>
              </h1>

              {/* H2 Subheadline */}
              <h2 className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 font-normal leading-relaxed text-center px-1">
                Excellion generates your course outline, lesson plan, sales page copy, and student portal from 1 prompt. Spend the weekend polishing, filming, and publishing.
              </h2>

              {/* Prompt Input */}
              <div className="w-full">
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Describe your course idea"
                    className="w-full border border-white/10 bg-background/50 text-sm sm:text-base min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 pr-12 sm:pr-14 focus-visible:ring-1 focus-visible:ring-primary resize-none rounded-xl"
                    rows={3}
                  />
                  {!prompt && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-12 pointer-events-none text-muted-foreground text-sm sm:text-base">
                      {animatedPlaceholder}
                      <span className="inline-block w-0.5 h-4 sm:h-5 bg-primary ml-0.5 animate-pulse align-middle" />
                    </div>
                  )}
                  {/* Microphone button */}
                  <button
                    type="button"
                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 p-2 sm:p-2.5 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary transition-all hover:scale-105 z-10 touch-manipulation"
                    aria-label="Voice input (coming soon)"
                    title="Voice input coming soon"
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <Button 
                    onClick={() => setInterviewOpen(true)}
                    size="lg"
                    variant="outline"
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base gap-2 border-primary/30 hover:bg-primary/10 touch-manipulation"
                  >
                   <Zap className="w-4 h-4" />
                    See an example
                  </Button>
                  <Button 
                    onClick={handleStart} 
                    size="lg"
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base gap-2 touch-manipulation"
                  >
                    Generate my course
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Example Chips */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
                {suggestionChips.map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => handleChipClick(chip)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all touch-manipulation"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 px-4 border-t border-border/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-3 sm:mb-4">
              How Excellion Works
            </h2>
             <p className="text-sm sm:text-base text-muted-foreground text-center mb-10 sm:mb-16 max-w-xl mx-auto">
              3 steps to launch your course this weekend
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary mb-4 sm:mb-6">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-primary mb-1.5 sm:mb-2">Step 1</div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                  Describe your audience + outcome
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  For example: busy dads, beginners, runners, powerlifters, or people focused on fat loss.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary mb-4 sm:mb-6">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-primary mb-1.5 sm:mb-2">Step 2</div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                  Excellion generates your course + sales page
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Get a ready-to-edit course with your outline, lesson structure, sales page copy, and student portal.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary mb-4 sm:mb-6">
                  <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-primary mb-1.5 sm:mb-2">Step 3</div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                  Customize, connect your domain, and publish
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Edit anything, connect your domain, and go live when you're ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-16 lg:py-24 px-4 bg-muted/30 border-t border-border/30">
          <div className="max-w-6xl mx-auto">
             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-3 sm:mb-4">
              Built for fitness influencers
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-10 sm:mb-16 max-w-xl mx-auto">
              Create, sell, and deliver a course in one place.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 text-primary mb-3 sm:mb-4">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2">
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

        {/* Course Preview Section */}
        <section id="course-preview" className="py-12 sm:py-16 lg:py-24 px-4 border-t border-border/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                Included with every plan
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
                Excellion Quickstart Course (Preview)
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                A step-by-step walkthrough that helps you publish your offer page, client portal, and weekly check-ins fast.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left Column – Copy */}
              <div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Write and structure your offer in minutes",
                    "Build a clean client portal that reduces support messages",
                    "Launch weekly check-ins that keep clients consistent",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="p-4 rounded-xl bg-card border border-border mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Course Outline</p>
                  <ul className="space-y-2">
                    {[
                      "Module 1: Offer + pricing",
                      "Module 2: Offer page + CTA",
                      "Module 3: Client portal setup",
                      "Module 4: Intake + check-ins",
                      "Module 5: Publish + domain",
                    ].map((mod, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary/60 shrink-0" />
                        {mod}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      if (user) {
                        navigate('/course/excellion-quickstart');
                      } else {
                        navigate('/auth?redirect=/course/excellion-quickstart');
                      }
                    }}
                  >
                    Access the Quickstart Course
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Most coaches finish setup in 1 weekend.</p>
              </div>

              {/* Right Column – Video Placeholder */}
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                {/* ▼ Replace inner content below with a real embed later ▼ */}
                <div className="aspect-video flex flex-col items-center justify-center bg-card text-muted-foreground gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/40 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Video coming soon</span>
                </div>
                {/* ▲ Replace inner content above with a real embed later ▲ */}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 sm:py-16 lg:py-24 px-4 border-t border-border/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-3 sm:mb-4">
              Pricing
            </h2>
             <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 sm:mb-12 max-w-xl mx-auto">
               One plan for fitness course creators.
             </p>

            {/* Single Plan Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-card border-2 border-primary relative">
               <div className="text-center mb-6">
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                  $19<span className="text-lg text-muted-foreground font-normal"> first month</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  then $79/month · or $790/year <span className="text-primary">(save $158)</span>
                </div>
                <p className="text-muted-foreground mt-3">
                  Everything included. Cancel anytime.
                </p>
              </div>

              <ul className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2.5 sm:gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Up to 3 active courses
                </li>
                <li className="flex items-center gap-2.5 sm:gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Unlimited page views
                </li>
                <li className="flex items-center gap-2.5 sm:gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Custom domain
                </li>
                <li className="flex items-center gap-2.5 sm:gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Intake & check-ins
                </li>
                <li className="flex items-center gap-2.5 sm:gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Student portal
                </li>
                <li className="flex items-center gap-2.5 sm:gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Built-in analytics
                </li>
              </ul>

              <Button 
                className="w-full h-11 sm:h-12 touch-manipulation"
                onClick={() => navigate("/pricing")}
              >
                 Start for $19
              </Button>
            </div>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              No hidden fees. Just build and sell your course.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12 sm:py-16 lg:py-24 px-4 bg-muted/30 border-t border-border/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 sm:mb-12">
              Everything you need to know about Excellion
            </p>

            <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-4 sm:px-6"
                >
                  <AccordionTrigger className="text-left text-foreground hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 sm:pb-5 text-sm">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 border-t border-border/30">
          <div className="max-w-2xl mx-auto text-center">
             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Ready to launch your course this weekend?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              Generate the outline and sales page now. Film and publish when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button 
                size="lg"
                className="w-full sm:w-auto h-12 px-8 gap-2 touch-manipulation"
                onClick={() => navigate("/secret-builder-hub")}
              >
                Get Started for $19
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 touch-manipulation"
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
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto rounded-2xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Build Assist</DialogTitle>
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
