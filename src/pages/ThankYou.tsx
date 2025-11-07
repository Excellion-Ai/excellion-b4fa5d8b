import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import dfyBackgroundVideo from "@/assets/dfy-background-new.mp4";

const ThankYou = () => {
  const navigate = useNavigate();

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
        
        <section className="container mx-auto px-6 py-24 min-h-[80vh] flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-accent/20 p-6 backdrop-blur-sm border border-accent/30">
                <CheckCircle2 className="w-16 h-16 text-accent" />
              </div>
            </div>

            {/* Thank You Message */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Thank You!
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Your quote request has been received.
            </p>

            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-8 mb-8">
              <p className="text-lg text-foreground mb-4">
                We'll reach out shortly with a detailed quote tailored to your project needs.
              </p>
              
              <p className="text-muted-foreground">
                Our team typically responds within <span className="text-accent font-semibold">24 hours</span>. 
                In the meantime, feel free to explore our services or reach out if you have any questions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/")}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => navigate("/contact")}
                size="lg"
                variant="outline"
                className="border-accent/50 hover:bg-accent/10"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
};

export default ThankYou;
