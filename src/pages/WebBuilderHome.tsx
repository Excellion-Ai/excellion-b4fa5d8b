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
  Mail,
  Loader2,
  Zap
} from "lucide-react";
import homeBackgroundVideo from "@/assets/home-background.mp4";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { AnimatedPlaceholder } from "@/components/AnimatedPlaceholder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { InterviewStepper } from "@/components/InterviewStepper";
import { useInterviewIntake } from "@/hooks/useInterviewIntake";

const placeholderSuggestions = [
  "I teach [who] how to [outcome]. It's a [self-paced, cohort, or coaching] program.",
];

const suggestionChips = [
  "Online fitness influencer course to help clients lose fat at home",
  "Cohort program helping freelancers land 5 clients in 30 days", 
  "Self-paced course teaching beginners how to use Notion for work"
];


const greatAtItems = [
  "Turns your course idea into a clear site structure (in the right order)",
  "Writes simple, persuasive sales copy that fits your audience",
  "Builds the key sections: what you'll learn, curriculum, pricing, FAQs, and CTA",
  "Helps you organize your course with lessons and video sections",
  "Sets up clear \"Buy / Join Waitlist / Apply\" buttons so visitors know what to do"
];

const notMagicItems = [
  "Still needs your input on who it's for and the result students get",
  "Won't replace your personal voice — you should tweak the wording",
  "Doesn't run your ads or grow your audience — it focuses on the course site"
];

type InputMode = 'quick' | 'interview';

const WebBuilderHome = () => {
  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('quick');
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Interview intake hook
  const interview = useInterviewIntake(prompt);

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
    const promptToUse = inputMode === 'interview' ? interview.composedPrompt : prompt;
    const structuredData = inputMode === 'interview' ? interview.structuredData : null;
    
    if (promptToUse.trim()) {
      navigate("/secret-builder-hub", { 
        state: { 
          initialIdea: promptToUse, 
          autoGenerate: true,
          interviewData: structuredData
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("quote_requests").insert({
        name: "Email Capture",
        email: email.trim(),
        project_type: "email_capture",
        source: "web_builder_home",
        description: prompt.trim() || "User signed up for examples",
        brand_name: prompt.trim() || undefined,
      });
      
      if (error) throw error;
      
      toast.success("Thanks! We'll send you examples and tips soon.");
      setEmail("");
      setPrompt("");
    } catch (error) {
      console.error("Email capture error:", error);
      toast.error("Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchMode = (mode: InputMode) => {
    // Preserve state when switching
    if (mode === 'interview' && prompt.trim()) {
      interview.setQuickPrompt(prompt);
    } else if (mode === 'quick' && interview.quickPrompt) {
      setPrompt(interview.quickPrompt);
    }
    setInputMode(mode);
  };

  const handleInterviewSubmit = () => {
    handleStart();
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Website Builder AI | Build Your Site with AI</title>
      </Helmet>

      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20 pb-12">
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
              Your course website,{" "}
              <span className="text-accent">written and structured by AI.</span>
            </h1>
            <p className="text-base sm:text-xl text-accent max-w-3xl mx-auto mb-8 font-semibold">
              Excellion builds a course website that sells from a short chat, including the landing page, curriculum outline, pricing, and conversion copy. You refine and publish.
            </p>

            {/* Mode Toggle */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className="inline-flex p-1 rounded-lg bg-background/30 border border-border/30 backdrop-blur-sm">
                <button
                  onClick={() => handleSwitchMode('quick')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    inputMode === 'quick'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  Quick Prompt
                </button>
                <button
                  onClick={() => handleSwitchMode('interview')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                    inputMode === 'interview'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Build Assist
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-4">
                {inputMode === 'quick' ? (
                  <>
                    {/* Quick Prompt Mode */}
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
                    <p className="text-xs text-muted-foreground mt-2 text-left px-4">
                      Include your audience, the transformation, and your offer type. Excellion handles structure, page flow, and sales copy.
                    </p>
                    <div className="flex items-center justify-end mt-3">
                      <Button onClick={handleStart} className="h-10 px-4 gap-2">
                        <span className="text-sm">Generate course site draft</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Build Assist Mode */
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
                    onSwitchToQuickPrompt={() => handleSwitchMode('quick')}
                  />
                )}
              </div>

              {/* Quick Prompt extras */}
              {inputMode === 'quick' && (
                <>
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

                  {/* Interview prompt link */}
                  <p className="text-xs text-foreground/60 mt-4 font-light">
                    No credit card required.{' '}
                    <button
                      onClick={() => handleSwitchMode('interview')}
                      className="text-primary hover:underline"
                    >
                      Want a better first draft? Try Build Assist (60 sec)
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 border-t border-border/50 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            How Excellion builds your course site
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Three simple steps from idea to enrollments
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-xl bg-card border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-primary uppercase tracking-wide">01</span>
              <h3 className="text-xl font-semibold text-foreground mt-1 mb-2">
                Tell us what your course is about
              </h3>
              <p className="text-muted-foreground text-sm">
                Who it's for, what they'll learn, and the result they'll get.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-xl bg-card border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Layout className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-primary uppercase tracking-wide">02</span>
              <h3 className="text-xl font-semibold text-foreground mt-1 mb-2">
                Get your course site draft
              </h3>
              <p className="text-muted-foreground text-sm">
                We generate the page layout, sections, and sales copy for you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-xl bg-card border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-primary uppercase tracking-wide">03</span>
              <h3 className="text-xl font-semibold text-foreground mt-1 mb-2">
                Edit and launch
              </h3>
              <p className="text-muted-foreground text-sm">
                Change anything you want, connect your domain, and publish when you're ready.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* AI Builder Section */}
      <section id="pricing" className="py-20 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-xl bg-card border border-border">
            <span className="text-xs font-medium text-primary uppercase tracking-wide mb-2 block">AI Course Builder</span>
            <h3 className="text-2xl font-semibold text-foreground mb-6">Build your course site with Excellion AI</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                Tell us your course idea and who it's for
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                Get a complete course site draft in seconds
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                Edit pages, sections, and copy anytime inside the builder
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mb-6">
              Start free with a draft site.
            </p>
            <Button 
              onClick={() => user ? navigate("/secret-builder-hub") : navigate("/auth?redirect=/secret-builder-hub")} 
              className="w-full max-w-md mx-auto flex items-center justify-center gap-2"
              size="lg"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Studio</span>
            </Button>
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
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Learn how course websites are structured
          </h2>
          <p className="text-muted-foreground mb-8">
            Tell us your course topic and we'll email you real examples, plus a simple checklist of the sections to include.
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-sm text-muted-foreground mb-1.5 block">Course topic</label>
                <Input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., fat loss at home, Notion for freelancers, AI for beginners"
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              <div className="text-left">
                <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send me the examples"
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default WebBuilderHome;
