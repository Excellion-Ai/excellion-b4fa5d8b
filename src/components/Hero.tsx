import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { Link } from "react-router-dom";
import excellionCityVideo from "@/assets/excellion-city.mp4";

const Hero = () => {
  const inputValue = "";
  const setInputValue = (_: string) => {};

  const suggestions = [
    "Restaurant website with menu",
    "Add authentication",
    "Use Supabase database"
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-end flex-col">
          <video
            ref={(el) => el && (el.playbackRate = 0.75)}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover will-change-transform"
            style={{ backfaceVisibility: 'hidden', objectPosition: 'center center', transform: 'translateZ(0) scale(1.5)', minWidth: '100%', minHeight: '100%' }}
          >
            <source src={excellionCityVideo} type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-accent/50">
            <span className="text-sm font-bold text-black">✨ Launch your website fast</span>
          </div>

          {/* Headline and Subheadline */}
          <div className="bg-background/50 backdrop-blur-sm px-8 py-8 rounded-lg border border-border/50 max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              The Most Convenient{" "}
              <span className="text-accent">Website Builder</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl">Coming Soon...</span>
            </h1>

            <p className="text-xl text-white max-w-2xl mx-auto mt-6" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000' }}>
              In the meantime, let us build your site—done right, done fast.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <Link to="/dfy">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all"
              >
                Request Expert Build
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
