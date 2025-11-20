import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LazyFooter from "@/components/LazyFooter";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Excellion | Free Website Estimate & Custom Mockup</title>
        <meta name="description" content="Get a free professional website estimate and custom mockup in minutes. No obligation. See your build plan and price range instantly." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero />
        <LazyFooter />
      </div>
    </>
  );
};

export default Index;
