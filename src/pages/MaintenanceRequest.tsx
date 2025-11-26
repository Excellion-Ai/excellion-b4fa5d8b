import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Wrench, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import contactBackgroundVideo from "@/assets/contact-background.mp4";
import { z } from "zod";

const emailSchema = z.string().email();

const MaintenanceRequest = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setEmailValid(validateEmail(value));
    } else {
      setEmailValid(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB
      if (!isValidType) {
        toast.error(`${file.name} is not an image file`);
      } else if (!isValidSize) {
        toast.error(`${file.name} exceeds 20MB limit`);
      }
      return isValidType && isValidSize;
    });
    setImages(prev => [...prev, ...validFiles].slice(0, 20)); // Max 20 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !description || !priority) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to storage if any
      const imageUrls: string[] = [];
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('maintenance-images')
            .upload(filePath, image);

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('maintenance-images')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      // Send email notification via edge function
      const { error: emailError } = await supabase.functions.invoke('send-maintenance-request', {
        body: {
          name,
          email,
          websiteUrl,
          description,
          priority,
          imageUrls
        }
      });

      if (emailError) throw emailError;

      toast.success("Maintenance request submitted successfully!");
      
      // Reset form
      setName("");
      setEmail("");
      setEmailValid(null);
      setWebsiteUrl("");
      setDescription("");
      setPriority("");
      setImages([]);
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      toast.error("Failed to submit request. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Maintenance Request | Excellion Websites</title>
        <meta name="description" content="Submit a maintenance request for your Excellion website. Our team will respond within 24 hours to address your site changes or issues." />
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
            <source src={contactBackgroundVideo} type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10">
          <Navigation />
          
          <main className="container mx-auto px-6 py-24">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
                  <Wrench className="w-10 h-10 text-accent" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Maintenance Request
              </h1>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                Need changes or fixes? Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-semibold">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-semibold">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="john@example.com"
                      required
                      className="bg-background border-border text-foreground pr-10"
                    />
                    {emailValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {emailValid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Website URL Field */}
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-foreground font-semibold">
                    Website URL or Project Name
                  </Label>
                  <Input
                    id="websiteUrl"
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yoursite.com or Project Name"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Priority Field */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-foreground font-semibold">
                    Priority Level <span className="text-destructive">*</span>
                  </Label>
                  <Select value={priority} onValueChange={setPriority} required>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent - Site is down or critical issue</SelectItem>
                      <SelectItem value="high">High - Important feature not working</SelectItem>
                      <SelectItem value="normal">Normal - General maintenance or changes</SelectItem>
                      <SelectItem value="low">Low - Minor improvements or updates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground font-semibold">
                    Describe the Issue or Change Needed <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide as much detail as possible about what needs to be fixed or changed. Include steps to reproduce any issues, expected behavior, and any error messages you're seeing."
                    required
                    rows={6}
                    className="bg-background border-border text-foreground resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Tip: Include screenshots, error messages, and specific page URLs if applicable
                  </p>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="images" className="text-foreground font-semibold">
                    Add Screenshots or Images (Optional)
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('images')?.click()}
                        disabled={images.length >= 20}
                        className="bg-background border-border text-foreground hover:bg-accent/10"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {images.length}/20 images (max 20MB each)
                      </span>
                    </div>
                    
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {image.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Maintenance Request"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  We'll review your request and respond within 24 hours during business days
                </p>
              </form>

              {/* Alternative Contact Info */}
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Need immediate assistance? Reach us on Discord or email directly:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="https://discord.gg/tmDTkwVY9u" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Discord Support
                    </Button>
                  </a>
                  <a href="mailto:Excellionai@gmail.com">
                    <Button variant="outline" size="sm">
                      Excellionai@gmail.com
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default MaintenanceRequest;
