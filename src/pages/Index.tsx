import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LazyFooter from "@/components/LazyFooter";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Excellion Websites | Free Website Estimate & Custom Mockup</title>
        <meta name="description" content="Excellion Websites provides professional custom web builds and AI-assisted design. Get a free estimate and personalized launch plan today." />
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
