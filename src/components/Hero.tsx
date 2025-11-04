import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import excellionCityVideo from "@/assets/excellion-city.mp4";

const Hero = () => {
  const [inputValue, setInputValue] = useState("");

  const suggestions = [
    "Restaurant website with menu",
    "Add authentication",
    "Use Supabase database"
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ minWidth: '100%', minHeight: '100%' }}
        >
          <source src={excellionCityVideo} type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-sm font-medium text-accent">✨ Launch your business online in days</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            The Most Convenient<br />
            <span className="text-accent">Website & App Builder</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your dream website and/or web app, and launch fast.
          </p>

          {/* Input Area */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Coming soon..."
                disabled
                className="min-h-[120px] bg-card/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground resize-none pr-24 text-base"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-9 w-9" disabled>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="icon" className="h-9 w-9 bg-accent hover:bg-accent/90 text-accent-foreground" disabled>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="text-sm text-muted-foreground">Try:</span>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(suggestion)}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-all hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all"
            >
              Request Expert Build
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
