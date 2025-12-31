import { SiteSection, SiteTheme, HeroContent } from '@/types/app-spec';
import { EditableText } from '../EditableText';
import { EditableElement } from '../EditableElement';
import { MotionWrapper, MotionButton, SignatureFlourish, BackgroundAccent, useMotionProfile } from '@/components/motion';

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
  const { intensity } = useMotionProfile();
  
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
        className="h-full min-h-[300px] flex flex-col justify-end p-6 lg:p-8 relative contain-layout"
        style={backgroundStyle}
      >
        {/* Background accent for premium/wild */}
        {intensity !== 'off' && intensity !== 'subtle' && (
          <BackgroundAccent position="hero" />
        )}
        
        {/* Signature flourish */}
        {intensity !== 'off' && <SignatureFlourish position="hero" />}
        
        <div className="max-w-xl overflow-hidden relative z-10">
          <MotionWrapper variant="hero">
            {onUpdateContent ? (
              <EditableText
                value={headline}
                onSave={(val) => onUpdateContent('headline', val)}
                as="h1"
                className="text-2xl lg:text-4xl font-bold mb-3 break-words"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor),
                  overflowWrap: 'anywhere'
                }}
              />
            ) : (
              <h1 
                className="text-2xl lg:text-4xl font-bold mb-3 break-words"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor),
                  overflowWrap: 'anywhere'
                }}
              >
                {headline}
              </h1>
            )}
          </MotionWrapper>
          
          <MotionWrapper variant="text" delay={0.15}>
            {onUpdateContent ? (
              <EditableText
                value={subheadline}
                onSave={(val) => onUpdateContent('subheadline', val)}
                as="p"
                multiline
                className="text-sm lg:text-base mb-5 opacity-80 break-words"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563'),
                  overflowWrap: 'anywhere'
                }}
              />
            ) : (
              <p 
                className="text-sm lg:text-base mb-5 opacity-80 break-words"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563'),
                  overflowWrap: 'anywhere'
                }}
              >
                {subheadline}
              </p>
            )}
          </MotionWrapper>
          
          <MotionWrapper variant="section" delay={0.3}>
            <div className="flex flex-wrap gap-3">
              <MotionButton
                className="px-5 py-2 rounded-lg font-semibold text-white text-sm transition-all"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {ctaText}
              </MotionButton>
              <MotionButton
                className="px-5 py-2 rounded-lg font-semibold border text-sm transition-all"
                style={{ 
                  borderColor: backgroundImage ? '#ffffff' : theme.primaryColor,
                  color: backgroundImage ? '#ffffff' : theme.primaryColor
                }}
              >
                {secondaryCtaText}
              </MotionButton>
            </div>
          </MotionWrapper>
        </div>
      </section>
    );
  }

  // Standard full-width centered layout
  return (
    <EditableElement
      elementId={`${section.id}-hero`}
      sectionId={section.id}
      label="Hero Section"
      properties={[
        { type: 'text', key: 'headline', label: 'Headline', value: headline },
        { type: 'text', key: 'subheadline', label: 'Subheadline', value: subheadline, multiline: true },
        { type: 'text', key: 'ctaText', label: 'Button Text', value: ctaText },
        { type: 'text', key: 'secondaryCtaText', label: 'Secondary Button', value: secondaryCtaText },
        { type: 'image', key: 'backgroundImage', label: 'Background Image', value: backgroundImage || '' },
      ]}
    >
      <section 
        id={section.id}
        className="min-h-[300px] flex items-center justify-center px-6 py-12 md:py-16 relative contain-layout"
        style={backgroundStyle}
      >
        {/* Background accent for premium/wild */}
        {intensity !== 'off' && intensity !== 'subtle' && (
          <BackgroundAccent position="hero" />
        )}
        
        {/* Signature flourish */}
        {intensity !== 'off' && <SignatureFlourish position="hero" />}
        
        <div className="max-w-4xl mx-auto text-center overflow-hidden relative z-10">
          {logo && (
            <MotionWrapper variant="hero">
              <img 
                src={logo} 
                alt={`${siteName} logo`}
                className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 object-contain aspect-square"
              />
            </MotionWrapper>
          )}
          <MotionWrapper variant="hero" delay={logo ? 0.15 : 0}>
            {onUpdateContent ? (
              <EditableText
                value={headline}
                onSave={(val) => onUpdateContent('headline', val)}
                as="h1"
                className="text-4xl md:text-6xl font-bold mb-6 break-words"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor),
                  overflowWrap: 'anywhere'
                }}
              />
            ) : (
              <h1 
                className="text-4xl md:text-6xl font-bold mb-6 break-words"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor),
                  overflowWrap: 'anywhere'
                }}
              >
                {headline}
              </h1>
            )}
          </MotionWrapper>
          
          <MotionWrapper variant="text" delay={0.2}>
            {onUpdateContent ? (
              <EditableText
                value={subheadline}
                onSave={(val) => onUpdateContent('subheadline', val)}
                as="p"
                multiline
                className="text-lg md:text-xl mb-8 max-w-2xl mx-auto break-words"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563'),
                  overflowWrap: 'anywhere'
                }}
              />
            ) : (
              <p 
                className="text-lg md:text-xl mb-8 max-w-2xl mx-auto break-words"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563'),
                  overflowWrap: 'anywhere'
                }}
              >
                {subheadline}
              </p>
            )}
          </MotionWrapper>
          
          <MotionWrapper variant="section" delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MotionButton
                className="px-8 py-3 rounded-lg font-semibold text-white transition-all"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {ctaText}
              </MotionButton>
              <MotionButton
                className="px-8 py-3 rounded-lg font-semibold border-2 transition-all"
                style={{ 
                  borderColor: backgroundImage ? '#ffffff' : theme.primaryColor,
                  color: backgroundImage ? '#ffffff' : theme.primaryColor
                }}
              >
                {secondaryCtaText}
              </MotionButton>
            </div>
          </MotionWrapper>
        </div>
      </section>
    </EditableElement>
  );
}
