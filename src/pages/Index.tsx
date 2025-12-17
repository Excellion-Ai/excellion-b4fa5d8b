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
        <meta name="description" content="Get a custom website mockup and clear pricing before you pay. Excellion builds fast, professional websites for small businesses. Book a free 15-minute consultation today." />
        <link rel="canonical" href="https://excellionwebsites.com/" />
        <meta property="og:title" content="Excellion Websites | Professional Web Builds in Days" />
        <meta property="og:description" content="Get a custom website mockup and clear pricing before you pay. Book a free 15-minute consultation." />
        <meta property="og:url" content="https://excellionwebsites.com/" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <Hero />
          <PortfolioShowcase />
        </main>
        <LazyFooter />
      </div>
    </>
  );
};

export default Index;
