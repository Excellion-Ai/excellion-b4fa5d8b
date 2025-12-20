import { SiteSection, SiteTheme, HeroContent } from '@/types/app-spec';
import { EditableText } from '../EditableText';
import { ScrollAnimation } from '../animations/ScrollAnimations';

interface HeroSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  siteName: string;
  asTile?: boolean;
  onUpdateContent?: (field: keyof HeroContent, value: string) => void;
}

export function HeroSection({ section, theme, siteName, asTile = false, onUpdateContent }: HeroSectionProps) {
  const content = section.content as HeroContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const headline = content?.headline || siteName;
  const subheadline = content?.subheadline || section.description || 'Welcome to our website. Discover what we have to offer.';
  const ctaText = content?.ctaText || 'Get Started';
  const secondaryCtaText = content?.secondaryCtaText || 'Learn More';
  const backgroundImage = content?.backgroundImage;
  const logo = (content as any)?.logo;

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

  // Tile mode for Bento layout - compact, asymmetric
  if (asTile) {
    return (
      <section 
        id={section.id}
        className="h-full min-h-[300px] flex flex-col justify-end p-6 lg:p-8 relative"
        style={backgroundStyle}
      >
        <div className="max-w-xl">
          <ScrollAnimation animation="fade-up" duration={800}>
            {onUpdateContent ? (
              <EditableText
                value={headline}
                onSave={(val) => onUpdateContent('headline', val)}
                as="h1"
                className="text-2xl lg:text-4xl font-bold mb-3"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor)
                }}
              />
            ) : (
              <h1 
                className="text-2xl lg:text-4xl font-bold mb-3"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor)
                }}
              >
                {headline}
              </h1>
            )}
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-up" delay={150} duration={800}>
            {onUpdateContent ? (
              <EditableText
                value={subheadline}
                onSave={(val) => onUpdateContent('subheadline', val)}
                as="p"
                multiline
                className="text-sm lg:text-base mb-5 opacity-80"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563')
                }}
              />
            ) : (
              <p 
                className="text-sm lg:text-base mb-5 opacity-80"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563')
                }}
              >
                {subheadline}
              </p>
            )}
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-up" delay={300} duration={800}>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-5 py-2 rounded-lg font-semibold text-white text-sm transition-all hover:scale-105"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {ctaText}
              </button>
              <button
                className="px-5 py-2 rounded-lg font-semibold border text-sm transition-all hover:scale-105"
                style={{ 
                  borderColor: backgroundImage ? '#ffffff' : theme.primaryColor,
                  color: backgroundImage ? '#ffffff' : theme.primaryColor
                }}
              >
                {secondaryCtaText}
              </button>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    );
  }

  // Standard full-width centered layout
  return (
    <section 
      id={section.id}
      className="flex items-center justify-center px-6 py-12 md:py-16 relative"
      style={backgroundStyle}
    >
      <div className="max-w-4xl mx-auto text-center">
        {logo && (
          <ScrollAnimation animation="fade-down" duration={800}>
            <img 
              src={logo} 
              alt={`${siteName} logo`}
              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 object-contain"
            />
          </ScrollAnimation>
        )}
        <ScrollAnimation animation="fade-down" delay={logo ? 150 : 0} duration={1000}>
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
        </ScrollAnimation>
        
        <ScrollAnimation animation="fade-up" delay={200} duration={1000}>
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
        </ScrollAnimation>
        
        <ScrollAnimation animation="scale-up" delay={400} duration={800}>
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
        </ScrollAnimation>
      </div>
    </section>
  );
}
