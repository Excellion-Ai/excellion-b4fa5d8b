import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LazyFooter from "@/components/LazyFooter";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Excellion | AI-Powered Course Builder</title>
        <meta name="description" content="Create complete online courses in seconds with AI. Generate curriculum, lessons, and publish with your own domain. No coding required." />
        <link rel="canonical" href="https://excellionwebsites.com/" />
        <meta property="og:title" content="Excellion | AI-Powered Course Builder" />
        <meta property="og:description" content="Create complete online courses in seconds with AI. Generate curriculum, lessons, and publish with your own domain." />
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
