import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ClipboardCheck, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const LandingPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: User,
      title: "Share Your Vision",
      description: "Tell us about your business goals and what you need"
    },
    {
      icon: ClipboardCheck,
      title: "Get Build Plan & Estimate",
      description: "Receive a custom plan with timeline and pricing"
    },
    {
      icon: Phone,
      title: "Book a Quick Call",
      description: "Review your mockup and finalize details"
    }
  ];

  const faqs = [
    {
      question: "How much does a website cost?",
      answer: "Plans start at $600 for Essential builds. Core plans range from $1,200-$2,800, and Premium builds start at $3,000. Your exact price depends on your specific needs and features."
    },
    {
      question: "How long does it take?",
      answer: "Typical launch is 3-7 days depending on complexity. Essential sites can launch in 2-3 days, while more complex Premium builds may take up to 7 days."
    },
    {
      question: "What's included in the estimate?",
      answer: "You'll get a detailed breakdown of recommended features, timeline, pricing range, and next steps. No obligations, just clarity."
    },
    {
      question: "Do I need to provide content?",
      answer: "We can work with what you have or help create content. We'll discuss your content status during the estimate process."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Excellion</h1>
          <Button 
            onClick={() => navigate('/survey')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            Start Estimate
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Get a Free Website Estimate for Your Business
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Answer a few quick questions. We'll tell you what your website needs, 
            how fast we can launch it, and your estimated price range—no pressure, no jargon.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/survey')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-12 py-6 font-semibold"
          >
            Start My Free Estimate
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No spam. No obligation. Just a clear plan.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <ChevronDown className="w-8 h-8 text-muted-foreground animate-bounce" />
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20 bg-card/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-accent text-sm font-semibold mb-2">STEP {index + 1}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SEO Content Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
            Professional Web Design Tailored for Growth
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            Whether you are a local business or a new brand, we build sites that convert. 
            Fast load times, mobile-optimized, and SEO-ready. Get a modern website that 
            works as hard as you do—without the complexity or cost of traditional agencies.
          </p>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-20 bg-card/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center bg-primary/10 border border-primary/20 rounded-2xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get your free estimate in less than 2 minutes
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/survey')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-12 py-6 font-semibold"
          >
            Start My Free Estimate
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">&copy; 2025 Excellion. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
