import { SiteSection, SiteTheme, FeaturesContent, FeatureItem } from '@/types/app-spec';
import { 
  // Core/Generic
  Zap, Shield, Clock, Star, Wrench, Heart, Users, Award, Target, Truck,
  CheckCircle, Settings, Sparkles, Lightbulb, Rocket, Gift, ThumbsUp, Crown,
  // Service/Trade
  Scissors, Hammer, PaintBucket, Droplets, Flame, Snowflake, Plug, Key, 
  // Food/Hospitality
  UtensilsCrossed, Coffee, Wine, Pizza, Cake, Cookie, Soup, ChefHat,
  // Automotive
  Car, Gauge, Fuel,
  // Health/Medical
  Stethoscope, Pill, Activity, HeartPulse, Brain, Eye, Smile,
  // Professional
  Briefcase, Scale, FileText, Calculator, Building, Landmark,
  // Creative/Design
  Palette, Camera, Pen, Brush, Film, Music, Mic,
  // Fitness/Wellness
  Dumbbell, Leaf, Apple, Bike, Timer,
  // Pet/Animal
  Dog, Cat, PawPrint,
  // Beauty/Fashion
  Shirt, Diamond, Flower2, Gem,
  // Home/Real Estate
  Home, Bed, Sofa, Bath, Trees,
  // Technology
  Monitor, Code, Cpu, Wifi, Database, Cloud, Globe,
  // Travel/Transport
  Plane, MapPin, Compass, Ship, Train,
  // Education
  GraduationCap, BookOpen, Pencil,
  // Security
  Lock, ShieldCheck, Fingerprint,
  // Communication
  Phone, Mail, MessageCircle, Send
} from 'lucide-react';
import { EditableText } from '../EditableText';
import { ScrollAnimation, StaggerContainer } from '../animations/ScrollAnimations';

interface FeaturesSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  asTile?: boolean;
  onUpdateContent?: (field: keyof FeaturesContent, value: string) => void;
  onUpdateItem?: (index: number, field: keyof FeatureItem, value: string) => void;
}

// 80+ industry-specific icons for dynamic feature rendering
const iconComponents: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  // Core/Generic
  Zap, Shield, Clock, Star, Wrench, Heart, Users, Award, Target, Truck,
  CheckCircle, Settings, Sparkles, Lightbulb, Rocket, Gift, ThumbsUp, Crown,
  // Service/Trade
  Scissors, Hammer, PaintBucket, Droplets, Flame, Snowflake, Plug, Key,
  // Food/Hospitality  
  UtensilsCrossed, Coffee, Wine, Pizza, Cake, Cookie, Soup, ChefHat,
  // Automotive
  Car, Gauge, Fuel,
  // Health/Medical
  Stethoscope, Pill, Activity, HeartPulse, Brain, Eye, Smile,
  // Professional
  Briefcase, Scale, FileText, Calculator, Building, Landmark,
  // Creative/Design
  Palette, Camera, Pen, Brush, Film, Music, Mic,
  // Fitness/Wellness
  Dumbbell, Leaf, Apple, Bike, Timer,
  // Pet/Animal
  Dog, Cat, PawPrint, Paw: PawPrint,
  // Beauty/Fashion
  Shirt, Diamond, Flower2, Gem,
  // Home/Real Estate
  Home, Bed, Sofa, Bath, Trees,
  // Technology
  Monitor, Code, Cpu, Wifi, Database, Cloud, Globe,
  // Travel/Transport
  Plane, MapPin, Compass, Ship, Train,
  // Education
  GraduationCap, BookOpen, Pencil,
  // Security
  Lock, ShieldCheck, Fingerprint,
  // Communication
  Phone, Mail, MessageCircle, Send
};

const defaultFeatures: FeatureItem[] = [
  { icon: 'Zap', title: 'Fast & Reliable', description: 'Built for speed and performance' },
  { icon: 'Shield', title: 'Secure', description: 'Your data is always protected' },
  { icon: 'Clock', title: '24/7 Support', description: "We're here whenever you need us" },
  { icon: 'Star', title: 'Top Quality', description: 'Excellence in everything we do' },
];

export function FeaturesSection({ section, theme, asTile = false, onUpdateContent, onUpdateItem }: FeaturesSectionProps) {
  const content = section.content as FeaturesContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || section.label || 'Features';
  const subtitle = content?.subtitle || section.description || 'Everything you need to succeed';
  const items = content?.items || defaultFeatures;

  // Ensure even number of items for symmetry
  const displayItems = items.length % 2 !== 0 ? items.slice(0, items.length - 1) : items;

  // Tile mode for Bento layout - compact grid
  if (asTile) {
    const tileItems = displayItems.slice(0, 4); // Max 4 for tile view
    
    return (
      <section 
        id={section.id}
        className="h-full p-5"
        style={{ 
          backgroundColor: isDark ? '#111111' : '#ffffff'
        }}
      >
        <ScrollAnimation animation="fade-up">
          <div className="mb-4">
            {onUpdateContent ? (
              <EditableText
                value={title}
                onSave={(val) => onUpdateContent('title', val)}
                as="h3"
                className="text-lg font-bold"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: isDark ? '#ffffff' : '#111827'
                }}
              />
            ) : (
              <h3 
                className="text-lg font-bold"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: isDark ? '#ffffff' : '#111827'
                }}
              >
                {title}
              </h3>
            )}
          </div>
        </ScrollAnimation>
        
        <StaggerContainer className="grid grid-cols-2 gap-3" staggerDelay={100}>
          {tileItems.map((feature, index) => {
            const IconComponent = iconComponents[feature.icon || 'Zap'] || Zap;
            return (
              <div 
                key={index}
                className="p-3 rounded-lg"
                style={{ 
                  backgroundColor: isDark ? '#1f1f1f' : '#f9fafb',
                }}
              >
                <div 
                  className="w-8 h-8 rounded-md flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${theme.primaryColor}20` }}
                >
                  <IconComponent 
                    className="w-4 h-4" 
                    style={{ color: theme.primaryColor }} 
                  />
                </div>
                {onUpdateItem ? (
                  <EditableText
                    value={feature.title}
                    onSave={(val) => onUpdateItem(index, 'title', val)}
                    as="h3"
                    className="text-sm font-semibold mb-1"
                    style={{ 
                      fontFamily: theme.fontHeading || 'system-ui',
                      color: isDark ? '#ffffff' : '#111827'
                    }}
                  />
                ) : (
                  <h3 
                    className="text-sm font-semibold mb-1"
                    style={{ 
                      fontFamily: theme.fontHeading || 'system-ui',
                      color: isDark ? '#ffffff' : '#111827'
                    }}
                  >
                    {feature.title}
                  </h3>
                )}
              </div>
            );
          })}
        </StaggerContainer>
      </section>
    );
  }

  // Standard full-width layout
  const gridCols = displayItems.length <= 2 ? 'md:grid-cols-2' : displayItems.length <= 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3 lg:grid-cols-4';

  return (
    <section 
      id={section.id}
      className="py-10 md:py-14 px-6 w-full"
      style={{ 
        backgroundColor: isDark ? '#0a0a0a' : '#f9fafb'
      }}
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
        </div>
        
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {displayItems.map((feature, index) => {
            const IconComponent = iconComponents[feature.icon || 'Zap'] || Zap;
            return (
              <ScrollAnimation 
                key={index} 
                animation="fade-up" 
                delay={index * 100}
              >
                <div 
                  className="p-6 rounded-xl transition-all hover:scale-105 h-full"
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
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
