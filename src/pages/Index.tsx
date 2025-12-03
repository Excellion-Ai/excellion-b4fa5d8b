import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import LazyFooter from "@/components/LazyFooter";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Excellion Websites | Professional Web Builds in Days, Not Months</title>
        <meta name="description" content="Excellion Websites builds fast, professional websites for your business. Book a free 15-minute call to get a clear build plan and price." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero />
        <PortfolioShowcase />
        <LazyFooter />
      </div>
    </>
  );
};

export default Index;
