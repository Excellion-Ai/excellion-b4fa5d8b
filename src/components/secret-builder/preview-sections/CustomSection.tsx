import { SiteSection, SiteTheme } from '@/types/site-spec';
import type { SiteSection as AppSiteSection, SiteTheme as AppSiteTheme } from '@/types/app-spec';
import { ScrollAnimation } from '../animations/ScrollAnimations';
import { INTEGRATION_COMPONENTS } from '../integration-components';

// Support both site-spec and app-spec types
type AnyTheme = SiteTheme | AppSiteTheme;
type AnySection = SiteSection | AppSiteSection;

interface CustomSectionProps {
  section: AnySection;
  theme: AnyTheme;
}

// Type guard to check if content has componentType
function hasComponentType(content: any): content is { componentType: string; props?: Record<string, any>; title?: string; body?: string } {
  return content && typeof content.componentType === 'string';
}

export function CustomSection({ section, theme }: CustomSectionProps) {
  const content = section.content as any;
  const isDarkMode = 'darkMode' in theme ? theme.darkMode : theme.backgroundStyle === 'dark';
  const fontHeading = theme.fontHeading || 'Inter, sans-serif';
  const fontBody = theme.fontBody || 'Inter, sans-serif';
  
  // Check if this is an integration component
  if (hasComponentType(content)) {
    const IntegrationComponent = INTEGRATION_COMPONENTS[content.componentType];
    if (IntegrationComponent) {
      return (
        <section 
          id={section.id}
          className="py-16 px-6 min-h-[200px] contain-layout"
          style={{ 
            backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation animation="fade-up">
              <IntegrationComponent 
                section={section} 
                theme={theme} 
                {...(content.props || {})} 
              />
            </ScrollAnimation>
          </div>
        </section>
      );
    }
  }
  
  // Default custom section rendering
  return (
    <section 
      id={section.id}
      className="py-16 px-6 min-h-[150px] contain-layout"
      style={{ 
        backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff'
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <ScrollAnimation animation="fade-up">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ 
              fontFamily: fontHeading,
              color: isDarkMode ? '#ffffff' : '#111827'
            }}
          >
            {section.label}
          </h2>
        </ScrollAnimation>
        <ScrollAnimation animation="fade-up" delay={150}>
          <p 
            className="text-base"
            style={{ 
              fontFamily: fontBody,
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            {section.description || content?.body || ''}
          </p>
        </ScrollAnimation>
      </div>
    </section>
  );
}
