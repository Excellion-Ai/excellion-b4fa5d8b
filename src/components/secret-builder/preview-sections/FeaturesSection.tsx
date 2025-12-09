import { SiteSection, SiteTheme } from '@/types/app-spec';
import { Zap, Shield, Clock, Star } from 'lucide-react';

interface FeaturesSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

const defaultFeatures = [
  { icon: Zap, title: 'Fast & Reliable', description: 'Built for speed and performance' },
  { icon: Shield, title: 'Secure', description: 'Your data is always protected' },
  { icon: Clock, title: '24/7 Support', description: 'We\'re here whenever you need us' },
  { icon: Star, title: 'Top Quality', description: 'Excellence in everything we do' },
];

export function FeaturesSection({ section, theme }: FeaturesSectionProps) {
  return (
    <section 
      id={section.id}
      className="py-20 px-6"
      style={{ 
        backgroundColor: theme.darkMode ? '#0a0a0a' : '#f9fafb'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: theme.fontHeading,
              color: theme.darkMode ? '#ffffff' : '#111827'
            }}
          >
            {section.label || 'Features'}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ 
              fontFamily: theme.fontBody,
              color: theme.darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            {section.description || 'Everything you need to succeed'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {defaultFeatures.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl transition-all hover:scale-105"
              style={{ 
                backgroundColor: theme.darkMode ? '#1f1f1f' : '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.primaryColor}20` }}
              >
                <feature.icon 
                  className="w-6 h-6" 
                  style={{ color: theme.primaryColor }} 
                />
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ 
                  fontFamily: theme.fontHeading,
                  color: theme.darkMode ? '#ffffff' : '#111827'
                }}
              >
                {feature.title}
              </h3>
              <p 
                className="text-sm"
                style={{ 
                  fontFamily: theme.fontBody,
                  color: theme.darkMode ? '#9ca3af' : '#6b7280'
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
