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
          question: "Do I need technical skills to use Excellion?",
          answer: "No. If you can describe your course idea in plain language, Excellion can build your course site. No coding or design experience required."
        },
        {
          question: "How long does it take to build a course website?",
          answer: "Your first draft is generated in seconds. Most creators spend their time refining copy and structure before publishing."
        },
        {
          question: "What information do I need to get started?",
          answer: "You'll need to know who the course is for, what outcome it delivers, and how it's offered (self-paced, cohort, or coaching)."
        },
        {
          question: "Can I preview my course site before publishing?",
          answer: "Yes. You can view and edit your full course site draft before it goes live."
        }
      ]
    },
    {
      title: "Course-Specific Questions",
      items: [
        {
          question: "What kind of courses can I build with Excellion?",
          answer: "Excellion works for self-paced courses, cohort programs, coaching offers, workshops, and challenges in any niche."
        },
        {
          question: "Does Excellion support lessons and videos?",
          answer: "Yes. You can organize lessons, add video sections, and structure your course content directly in your site."
        },
        {
          question: "Can I sell my course directly from the site?",
          answer: "Yes. Excellion builds course sites with clear calls-to-action and checkout-ready sections for selling or collecting signups."
        },
        {
          question: "Can I create multiple courses or offers?",
          answer: "Yes. You can build and manage multiple course sites or offers inside Excellion."
        }
      ]
    },
    {
      title: "Editing & Customization",
      items: [
        {
          question: "What happens after the AI builds my course site?",
          answer: "You can edit pages, sections, lessons, and copy anytime using chat or the visual editor."
        },
        {
          question: "Can I change the design after it's generated?",
          answer: "Yes. You can adjust layout, style, and content whenever you want."
        },
        {
          question: "Can I add my own images and videos?",
          answer: "Yes. You can upload and embed your own images and videos throughout your course site."
        },
        {
          question: "What if I don't like the first draft?",
          answer: "You can regenerate sections, edit the copy, or guide the AI with new instructions until it matches your vision."
        }
      ]
    },
    {
      title: "Publishing & Domains",
      items: [
        {
          question: "How do I publish my course site?",
          answer: "Publish with one click when you're ready."
        },
        {
          question: "Can I use my own domain name?",
          answer: "Yes. You can connect a custom domain to your course site."
        },
        {
          question: "Is hosting included?",
          answer: "Yes. Hosting is included when your site is published."
        },
        {
          question: "Can I unpublish or take my site down later?",
          answer: "Yes. You can unpublish or update your site at any time."
        }
      ]
    },
    {
      title: "Pricing & Plans",
      items: [
        {
          question: "Is there a free plan?",
          answer: "You can start free with a draft course site before upgrading."
        },
        {
          question: "Can I cancel anytime?",
          answer: "Yes. There are no long-term contracts."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No. Pricing is transparent and shown clearly before you upgrade."
        }
      ]
    },
    {
      title: "Support & Security",
      items: [
        {
          question: "Can I talk to a real person if I get stuck?",
          answer: "Yes. You can reach our team through support or the community."
        },
        {
          question: "Who owns my course website and content?",
          answer: "You do. All course content and sites you create belong to you."
        },
        {
          question: "Is my course site secure?",
          answer: "Yes. Excellion uses modern hosting and security practices to keep your site protected."
        },
        {
          question: "How fast will my course site load?",
          answer: "Course sites are optimized for fast load times on desktop and mobile."
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Course Website Builder FAQ | Excellion</title>
        <meta name="description" content="Everything you need to know about building and launching a course website with Excellion AI." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about building and launching a course website with Excellion AI.
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