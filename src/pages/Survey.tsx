import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import dfyBackgroundVideo from "@/assets/dfy-background-new.mp4";
import { z } from "zod";

const surveySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Invalid email address"
  }),
  phone: z.string().trim().min(1, "Phone number is required").refine((val) => {
    // Strip out common formatting characters
    const digitsOnly = val.replace(/[\s\-\(\)\.\+]/g, '');
    // Check if it contains only digits and is between 10-15 digits
    return /^\d{10,15}$/.test(digitsOnly);
  }, {
    message: "Please enter a valid phone number (10-15 digits)"
  }),
  brandName: z.string().trim().min(1, "Brand name is required").max(100, "Brand name must be less than 100 characters"),
  mainOutcome: z.string().min(1, "Please select your main outcome").refine((val) => ["professional", "leads", "sell-online", "convert-better"].includes(val), "Please select a valid option"),
  featuresNeeded: z.array(z.string()).min(1, "Please select at least one feature"),
  brandContentStatus: z.string().min(1, "Please select your branding status").refine((val) => ["have-ready", "need-branding"].includes(val), "Please select a valid option"),
  timeline: z.string().min(1, "Please select your launch timeline").refine((val) => ["2-3-days", "4-7-days"].includes(val), "Please select a valid option"),
  additionalNotes: z.string().max(1000, "Additional notes must be less than 1000 characters").optional()
});

