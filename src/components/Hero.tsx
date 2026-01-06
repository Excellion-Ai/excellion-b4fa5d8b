import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import homeBackgroundVideo from "@/assets/home-background.mp4";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

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
          <div className="bg-background/90 dark:bg-background/50 backdrop-blur-md px-4 md:px-8 py-5 md:py-8 rounded-lg border border-border max-w-4xl mx-auto text-center will-change-transform shadow-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              AI-Powered Course Builder
            </div>
            
            <h1 className="text-3xl md:text-7xl font-bold text-foreground leading-tight">
              Your dream course, <span className="text-accent">generated in seconds.</span>
            </h1>

            <p className="text-base md:text-xl text-accent max-w-2xl mx-auto mt-3 md:mt-6 font-semibold">
              An AI course builder that generates a complete curriculum in seconds. Make changes by chat, customize lessons, and publish with your own domain.
            </p>

            <p className="text-xs text-foreground/80 dark:text-foreground/60 mt-3 md:mt-6 font-light">
              No credit card required to start.
            </p>

            {/* CTA Buttons */}
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/secret-builder-hub")}
                aria-label="Start building your course with Excellion"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 md:px-8 py-4 md:py-6 text-base md:text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all"
              >
                Start Building Your Course
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
