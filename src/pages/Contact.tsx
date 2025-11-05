import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Contact Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Need help? We're here for you. Choose your preferred way to reach us.
          </p>
        </div>

        {/* Contact Options */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Discord Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent transition-colors">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Discord Community
                </h2>
                <p className="text-muted-foreground mb-6">
                  Join our Discord server for instant support. Ping @Excellion Support in #help-desk or open a ticket for human support.
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
                  Join Discord Server
                </Button>
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent transition-colors">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Email Support
                </h2>
                <p className="text-muted-foreground mb-6">
                  Prefer email? Send us a message and we'll get back to you within 24 hours.
                </p>
              </div>
              <a 
                href="mailto:Excellionai@gmail.com"
                className="w-full"
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full font-semibold"
                >
                  Excellionai@gmail.com
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              What can we help you with?
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Technical support and troubleshooting</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Questions about DIY templates or DFY services</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Pricing and billing inquiries</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Custom feature requests and project consultations</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Ongoing maintenance and support packages</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
