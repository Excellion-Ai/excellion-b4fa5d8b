import { SiteSection, SiteTheme, FeaturesContent, FeatureItem, FeaturesVariant } from '@/types/app-spec';
import { MotionWrapper, MotionStaggerContainer, useMotionProfile } from '@/components/motion';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Clock, Star, Wrench, Heart, Users, Award, Target, Truck,
  CheckCircle, Settings, Sparkles, Lightbulb, Rocket, Gift, ThumbsUp, Crown,
  Scissors, Hammer, PaintBucket, Droplets, Flame, Snowflake, Plug, Key, 
  UtensilsCrossed, Coffee, Wine, Pizza, Cake, Cookie, Soup, ChefHat,
  Car, Gauge, Fuel, Stethoscope, Pill, Activity, HeartPulse, Brain, Eye, Smile,
  Briefcase, Scale, FileText, Calculator, Building, Landmark,
  Palette, Camera, Pen, Brush, Film, Music, Mic,
  Dumbbell, Leaf, Apple, Bike, Timer, Dog, Cat, PawPrint,
  Shirt, Diamond, Flower2, Gem, Home, Bed, Sofa, Bath, Trees,
  Monitor, Code, Cpu, Wifi, Database, Cloud, Globe,
  Plane, MapPin, Compass, Ship, Train, GraduationCap, BookOpen, Pencil,
  Lock, ShieldCheck, Fingerprint, Phone, Mail, MessageCircle, Send,
  RefreshCw, Calendar, CreditCard, Tag, Smartphone, TrendingUp, Download, PieChart
} from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableElement } from '../EditableElement';
import { ScrollAnimation, StaggerContainer } from '../animations/ScrollAnimations';
import { SetupRequiredCard, isPlaceholderContent } from '../SetupRequiredCard';

import type { RenderMode } from '../SiteRenderer';

interface FeaturesSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  asTile?: boolean;
  renderMode?: RenderMode;
  onUpdateContent?: (field: keyof FeaturesContent, value: string) => void;
  onUpdateItem?: (index: number, field: keyof FeatureItem, value: string) => void;
  onGenerateContent?: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const bentoCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

const zigzagVariants = {
  hidden: (isEven: boolean) => ({ 
    opacity: 0, 
    x: isEven ? -60 : 60 
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6 },
  },
};

// Preview-mode fallback features when content is empty
const PREVIEW_FALLBACK_FEATURES: FeatureItem[] = [
  { icon: 'Star', title: 'Premium Quality', description: 'We deliver excellence in everything we do, backed by years of expertise.' },
  { icon: 'Users', title: 'Expert Team', description: 'Our dedicated professionals bring skill and passion to every project.' },
  { icon: 'Clock', title: 'Reliable Service', description: 'Count on us for consistent, timely delivery every single time.' },
  { icon: 'Award', title: 'Proven Results', description: 'Join hundreds of satisfied customers who trust our work.' },
];

// 100+ industry-specific icons for dynamic feature rendering
const iconComponents: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Zap, Shield, Clock, Star, Wrench, Heart, Users, Award, Target, Truck,
  CheckCircle, Settings, Sparkles, Lightbulb, Rocket, Gift, ThumbsUp, Crown,
  Scissors, Hammer, PaintBucket, Droplets, Flame, Snowflake, Plug, Key,
  UtensilsCrossed, Coffee, Wine, Pizza, Cake, Cookie, Soup, ChefHat,
  Car, Gauge, Fuel,
  Stethoscope, Pill, Activity, HeartPulse, Brain, Eye, Smile,
  Briefcase, Scale, FileText, Calculator, Building, Landmark,
  Palette, Camera, Pen, Brush, Film, Music, Mic,
  Dumbbell, Leaf, Apple, Bike, Timer,
  Dog, Cat, PawPrint, Paw: PawPrint,
  Shirt, Diamond, Flower2, Gem,
  Home, Bed, Sofa, Bath, Trees,
  Monitor, Code, Cpu, Wifi, Database, Cloud, Globe,
  Plane, MapPin, Compass, Ship, Train,
  GraduationCap, BookOpen, Pencil,
  Lock, ShieldCheck, Fingerprint,
  Phone, Mail, MessageCircle, Send,
  RefreshCw, Calendar, CreditCard, Tag, Smartphone, TrendingUp, Download, PieChart
};

function hasBannedFeatureContent(items: FeatureItem[]): boolean {
  const bannedTitles = [
    'fast & reliable', 'secure', '24/7 support', 'top quality',
    'feature 1', 'feature 2', 'service 1', 'service 2',
  ];
  
  for (const item of items) {
    const title = (item.title || '').toLowerCase();
    if (bannedTitles.some(banned => title.includes(banned))) {
      return true;
    }
  }
  return false;
}

