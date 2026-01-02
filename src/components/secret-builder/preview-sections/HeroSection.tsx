import { SiteSection, SiteTheme, HeroContent, HeroVariant } from '@/types/app-spec';
import { EditableText } from '../EditableText';
import { EditableElement } from '../EditableElement';
import { MotionWrapper, MotionButton, SignatureFlourish, BackgroundAccent, useMotionProfile } from '@/components/motion';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  siteName: string;
  asTile?: boolean;
  onUpdateContent?: (field: keyof HeroContent, value: string) => void;
}

// Animation variants for entrance effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7 },
  },
};

export function HeroSection({ section, theme, siteName, asTile = false, onUpdateContent }: HeroSectionProps) {
  const content = section.content as HeroContent | undefined;
  const isDark = theme.darkMode ?? (theme as any).backgroundStyle === 'dark';
  const { intensity } = useMotionProfile();
  
  const headline = content?.headline || siteName || '';
  const subheadline = content?.subheadline || section.description || '';
  const backgroundImage = content?.backgroundImage;
  const logo = (content as any)?.logo;
  const variant: HeroVariant = content?.variant || 'simple-centered';

  // CHILD-PROOF CTA EXTRACTION: Handle both flat and array formats
  // Fallback chain: ctaText -> ctas[0].label -> ctas[0].text -> ctas[0].title -> cta.label -> cta.text -> cta.title
  const getCTALabel = (index: 0 | 1): string => {
    const c = content as any;
    if (!c) return '';
    
    // Flat format (preferred)
    if (index === 0 && c.ctaText) return c.ctaText;
    if (index === 1 && c.secondaryCtaText) return c.secondaryCtaText;
    
    // Array format: ctas[]
    if (Array.isArray(c.ctas) && c.ctas[index]) {
      const cta = c.ctas[index];
      return cta?.label || cta?.text || cta?.title || '';
    }
    
    // Object format: cta / secondaryCta
    if (index === 0 && c.cta) {
      return c.cta?.label || c.cta?.text || c.cta?.title || '';
    }
    if (index === 1 && c.secondaryCta) {
      return c.secondaryCta?.label || c.secondaryCta?.text || c.secondaryCta?.title || '';
    }
    
    return '';
  };
  
  const ctaText = getCTALabel(0);
  const secondaryCtaText = getCTALabel(1);

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
        {intensity !== 'off' && intensity !== 'subtle' && (
          <BackgroundAccent position="hero" />
        )}
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
              {ctaText.trim() && (
                <MotionButton
                  className="px-5 py-2 rounded-lg font-semibold text-white text-sm transition-all"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {ctaText}
                </MotionButton>
              )}
              {secondaryCtaText.trim() && (
                <MotionButton
                  className="px-5 py-2 rounded-lg font-semibold border text-sm transition-all"
                  style={{ 
                    borderColor: backgroundImage ? '#ffffff' : theme.primaryColor,
                    color: backgroundImage ? '#ffffff' : theme.primaryColor
                  }}
                >
                  {secondaryCtaText}
                </MotionButton>
              )}
            </div>
          </MotionWrapper>
        </div>
      </section>
    );
  }

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'split-image-right':
        return renderSplitImageRight();
      case 'minimal-impact':
        return renderMinimalImpact();
      case 'simple-centered':
      default:
        return renderSimpleCentered();
    }
  };

  // VARIANT: Simple Centered (default)
  const renderSimpleCentered = () => (
    <motion.div 
      className="max-w-4xl mx-auto text-center overflow-hidden relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {logo && (
        <motion.div variants={itemVariants}>
          <img 
            src={logo} 
            alt={`${siteName} logo`}
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 object-contain aspect-square"
          />
        </motion.div>
      )}
      <motion.div variants={itemVariants}>
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
      </motion.div>
      
      <motion.div variants={itemVariants}>
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
      </motion.div>
      
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
        {ctaText.trim() && (
          <MotionButton
            className="px-8 py-3 rounded-lg font-semibold text-white transition-all"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {ctaText}
          </MotionButton>
        )}
        {secondaryCtaText.trim() && (
          <MotionButton
            className="px-8 py-3 rounded-lg font-semibold border-2 transition-all"
            style={{ 
              borderColor: backgroundImage ? '#ffffff' : theme.primaryColor,
              color: backgroundImage ? '#ffffff' : theme.primaryColor
            }}
          >
            {secondaryCtaText}
          </MotionButton>
        )}
      </motion.div>
    </motion.div>
  );

  // VARIANT: Split Image Right (2-column)
  const renderSplitImageRight = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto relative z-10">
      <motion.div 
        className="text-left overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {logo && (
          <motion.div variants={itemVariants}>
            <img 
              src={logo} 
              alt={`${siteName} logo`}
              className="w-16 h-16 mb-6 object-contain"
            />
          </motion.div>
        )}
        <motion.div variants={itemVariants}>
          {onUpdateContent ? (
            <EditableText
              value={headline}
              onSave={(val) => onUpdateContent('headline', val)}
              as="h1"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 break-words"
              style={{ 
                fontFamily: theme.fontHeading || 'system-ui',
                color: isDark ? '#ffffff' : theme.primaryColor,
                overflowWrap: 'anywhere'
              }}
            />
          ) : (
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 break-words"
              style={{ 
                fontFamily: theme.fontHeading || 'system-ui',
                color: isDark ? '#ffffff' : theme.primaryColor,
                overflowWrap: 'anywhere'
              }}
            >
              {headline}
            </h1>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants}>
          {onUpdateContent ? (
            <EditableText
              value={subheadline}
              onSave={(val) => onUpdateContent('subheadline', val)}
              as="p"
              multiline
              className="text-lg md:text-xl mb-8 break-words"
              style={{ 
                fontFamily: theme.fontBody || 'system-ui',
                color: isDark ? '#e5e5e5' : '#4b5563',
                overflowWrap: 'anywhere'
              }}
            />
          ) : (
            <p 
              className="text-lg md:text-xl mb-8 break-words"
              style={{ 
                fontFamily: theme.fontBody || 'system-ui',
                color: isDark ? '#e5e5e5' : '#4b5563',
                overflowWrap: 'anywhere'
              }}
            >
              {subheadline}
            </p>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          {ctaText.trim() && (
            <MotionButton
              className="px-8 py-3 rounded-lg font-semibold text-white transition-all"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {ctaText}
            </MotionButton>
          )}
          {secondaryCtaText.trim() && (
            <MotionButton
              className="px-8 py-3 rounded-lg font-semibold border-2 transition-all"
              style={{ 
                borderColor: theme.primaryColor,
                color: theme.primaryColor
              }}
            >
              {secondaryCtaText}
            </MotionButton>
          )}
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="relative"
        variants={slideInRight}
        initial="hidden"
        animate="visible"
      >
        {backgroundImage ? (
          <img 
            src={backgroundImage} 
            alt="Hero visual"
            className="w-full h-64 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
          />
        ) : (
          <div 
            className="w-full h-64 lg:h-[500px] rounded-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primaryColor}40, ${theme.secondaryColor}40)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );

  // VARIANT: Minimal Impact (large typography, minimal elements)
  const renderMinimalImpact = () => (
    <motion.div 
      className="max-w-5xl mx-auto text-center overflow-hidden relative z-10 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={scaleIn}>
        {onUpdateContent ? (
          <EditableText
            value={headline}
            onSave={(val) => onUpdateContent('headline', val)}
            as="h1"
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight break-words"
            style={{ 
              fontFamily: theme.fontHeading || 'system-ui',
              color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor),
              overflowWrap: 'anywhere',
              lineHeight: 1.1,
            }}
          />
        ) : (
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight break-words"
            style={{ 
              fontFamily: theme.fontHeading || 'system-ui',
              color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor),
              overflowWrap: 'anywhere',
              lineHeight: 1.1,
            }}
          >
            {headline}
          </h1>
        )}
      </motion.div>
      
      <motion.div variants={itemVariants}>
        {onUpdateContent ? (
          <EditableText
            value={subheadline}
            onSave={(val) => onUpdateContent('subheadline', val)}
            as="p"
            multiline
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto break-words opacity-70"
            style={{ 
              fontFamily: theme.fontBody || 'system-ui',
              color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563'),
              overflowWrap: 'anywhere'
            }}
          />
        ) : (
          <p 
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto break-words opacity-70"
            style={{ 
              fontFamily: theme.fontBody || 'system-ui',
              color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563'),
              overflowWrap: 'anywhere'
            }}
          >
            {subheadline}
          </p>
        )}
      </motion.div>
      
      <motion.div variants={itemVariants}>
        {ctaText.trim() && (
          <MotionButton
            className="px-12 py-4 rounded-full font-bold text-lg text-white transition-all shadow-lg hover:shadow-xl"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {ctaText}
          </MotionButton>
        )}
      </motion.div>
    </motion.div>
  );

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
        className={`min-h-[400px] flex items-center justify-center px-6 relative contain-layout ${
          variant === 'split-image-right' ? 'py-16 md:py-24' : 'py-12 md:py-16'
        }`}
        style={variant === 'split-image-right' ? { 
          background: isDark
            ? `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}10)`
            : `linear-gradient(135deg, ${theme.primaryColor}05, ${theme.secondaryColor}05)`,
        } : backgroundStyle}
      >
        {intensity !== 'off' && intensity !== 'subtle' && (
          <BackgroundAccent position="hero" />
        )}
        {intensity !== 'off' && <SignatureFlourish position="hero" />}
        
        {renderContent()}
      </section>
    </EditableElement>
  );
}