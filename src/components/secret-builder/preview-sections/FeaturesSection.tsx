import { SiteSection, SiteTheme, FeaturesContent, FeatureItem } from '@/types/app-spec';
import { Zap, Shield, Clock, Star, Wrench, Heart, Users, Award, Target, Truck } from 'lucide-react';
import { EditableText } from '../EditableText';

interface FeaturesSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  onUpdateContent?: (field: keyof FeaturesContent, value: string) => void;
  onUpdateItem?: (index: number, field: keyof FeatureItem, value: string) => void;
}

const iconComponents: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Zap, Shield, Clock, Star, Wrench, Heart, Users, Award, Target, Truck
};

const defaultFeatures: FeatureItem[] = [
  { icon: 'Zap', title: 'Fast & Reliable', description: 'Built for speed and performance' },
  { icon: 'Shield', title: 'Secure', description: 'Your data is always protected' },
  { icon: 'Clock', title: '24/7 Support', description: "We're here whenever you need us" },
  { icon: 'Star', title: 'Top Quality', description: 'Excellence in everything we do' },
];

export function FeaturesSection({ section, theme, onUpdateContent, onUpdateItem }: FeaturesSectionProps) {
  const content = section.content as FeaturesContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || section.label || 'Features';
  const subtitle = content?.subtitle || section.description || 'Everything you need to succeed';
  const items = content?.items || defaultFeatures;

  // Ensure even number of items for symmetry
  const displayItems = items.length % 2 !== 0 ? items.slice(0, items.length - 1) : items;
  const gridCols = displayItems.length <= 2 ? 'md:grid-cols-2' : displayItems.length <= 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3 lg:grid-cols-4';

  return (
    <section 
      id={section.id}
      className="py-20 px-6"
      style={{ 
        backgroundColor: isDark ? '#0a0a0a' : '#f9fafb'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
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
        </div>
        
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {displayItems.map((feature, index) => {
            const IconComponent = iconComponents[feature.icon || 'Zap'] || Zap;
            return (
              <div 
                key={index}
                className="p-6 rounded-xl transition-all hover:scale-105"
                style={{ 
                  backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${theme.primaryColor}20` }}
                >
                  <IconComponent 
                    className="w-6 h-6" 
                    style={{ color: theme.primaryColor }} 
                  />
                </div>
                {onUpdateItem ? (
                  <EditableText
                    value={feature.title}
                    onSave={(val) => onUpdateItem(index, 'title', val)}
                    as="h3"
                    className="text-lg font-semibold mb-2"
                    style={{ 
                      fontFamily: theme.fontHeading || 'system-ui',
                      color: isDark ? '#ffffff' : '#111827'
                    }}
                  />
                ) : (
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ 
                      fontFamily: theme.fontHeading || 'system-ui',
                      color: isDark ? '#ffffff' : '#111827'
                    }}
                  >
                    {feature.title}
                  </h3>
                )}
                {onUpdateItem ? (
                  <EditableText
                    value={feature.description}
                    onSave={(val) => onUpdateItem(index, 'description', val)}
                    as="p"
                    className="text-sm"
                    style={{ 
                      fontFamily: theme.fontBody || 'system-ui',
                      color: isDark ? '#9ca3af' : '#6b7280'
                    }}
                  />
                ) : (
                  <p 
                    className="text-sm"
                    style={{ 
                      fontFamily: theme.fontBody || 'system-ui',
                      color: isDark ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    {feature.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
