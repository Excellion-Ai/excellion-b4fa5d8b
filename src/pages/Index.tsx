import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LazyFooter from "@/components/LazyFooter";

const Index = () => {
  return (
    <>
      <Helmet>
         <title>Excellion — AI Course Builder for Fitness Creators</title>
        <meta name="description" content="Launch your fitness course in 1 weekend. Excellion generates your course outline, lesson plan, sales page copy, and student portal. Start for $19." />
        <link rel="canonical" href="https://excellionwebsites.com/" />
        <meta property="og:title" content="Excellion — AI Course Builder for Fitness Creators" />
        <meta property="og:description" content="Launch your fitness course in 1 weekend. Generate your outline, lesson plan, and sales page with AI." />
        <meta property="og:url" content="https://excellionwebsites.com/" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <Hero />
        </main>
        <LazyFooter />
      </div>
    </>
  );
};

export default Index;
