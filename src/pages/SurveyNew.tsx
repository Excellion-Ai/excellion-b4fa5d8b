import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const surveySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  businessName: z.string().trim().min(1, "Business name is required"),
  mainGoal: z.enum(["professional", "leads", "sell-online"]),
  timeline: z.enum(["2-3-days", "4-7-days"]),
  features: z.array(z.string()).min(1, "Select at least one feature")
});

const SurveyNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    mainGoal: "",
    timeline: "",
    features: [] as string[]
  });

  const progress = (step / 2) * 100;

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    try {
      surveySchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
      return;
    }

    setIsProcessing(true);

    // Determine qualified plan
    let plan = "Essential";
    const featureCount = formData.features.length;
    if (featureCount >= 3 || formData.mainGoal === "sell-online") {
      plan = "Core";
    }
    if (featureCount >= 4) {
      plan = "Premium";
    }

    // Get session
    const { data: { session } } = await supabase.auth.getSession();

    // Insert into database
    const { error } = await supabase
      .from('quote_requests')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: null,
        brand_name: formData.businessName,
        project_type: "funnel-survey",
        main_outcome: formData.mainGoal,
        features_needed: formData.features,
        brand_content_status: null,
        timeline: formData.timeline,
        additional_notes: null,
        qualified_plan: plan,
        user_id: session?.user?.id || null
      });

    if (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    // Send SMS notification
    try {
      await supabase.functions.invoke('send-survey-sms', {
        body: {
          name: formData.name,
          phone: formData.email, // Using email as identifier
          brandName: formData.businessName,
          mainOutcome: formData.mainGoal,
          featuresNeeded: formData.features,
          brandContentStatus: "not-specified",
          timeline: formData.timeline,
          qualifiedPlan: plan,
          additionalNotes: "",
          otherFeatureDetails: ""
        }
      });
    } catch (smsError) {
      console.error("Error sending SMS:", smsError);
    }

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/results');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Excellion</h1>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of 2</span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Let's Get Started</h2>
                  <p className="text-muted-foreground">Tell us about yourself and your business</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Your Company"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    if (formData.name && formData.email && formData.businessName) {
                      setStep(2);
                    } else {
                      toast({
                        title: "Required Fields",
                        description: "Please fill in all required fields",
                        variant: "destructive"
                      });
                    }
                  }}
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Your Project Details</h2>
                  <p className="text-muted-foreground">Help us understand your needs</p>
                </div>

                {/* Main Goal */}
                <div className="space-y-3">
                  <Label>What is your main goal? *</Label>
                  <RadioGroup
                    value={formData.mainGoal}
                    onValueChange={(value) => setFormData({ ...formData, mainGoal: value })}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer">
                      <RadioGroupItem value="professional" id="goal-professional" />
                      <Label htmlFor="goal-professional" className="flex-1 cursor-pointer">
                        Look professional online
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer">
                      <RadioGroupItem value="leads" id="goal-leads" />
                      <Label htmlFor="goal-leads" className="flex-1 cursor-pointer">
                        Get more leads
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer">
                      <RadioGroupItem value="sell-online" id="goal-sell" />
                      <Label htmlFor="goal-sell" className="flex-1 cursor-pointer">
                        Sell products/services online
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <Label>When do you need it launched? *</Label>
                  <RadioGroup
                    value={formData.timeline}
                    onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer">
                      <RadioGroupItem value="2-3-days" id="timeline-fast" />
                      <Label htmlFor="timeline-fast" className="flex-1 cursor-pointer">
                        2-3 days
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer">
                      <RadioGroupItem value="4-7-days" id="timeline-normal" />
                      <Label htmlFor="timeline-normal" className="flex-1 cursor-pointer">
                        4-7 days
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <Label>What features do you need? (Select all that apply) *</Label>
                  <div className="space-y-3">
                    {[
                      { id: "contact-form", label: "Contact Form" },
                      { id: "booking", label: "Booking System" },
                      { id: "newsletter", label: "Newsletter Signup" },
                      { id: "payments", label: "Payment Processing" }
                    ].map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer"
                        onClick={() => toggleFeature(feature.id)}
                      >
                        <Checkbox
                          id={feature.id}
                          checked={formData.features.includes(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                        <Label htmlFor={feature.id} className="flex-1 cursor-pointer">
                          {feature.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Get My Estimate"}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Excellion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SurveyNew;
