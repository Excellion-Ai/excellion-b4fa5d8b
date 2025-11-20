import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Rocket, Code, Zap, Shield, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import dfyBackgroundVideo from "@/assets/dfy-background-new.mp4";

const DFY = () => {
  const navigate = useNavigate();
  const [showProcessModal, setShowProcessModal] = useState(false);
  
  const processSteps = [
    {
      number: "01",
      title: "Discovery",
      points: [
        "Share your vision in a quick intake (or survey): goals, pages, features, style. No tech talk.",
        "We map you to Essential, Core, or Premium and give you a clear estimate upfront.",
        "On our call, you see an initial layout already started. We adjust it live to match your brand, pages, and timeline.",
        "You leave with a locked plan: what we're building, how it works, and how fast it ships."
      ]
    },
    {
      number: "02",
      title: "Development",
      points: [
        "We lock in a clean visual system so everything feels sharp and consistent.",
        "Real engineers + AI tools deliver fast, reliable, maintainable builds.",
        "We set up what you actually need: forms, menus, bookings, quote flows, portals, automations, and integrations."
      ]
    },
    {
      number: "03",
      title: "Launch",
      points: [
        "We handle deployment end-to-end: domain, hosting, SSL, and final checks.",
        "Forms, bookings, checkouts, and mobile/desktop views are tested before launch.",
        "Need tweaks or new features later? Excellion stays available as your long-term build partner."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={(el) => {
            if (el) {
              el.playbackRate = 0.75;
              el.style.willChange = 'transform';
              el.setAttribute('playsinline', '');
              el.setAttribute('webkit-playsinline', '');
              el.setAttribute('disablePictureInPicture', '');
              if ('requestVideoFrameCallback' in el) {
                el.style.contentVisibility = 'auto';
              }
            }
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'translateZ(0) scale(1.0)', 
            minWidth: '100%', 
            minHeight: '100%',
            WebkitTransform: 'translateZ(0) scale(1.0)',
            filter: 'contrast(1.05) saturate(1.1) brightness(1.02)',
            contain: 'paint',
          } as React.CSSProperties}
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

      {/* Process Grid */}
      <section className="container mx-auto px-6 pt-4 pb-16">
        <h2 className="text-4xl font-bold text-center text-foreground mb-12">
          <span className="text-accent">3-step</span> process
        </h2>
        <div className="space-y-8 max-w-6xl mx-auto">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-8 hover:border-accent/50 transition-all"
            >
              <div className="flex gap-6 items-start">
                <div className="text-5xl font-bold text-accent/40">{step.number}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                  <ul className="space-y-3 text-muted-foreground list-disc ml-6">
                    {step.points.map((point, pointIndex) => (
                      <li key={pointIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      </div>

      {/* Fullscreen Process Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <div className="max-w-4xl mx-auto px-6 py-12 relative">
            {/* Process Content */}
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border/50 max-h-[85vh] overflow-y-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12">
                Our <span className="text-accent">Process</span>
              </h2>
              
              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="text-6xl font-bold text-accent">01</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-foreground mb-3">Discovery</h3>
                    <p className="text-lg text-muted-foreground">
                      Get a free website estimate based on your vision. Then book a call—we'll have a mockup ready, and we'll refine it together to match your brand and goals.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="text-6xl font-bold text-accent">02</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-foreground mb-3">Development</h3>
                    <p className="text-lg text-muted-foreground">
                      Expert developers build your website or app with clean, efficient code.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="text-6xl font-bold text-accent">03</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-foreground mb-3">Launch</h3>
                    <p className="text-lg text-muted-foreground">
                      We deploy your project and provide ongoing support for smooth operation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <div className="mt-12 text-center">
                <Button
                  size="lg"
                  onClick={() => {
                    setShowProcessModal(false);
                    navigate("/survey");
                  }}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-12 py-6 text-lg"
                >
                  Click to proceed
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DFY;
