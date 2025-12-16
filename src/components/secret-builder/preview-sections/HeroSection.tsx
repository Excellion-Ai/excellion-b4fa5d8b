import { SiteSection, SiteTheme, HeroContent } from '@/types/app-spec';
import { EditableText } from '../EditableText';

interface HeroSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  siteName: string;
  onUpdateContent?: (field: keyof HeroContent, value: string) => void;
}

export function HeroSection({ section, theme, siteName, onUpdateContent }: HeroSectionProps) {
  const content = section.content as HeroContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const headline = content?.headline || siteName;
  const subheadline = content?.subheadline || section.description || 'Welcome to our website. Discover what we have to offer.';
  const ctaText = content?.ctaText || 'Get Started';
  const secondaryCtaText = content?.secondaryCtaText || 'Learn More';

  return (
    <section 
      id={section.id}
      className="min-h-[70vh] flex items-center justify-center px-6 py-16"
      style={{ 
        background: isDark 
          ? `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)` 
          : `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}10)`
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {onUpdateContent ? (
          <EditableText
            value={headline}
            onSave={(val) => onUpdateContent('headline', val)}
            as="h1"
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: theme.fontHeading || 'system-ui',
              color: isDark ? '#ffffff' : theme.primaryColor 
            }}
          />
        ) : (
          <h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: theme.fontHeading || 'system-ui',
              color: isDark ? '#ffffff' : theme.primaryColor 
            }}
          >
            {headline}
          </h1>
        )}
        
        {onUpdateContent ? (
          <EditableText
            value={subheadline}
            onSave={(val) => onUpdateContent('subheadline', val)}
            as="p"
            multiline
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            style={{ 
              fontFamily: theme.fontBody || 'system-ui',
              color: isDark ? '#e5e5e5' : '#4b5563'
            }}
          />
        ) : (
          <p 
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            style={{ 
              fontFamily: theme.fontBody || 'system-ui',
              color: isDark ? '#e5e5e5' : '#4b5563'
            }}
          >
            {subheadline}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {ctaText}
          </button>
          <button
            className="px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
            style={{ 
              borderColor: theme.primaryColor,
              color: theme.primaryColor
            }}
          >
            {secondaryCtaText}
          </button>
        </div>
      </div>
    </section>
  );
}
