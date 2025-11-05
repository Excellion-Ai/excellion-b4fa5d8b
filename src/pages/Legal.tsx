import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import legalBackground from "@/assets/legal-background.mp4";

const Legal = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to the section based on hash
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={legalBackground} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10">
        <Navigation />
        
        <main className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Privacy Policy Section */}
          <section id="privacy" className="scroll-mt-24">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="text-sm text-muted-foreground/70">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Information We Collect</h2>
              <p>
                At Excellion, we collect information that you provide directly to us, including your name, email address, 
                company information, and project details when you submit forms or communicate with us.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, communicate with you 
                about your projects, send you updates and marketing communications (with your consent), and respond to 
                your inquiries and support requests.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personally identifiable information to third parties. 
                We may share your information with trusted service providers who assist us in operating our business, 
                provided they agree to keep this information confidential.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal information. You may also object to 
                or restrict certain processing of your data. To exercise these rights, please contact us at 
                Excellionai@gmail.com.
              </p>
            </div>
          </section>

          {/* Terms of Service Section */}
          <section id="terms" className="scroll-mt-24 pt-16 border-t border-border">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Terms of Service
            </h1>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="text-sm text-muted-foreground/70">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Acceptance of Terms</h2>
              <p>
                By accessing and using Excellion's services, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Services Description</h2>
              <p>
                Excellion provides web development services including DIY website builder templates and Done-For-You (DFY) 
                custom development services. We reserve the right to modify, suspend, or discontinue any service at any time.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">User Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account information and for all activities 
                that occur under your account. You agree to use our services only for lawful purposes and in accordance with 
                these Terms.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Payment Terms</h2>
              <p>
                For DFY services, payment terms will be specified in your project quote. DIY templates and subscriptions 
                are billed as indicated at the time of purchase. All payments are non-refundable unless otherwise stated.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Intellectual Property</h2>
              <p>
                Upon full payment, you own the code and assets delivered as part of your project. However, Excellion retains 
                the right to use general techniques, methodologies, and non-proprietary components in future projects.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Limitation of Liability</h2>
              <p>
                Excellion shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                resulting from your use or inability to use our services.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Termination</h2>
              <p>
                We reserve the right to terminate or suspend your access to our services at our sole discretion, without 
                notice, for conduct that we believe violates these Terms or is harmful to other users or our business.
              </p>
            </div>
          </section>

          {/* Cookie Policy Section */}
          <section id="cookies" className="scroll-mt-24 pt-16 border-t border-border">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Cookie Policy
            </h1>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="text-sm text-muted-foreground/70">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">What Are Cookies</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us 
                provide you with a better experience by remembering your preferences and understanding how you use our site.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Types of Cookies We Use</h2>
              <p>
                <strong>Essential Cookies:</strong> These cookies are necessary for our website to function properly. 
                They enable basic functions like page navigation and access to secure areas of the website.
              </p>
              <p>
                <strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our 
                website by collecting and reporting information anonymously.
              </p>
              <p>
                <strong>Preference Cookies:</strong> These cookies allow our website to remember choices you make 
                (such as your language or region) and provide enhanced, personalized features.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Managing Cookies</h2>
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on 
                your computer and you can set most browsers to prevent them from being placed. However, if you do this, 
                you may have to manually adjust some preferences every time you visit our site.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Third-Party Cookies</h2>
              <p>
                We may use third-party services that place cookies on your device. These services include analytics 
                providers and advertising networks. These third parties have their own privacy policies.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at Excellionai@gmail.com.
              </p>
            </div>
          </section>
        </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Legal;
