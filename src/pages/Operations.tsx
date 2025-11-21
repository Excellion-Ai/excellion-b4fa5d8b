import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, BookOpen, Egg, Users, Wrench } from "lucide-react";
import { Helmet } from "react-helmet-async";
import operationsBackgroundVideo from "@/assets/operations-background-new.mp4";

const Operations = () => {
  const sections = [
    {
      title: "What's Inside",
      icon: Sparkles,
      description: "Everything you need to build faster and smarter with Excellion.",
      items: [
        "Live Expert Help — Chat with Excellion pros for fast answers and build reviews",
        "Templates Library — Grab starter apps and workflows you can clone in minutes",
        "AI Prompt Builder — Craft better prompts for builders, ads, and automations",
        "Order Tracking — See your Expert Build status, milestones, and delivery ETA"
      ]
    },
    {
      title: "Community Lanes",
      icon: Users,
      description: "Join dedicated channels where creators share, learn, and collaborate.",
      items: [
        "#announcements — Launches, updates, and limited drops",
        "#showcase — Share your builds, get feedback, earn spotlights",
        "#help-desk — Quick questions, real answers",
        "#templates — New blueprints from the team + community",
        "#prompts — High-performing prompts, crits, and upgrades",
        "#build-requests — Scope an Expert Build, get a quote"
      ]
    },
    {
      title: "Build With Us",
      icon: BookOpen,
      description: "Get hands-on support whether you're DIY-ing or want expert help.",
      items: [
        "DIY Fast-Track — Step-by-step mini guides and 'copy → paste → ship' snippets",
        "Expert Build Queue — Priority intake, clear scope, transparent timelines",
        "Creator Perks — Beta access, partner slots, and first dibs on new features"
      ]
    },
    {
      title: "Learn & Level Up",
      icon: BookOpen,
      description: "Proven flows, powerful skills, and practical tooling to ship better work.",
      items: [
        "Micro-Workshops — 10–15 min sessions on one powerful skill",
        "Playbooks — Proven flows for creators, founders, and agencies",
        "Tooling Tips — Wire Excellion with your stack (Blink, Typeform, etc.)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <Helmet>
        <title>Operations Hub - Creator Community & Support | Excellion</title>
        <meta 
          name="description" 
          content="Join Excellion's creator hub. Access expert support, AI tools, templates, and a thriving community. Get help building faster with real-time assistance and resources." 
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "Excellion",
                "url": "https://excellion.ai",
                "logo": "https://excellion.ai/logo.png",
                "description": "Creator operations hub with expert support, AI tools, and community resources.",
                "sameAs": [
                  "https://discord.gg/tmDTkwVY9u"
                ]
              },
              {
                "@type": "WebPage",
                "name": "Creator Operations Hub",
                "description": "Central hub for creators, founders, and agencies. Access expert support, AI tools, templates, and community.",
                "url": "https://excellion.ai/operations",
                "breadcrumb": {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "Home",
                      "item": "https://excellion.ai"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": "Operations Hub",
                      "item": "https://excellion.ai/operations"
                    }
                  ]
                }
              },
              {
                "@type": "Product",
                "name": "Excellion Operations Hub",
                "description": "Complete creator support platform with live expert help, templates library, AI prompt builder, and order tracking.",
                "brand": {
                  "@type": "Brand",
                  "name": "Excellion"
                },
                "offers": {
                  "@type": "Offer",
                  "availability": "https://schema.org/InStock",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              }
            ]
          })}
        </script>
      </Helmet>

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
          <source src={operationsBackgroundVideo} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10">
        <Navigation />
      
      <main className="container mx-auto px-6 py-20">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Creator Operations Hub
            </h1>
            
            <p className="text-xl text-accent italic mt-4">
              Your central hub for expert support, community, and AI-powered tools
            </p>

            <p className="text-lg text-white font-semibold max-w-3xl mx-auto leading-relaxed mt-6">
              Welcome to Operations — Excellion's connected hub for creators, founders, and agencies. Access expert support, explore app templates, use our AI prompt builder, and track your custom builds. Connect with Excellion experts through Discord, get instant DIY support, or reach our team directly — all in one powerful space built for serious creators.
            </p>

            <a href="https://discord.gg/tmDTkwVY9u" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg mt-8"
              >
                Join the Community
              </Button>
            </a>
          </div>
        </div>

        {/* Site Maintenance Section - Centered */}
        <div id="maintenance" className="flex justify-center max-w-6xl mx-auto mb-16 scroll-mt-24">
          <Card 
            className="bg-card border-border hover:border-accent/50 transition-all duration-300 w-fit mx-auto"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Wrench className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">Site Maintenance</CardTitle>
              </div>
              <CardDescription className="text-base">
                We handle the tech, security, and updates so your site stays fast and safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
                  <span className="text-sm">Technical Health: Daily backups, plugin/core updates, and performance checks.</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
                  <span className="text-sm">Security Shield: 24/7 uptime monitoring, malware removal, and SSL management.</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
                  <span className="text-sm">Priority Support: Includes managed hosting, domain renewal, and content edits.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Feature Sections */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card 
                key={index}
                className="bg-card border-border hover:border-accent/50 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li 
                        key={idx}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Operations;
