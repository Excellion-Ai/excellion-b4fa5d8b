import { SiteSection, SiteTheme, HeroContent } from '@/types/app-spec';
import { EditableText } from '../EditableText';
import { ImageUpload } from '../ImageUpload';
import { Image as ImageIcon } from 'lucide-react';

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
  const backgroundImage = content?.backgroundImage;

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: isDark
          ? `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)`
          : `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}10)`,
      };

  return (
    <section 
      id={section.id}
      className="min-h-[70vh] flex items-center justify-center px-6 py-16 relative"
      style={backgroundStyle}
    >
      {/* Image upload button for editable mode */}
      {onUpdateContent && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
            <ImageUpload
              currentUrl={backgroundImage}
              onUpload={(url) => onUpdateContent('backgroundImage', url)}
              onRemove={() => onUpdateContent('backgroundImage', '')}
              aspectRatio="banner"
              className="w-48"
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center">
        {onUpdateContent ? (
          <EditableText
            value={headline}
            onSave={(val) => onUpdateContent('headline', val)}
            as="h1"
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: theme.fontHeading || 'system-ui',
              color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor)
            }}
          />
        ) : (
          <h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: theme.fontHeading || 'system-ui',
              color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor)
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
              color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563')
            }}
          />
        ) : (
          <p 
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            style={{ 
              fontFamily: theme.fontBody || 'system-ui',
              color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563')
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
              borderColor: backgroundImage ? '#ffffff' : theme.primaryColor,
              color: backgroundImage ? '#ffffff' : theme.primaryColor
            }}
          >
            {secondaryCtaText}
          </button>
        </div>
      </div>
    </section>
  );
}
