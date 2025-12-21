import { SiteTheme } from '@/types/app-spec';
import { ScrollAnimation, StaggerContainer } from '../animations/ScrollAnimations';
import { CheckCircle } from 'lucide-react';

interface ServiceItem {
  title: string;
  description: string;
  price?: string;
  features?: string[];
  image?: string;
}

interface ServicesContent {
  title?: string;
  subtitle?: string;
  items?: ServiceItem[];
}

interface ServicesSectionProps {
  section: { id: string; content?: any };
  theme: SiteTheme;
  asTile?: boolean;
}

const defaultServices: ServiceItem[] = [
  {
    title: 'Basic Service',
    description: 'Perfect for getting started',
    price: '$99',
    features: ['Feature one', 'Feature two', 'Feature three'],
  },
  {
    title: 'Professional Service',
    description: 'Our most popular option',
    price: '$199',
    features: ['Everything in Basic', 'Priority support', 'Extended warranty'],
  },
  {
    title: 'Enterprise Service',
    description: 'For large-scale needs',
    price: '$399',
    features: ['Everything in Pro', 'Dedicated manager', 'Custom solutions'],
  },
];

export function ServicesSection({ section, theme, asTile = false }: ServicesSectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || 'Our Services';
  const subtitle = content?.subtitle || 'Choose the perfect solution for your needs';
  const items = content?.items || defaultServices;

  if (asTile) {
    return (
      <section 
        id={section.id}
        className="h-full p-4"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <h3 
          className="text-sm font-bold mb-3"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {title}
        </h3>
        <div className="space-y-2">
          {items.slice(0, 3).map((item, i) => (
            <div 
              key={i}
              className="p-2 rounded-lg"
              style={{ backgroundColor: isDark ? '#1f1f1f' : '#f9fafb' }}
            >
              <div className="flex justify-between items-center">
                <span 
                  className="text-xs font-medium"
                  style={{ color: isDark ? '#ffffff' : '#111827' }}
                >
                  {item.title}
                </span>
                {item.price && (
                  <span 
                    className="text-xs font-bold"
                    style={{ color: theme.primaryColor }}
                  >
                    {item.price}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section 
      id={section.id}
      className="py-12 md:py-16 px-6"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }}
    >
      <div className="max-w-7xl mx-auto">
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

        <StaggerContainer 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={150}
        >
          {items.map((item, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ 
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 
                className="text-xl font-bold mb-2"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: isDark ? '#ffffff' : '#111827'
                }}
              >
                {item.title}
              </h3>
              
              <p 
                className="text-sm mb-4"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}
              >
                {item.description}
              </p>
              
              {item.price && (
                <p 
                  className="text-2xl font-bold mb-4"
                  style={{ color: theme.primaryColor }}
                >
                  {item.price}
                </p>
              )}
              
              {item.features && item.features.length > 0 && (
                <ul className="space-y-2">
                  {item.features.map((feature, i) => (
                    <li 
                      key={i}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                    >
                      <CheckCircle 
                        className="w-4 h-4 flex-shrink-0" 
                        style={{ color: theme.primaryColor }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
