import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LazyFooter from "@/components/LazyFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <LazyFooter />
    </div>
  );
};

export default Index;
