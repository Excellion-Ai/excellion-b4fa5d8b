import { SiteSection, SiteTheme } from '@/types/app-spec';

interface CTASectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

export function CTASection({ section, theme }: CTASectionProps) {
  return (
    <section 
      id={section.id}
      className="py-20 px-6"
      style={{ 
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className="text-3xl md:text-4xl font-bold mb-4 text-white"
          style={{ fontFamily: theme.fontHeading }}
        >
          {section.label || 'Ready to Get Started?'}
        </h2>
        <p 
          className="text-lg mb-8 text-white/90 max-w-2xl mx-auto"
          style={{ fontFamily: theme.fontBody }}
        >
          {section.description || 'Join thousands of satisfied customers and transform your business today.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{ 
              backgroundColor: '#ffffff',
              color: theme.primaryColor
            }}
          >
            Start Free Trial
          </button>
          <button
            className="px-8 py-3 rounded-lg font-semibold border-2 border-white text-white transition-all hover:bg-white/10"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}
