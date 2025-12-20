import { useState } from 'react';
import { SiteSection, SiteTheme, FAQContent, FAQItem } from '@/types/app-spec';
import { ChevronDown } from 'lucide-react';
import { ScrollAnimation } from '../animations/ScrollAnimations';

interface FAQSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

const defaultFAQs: FAQItem[] = [
  { 
    question: 'How do I get started?', 
    answer: "Simply sign up for an account and follow our quick onboarding process. You'll be up and running in minutes."
  },
  { 
    question: 'What payment methods do you accept?', 
    answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.'
  },
  { 
    question: 'Can I cancel my subscription anytime?', 
    answer: 'Yes, you can cancel your subscription at any time with no questions asked. We offer a 30-day money-back guarantee.'
  },
  { 
    question: 'Do you offer customer support?', 
    answer: 'Absolutely! Our support team is available 24/7 via email, chat, and phone for Pro and Enterprise customers.'
  },
];

export function FAQSection({ section, theme }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const content = section.content as FAQContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || section.label || 'Frequently Asked Questions';
  const subtitle = content?.subtitle || section.description || 'Find answers to common questions';
  const items = content?.items || defaultFAQs;

  return (
    <section 
      id={section.id}
      className="py-10 md:py-14 px-6 w-full"
      style={{ 
        backgroundColor: isDark ? '#111111' : '#ffffff'
      }}
    >
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <ScrollAnimation animation="fade-up">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ 
                fontFamily: theme.fontHeading || 'system-ui',
                color: isDark ? '#ffffff' : '#111827'
              }}
            >
              {title}
            </h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fade-up" delay={100}>
            <p 
              className="text-lg"
              style={{ 
                fontFamily: theme.fontBody || 'system-ui',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}
            >
              {subtitle}
            </p>
          </ScrollAnimation>
        </div>
        
        <div className="space-y-4">
          {items.slice(0, 8).map((faq, index) => (
            <ScrollAnimation 
              key={index} 
              animation="fade-up" 
              delay={index * 75}
            >
              <div 
                className="rounded-xl overflow-hidden"
                style={{ 
                  backgroundColor: isDark ? '#1f1f1f' : '#f9fafb',
                }}
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span 
                    className="font-semibold"
                    style={{ 
                      fontFamily: theme.fontHeading || 'system-ui',
                      color: isDark ? '#ffffff' : '#111827'
                    }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                    style={{ color: theme.primaryColor }}
                  />
                </button>
                <div 
                  className="overflow-hidden transition-all duration-300"
                  style={{ 
                    maxHeight: openIndex === index ? '200px' : '0',
                    opacity: openIndex === index ? 1 : 0
                  }}
                >
                  <div 
                    className="px-6 pb-4"
                    style={{ 
                      fontFamily: theme.fontBody || 'system-ui',
                      color: isDark ? '#d1d5db' : '#4b5563'
                    }}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
