import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Wrench, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import contactBackgroundVideo from "@/assets/contact-background.mp4";

const MaintenanceRequest = () => {
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
          <source src={contactBackgroundVideo} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        <main className="container mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Maintenance Request
          </h1>
          <p className="text-2xl font-semibold text-foreground max-w-2xl mx-auto">
            Need help with your site? Submit a maintenance request and we'll take care of it.
          </p>
        </div>

        {/* Request Options */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Discord Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent transition-colors h-full">
            <div className="flex flex-col items-center text-center space-y-6 h-full">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Discord Support
                </h2>
                <p className="text-muted-foreground mb-6">
                  Submit your maintenance request via Discord. Ping @Excellion Support in #help-desk or open a ticket for immediate assistance.
                </p>
              </div>
              <a 
                href="https://discord.gg/tmDTkwVY9u" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Open Discord Request
                </Button>
              </a>
            </div>
          </div>

          {/* Direct Request Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent transition-colors h-full">
            <div className="flex flex-col items-center text-center space-y-6 h-full">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <Wrench className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Email Request
                </h2>
                <p className="text-muted-foreground mb-6">
                  Send us a detailed maintenance request via email and our team will respond within 24 hours.
                </p>
              </div>
              <a 
                href="mailto:Excellionai@gmail.com?subject=Maintenance%20Request"
                className="w-full"
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full font-semibold"
                >
                  Send Maintenance Email
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-3">
              What to Include in Your Request
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Your site URL or project name</li>
              <li>• Detailed description of the issue or change needed</li>
              <li>• Screenshots or videos if applicable</li>
              <li>• Priority level (urgent, normal, low)</li>
              <li>• Your preferred contact method for updates</li>
            </ul>
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </div>
  );
};

export default MaintenanceRequest;
