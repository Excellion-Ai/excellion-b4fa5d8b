import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InterviewStepper } from "@/components/InterviewStepper";
import { useInterviewIntake } from "@/hooks/useInterviewIntake";
import homeBackgroundVideo from "@/assets/home-background.mp4";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [interviewOpen, setInterviewOpen] = useState(false);
  const interview = useInterviewIntake();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set playback rate
    video.playbackRate = 0.75;

    // Attempt to play with proper error handling
    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        // Silently handle autoplay restrictions
        console.log("Video autoplay prevented:", error);
      }
    };

    // Play when ready
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('loadeddata', playVideo, { once: true });
    }

    // Handle visibility changes to resume playback
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

  // Handle Build Assist interview submission - store in sessionStorage and navigate
  const handleInterviewSubmit = useCallback(() => {
    if (interview.canSubmit && interview.composedPrompt) {
      // Store the composed prompt for the builder to pick up
      sessionStorage.setItem('pendingBuilderData', JSON.stringify({
        prompt: interview.composedPrompt,
        answers: interview.answers,
        source: 'build-assist'
      }));
      setInterviewOpen(false);
      navigate("/secret-builder-hub");
    }
  }, [interview.canSubmit, interview.composedPrompt, interview.answers, navigate]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero section">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-end flex-col">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            aria-hidden="true"
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
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-24 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-8">
          {/* Headline and Subheadline */}
          <div className="bg-background/40 dark:bg-background/30 backdrop-blur-sm px-4 md:px-8 py-5 md:py-8 rounded-lg border border-border/50 max-w-4xl mx-auto text-center will-change-transform shadow-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              AI-Powered Course Builder
            </div>
            
            <h1 className="text-3xl md:text-7xl font-bold text-foreground leading-tight">
              Your course website, <span className="text-accent">written and structured by AI.</span>
            </h1>

            <p className="text-base md:text-xl text-accent max-w-2xl mx-auto mt-3 md:mt-6 font-semibold">
              Excellion builds a course website that sells from a short chat, including the landing page, curriculum outline, pricing, and conversion copy. You refine and publish.
            </p>

            <p className="text-xs text-foreground/80 dark:text-foreground/60 mt-3 md:mt-6 font-light">
              No credit card required to start.
            </p>

            {/* CTA Buttons */}
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={() => setInterviewOpen(true)}
                aria-label="Start building your course with guided questions"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 md:px-8 py-4 md:py-6 text-base md:text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                Build My Course
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/secret-builder-hub")}
                aria-label="Skip to builder with quick prompt"
                className="font-semibold px-6 md:px-8 py-4 md:py-6 text-base md:text-lg border-border/50 hover:bg-background/80"
              >
                Skip to Builder
              </Button>
            </div>
          </div>
        </div>
      </div>

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
    </section>
  );
};

export default Hero;
