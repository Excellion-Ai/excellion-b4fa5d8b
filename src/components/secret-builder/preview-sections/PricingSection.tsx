import { SiteSection, SiteTheme, PricingContent, PricingTier } from '@/types/app-spec';
import { Check } from 'lucide-react';
import { ScrollAnimation } from '../animations/ScrollAnimations';
import { EditableText } from '../EditableText';
import { RenderMode } from '../SiteRenderer';

interface PricingSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  renderMode?: RenderMode;
  onUpdateContent?: (field: keyof PricingContent, value: string) => void;
  onUpdateItem?: (index: number, field: keyof PricingTier, value: string | string[]) => void;
}

export function PricingSection({ 
  section, 
  theme, 
  renderMode = 'preview',
  onUpdateContent, 
  onUpdateItem 
}: PricingSectionProps) {
  const content = section.content as PricingContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  // SPEC-FIRST: Use exactly what AI provided
  const title = content?.title || section.label || 'Pricing';
  const subtitle = content?.subtitle || section.description || '';
  const items = content?.items || [];
  
  // If no pricing items, show empty state
  if (items.length === 0) {
    return (
      <section 
        id={section.id}
        className="py-10 md:py-14 px-6 w-full min-h-[200px] contain-layout flex items-center justify-center"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <div className="text-center" style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>
          <p className="text-sm">Pricing section - add your packages</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id={section.id}
      className="py-10 md:py-14 px-6 w-full min-h-[350px] contain-layout"
      style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
    >
      <div className="w-full">
        <div className="text-center mb-8">
          <ScrollAnimation animation="fade-up">
            {onUpdateContent ? (
              <EditableText
                value={title}
                onSave={(val) => onUpdateContent('title', val)}
                as="h2"
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: isDark ? '#ffffff' : '#111827'
                }}
              />
            ) : (
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: isDark ? '#ffffff' : '#111827'
                }}
              >
                {title}
              </h2>
            )}
          </ScrollAnimation>
          {subtitle && (
            <ScrollAnimation animation="fade-up" delay={100}>
              {onUpdateContent ? (
                <EditableText
                  value={subtitle}
                  onSave={(val) => onUpdateContent('subtitle', val)}
                  as="p"
                  className="text-lg max-w-2xl mx-auto"
                  style={{ 
                    fontFamily: theme.fontBody || 'system-ui',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}
                />
              ) : (
                <p 
                  className="text-lg max-w-2xl mx-auto"
                  style={{ 
                    fontFamily: theme.fontBody || 'system-ui',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}
                >
                  {subtitle}
                </p>
              )}
            </ScrollAnimation>
          )}
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
                {onUpdateItem ? (
                  <EditableText
                    value={plan.name}
                    onSave={(val) => onUpdateItem(index, 'name', val)}
                    as="h3"
                    className="text-lg md:text-xl font-semibold mb-2"
                    style={{ 
                      fontFamily: theme.fontHeading || 'system-ui',
                      color: plan.highlighted ? '#ffffff' : (isDark ? '#ffffff' : '#111827')
                    }}
                  />
                ) : (
                  <h3 
                    className="text-lg md:text-xl font-semibold mb-2"
                    style={{ 
                      fontFamily: theme.fontHeading || 'system-ui',
                      color: plan.highlighted ? '#ffffff' : (isDark ? '#ffffff' : '#111827')
                    }}
                  >
                    {plan.name}
                  </h3>
                )}
                <div className="mb-4 md:mb-6">
                  {onUpdateItem ? (
                    <EditableText
                      value={plan.price}
                      onSave={(val) => onUpdateItem(index, 'price', val)}
                      as="span"
                      className="text-3xl md:text-4xl font-bold"
                      style={{ 
                        color: plan.highlighted ? '#ffffff' : (isDark ? '#ffffff' : '#111827')
                      }}
                    />
                  ) : (
                    <span 
                      className="text-3xl md:text-4xl font-bold"
                      style={{ 
                        color: plan.highlighted ? '#ffffff' : (isDark ? '#ffffff' : '#111827')
                      }}
                    >
                      {plan.price}
                    </span>
                  )}
                  {plan.period && (
                    <span 
                      className="text-sm md:text-base"
                      style={{ 
                        color: plan.highlighted ? 'rgba(255,255,255,0.8)' : (isDark ? '#9ca3af' : '#6b7280')
                      }}
                    >
                      {plan.period}
                    </span>
                  )}
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