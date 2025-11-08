import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import faqBackgroundVideo from "@/assets/faq-background.mp4";

const FAQ = () => {
  const faqs = [
    {
      question: "What's the difference between DIY and DFY?",
      answer: "DIY (Do It Yourself) gives you access to our templates and tools to build your own website. DFY (Done For You) means our expert team builds everything for you based on your requirements."
    },
    {
      question: "How long does it take to get my website?",
      answer: "DIY templates are available instantly. For DFY services, typical turnaround is 7-14 days depending on complexity and current workload."
    },
    {
      question: "Can I switch from DIY to DFY later?",
      answer: "Absolutely! Many clients start with DIY and upgrade to DFY when they need professional help. We can take over any project at any stage."
    },
    {
      question: "What platforms do you build on?",
      answer: "We primarily use modern web technologies like React, ensuring your site is fast, secure, and easy to maintain. All sites are fully responsive and optimized for mobile devices."
    },
    {
      question: "Do you provide hosting?",
      answer: "Yes! All our sites come with reliable hosting included. We handle all technical aspects so you can focus on your business."
    },
    {
      question: "What kind of support do you offer?",
      answer: "All plans include Discord support. Join our server and ping @Excellion Support in #help-desk for quick assistance. Our team typically responds within 24 hours."
    },
    {
      question: "Can you help with ongoing maintenance?",
      answer: "Yes! Check out our Operations page for details on ongoing maintenance, updates, and support packages."
    },
    {
      question: "Do I own the code?",
      answer: "Yes! With both DIY and DFY, you own all the code and assets. We believe in full transparency and client ownership."
    },
    {
      question: "What if I need custom features?",
      answer: "We love custom work! Our DFY service includes custom feature development. Just describe what you need and we'll make it happen."
    },
    {
      question: "Do you offer refunds?",
      answer: "We stand behind our work. If you're not satisfied with a DFY project, contact us within 7 days of delivery to discuss options. DIY template purchases are non-refundable once accessed."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={(el) => el && (el.playbackRate = 0.75)}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
        >
          <source src={faqBackgroundVideo} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10">
        <Navigation />
      
        <main className="container mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl text-white font-semibold max-w-2xl mx-auto leading-relaxed">
            Got questions? We've got answers. Can't find what you're looking for? 
            Join our Discord and ask away!
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join our Discord community and get help from our team and other users.
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
    </div>
  );
};

export default FAQ;
