import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BuilderFAQ = () => {
  const faqItems = [
    {
      question: "Do I need any technical skills to use this?",
      answer: "No. You answer questions in plain language, and Excellion AI handles the layout, copy, and page structure. You'll only need to approve things and connect your domain when you're ready."
    },
    {
      question: "What happens after the AI builds my site?",
      answer: "You can edit the text and sections yourself, then publish with one click when you're ready. Connect your domain and go live on your own timeline."
    },
    {
      question: "Can I talk to a real person if I get stuck?",
      answer: "Yes. You can call our support agent for step-by-step help. If it can't resolve your issue, you'll be transferred to a founder directly—no runaround."
    },
    {
      question: "Who owns the website once it's built?",
      answer: "You do. Your content, branding, and domain are yours, and you're free to move or export if your needs change later."
    },
    {
      question: "How is this different from Wix or Squarespace?",
      answer: "Instead of starting from a generic template, Excellion AI writes custom copy and structures pages around your business. You get a site that actually sounds like you—not a fill-in-the-blank layout."
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI Website Builder FAQ | Excellion</title>
        <meta name="description" content="Frequently asked questions about Excellion's AI website builder. Learn how it works, what happens after your site is built, and more." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about building your website with Excellion AI.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-lg border border-border bg-card px-6"
                >
                  <AccordionTrigger className="text-foreground hover:no-underline text-left text-lg font-semibold hover:text-accent">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join our Discord community and get help from our team.
              </p>
              <a 
                href="https://discord.gg/tmDTkwVY9u" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3 rounded-lg transition-colors">
                  Join Discord
                </button>
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BuilderFAQ;