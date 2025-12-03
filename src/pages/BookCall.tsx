import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import LazyFooter from "@/components/LazyFooter";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import operationsBackgroundVideo from "@/assets/operations-background-new.mp4";

// Easy to change Calendly URL
const CALENDLY_URL = "https://calendly.com/excellionai/30min";

interface FormErrors {
  name?: string;
  businessName?: string;
  location?: string;
  helpText?: string;
}

const BookCall = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Pre-check form state
  const [hasPassedPrecheck, setHasPassedPrecheck] = useState(false);
  const [isSpam, setIsSpam] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Form fields
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [helpText, setHelpText] = useState("");
  const [currentWebsite, setCurrentWebsite] = useState("");
  const [honeypot, setHoneypot] = useState("");

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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!name || name.trim().length < 3) {
      errors.name = "Please enter at least 3 characters.";
    }
    if (!businessName || businessName.trim().length < 3) {
      errors.businessName = "Please enter at least 3 characters.";
    }
    if (!location || location.trim().length < 3) {
      errors.location = "Please enter at least 3 characters.";
    }
    if (!helpText || helpText.trim().length < 20) {
      errors.helpText = "Please add a bit more detail so we can prep for your call.";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    // Check honeypot first
    if (honeypot) {
      setIsSpam(true);
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to database
      const { error } = await supabase.from("quote_requests").insert({
        name: name.trim(),
        company: businessName.trim(),
        city: location.trim(),
        description: helpText.trim(),
        additional_notes: currentWebsite.trim() || null,
        project_type: "book-call",
        source: "book-call-precheck",
      });
      
      if (error) {
        console.error("Error saving precheck data:", error);
        setSubmitError("Something went wrong saving your details. Please try again in a moment.");
        return;
      }
      
      setHasPassedPrecheck(true);
    } catch (err) {
      console.error("Error during precheck submission:", err);
      setSubmitError("Something went wrong saving your details. Please try again in a moment.");
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
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Book Your 15-Minute Mockup Call
                </h1>
                
                {/* Transparent box around description and benefits */}
                <div className="bg-background/50 backdrop-blur-sm px-6 md:px-10 py-6 md:py-8 rounded-lg border border-border/50 max-w-3xl mx-auto">
                  <p className="text-foreground text-base md:text-lg mb-6">
                    We'll outline a simple plan for your site and start your custom mockup. You'll see the mockup and a clear price range before you make any decisions.
                  </p>
                  
                  {/* Benefits */}
                  <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 text-sm md:text-base">
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>See your mockup before you pay</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>Site goes live within 24 hours of approval</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>Typical builds: $600–$3,500</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spam message (shown if honeypot triggered) */}
              {isSpam && (
                <div className="bg-card border border-border rounded-lg p-6 text-center mb-8">
                  <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Thanks, we've received your info
                  </h2>
                  <p className="text-muted-foreground">
                    If it's a fit, we'll reach out.
                  </p>
                </div>
              )}

              {/* Pre-check Form (shown if not passed and not spam) */}
              {!hasPassedPrecheck && !isSpam && (
                <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
                  <h2 className="text-lg font-semibold text-foreground mb-6">
                    Tell us a bit about your project
                  </h2>
                  
                  {submitError && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md p-3 mb-5">
                      {submitError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot field - hidden from users */}
                    <input
                      type="text"
                      name="website_url_hidden"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={formErrors.name ? "border-destructive" : ""}
                        />
                        {formErrors.name && (
                          <p className="text-sm text-destructive">{formErrors.name}</p>
                        )}
                      </div>
                      
                      {/* Business Name */}
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business name *</Label>
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="Your business name"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className={formErrors.businessName ? "border-destructive" : ""}
                        />
                        {formErrors.businessName && (
                          <p className="text-sm text-destructive">{formErrors.businessName}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Where is your business located? *</Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="City, Country"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={formErrors.location ? "border-destructive" : ""}
                      />
                      {formErrors.location && (
                        <p className="text-sm text-destructive">{formErrors.location}</p>
                      )}
                    </div>
                    
                    {/* What do you need help with */}
                    <div className="space-y-2">
                      <Label htmlFor="helpText">What do you need help with? *</Label>
                      <Textarea
                        id="helpText"
                        placeholder="Example: New website for my restaurant, want online ordering and more bookings."
                        value={helpText}
                        onChange={(e) => setHelpText(e.target.value)}
                        className={`min-h-[100px] ${formErrors.helpText ? "border-destructive" : ""}`}
                      />
                      {formErrors.helpText && (
                        <p className="text-sm text-destructive">{formErrors.helpText}</p>
                      )}
                    </div>
                    
                    {/* Current website (optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="currentWebsite">Current website (optional)</Label>
                      <Input
                        id="currentWebsite"
                        type="text"
                        placeholder="https://yourwebsite.com"
                        value={currentWebsite}
                        onChange={(e) => setCurrentWebsite(e.target.value)}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Continue to Booking"
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* Success message after passing precheck */}
              {hasPassedPrecheck && (
                <div className="bg-card/50 border border-accent/30 rounded-lg p-4 mb-6 text-center">
                  <p className="text-foreground flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    Thanks — now pick a time for your 15-minute mockup call.
                  </p>
                </div>
              )}

              {/* Calendly Embed - Only shown after passing precheck */}
              {hasPassedPrecheck && (
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
              )}
            </div>
          </main>

          <LazyFooter />
        </div>
      </div>
    </>
  );
};

export default BookCall;
