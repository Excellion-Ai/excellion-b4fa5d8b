import { SiteSection, SiteTheme, HeroContent } from '@/types/app-spec';
import { EditableText } from '../EditableText';
import { EditableElement } from '../EditableElement';
import { MotionButton, SignatureFlourish, BackgroundAccent, useMotionProfile } from '@/components/motion';
import { motion } from 'framer-motion';

// Hero variants: 'split' | 'centered' | 'glassmorphism'
export type HeroVariant = 'split' | 'centered' | 'glassmorphism';

interface HeroSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  siteName: string;
  asTile?: boolean;
  onUpdateContent?: (field: keyof HeroContent, value: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

export function HeroSection({ section, theme, siteName, asTile = false, onUpdateContent }: HeroSectionProps) {
  const content = section.content as HeroContent | undefined;
  const isDark = theme.darkMode ?? (theme as any).backgroundStyle === 'dark';
  const { intensity } = useMotionProfile();
  
  const headline = content?.headline || siteName || '';
  const subheadline = content?.subheadline || section.description || '';
  const backgroundImage = content?.backgroundImage;
  const logo = (content as any)?.logo;
  
  // Map old variants to new ones, default to 'centered'
  const rawVariant = content?.variant || 'centered';
  const variant: HeroVariant = 
    rawVariant === 'split-image-right' ? 'split' :
    rawVariant === 'minimal-impact' ? 'glassmorphism' :
    rawVariant === 'simple-centered' ? 'centered' :
    (rawVariant as HeroVariant) || 'centered';

  // Child-proof CTA extraction
  const getCTALabel = (index: 0 | 1): string => {
    const c = content as any;
    if (!c) return '';
    if (index === 0 && c.ctaText) return c.ctaText;
    if (index === 1 && c.secondaryCtaText) return c.secondaryCtaText;
    if (Array.isArray(c.ctas) && c.ctas[index]) {
      const cta = c.ctas[index];
      return cta?.label || cta?.text || cta?.title || '';
    }
    if (index === 0 && c.cta) return c.cta?.label || c.cta?.text || c.cta?.title || '';
    if (index === 1 && c.secondaryCta) return c.secondaryCta?.label || c.secondaryCta?.text || c.secondaryCta?.title || '';
    return '';
  };
  
  const ctaText = getCTALabel(0);
  const secondaryCtaText = getCTALabel(1);

  // Tile mode for Bento layout
  if (asTile) {
    return (
      <section 
        id={section.id}
        className="h-full min-h-[300px] flex flex-col justify-end p-6 lg:p-8 relative contain-layout"
        style={{
          backgroundImage: backgroundImage 
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          background: !backgroundImage 
            ? `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)`
            : undefined,
        }}
      >
        <div className="max-w-xl overflow-hidden relative z-10">
          <h1 
            className="text-2xl lg:text-4xl font-bold mb-3 break-words"
            style={{ 
              fontFamily: theme.fontHeading || 'system-ui',
              color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : theme.primaryColor),
            }}
          >
            {headline}
          </h1>
          <p 
            className="text-sm lg:text-base mb-5 opacity-80 break-words"
            style={{ 
              fontFamily: theme.fontBody || 'system-ui',
              color: backgroundImage ? '#e5e5e5' : (isDark ? '#e5e5e5' : '#4b5563'),
            }}
          >
            {subheadline}
          </p>
          <div className="flex flex-wrap gap-3">
            {ctaText.trim() && (
              <button
                className="px-5 py-2 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {ctaText}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // VARIANT: Split (image right, 2-column layout)
  const renderSplit = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto relative z-10">
      <motion.div 
        className="text-left overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {logo && (
          <motion.div variants={itemVariants}>
            <img src={logo} alt={`${siteName} logo`} className="w-16 h-16 mb-6 object-contain" />
          </motion.div>
        )}
        <motion.div variants={itemVariants}>
          {onUpdateContent ? (
            <EditableText
              value={headline}
              onSave={(val) => onUpdateContent('headline', val)}
              as="h1"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 break-words"
              style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : theme.primaryColor }}
            />
          ) : (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 break-words" style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : theme.primaryColor }}>
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
              style={{ fontFamily: theme.fontBody, color: isDark ? '#e5e5e5' : '#4b5563' }}
            />
          ) : (
            <p className="text-lg md:text-xl mb-8 break-words" style={{ fontFamily: theme.fontBody, color: isDark ? '#e5e5e5' : '#4b5563' }}>
              {subheadline}
            </p>
          )}
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          {ctaText.trim() && (
            <MotionButton className="px-8 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: theme.primaryColor }}>
              {ctaText}
            </MotionButton>
          )}
          {secondaryCtaText.trim() && (
            <MotionButton className="px-8 py-3 rounded-lg font-semibold border-2" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
              {secondaryCtaText}
            </MotionButton>
          )}
        </motion.div>
      </motion.div>
      <motion.div className="relative" variants={slideInRight} initial="hidden" animate="visible">
        {backgroundImage ? (
          <img src={backgroundImage} alt="Hero visual" className="w-full h-64 lg:h-[500px] object-cover rounded-2xl shadow-2xl" />
        ) : (
          <div className="w-full h-64 lg:h-[500px] rounded-2xl" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}40, ${theme.secondaryColor}40)` }} />
        )}
      </motion.div>
    </div>
  );

  // VARIANT: Centered (minimalist, text-focused)
  const renderCentered = () => (
    <motion.div 
      className="max-w-4xl mx-auto text-center overflow-hidden relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {logo && (
        <motion.div variants={itemVariants}>
          <img src={logo} alt={`${siteName} logo`} className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 object-contain" />
        </motion.div>
      )}
      <motion.div variants={itemVariants}>
        {onUpdateContent ? (
          <EditableText
            value={headline}
            onSave={(val) => onUpdateContent('headline', val)}
            as="h1"
            className="text-4xl md:text-6xl font-bold mb-6 break-words"
            style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : theme.primaryColor }}
          />
        ) : (
          <h1 className="text-4xl md:text-6xl font-bold mb-6 break-words" style={{ fontFamily: theme.fontHeading, color: isDark ? '#ffffff' : theme.primaryColor }}>
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
            style={{ fontFamily: theme.fontBody, color: isDark ? '#e5e5e5' : '#4b5563' }}
          />
        ) : (
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto break-words" style={{ fontFamily: theme.fontBody, color: isDark ? '#e5e5e5' : '#4b5563' }}>
            {subheadline}
          </p>
        )}
      </motion.div>
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
        {ctaText.trim() && (
          <MotionButton className="px-8 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: theme.primaryColor }}>
            {ctaText}
          </MotionButton>
        )}
        {secondaryCtaText.trim() && (
          <MotionButton className="px-8 py-3 rounded-lg font-semibold border-2" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
            {secondaryCtaText}
          </MotionButton>
        )}
      </motion.div>
    </motion.div>
  );

  // VARIANT: Glassmorphism (text over blurred background image)
  const renderGlassmorphism = () => (
    <motion.div 
      className="max-w-4xl mx-auto text-center overflow-hidden relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={itemVariants}
        className="backdrop-blur-xl bg-white/10 dark:bg-black/30 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        {logo && (
          <img src={logo} alt={`${siteName} logo`} className="w-20 h-20 mx-auto mb-6 object-contain" />
        )}
        {onUpdateContent ? (
          <EditableText
            value={headline}
            onSave={(val) => onUpdateContent('headline', val)}
            as="h1"
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 break-words tracking-tight"
            style={{ fontFamily: theme.fontHeading, color: '#ffffff', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
          />
        ) : (
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 break-words tracking-tight" style={{ fontFamily: theme.fontHeading, color: '#ffffff', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {headline}
          </h1>
        )}
        {onUpdateContent ? (
          <EditableText
            value={subheadline}
            onSave={(val) => onUpdateContent('subheadline', val)}
            as="p"
            multiline
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto break-words opacity-90"
            style={{ fontFamily: theme.fontBody, color: '#e5e5e5' }}
          />
        ) : (
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto break-words opacity-90" style={{ fontFamily: theme.fontBody, color: '#e5e5e5' }}>
            {subheadline}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {ctaText.trim() && (
            <MotionButton 
              className="px-10 py-4 rounded-full font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {ctaText}
            </MotionButton>
          )}
          {secondaryCtaText.trim() && (
            <MotionButton 
              className="px-10 py-4 rounded-full font-bold text-lg border-2 backdrop-blur-sm"
              style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#ffffff' }}
            >
              {secondaryCtaText}
            </MotionButton>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  // Switch statement to render chosen layout
  const renderContent = () => {
    switch (variant) {
      case 'split':
        return renderSplit();
      case 'glassmorphism':
        return renderGlassmorphism();
      case 'centered':
      default:
        return renderCentered();
    }
  };

  // Background style based on variant
  const getBackgroundStyle = () => {
    if (variant === 'glassmorphism' && backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (variant === 'split') {
      return {
        background: isDark
          ? `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}10)`
          : `linear-gradient(135deg, ${theme.primaryColor}05, ${theme.secondaryColor}05)`,
      };
    }
    return {
      background: isDark
        ? `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)`
        : `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}10)`,
    };
  };

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
        className="min-h-[500px] flex items-center justify-center px-6 relative contain-layout py-16 md:py-24"
        style={getBackgroundStyle()}
      >
        {intensity !== 'off' && intensity !== 'subtle' && <BackgroundAccent position="hero" />}
        {intensity !== 'off' && <SignatureFlourish position="hero" />}
        {renderContent()}
      </section>
    </EditableElement>
  );
}
