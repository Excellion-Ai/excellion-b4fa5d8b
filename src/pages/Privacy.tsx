import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Excellion</title>
        <meta name="description" content="Privacy policy for Excellion AI-powered course builder." />
        <link rel="canonical" href="https://excellion.lovable.app/privacy" />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Privacy policy content coming soon.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Privacy;
