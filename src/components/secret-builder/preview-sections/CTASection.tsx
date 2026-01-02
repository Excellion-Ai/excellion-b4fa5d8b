import { SiteSection, SiteTheme, CTAContent } from '@/types/app-spec';
import { ScrollAnimation } from '../animations/ScrollAnimations';
import { EditableText } from '../EditableText';
import { RenderMode } from '../SiteRenderer';

interface CTASectionProps {
  section: SiteSection;
  theme: SiteTheme;
  renderMode?: RenderMode;
  onUpdateContent?: (field: keyof CTAContent, value: string) => void;
}

export function CTASection({ 
  section, 
  theme, 
  renderMode = 'preview',
  onUpdateContent 
}: CTASectionProps) {
  const content = section.content as CTAContent | undefined;
  
  // SPEC-FIRST: Use exactly what the AI provided, show empty state if missing
  const headline = content?.headline || '';
  const subheadline = content?.subheadline || '';
  const ctaText = content?.ctaText || 'Get Started';
  
  // If no content at all, render minimal placeholder
  if (!content?.headline && !content?.subheadline) {
    return (
      <section 
        id={section.id}
        className="py-10 md:py-14 px-6 w-full min-h-[150px] contain-layout flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
        }}
      >
        <div className="text-center text-white/60 text-sm">
          CTA section - content pending
        </div>
      </section>
    );
  }
  
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
        {subheadline && (
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
        )}
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
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}