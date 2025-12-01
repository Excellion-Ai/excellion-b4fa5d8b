import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import homeBackgroundVideo from "@/assets/home-background.mp4";
import TypingEffect from "./TypingEffect";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [showCaptcha, setShowCaptcha] = useState(false);
  const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

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

  const handleCaptchaVerify = () => {
    setShowCaptcha(false);
    navigate("/survey");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-end flex-col">
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
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-24 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline and Subheadline */}
          <div className="bg-background/50 backdrop-blur-sm px-8 py-8 rounded-lg border border-border/50 max-w-4xl mx-auto text-center will-change-transform">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Get a Free Mockup + <span className="text-accent">Website Estimate</span>
            </h1>

            <p className="text-xl text-accent max-w-2xl mx-auto mt-6 font-semibold">
              Stop guessing what a professional website costs. Answer a few quick questions and we'll send a custom mockup, clear price range, and launch timeline.
            </p>

            <p className="text-xs text-foreground/60 mt-6 font-light">
              No credit card. No obligation. 100% free preview.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <Button 
              size="lg" 
              onClick={() => setShowCaptcha(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all"
            >
              Start My Free Mockup & Estimate
            </Button>
          </div>
        </div>
      </div>

      {/* hCaptcha Verification Modal */}
      <Dialog open={showCaptcha} onOpenChange={setShowCaptcha}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify You're Human</DialogTitle>
            <DialogDescription>
              Please complete the verification to continue to your free estimate.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            {hcaptchaSiteKey && (
              <HCaptcha
                sitekey={hcaptchaSiteKey}
                onVerify={handleCaptchaVerify}
                theme="dark"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
