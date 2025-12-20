import { SiteSection, SiteTheme, PricingContent, PricingTier } from '@/types/app-spec';
import { Check } from 'lucide-react';
import { ScrollAnimation } from '../animations/ScrollAnimations';

interface PricingSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

const defaultPlans: PricingTier[] = [
  { 
    name: 'Starter', 
    price: '$9', 
    period: '/month',
    features: ['Basic features', 'Email support', '1 user'],
    highlighted: false
  },
  { 
    name: 'Pro', 
    price: '$29', 
    period: '/month',
    features: ['All Starter features', 'Priority support', '5 users', 'Advanced analytics'],
    highlighted: true
  },
  { 
    name: 'Enterprise', 
    price: '$99', 
    period: '/month',
    features: ['All Pro features', 'Dedicated support', 'Unlimited users', 'Custom integrations'],
    highlighted: false
  },
];

export function PricingSection({ section, theme }: PricingSectionProps) {
  const content = section.content as PricingContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || section.label || 'Pricing';
  const subtitle = content?.subtitle || section.description || 'Choose the plan that works for you';
  const items = content?.items || defaultPlans;

  return (
    <section 
      id={section.id}
      className="py-20 px-6"
      style={{ 
        backgroundColor: isDark ? '#111111' : '#ffffff'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
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
              className="text-lg max-w-2xl mx-auto"
              style={{ 
                fontFamily: theme.fontBody || 'system-ui',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}
            >
              {subtitle}
            </p>
          </ScrollAnimation>
        </div>
        
        <div 
          className="grid gap-6 md:gap-8 justify-center"
          style={{
            gridTemplateColumns: items.length <= 2 
              ? 'repeat(auto-fit, minmax(280px, 1fr))' 
              : 'repeat(auto-fit, minmax(280px, 360px))',
            maxWidth: items.length <= 2 ? '800px' : '100%',
            margin: items.length <= 2 ? '0 auto' : undefined
          }}
        >
          {items.slice(0, 4).map((plan, index) => (
            <ScrollAnimation 
              key={index} 
              animation={plan.highlighted ? 'scale-up' : 'fade-up'} 
              delay={index * 150}
            >
              <div 
                className="p-6 md:p-8 rounded-2xl transition-all hover:scale-105 h-full flex flex-col"
                style={{ 
                  backgroundColor: plan.highlighted ? theme.primaryColor : (isDark ? '#1f1f1f' : '#f9fafb'),
                  boxShadow: plan.highlighted ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  minWidth: '260px'
                }}
              >
                <h3 
                  className="text-lg md:text-xl font-semibold mb-2"
                  style={{ 
                    fontFamily: theme.fontHeading || 'system-ui',
                    color: plan.highlighted ? '#ffffff' : (isDark ? '#ffffff' : '#111827')
                  }}
                >
                  {plan.name}
                </h3>
                <div className="mb-4 md:mb-6">
                  <span 
                    className="text-3xl md:text-4xl font-bold"
                    style={{ 
                      color: plan.highlighted ? '#ffffff' : (isDark ? '#ffffff' : '#111827')
                    }}
                  >
                    {plan.price}
                  </span>
                  <span 
                    className="text-sm md:text-base"
                    style={{ 
                      color: plan.highlighted ? 'rgba(255,255,255,0.8)' : (isDark ? '#9ca3af' : '#6b7280')
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check 
                        className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" 
                        style={{ color: plan.highlighted ? '#ffffff' : theme.primaryColor }}
                      />
                      <span 
                        className="text-xs md:text-sm leading-relaxed"
                        style={{ 
                          fontFamily: theme.fontBody || 'system-ui',
                          color: plan.highlighted ? 'rgba(255,255,255,0.9)' : (isDark ? '#d1d5db' : '#4b5563')
                        }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-2.5 md:py-3 rounded-lg font-semibold transition-all hover:opacity-90 text-sm md:text-base mt-auto"
                  style={{ 
                    backgroundColor: plan.highlighted ? '#ffffff' : theme.primaryColor,
                    color: plan.highlighted ? theme.primaryColor : '#ffffff'
                  }}
                >
                  {plan.ctaText || 'Get Started'}
                </button>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
