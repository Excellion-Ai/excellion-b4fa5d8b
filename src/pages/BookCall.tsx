import { Helmet } from "react-helmet-async";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import LazyFooter from "@/components/LazyFooter";
import { CheckCircle2, ExternalLink } from "lucide-react";
import operationsBackgroundVideo from "@/assets/operations-background-new.mp4";

// Easy to change Calendly URL
const CALENDLY_URL = "https://calendly.com/excellionai/30min";

const BookCall = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    city: "",
    helpNeeded: "",
    honeypot: "", // Hidden honeypot field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check - if filled, silently reject
    if (formData.honeypot) {
      console.log("Spam submission detected");
      setIsSubmitted(true); // Pretend success to not alert bots
      return;
    }

    // Basic validation
    if (!formData.name.trim() || !formData.company.trim() || !formData.city.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("quote_requests").insert({
        name: formData.name.trim().substring(0, 100),
        company: formData.company.trim().substring(0, 100),
        city: formData.city.trim().substring(0, 100),
        project_type: formData.helpNeeded || "Not specified",
        source: "book-call-mini-form",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Thanks! Your info has been saved.");
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Book Your Free Website Planning Call | Excellion</title>
        <meta
          name="description"
          content="Book a free 15-minute call with Excellion. Get a clear build plan and price for your business website. Fast turnaround, no long contracts."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        {/* Video Background */}
        <div className="fixed inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'translateZ(0) scale(1.0)', 
              minWidth: '100%', 
              minHeight: '100%',
              WebkitTransform: 'translateZ(0) scale(1.0)',
              filter: 'contrast(1.05) saturate(1.1) brightness(1.02)',
              contain: 'paint',
              willChange: 'transform',
            } as React.CSSProperties}
          >
            <source src={operationsBackgroundVideo} type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10">
          <Navigation />

          <main className="pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Book Your Free Website Planning Call
              </h1>
              
              {/* Transparent box around description and benefits */}
              <div className="bg-background/50 backdrop-blur-sm px-6 md:px-10 py-6 md:py-8 rounded-lg border border-border/50 max-w-3xl mx-auto">
                <p className="text-foreground text-base md:text-lg mb-6">
                  Pick a time that works for you. On this 15-minute call, we'll map your
                  business to Essential, Core, or Premium, walk through a simple build
                  plan, and give you a clear price range before we start building.
                </p>
                
                {/* Benefits */}
                <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 text-sm md:text-base">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>100% free, no pressure</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Fast turnaround (sites in days, not months)</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Clear pricing: $600–$3,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid md:grid-cols-5 gap-8">
              {/* Mini Form - Optional */}
              <div className="md:col-span-2">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Tell us a bit about yourself
                    <span className="text-muted-foreground font-normal text-sm ml-2">(optional)</span>
                  </h2>

                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
                      <p className="text-foreground font-medium">Thanks!</p>
                      <p className="text-muted-foreground text-sm">
                        Now pick a time that works for you.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Honeypot field - hidden from users */}
                      <input
                        type="text"
                        name="website_url_hidden"
                        value={formData.honeypot}
                        onChange={(e) =>
                          setFormData({ ...formData, honeypot: e.target.value })
                        }
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your name"
                          maxLength={100}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="company">Business name *</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({ ...formData, company: e.target.value })
                          }
                          placeholder="Your business name"
                          maxLength={100}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          placeholder="Your city"
                          maxLength={100}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="helpNeeded">What do you need help with?</Label>
                        <Select
                          value={formData.helpNeeded}
                          onValueChange={(value) =>
                            setFormData({ ...formData, helpNeeded: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New website">New website</SelectItem>
                            <SelectItem value="Redesign">Redesign</SelectItem>
                            <SelectItem value="Sell online">Sell online</SelectItem>
                            <SelectItem value="Bookings">Bookings</SelectItem>
                            <SelectItem value="Not sure">Not sure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save & Continue to Booking"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {/* Calendly Embed */}
              <div className="md:col-span-3">
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Pick a time for your call
                  </h2>

                  {/* Calendly iframe embed */}
                  <div className="w-full min-h-[600px] rounded-lg overflow-hidden bg-background">
                    <iframe
                      src={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0a0a0a&text_color=ffffff&primary_color=d4af37`}
                      width="100%"
                      height="600"
                      frameBorder="0"
                      title="Book a call with Excellion"
                      className="rounded-lg"
                    />
                  </div>

                  {/* Fallback button */}
                  <div className="mt-4 text-center">
                    <p className="text-muted-foreground text-sm mb-2">
                      If the booking tool doesn't load, click here to open Calendly.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(CALENDLY_URL, "_blank")}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Calendly
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

          <LazyFooter />
        </div>
      </div>
    </>
  );
};

export default BookCall;
