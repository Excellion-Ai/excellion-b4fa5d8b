import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Rocket, Code, Zap, Shield, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import dfyBackgroundVideo from "@/assets/dfy-background-new.mp4";

const DFY = () => {
  const navigate = useNavigate();
  const [showProcessModal, setShowProcessModal] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const services = [
    {
      icon: <Code className="h-12 w-12 text-accent animate-code" />,
      title: "Custom Development",
      description: "Our expert developers build your entire website from scratch, tailored to your exact specifications."
    },
    {
      icon: <Zap className="h-12 w-12 text-accent animate-lightning" />,
      title: "Rapid Deployment",
      description: "Launch your project in days, not months. We handle everything from design to deployment."
    },
    {
      icon: <Shield className="h-12 w-12 text-accent animate-shield" />,
      title: "Full Support",
      description: "Get total support and peace of mind.\n\nWe handle all maintenance, updates, and tech support 24/7.\n\nYour business runs smoothly, guaranteed.\n\nGet instant help from our expert team in our private Discord."
    },
    {
      icon: <Rocket className="h-12 w-12 text-accent animate-rocket" />,
      title: "Scalable Solutions",
      description: "Built to grow with your business, from startup to enterprise-level assistance."
    }
  ];

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
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <span className="text-sm font-medium text-accent">✨ Done For You Service</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            We Build It <span className="text-accent">For You</span>
          </h1>
          
          <p className="text-xl text-foreground max-w-2xl mx-auto bg-background/80 backdrop-blur-sm px-6 py-4 rounded-lg border border-border/50">
            Sit back and relax while our expert team creates your perfect website.
          </p>

          <Button 
            size="lg"
            onClick={() => setShowProcessModal(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg mt-8"
          >
            Get quote
          </Button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-6 pt-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-8 hover:border-accent/50 transition-all"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-background/80 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-border/50">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Our <span className="text-accent">Process</span>
          </h2>
          
          <div className="space-y-8">
            {[
              { step: "01", title: "Discovery", description: "We get right to work. When we hop on the call, we'll have an initial mockup ready for you. We'll review it together and quickly align the design with your business goals." },
              { step: "02", title: "Development", description: "Expert developers build your website or app with clean, efficient code." },
              { step: "03", title: "Launch", description: "We deploy your project and provide ongoing support for smooth operation." }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="text-5xl font-bold text-accent/40">{item.step}</div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
      </div>

      {/* Fullscreen Process Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <div className="max-w-4xl mx-auto px-6 py-12 relative">
            {/* Close Button moved inside content card for better visibility on mobile */}

            {/* Process Content */}
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border/50 max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  navigate("/survey");
                }}
                className="absolute top-3 right-3 md:top-4 md:right-4 p-3 rounded-full bg-red-500 hover:bg-red-600 shadow-lg ring-1 ring-white/20 transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close and continue to survey"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12">
                Our <span className="text-accent">Process</span>
              </h2>
              
              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="text-6xl font-bold text-accent">01</div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-3">Discovery</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We get right to work. When we hop on the call, we'll have an initial mockup ready for you. We'll review it together and quickly align the design with your business goals.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="text-6xl font-bold text-accent">02</div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-3">Development</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Expert developers build your website or app with clean, efficient code.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="text-6xl font-bold text-accent">03</div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-3">Launch</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We deploy your project and provide ongoing support for smooth operation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DFY;