export function FeaturesSection({ section, theme, asTile = false, renderMode = 'preview', onUpdateContent, onUpdateItem, onGenerateContent }: FeaturesSectionProps) {
  const content = section.content as FeaturesContent | undefined;
  const isDark = theme.darkMode ?? (theme as any).backgroundStyle === 'dark';
  const { intensity, hasMicroEffect } = useMotionProfile();
  
  const title = content?.title || section.label || 'What We Offer';
  const subtitle = content?.subtitle || section.description || '';
  const rawItems = content?.items?.length ? content.items : [];
  const variant: FeaturesVariant = content?.variant || 'grid-3';
  
  const isEmpty = rawItems.length === 0;
  const hasPlaceholder = rawItems.some(item => isPlaceholderContent(item.title) || isPlaceholderContent(item.description));
  const hasBanned = hasBannedFeatureContent(rawItems);
  const needsSetup = isEmpty || hasPlaceholder || hasBanned;

  const items = needsSetup && renderMode === 'preview' ? PREVIEW_FALLBACK_FEATURES : rawItems;

  if (needsSetup && renderMode === 'editor' && !asTile) {
    return (
      <section 
        id={section.id}
        className="py-10 md:py-14 px-6 w-full min-h-[300px] contain-layout flex items-center justify-center"
        style={{ backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }}
      >
        <SetupRequiredCard 
          type="features"
          sectionLabel={title !== 'What We Offer' ? title : undefined}
          onGenerate={onGenerateContent}
        />
      </section>
    );
  }

  const displayItems = items.length % 2 !== 0 ? items.slice(0, items.length - 1) : items;

  // Tile mode for Bento layout
  if (asTile) {
    const tileItems = displayItems.slice(0, 4);
    
    return (
      <section 
        id={section.id}
        className="h-full min-h-[200px] p-5 contain-layout"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <ScrollAnimation animation="fade-up">
          <div className="mb-4">
            {onUpdateContent ? (
              <EditableText
                value={title}
                onSave={(val) => onUpdateContent('title', val)}
                as="h3"
                className="text-lg font-bold"
                style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827' }}
              />
            ) : (
              <h3 className="text-lg font-bold" style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827' }}>
                {title}
              </h3>
            )}
          </div>
        </ScrollAnimation>
        
        <StaggerContainer className="grid grid-cols-2 gap-3" staggerDelay={100}>
          {tileItems.map((feature, index) => {
            const IconComponent = iconComponents[feature.icon || 'Zap'] || Zap;
            return (
              <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#1f1f1f' : '#f9fafb' }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center mb-2" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                  <IconComponent className="w-4 h-4" style={{ color: theme.primaryColor }} />
                </div>
                {onUpdateItem ? (
                  <EditableText
                    value={feature.title}
                    onSave={(val) => onUpdateItem(index, 'title', val)}
                    as="h3"
                    className="text-sm font-semibold mb-1"
                    style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827' }}
                  />
                ) : (
                  <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827' }}>
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

  // Render based on variant
  const renderVariant = () => {
    switch (variant) {
      case 'bento-box':
        return renderBentoBox();
      case 'zigzag-large':
        return renderZigzagLarge();
      case 'grid-3':
      default:
        return renderGrid3();
    }
  };

  // VARIANT: Grid-3 (default 3-column grid)
  const renderGrid3 = () => (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {displayItems.map((feature, index) => {
        const IconComponent = iconComponents[feature.icon || 'Zap'] || Zap;
        return (
          <motion.div key={index} variants={cardVariants}>
            <EditableElement
              elementId={`${section.id}-feature-${index}`}
              sectionId={section.id}
              itemIndex={index}
              label={`Feature Card ${index + 1}`}
              properties={[
                { type: 'text', key: 'title', label: 'Title', value: feature.title },
                { type: 'text', key: 'description', label: 'Description', value: feature.description, multiline: true },
                { type: 'icon', key: 'icon', label: 'Icon', value: feature.icon || 'Zap' },
              ]}
            >
              <div 
                className={`p-6 rounded-xl transition-all h-full overflow-hidden ${hasMicroEffect('shadowLift') ? 'hover-lift' : 'hover:scale-105'}`}
                style={{ 
                  backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div 
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${hasMicroEffect('iconPulse') ? 'animate-icon-pulse' : ''}`}
                  style={{ backgroundColor: `${theme.primaryColor}20` }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: theme.primaryColor }} />
                </div>
                {onUpdateItem ? (
                  <EditableText
                    value={feature.title}
                    onSave={(val) => onUpdateItem(index, 'title', val)}
                    as="h3"
                    className="text-lg font-semibold mb-2 break-words"
                    style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827', overflowWrap: 'anywhere' }}
                  />
                ) : (
                  <h3 className="text-lg font-semibold mb-2 break-words" style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827', overflowWrap: 'anywhere' }}>
                    {feature.title}
                  </h3>
                )}
                {onUpdateItem ? (
                  <EditableText
                    value={feature.description}
                    onSave={(val) => onUpdateItem(index, 'description', val)}
                    as="p"
                    className="text-sm break-words"
                    style={{ fontFamily: theme.fontBody, color: isDark ? '#9ca3af' : '#6b7280', overflowWrap: 'anywhere' }}
                  />
                ) : (
                  <p className="text-sm break-words" style={{ fontFamily: theme.fontBody, color: isDark ? '#9ca3af' : '#6b7280', overflowWrap: 'anywhere' }}>
                    {feature.description}
                  </p>
                )}
              </div>
            </EditableElement>
          </motion.div>
        );
      })}
    </motion.div>
  );

  // VARIANT: Bento Box (asymmetric grid with featured items)
  const renderBentoBox = () => {
    const bentoItems = displayItems.slice(0, 5);
    
    return (
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {bentoItems.map((feature, index) => {
          const IconComponent = iconComponents[feature.icon || 'Zap'] || Zap;
          const isLarge = index === 0 || index === 3;
          
          return (
            <motion.div 
              key={index} 
              variants={bentoCardVariants}
              className={`${isLarge ? 'col-span-2 row-span-2' : ''}`}
            >
              <EditableElement
                elementId={`${section.id}-feature-${index}`}
                sectionId={section.id}
                itemIndex={index}
                label={`Feature Card ${index + 1}`}
                properties={[
                  { type: 'text', key: 'title', label: 'Title', value: feature.title },
                  { type: 'text', key: 'description', label: 'Description', value: feature.description, multiline: true },
                  { type: 'icon', key: 'icon', label: 'Icon', value: feature.icon || 'Zap' },
                ]}
              >
                <div 
                  className="p-6 rounded-2xl h-full flex flex-col justify-between transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                    boxShadow: '0 4px 20px -1px rgba(0, 0, 0, 0.1)',
                    border: `1px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}`
                  }}
                >
                  <div>
                    <div 
                      className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12'} rounded-xl flex items-center justify-center mb-4`}
                      style={{ backgroundColor: `${theme.primaryColor}15` }}
                    >
                      <IconComponent className={`${isLarge ? 'w-8 h-8' : 'w-6 h-6'}`} style={{ color: theme.primaryColor }} />
                    </div>
                    <h3 
                      className={`${isLarge ? 'text-2xl' : 'text-lg'} font-bold mb-2`}
                      style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827' }}
                    >
                      {feature.title}
                    </h3>
                  </div>
                  <p 
                    className={`${isLarge ? 'text-base' : 'text-sm'} opacity-70`}
                    style={{ fontFamily: theme.fontBody, color: isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </EditableElement>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  // VARIANT: Zigzag Large (alternating left-right large cards)
  const renderZigzagLarge = () => (
    <div className="space-y-16">
      {displayItems.slice(0, 4).map((feature, index) => {
        const IconComponent = iconComponents[feature.icon || 'Zap'] || Zap;
        const isEven = index % 2 === 0;
        
        return (
          <motion.div 
            key={index}
            custom={isEven}
            variants={zigzagVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
          >
            <EditableElement
              elementId={`${section.id}-feature-${index}`}
              sectionId={section.id}
              itemIndex={index}
              label={`Feature Card ${index + 1}`}
              properties={[
                { type: 'text', key: 'title', label: 'Title', value: feature.title },
                { type: 'text', key: 'description', label: 'Description', value: feature.description, multiline: true },
                { type: 'icon', key: 'icon', label: 'Icon', value: feature.icon || 'Zap' },
              ]}
            >
              <div className="flex-1 space-y-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${theme.primaryColor}15` }}
                >
                  <IconComponent className="w-8 h-8" style={{ color: theme.primaryColor }} />
                </div>
                <h3 
                  className="text-2xl md:text-3xl font-bold"
                  style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-lg leading-relaxed"
                  style={{ fontFamily: theme.fontBody, color: isDark ? '#9ca3af' : '#6b7280' }}
                >
                  {feature.description}
                </p>
              </div>
            </EditableElement>
            
            <div 
              className="flex-1 w-full h-64 lg:h-80 rounded-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)`,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section 
      id={section.id}
      className="py-16 md:py-24 px-6 w-full min-h-[300px] contain-layout"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {onUpdateContent ? (
              <EditableText
                value={title}
                onSave={(val) => onUpdateContent('title', val)}
                as="h2"
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827' }}
              />
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : '#111827' }}>
                {title}
              </h2>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {onUpdateContent ? (
              <EditableText
                value={subtitle}
                onSave={(val) => onUpdateContent('subtitle', val)}
                as="p"
                className="text-lg max-w-2xl mx-auto"
                style={{ fontFamily: theme.fontBody, color: isDark ? '#9ca3af' : '#6b7280' }}
              />
            ) : (
              <p className="text-lg max-w-2xl mx-auto" style={{ fontFamily: theme.fontBody, color: isDark ? '#9ca3af' : '#6b7280' }}>
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
        
        {renderVariant()}
      </div>
    </section>
  );
}