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
  const faqCategories = [
    {
      title: "Getting Started",
      items: [
        {
          question: "Do I need any technical skills to use this?",
          answer: "No. You answer questions in plain language, and Excellion AI handles the layout, copy, and page structure. You'll only need to approve things and connect your domain when you're ready."
        },
        {
          question: "How long does it take to build a website?",
          answer: "Your initial site can be generated in minutes. Most users have a polished, publish-ready site within an hour of starting—depending on how much customization you want to do."
        },
        {
          question: "What information do I need to get started?",
          answer: "Just your business name and a brief description of what you do. The AI will ask follow-up questions to fill in the rest. Having your logo and brand colors ready helps speed things up."
        },
        {
          question: "Can I see a preview before publishing?",
          answer: "Absolutely. You'll see a live preview as the AI builds your site, and you can make changes before going live. Nothing is published until you click the publish button."
        }
      ]
    },
    {
      title: "Editing & Customization",
      items: [
        {
          question: "What happens after the AI builds my site?",
          answer: "You can edit the text and sections yourself, then publish with one click when you're ready. Connect your domain and go live on your own timeline."
        },
        {
          question: "Can I change the design after it's generated?",
          answer: "Yes. You can customize colors, fonts, layouts, images, and text directly in the editor. You can also ask the AI to make changes by describing what you want."
        },
        {
          question: "Can I add my own images and videos?",
          answer: "Yes. Upload your own photos, videos, and graphics. You can also generate new images with Excellion AI, and it can suggest visuals that match your content and brand."
        },
        {
          question: "What if I don't like what the AI created?",
          answer: "Just tell the AI what you'd like changed. You can regenerate sections, adjust the tone, or completely restyle your site. The AI learns from your feedback to get closer to your vision."
        },
        {
          question: "Can I add custom sections or pages?",
          answer: "Yes. Create new pages, duplicate sections, and build custom layouts. Excellion AI can generate new sections from a prompt and help you refine structure, copy, and styling as you go."
        }
      ]
    },
    {
      title: "Publishing & Domains",
      items: [
        {
          question: "How do I publish my website?",
          answer: "Click the publish button when you're ready. Your site goes live instantly on a free subdomain, or you can connect your own custom domain."
        },
        {
          question: "Can I use my own domain name?",
          answer: "Yes. You can connect any domain you own. We'll guide you through updating your DNS settings—it usually takes just a few minutes to set up."
        },
        {
          question: "Is hosting included?",
          answer: "Yes. Hosting, SSL certificates, and CDN are all included. Your site is served from fast, global servers with automatic backups and 99.9% uptime."
        },
        {
          question: "Can I unpublish or take down my site?",
          answer: "Yes. You can unpublish your site at any time from the dashboard. Your content is saved and you can republish whenever you're ready."
        }
      ]
    },
    {
      title: "Pricing & Plans",
      items: [
        {
          question: "Is there a free plan?",
          answer: "Yes. You can build and preview your site for free. Publishing requires a paid plan, which includes hosting, your custom domain, and ongoing support."
        },
        {
          question: "Can I cancel anytime?",
          answer: "Yes. All plans are month-to-month with no long-term contracts. Cancel anytime from your account settings—your site stays live until the end of your billing period."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No. The price you see is the price you pay. Hosting, SSL, and standard support are all included. Custom domain registration is separate if you don't already own one."
        }
      ]
    },
    {
      title: "Features & Integrations",
      items: [
        {
          question: "How is this different from Wix or Squarespace?",
          answer: "Instead of starting from a generic template, Excellion AI writes custom copy and structures pages around your business. You get a site that actually sounds like you—not a fill-in-the-blank layout."
        },
        {
          question: "Can I add a contact form?",
          answer: "Yes. Contact forms are built-in and automatically connected. Form submissions go straight to your email, and you can add custom fields for your specific needs."
        },
        {
          question: "Does my site work on mobile?",
          answer: "Yes. All sites are fully responsive and optimized for phones, tablets, and desktops. The AI automatically adjusts layouts for different screen sizes."
        },
        {
          question: "Can I add analytics to track visitors?",
          answer: "Yes. Built-in analytics show you page views, visitor locations, and traffic sources. You can also connect Google Analytics or other tracking tools."
        },
        {
          question: "Can I integrate with other tools?",
          answer: "Yes. Connect your site to email marketing platforms, CRMs, payment processors, and more. We support popular integrations like Mailchimp, Stripe, and Calendly."
        }
      ]
    },
    {
      title: "Support & Security",
      items: [
        {
          question: "Can I talk to a real person if I get stuck?",
          answer: "Yes. You can call our support agent for step-by-step help. If it can't resolve your issue, you'll be transferred to a founder directly—no runaround."
        },
        {
          question: "Who owns the website once it's built?",
          answer: "You do. Your content, branding, and domain are yours, and you're free to move or export if your needs change later."
        },
        {
          question: "Is my website secure?",
          answer: "Yes. All sites include free SSL certificates, automatic security updates, and DDoS protection. Your data is encrypted and backed up regularly."
        },
        {
          question: "How fast will my website load?",
          answer: "Very fast. Sites are optimized for speed with compressed images, efficient code, and global CDN distribution. Most pages load in under 2 seconds."
        },
        {
          question: "Can I export my website?",
          answer: "Yes. You can export your site's code and content at any time. We don't lock you in—if you want to move to another platform, you can take everything with you."
        }
      ]
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

          <div className="max-w-3xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold text-foreground mb-6">{category.title}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.items.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${categoryIndex}-${index}`}
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
            ))}
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