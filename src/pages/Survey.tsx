import { useState } from "react";
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
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number must be less than 20 characters"),
  brandName: z.string().trim().min(1, "Brand name is required").max(100, "Brand name must be less than 100 characters"),
  mainOutcome: z.enum(["professional", "leads", "sell-online", "convert-better"]),
  featuresNeeded: z.array(z.string()).min(1, "Please select at least one feature"),
  brandContentStatus: z.enum(["have-ready", "need-branding"]),
  timeline: z.enum(["2-3-days", "4-7-days"]),
  additionalNotes: z.string().max(1000, "Additional notes must be less than 1000 characters").optional()
});

const Survey = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const [qualifiedPlan, setQualifiedPlan] = useState("");
  const [formData, setFormData] = useState({
    name: "",
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
        email: null,
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

    // Show result modal
    setShowResult(true);
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
          title: "You qualify for the Premium Build",
          description: "Based on your answers, you qualify for our Premium Build — best for complex projects with multiple features, deeper branding/content support, or faster timelines.",
          includes: [
            "7+ pages or complex flows",
            "Online store or ordering, payments, advanced automations, or custom experiences",
            "Optional full brand + content support",
            "Priority handling and white-glove launch"
          ],
          pricing: "$3,000 – $10,000",
          footerLine: "You qualify for Premium. We've received your details and will email a detailed Premium estimate and link to book a call.",
          buttonText: "Talk with Excellion About Your Premium Build"
        };
      case "Core":
        return {
          title: "You qualify for the Core Build",
          description: "Based on your answers, you qualify for our Core Build — great for growing businesses that want more features and stronger lead generation without a super heavy setup.",
          includes: [
            "4–6 pages with a guided user journey",
            "Features like booking, lead capture, forms, basic automations, or simple integrations",
            "Built to support active leads, clients, and campaigns"
          ],
          pricing: "$1,200 – $2,800",
          footerLine: "You qualify for Core. We've received your details and will email a detailed Core estimate and link to book a call.",
          buttonText: "Book a Core Build Call"
        };
      default:
        return {
          title: "You qualify for the Essential Build",
          description: "Based on your answers, you qualify for our Essential Build — ideal for a clean, professional site with a few key features and a straightforward setup.",
          includes: [
            "1–3 core pages (Home, About, Services, Contact)",
            "Modern, conversion-focused layout",
            "Contact or quote form so people can reach you fast"
          ],
          pricing: "$600 – $1,000",
          footerLine: "You qualify for Essential. We've received your details and will email a detailed Essential estimate and link to book a call.",
          buttonText: "Book an Essential Call"
        };
    }
  };

  return (
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
            <div className="text-center mb-12 bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-accent/20">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Fill out a quick survey, and we'll send your <span className="text-accent">estimate</span> plus a link to book a call by email or text.
              </h1>
            </div>

            {/* Survey Form */}
            <form onSubmit={handleSubmit} className="bg-black/80 backdrop-blur-md border border-accent/30 rounded-2xl p-6 md:p-8 space-y-5 shadow-xl">
              {/* Contact Info - Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-accent text-base font-semibold">
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    required
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
                    Main outcome <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
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
                    Launch timeline <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
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
                    Features needed <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span> <span className="text-foreground text-sm font-medium">(select all that apply)</span>
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
                </div>
              </div>

              {/* Conditional text box for "Other" features - appears below the grid */}
              {formData.featuresNeeded.includes("other") && (
                <div className="space-y-1.5">
                  <Label htmlFor="otherFeatureDetails" className="text-accent text-base font-semibold">
                    What other features do you need?
                  </Label>
                  <Textarea
                    id="otherFeatureDetails"
                    value={formData.otherFeatureDetails}
                    onChange={(e) => setFormData({ ...formData, otherFeatureDetails: e.target.value })}
                    placeholder="Describe the other features you need..."
                    rows={5}
                    className="bg-background/50 text-sm"
                  />
                </div>
              )}

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
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-accent mb-4">
              {getPlanContent().title}
            </DialogTitle>
            <DialogDescription className="text-base space-y-4">
              <p className="text-foreground">{getPlanContent().description}</p>
              
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
  );
};

export default Survey;
