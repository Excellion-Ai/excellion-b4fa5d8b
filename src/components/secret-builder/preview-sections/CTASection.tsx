import { SiteSection, SiteTheme, CTAContent } from '@/types/app-spec';
import { ScrollAnimation } from '../animations/ScrollAnimations';

interface CTASectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

export function CTASection({ section, theme }: CTASectionProps) {
  const content = section.content as CTAContent | undefined;
  
  const headline = content?.headline || section.label || 'Ready to Get Started?';
  const subheadline = content?.subheadline || section.description || 'Join thousands of satisfied customers and transform your business today.';
  const ctaText = content?.ctaText || 'Start Free Trial';
  
  return (
    <section 
      id={section.id}
      className="py-10 md:py-14 px-6 w-full"
      style={{ 
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
      }}
    >
      <div className="w-full text-center">
        <ScrollAnimation animation="fade-up">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            style={{ fontFamily: theme.fontHeading }}
          >
            {headline}
          </h2>
        </ScrollAnimation>
        <ScrollAnimation animation="fade-up" delay={150}>
          <p 
            className="text-lg mb-8 text-white/90 max-w-2xl mx-auto"
            style={{ fontFamily: theme.fontBody }}
          >
            {subheadline}
          </p>
        </ScrollAnimation>
        <ScrollAnimation animation="scale-up" delay={300}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{ 
                backgroundColor: '#ffffff',
                color: theme.primaryColor
              }}
            >
              {ctaText}
            </button>
            <button
              className="px-8 py-3 rounded-lg font-semibold border-2 border-white text-white transition-all hover:bg-white/10"
            >
              Contact Sales
            </button>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
