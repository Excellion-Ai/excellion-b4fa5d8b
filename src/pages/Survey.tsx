import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import dfyBackgroundVideo from "@/assets/dfy-background-new.mp4";

const Survey = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.projectType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Insert into database
    const { error } = await supabase
      .from('quote_requests')
      .insert({
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        project_type: formData.projectType,
        budget: formData.budget || null,
        timeline: formData.timeline || null,
        description: formData.description || null
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

    // Navigate to thank you page
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
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
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <span className="text-sm font-medium text-accent">📋 Free Quote Survey</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Let's Build Something <span className="text-accent">Amazing</span>
              </h1>
              
              <p className="text-lg text-muted-foreground">
                Tell us about your project and we'll provide a free, detailed quote within 24 hours.
              </p>
            </div>

            {/* Survey Form */}
            <form onSubmit={handleSubmit} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-8 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name <span className="text-accent">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="bg-background/50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address <span className="text-accent">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  className="bg-background/50"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-foreground">
                  Company Name (Optional)
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your Company Inc."
                  className="bg-background/50"
                />
              </div>

              {/* Project Type */}
              <div className="space-y-2">
                <Label className="text-foreground">
                  Project Type <span className="text-accent">*</span>
                </Label>
                <RadioGroup
                  value={formData.projectType}
                  onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 bg-background/50 p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
                    <RadioGroupItem value="website" id="website" />
                    <Label htmlFor="website" className="cursor-pointer flex-1">Website</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-background/50 p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
                    <RadioGroupItem value="webapp" id="webapp" />
                    <Label htmlFor="webapp" className="cursor-pointer flex-1">Web Application</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-background/50 p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
                    <RadioGroupItem value="ecommerce" id="ecommerce" />
                    <Label htmlFor="ecommerce" className="cursor-pointer flex-1">E-commerce</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-background/50 p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer flex-1">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-foreground">
                  Budget Range
                </Label>
                <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-5k">Under $5,000</SelectItem>
                    <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="over-50k">Over $50,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-foreground">
                  Desired Timeline
                </Label>
                <Select value={formData.timeline} onValueChange={(value) => setFormData({ ...formData, timeline: value })}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="When do you need this completed?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP (1-2 weeks)</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="2-3-months">2-3 Months</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your project vision, key features you need, and any specific requirements..."
                  rows={6}
                  className="bg-background/50"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Get My Free Quote
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                We respect your privacy. Your information will never be shared with third parties.
              </p>
            </form>
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
};

export default Survey;
