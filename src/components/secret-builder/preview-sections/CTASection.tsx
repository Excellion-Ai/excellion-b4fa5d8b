import { SiteSection, SiteTheme, CTAContent } from '@/types/app-spec';
import { ScrollAnimation } from '../animations/ScrollAnimations';
import { EditableText } from '../EditableText';
import { RenderMode } from '../SiteRenderer';
import { 
  BusinessIntent, 
  CTA_CONTENT, 
  SECONDARY_CTA 
} from '@/lib/intentAwareFallbacks';

interface CTASectionProps {
  section: SiteSection;
  theme: SiteTheme;
  renderMode?: RenderMode;
  businessIntent?: BusinessIntent;
  onUpdateContent?: (field: keyof CTAContent, value: string) => void;
}

export function CTASection({ 
  section, 
  theme, 
  renderMode = 'preview',
  businessIntent = 'service_business',
  onUpdateContent 
}: CTASectionProps) {
  const content = section.content as CTAContent | undefined;
  
  // Get intent-aware fallback content
  const intentCTA = CTA_CONTENT[businessIntent];
  const secondaryCTA = SECONDARY_CTA[businessIntent];
  
  // Use provided content or intent-aware fallbacks (never generic)
  const headline = content?.headline || intentCTA.headline;
  const subheadline = content?.subheadline || intentCTA.subheadline;
  const ctaText = content?.ctaText || intentCTA.ctaText;
  
  return (
    <section 
      id={section.id}
      className="py-10 md:py-14 px-6 w-full min-h-[200px] contain-layout"
      style={{ 
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
      }}
    >
      <div className="w-full text-center overflow-hidden">
        <ScrollAnimation animation="fade-up">
          {onUpdateContent ? (
            <EditableText
              value={headline}
              onSave={(val) => onUpdateContent('headline', val)}
              as="h2"
              className="text-3xl md:text-4xl font-bold mb-4 text-white break-words"
              style={{ fontFamily: theme.fontHeading, overflowWrap: 'anywhere' }}
            />
          ) : (
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4 text-white break-words"
              style={{ fontFamily: theme.fontHeading, overflowWrap: 'anywhere' }}
            >
              {headline}
            </h2>
          )}
        </ScrollAnimation>
        <ScrollAnimation animation="fade-up" delay={150}>
          {onUpdateContent ? (
            <EditableText
              value={subheadline}
              onSave={(val) => onUpdateContent('subheadline', val)}
              as="p"
              multiline
              className="text-lg mb-8 text-white/90 max-w-2xl mx-auto break-words"
              style={{ fontFamily: theme.fontBody, overflowWrap: 'anywhere' }}
            />
          ) : (
            <p 
              className="text-lg mb-8 text-white/90 max-w-2xl mx-auto break-words"
              style={{ fontFamily: theme.fontBody, overflowWrap: 'anywhere' }}
            >
              {subheadline}
            </p>
          )}
        </ScrollAnimation>
        <ScrollAnimation animation="scale-up" delay={300}>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 shrink-0"
              style={{ 
                backgroundColor: '#ffffff',
                color: theme.primaryColor
              }}
            >
              {ctaText}
            </button>
            <button
              className="px-8 py-3 rounded-lg font-semibold border-2 border-white text-white transition-all hover:bg-white/10 shrink-0"
            >
              {secondaryCTA.text}
            </button>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}