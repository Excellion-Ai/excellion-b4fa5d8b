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
  
  const processSteps = [
    {
      number: "01",
      title: "Discovery: From Idea to Exact Game Plan",
      points: [
        "Share your vision in a quick intake (or survey): goals, pages, features, style. No tech talk.",
        "We map you to Essential, Core, or Premium and give you a clear estimate upfront.",
        "On our call, you see an initial layout already started. We adjust it live to match your brand, pages, and timeline.",
        "You leave with a locked plan: what we're building, how it works, and how fast it ships."
      ]
    },
    {
      number: "02",
      title: "Build: Design, Develop, Tighten",
      points: [
        "We lock in a clean visual system so everything feels sharp and consistent.",
        "Real engineers + AI tools deliver fast, reliable, maintainable builds.",
        "We set up what you actually need: forms, menus, bookings, quote flows, portals, automations, and integrations."
      ]
    },
    {
      number: "03",
      title: "Launch & Beyond: Live, Backed, Supported",
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
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-foreground mb-3">Discovery: From Idea to Exact Game Plan</h3>
                    <p className="text-lg text-muted-foreground mb-4">We don't waste your time with vague calls.</p>
                    <ul className="space-y-4 text-lg text-muted-foreground">
                      <li>
                        <strong className="text-foreground">Tell us what you want</strong><br />
                        A quick intake (or survey) captures your vision: industry, style, goals, features, and what "done" looks like for you. No tech talk needed.
                      </li>
                      <li>
                        <strong className="text-foreground">Instant alignment, upfront pricing</strong><br />
                        Using your answers, we map you to the right Excellion tier (Essential, Core, or Premium) and give you a clear estimate before we start. No surprise invoices.
                      </li>
                      <li>
                        <strong className="text-foreground">Live strategy + preview</strong><br />
                        When we meet, we're not starting from zero—you'll see an early layout or structure already in place. On the call we:
                        <ul className="ml-6 mt-2 space-y-1 list-disc">
                          <li>Move sections around live</li>
                          <li>Match visuals to your brand</li>
                          <li>Confirm pages, features, and deadlines</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-foreground">Outcome:</strong> You leave this step with a locked-in plan: what we're building, how it works, how fast it ships, and what it'll cost.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="text-6xl font-bold text-accent">02</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-foreground mb-3">Build: Design, Develop, Tighten</h3>
                    <p className="text-lg text-muted-foreground mb-4">Now we execute—fast, structured, and transparent.</p>
                    <ul className="space-y-4 text-lg text-muted-foreground">
                      <li>
                        <strong className="text-foreground">Polished visual system</strong><br />
                        We finalize the look: typography, colors, layout, and content flow so your brand feels sharp and consistent.
                      </li>
                      <li>
                        <strong className="text-foreground">Real engineers + smart tools</strong><br />
                        Excellion's AI workflows speed up production, but every build is reviewed and refined by experienced developers:
                        <ul className="ml-6 mt-2 space-y-1 list-disc">
                          <li>Clean, reliable code</li>
                          <li>Mobile-first layouts</li>
                          <li>Fast performance</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-foreground">Features built around outcomes</strong><br />
                        Whether it's selling, booking, collecting leads, or managing clients, we build exactly what your flow needs:
                        <ul className="ml-6 mt-2 space-y-1 list-disc">
                          <li>Forms, menus, bookings, quote flows</li>
                          <li>Simple dashboards or portals</li>
                          <li>Automations + integrations (email, CRM, payments, etc.)</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-foreground">You see it as it comes together</strong><br />
                        We share working previews instead of static screenshots, collect your feedback in simple rounds, and adjust as we go—no disappearing act.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="text-6xl font-bold text-accent">03</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-foreground mb-3">Launch & Beyond: Live, Backed, Supported</h3>
                    <p className="text-lg text-muted-foreground mb-4">Going live is handled end-to-end.</p>
                    <ul className="space-y-4 text-lg text-muted-foreground">
                      <li>
                        <strong className="text-foreground">Full deployment done for you</strong><br />
                        We:
                        <ul className="ml-6 mt-2 space-y-1 list-disc">
                          <li>Connect your domain</li>
                          <li>Set up hosting & SSL</li>
                          <li>Configure essential SEO structure</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-foreground">Quality checks before launch</strong><br />
                        Every key piece is tested:
                        <ul className="ml-6 mt-2 space-y-1 list-disc">
                          <li>Forms, flows, checkouts, bookings</li>
                          <li>Mobile & desktop views</li>
                          <li>Speed and basic security</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-foreground">Simple handoff (no overwhelm)</strong><br />
                        We show you how to update key content so you're not locked to a dev for every small change.
                      </li>
                      <li>
                        <strong className="text-foreground">Ongoing support if you want it</strong><br />
                        Need tweaks, new pages, or added features later? Excellion stays available as your build partner, not just a one-time project.
                      </li>
                    </ul>
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