const Survey = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const [qualifiedPlan, setQualifiedPlan] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    brandName: "",
    mainOutcome: "",
    featuresNeeded: [] as string[],
    brandContentStatus: "",
    timeline: "",
    additionalNotes: "",
    otherFeatureDetails: ""
  });

  const qualifyPlan = () => {
    let plan_tier = "Essential";
    const feature_count = formData.featuresNeeded.length;
    let complexity_points = 0;

    // Add complexity points based on feature count
    if (feature_count >= 4) {
      complexity_points += 1;
    }

    // Add complexity points for specific features
    if (
      formData.featuresNeeded.includes("automations") ||
      formData.featuresNeeded.includes("online-ordering") ||
      formData.featuresNeeded.includes("other")
    ) {
      complexity_points += 1;
    }

    // Add complexity points for branding needs
    if (formData.brandContentStatus === "need-branding") {
      complexity_points += 1;
    }

    // Add complexity points for tight timeline with multiple features
    if (formData.timeline === "2-3-days" && feature_count >= 3) {
      complexity_points += 1;
    }

    // Determine plan tier based on complexity points
    if (complexity_points >= 2) {
      plan_tier = "Premium";
    } else {
      // Check for Core tier conditions
      const isLeadsOrConversion = 
        formData.mainOutcome === "leads" || 
        formData.mainOutcome === "convert-better";

      if (isLeadsOrConversion || feature_count >= 3) {
        plan_tier = "Core";
      }
    }

    return plan_tier;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data with zod
    try {
      surveySchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
      }
      return;
    }

    // Determine qualified plan
    const plan = qualifyPlan();
    setQualifiedPlan(plan);

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();

    // Insert into database
    const additionalNotesText = formData.additionalNotes || "";
    const otherFeaturesText = formData.featuresNeeded.includes("other") && formData.otherFeatureDetails 
      ? `\n\nOther Features Needed: ${formData.otherFeatureDetails}` 
      : "";
    
    const { error } = await supabase
      .from('quote_requests')
      .insert({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone,
        brand_name: formData.brandName,
        project_type: "survey-submission",
        main_outcome: formData.mainOutcome,
        features_needed: formData.featuresNeeded,
        brand_content_status: formData.brandContentStatus,
        timeline: formData.timeline,
        additional_notes: (additionalNotesText + otherFeaturesText) || null,
        qualified_plan: plan,
        user_id: session?.user?.id || null
      });

    if (error) {
      if (import.meta.env.DEV) {
        console.error("Error submitting quote request:", error);
      }
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Send SMS notification
    try {
      await supabase.functions.invoke('send-survey-sms', {
        body: {
          name: formData.name,
          phone: formData.phone,
          brandName: formData.brandName,
          mainOutcome: formData.mainOutcome,
          featuresNeeded: formData.featuresNeeded,
          brandContentStatus: formData.brandContentStatus,
          timeline: formData.timeline,
          qualifiedPlan: plan,
          additionalNotes: formData.additionalNotes,
          otherFeatureDetails: formData.otherFeatureDetails
        }
      });
      console.log("SMS notification sent successfully");
    } catch (smsError) {
      // Log error but don't block the user flow
      console.error("Error sending SMS notification:", smsError);
    }

    // Send email notifications
    try {
      await supabase.functions.invoke('send-survey-email', {
        body: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          brandName: formData.brandName,
          mainOutcome: formData.mainOutcome,
          featuresNeeded: formData.featuresNeeded,
          brandContentStatus: formData.brandContentStatus,
          timeline: formData.timeline,
          qualifiedPlan: plan
        }
      });
      console.log("Email notifications sent successfully");
    } catch (emailError) {
      // Log error but don't block the user flow
      console.error("Error sending email notifications:", emailError);
    }

    // Show result modal
    setShowResult(true);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Apply formatting based on length
    if (digitsOnly.length <= 3) {
      return digitsOnly;
    } else if (digitsOnly.length <= 6) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    } else {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      featuresNeeded: prev.featuresNeeded.includes(feature)
        ? prev.featuresNeeded.filter(f => f !== feature)
        : [...prev.featuresNeeded, feature]
    }));
  };

  const getPlanContent = () => {
    switch (qualifiedPlan) {
      case "Premium":
        return {
          title: "Premium Build",
          description: "For businesses ready to scale with complex needs. Includes Full Strategy, Online Store/Payments, & Advanced Automations.",
          includes: [
            "6+ pages with advanced features and workflows",
            "Complex integrations, payment processing, booking systems, or custom automations",
            "Built to scale with aggressive marketing, high traffic, or complex user journeys"
          ],
          pricing: "$3,000 – $10,000+ Estimated",
          footerLine: "We have a concept in mind for your homepage. Let's hop on a 30-minute call to walk through the mockup and finalize your exact quote.",
          buttonText: "Book Your Mockup Reveal Call"
        };
      case "Core":
        return {
          title: "Core Build - Recommended",
          description: "Our most popular build. Designed to capture leads and convert visitors. Includes up to 6 Pages, Booking/Lead Forms, & SEO Setup.",
          includes: [
            "4–6 pages with a guided user journey",
            "Features like booking, lead capture, forms, basic automations, or simple integrations",
            "Built to support active leads, clients, and campaigns"
          ],
          pricing: "$1,200 – $2,800 Estimated",
          footerLine: "We have a concept in mind for your homepage. Let's hop on a 30-minute call to walk through the mockup and finalize your exact quote.",
          buttonText: "Book Your Mockup Reveal Call"
        };
      default:
        return {
          title: "Essential Build",
          description: "Perfect for businesses that need a professional 'digital business card'. Includes Home, About, Contact pages & Fast 3-Day Launch.",
          includes: [
            "1–3 core pages (Home, About, Services, Contact)",
            "Modern, conversion-focused layout",
            "Contact or quote form so people can reach you fast"
          ],
          pricing: "$600 – $1,000 Estimated",
          footerLine: "We have a concept in mind for your homepage. Let's hop on a 30-minute call to walk through the mockup and finalize your exact quote.",
          buttonText: "Book Your Mockup Reveal Call"
        };
    }
  };

  return (
    <>
      <Helmet>
        <title>Build Your Website Plan | Excellion</title>
        <meta name="description" content="Take our 60-second assessment to qualify for a custom website build and pricing plan." />
      </Helmet>
      <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={(el) => el && (el.playbackRate = 0.75)}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <source src={dfyBackgroundVideo} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-accent/20">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Let's Build Your <span className="text-accent">Plan</span>
              </h1>
              <p className="text-lg text-accent/90 mt-2">
                Step 1 of 2 • Takes less than 60 seconds
              </p>
            </div>

            {/* Survey Form */}
            <form onSubmit={handleSubmit} className="bg-black/80 backdrop-blur-md border border-accent/30 rounded-2xl p-6 md:p-8 space-y-5 shadow-xl">
              {/* Contact Info - Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-accent text-base font-semibold">
                  First, where should we send your estimate?
                </Label>
                <Label htmlFor="name" className="text-foreground text-sm font-medium mt-1">
                  Your name <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="bg-background/50 h-9"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground text-sm font-medium">
                  Email address (optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-background/50 h-9"
                />
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-accent text-base font-semibold">
                    Phone number <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    required
                    maxLength={14}
                    className="bg-background/50 h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brandName" className="text-accent text-base font-semibold">
                    Brand / business name <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                  </Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Your Brand"
                    required
                    className="bg-background/50 h-9"
                  />
                </div>
              </div>

              {/* Main Outcome */}
              <div className="space-y-2">
                <Label className="text-accent text-base font-semibold">
                  What is the #1 thing this website needs to do? <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                </Label>
                  <RadioGroup
                    value={formData.mainOutcome}
                    onValueChange={(value) => setFormData({ ...formData, mainOutcome: value })}
                    className="space-y-2"
                    required
                  >
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="cursor-pointer flex-1 text-base font-medium text-foreground">Look professional</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="leads" id="leads" />
                      <Label htmlFor="leads" className="cursor-pointer flex-1 text-base font-medium text-foreground">Get more leads</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="sell-online" id="sell-online" />
                      <Label htmlFor="sell-online" className="cursor-pointer flex-1 text-base font-medium text-foreground">Sell online</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="convert-better" id="convert-better" />
                      <Label htmlFor="convert-better" className="cursor-pointer flex-1 text-base font-medium text-foreground">Better conversions</Label>
                    </div>
                  </RadioGroup>
                </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label className="text-accent text-base font-semibold">
                  How soon do you need this live? <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                </Label>
                  <RadioGroup
                    value={formData.timeline}
                    onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                    className="space-y-2"
                    required
                  >
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="2-3-days" id="2-3-days" />
                      <Label htmlFor="2-3-days" className="cursor-pointer flex-1 text-base font-medium text-foreground">2–3 days</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="4-7-days" id="4-7-days" />
                      <Label htmlFor="4-7-days" className="cursor-pointer flex-1 text-base font-medium text-foreground">4–7 days</Label>
                    </div>
                  </RadioGroup>
                </div>

              {/* Features & Brand Status - Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-accent text-base font-semibold">
                    What features does your business need? <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span> <span className="text-foreground text-sm font-medium">(select all that apply)</span>
                  </Label>
                  <div className="space-y-2">
                    {[
                      { id: "contact-form", label: "Contact form" },
                      { id: "booking", label: "Booking" },
                      { id: "payments", label: "Payments" },
                      { id: "online-ordering", label: "Online ordering" },
                      { id: "automations", label: "Automations" },
                      { id: "other", label: "Other" }
                    ].map((feature) => (
                       <div key={feature.id} className="flex items-center space-x-2 bg-background/50 p-2 rounded-lg border border-border hover:border-accent/50 transition-colors">
                         <Checkbox
                           id={feature.id}
                           checked={formData.featuresNeeded.includes(feature.id)}
                           onCheckedChange={() => toggleFeature(feature.id)}
                         />
                         <Label htmlFor={feature.id} className="cursor-pointer flex-1 text-base font-medium text-foreground">
                           {feature.label}
                         </Label>
                       </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-accent text-base font-semibold">
                    Branding <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                  </Label>
                  <RadioGroup
                    value={formData.brandContentStatus}
                    onValueChange={(value) => setFormData({ ...formData, brandContentStatus: value })}
                    className="space-y-2"
                    required
                  >
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="have-ready" id="have-ready" />
                      <Label htmlFor="have-ready" className="cursor-pointer flex-1 text-base font-medium text-foreground">Have ready</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="need-branding" id="need-branding" />
                      <Label htmlFor="need-branding" className="cursor-pointer flex-1 text-base font-medium text-foreground">Need branding</Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Conditional text box - unlocked when "Other" is selected in Features needed */}
                  <div className="space-y-1.5 pt-2">
                    <Label htmlFor="otherFeatureDetails" className={`text-base font-semibold ${formData.featuresNeeded.includes("other") ? "text-accent" : "text-muted-foreground"}`}>
                      What other features do you need?
                    </Label>
                    <Textarea
                      id="otherFeatureDetails"
                      value={formData.otherFeatureDetails}
                      onChange={(e) => setFormData({ ...formData, otherFeatureDetails: e.target.value })}
                      placeholder={formData.featuresNeeded.includes("other") ? "Describe the other features you need..." : "Select 'Other' in Features needed to unlock this field"}
                      disabled={!formData.featuresNeeded.includes("other")}
                      rows={6}
                      className={`text-sm transition-all min-h-[160px] ${formData.featuresNeeded.includes("other") ? "bg-background/50" : "bg-background/20 cursor-not-allowed opacity-50"}`}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="additionalNotes" className="text-accent text-base font-semibold">
                  Anything else we should know?
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Share any additional details..."
                  rows={3}
                  className="bg-background/50 text-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Done, get my estimate.
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                We respect your privacy. Your information will never be shared with third parties.
              </p>
            </form>
          </div>
        </section>
        
        <Footer />
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={(open) => {
        setShowResult(open);
        if (!open) navigate("/");
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-accent mb-4">
              We've Generated Your Build Plan!
            </DialogTitle>
            <DialogDescription className="text-base space-y-4">
              <p className="text-foreground font-semibold">Based on your answers, here is the Excellion tier that fits your goals.</p>
              
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-accent font-bold text-2xl mb-2">{getPlanContent().title}</p>
                <p className="text-foreground">{getPlanContent().description}</p>
              </div>
              
              <div>
                <p className="text-foreground font-semibold mb-2">What this usually includes:</p>
                <ul className="space-y-1.5 ml-4">
                  {getPlanContent().includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-foreground">
                      <span className="text-accent mt-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-foreground font-semibold">Typical investment:</p>
                <p className="text-accent font-bold text-xl">{getPlanContent().pricing}</p>
              </div>

              <p className="text-sm text-muted-foreground pt-2">
                {getPlanContent().footerLine}
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default Survey;
