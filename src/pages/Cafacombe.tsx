import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Coffee, Users, Calendar, MapPin } from "lucide-react";

const Cafacombe = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Coffee className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Cafacombe Community</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Join the <span className="text-accent">Cafacombe</span> Experience
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A unique blend of technology, creativity, and community. Connect with fellow entrepreneurs and innovators.
          </p>

          <Button 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg mt-8"
          >
            Join Cafacombe
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Users className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Community</h3>
            <p className="text-muted-foreground">
              Connect with like-minded entrepreneurs and developers building the future.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Calendar className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Events</h3>
            <p className="text-muted-foreground">
              Regular meetups, workshops, and networking events to grow your skills.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <MapPin className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Workspace</h3>
            <p className="text-muted-foreground">
              Beautiful co-working space designed for productivity and collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            What is <span className="text-accent">Cafacombe</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            Cafacombe is more than just a place—it's a movement. Born from the intersection of café culture and technology, we've created a space where innovation happens naturally.
          </p>
          <p className="text-lg text-muted-foreground mb-4">
            Whether you're a startup founder, freelance developer, or creative professional, Cafacombe provides the environment and community you need to thrive.
          </p>
          <p className="text-lg text-muted-foreground">
            Join us for coffee, coding, and collaboration. Your next big breakthrough might be just a conversation away.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Cafacombe;
