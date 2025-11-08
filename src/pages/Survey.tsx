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

const Survey = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const [qualifiedPlan, setQualifiedPlan] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brandName: "",
    projectType: "",
    mainOutcome: "",
    pagesNeeded: "",
    featuresNeeded: [] as string[],
    brandContentStatus: "",
    timeline: "",
    additionalNotes: ""
  });

  const qualifyPlan = () => {
    // Premium Build conditions
    const isPremium = 
      formData.projectType === "online-store" ||
      formData.featuresNeeded.includes("online-ordering") ||
      formData.pagesNeeded === "7-10" ||
      formData.pagesNeeded === "10-plus" ||
      formData.brandContentStatus === "need-branding-content" ||
      formData.timeline === "2-3-days";

    if (isPremium) return "Premium";

    // Core Build conditions
    const isCore = 
      formData.projectType === "website-with-features" ||
      formData.pagesNeeded === "4-6" ||
      formData.featuresNeeded.some(f => ["booking", "email-capture", "payments", "automations"].includes(f)) ||
      formData.timeline === "3-5-days";

    if (isCore) return "Core";

    // Essential Build (default)
    return "Essential";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.brandName || !formData.projectType || 
        !formData.mainOutcome || !formData.pagesNeeded || formData.featuresNeeded.length === 0 || 
        !formData.brandContentStatus || !formData.timeline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Determine qualified plan
    const plan = qualifyPlan();
    setQualifiedPlan(plan);

    // Insert into database
    const { error } = await supabase
      .from('quote_requests')
      .insert({
        name: formData.name,
        email: formData.email,
        brand_name: formData.brandName,
        project_type: formData.projectType,
        main_outcome: formData.mainOutcome,
        pages_needed: formData.pagesNeeded,
        features_needed: formData.featuresNeeded,
        brand_content_status: formData.brandContentStatus,
        timeline: formData.timeline,
        additional_notes: formData.additionalNotes || null,
        qualified_plan: plan
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
      console.error("Error submitting quote request:", error);
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
          description: "Your answers show you're building something bigger—advanced features, higher volume, or a faster rollout—so you qualify for Premium.",
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
          description: "Your project needs more than a basic landing page—and your answers clearly qualify you for Core.",
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
          description: "Based on your answers, you're a perfect fit for our Essential Build — a clean, high-trust site without unnecessary complexity.",
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
                Share your vision in a quick survey, and we'll send your <span className="text-accent">estimate</span> plus a link to book a call by email or text.
              </h1>
            </div>

            {/* Survey Form */}
            <form onSubmit={handleSubmit} className="bg-black/80 backdrop-blur-md border border-accent/30 rounded-2xl p-6 md:p-8 space-y-5 shadow-xl">
              {/* Contact Info - Grid Layout */}
              <div className="grid md:grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-accent text-base font-semibold">
                    Email <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="bg-background/50 h-9"
                  />
                </div>
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

              {/* Project Type & Main Outcome - Side by Side */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-accent text-base font-semibold">
                    What do you want us to build? <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                  </Label>
                  <RadioGroup
                    value={formData.projectType}
                    onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                    className="space-y-2"
                    required
                  >
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="simple-website" id="simple-website" />
                      <Label htmlFor="simple-website" className="cursor-pointer flex-1 text-base font-medium text-foreground">Simple website / landing page</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="website-with-features" id="website-with-features" />
                      <Label htmlFor="website-with-features" className="cursor-pointer flex-1 text-base font-medium text-foreground">Website with features</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="online-store" id="online-store" />
                      <Label htmlFor="online-store" className="cursor-pointer flex-1 text-base font-medium text-foreground">Online store</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="lead-gen-funnel" id="lead-gen-funnel" />
                      <Label htmlFor="lead-gen-funnel" className="cursor-pointer flex-1 text-base font-medium text-foreground">Lead-gen funnel</Label>
                    </div>
                  </RadioGroup>
                </div>

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
              </div>

              {/* Pages & Timeline - Compact Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-accent text-base font-semibold">
                    How many pages? <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
                  </Label>
                  <RadioGroup
                    value={formData.pagesNeeded}
                    onValueChange={(value) => setFormData({ ...formData, pagesNeeded: value })}
                    className="grid grid-cols-2 gap-2"
                    required
                  >
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="1-3" id="1-3" />
                      <Label htmlFor="1-3" className="cursor-pointer flex-1 text-base font-medium text-foreground">1–3</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="4-6" id="4-6" />
                      <Label htmlFor="4-6" className="cursor-pointer flex-1 text-base font-medium text-foreground">4–6</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="7-10" id="7-10" />
                      <Label htmlFor="7-10" className="cursor-pointer flex-1 text-base font-medium text-foreground">7–10</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="10-plus" id="10-plus" />
                      <Label htmlFor="10-plus" className="cursor-pointer flex-1 text-base font-medium text-foreground">10+</Label>
                    </div>
                  </RadioGroup>
                </div>

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
                      <RadioGroupItem value="3-5-days" id="3-5-days" />
                      <Label htmlFor="3-5-days" className="cursor-pointer flex-1 text-base font-medium text-foreground">3–5 days</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="5-7-days" id="5-7-days" />
                      <Label htmlFor="5-7-days" className="cursor-pointer flex-1 text-base font-medium text-foreground">5–7 days</Label>
                    </div>
                  </RadioGroup>
                </div>
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
                      { id: "email-capture", label: "Email capture" },
                      { id: "payments", label: "Payments" },
                      { id: "online-ordering", label: "Online ordering" },
                      { id: "automations", label: "Automations" },
                      { id: "not-sure", label: "Not sure" }
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
                    Brand & content <span className="text-accent text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>*</span>
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
                      <RadioGroupItem value="need-help-finishing" id="need-help-finishing" />
                      <Label htmlFor="need-help-finishing" className="cursor-pointer flex-1 text-base font-medium text-foreground">Need help finishing</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-background/50 p-2.5 rounded-lg border border-border hover:border-accent/50 transition-colors">
                      <RadioGroupItem value="need-branding-content" id="need-branding-content" />
                      <Label htmlFor="need-branding-content" className="cursor-pointer flex-1 text-base font-medium text-foreground">Need branding + content</Label>
                    </div>
                  </RadioGroup>
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
