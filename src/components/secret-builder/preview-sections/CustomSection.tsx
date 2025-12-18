import { SiteSection, SiteTheme } from '@/types/app-spec';
import { ScrollAnimation } from '../animations/ScrollAnimations';

interface CustomSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

export function CustomSection({ section, theme }: CustomSectionProps) {
  return (
    <section 
      id={section.id}
      className="py-16 px-6"
      style={{ 
        backgroundColor: theme.darkMode ? '#0a0a0a' : '#ffffff'
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <ScrollAnimation animation="fade-up">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ 
              fontFamily: theme.fontHeading,
              color: theme.darkMode ? '#ffffff' : '#111827'
            }}
          >
            {section.label}
          </h2>
        </ScrollAnimation>
        <ScrollAnimation animation="fade-up" delay={150}>
          <p 
            className="text-base"
            style={{ 
              fontFamily: theme.fontBody,
              color: theme.darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            {section.description || 'Custom section content goes here.'}
          </p>
        </ScrollAnimation>
      </div>
    </section>
  );
}
