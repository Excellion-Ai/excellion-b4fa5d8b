import { useState } from 'react';
import { SiteSection, SiteTheme } from '@/types/app-spec';
import { ChevronDown } from 'lucide-react';

interface FAQSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

const defaultFAQs = [
  { 
    question: 'How do I get started?', 
    answer: 'Simply sign up for an account and follow our quick onboarding process. You\'ll be up and running in minutes.'
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

  return (
    <section 
      id={section.id}
      className="py-20 px-6"
      style={{ 
        backgroundColor: theme.darkMode ? '#111111' : '#ffffff'
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: theme.fontHeading,
              color: theme.darkMode ? '#ffffff' : '#111827'
            }}
          >
            {section.label || 'Frequently Asked Questions'}
          </h2>
          <p 
            className="text-lg"
            style={{ 
              fontFamily: theme.fontBody,
              color: theme.darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            {section.description || 'Find answers to common questions'}
          </p>
        </div>
        
        <div className="space-y-4">
          {defaultFAQs.map((faq, index) => (
            <div 
              key={index}
              className="rounded-xl overflow-hidden"
              style={{ 
                backgroundColor: theme.darkMode ? '#1f1f1f' : '#f9fafb',
              }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span 
                  className="font-semibold"
                  style={{ 
                    fontFamily: theme.fontHeading,
                    color: theme.darkMode ? '#ffffff' : '#111827'
                  }}
                >
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: theme.primaryColor }}
                />
              </button>
              {openIndex === index && (
                <div 
                  className="px-6 pb-4"
                  style={{ 
                    fontFamily: theme.fontBody,
                    color: theme.darkMode ? '#d1d5db' : '#4b5563'
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
