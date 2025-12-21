import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteDefinition, SiteTheme } from '@/types/app-spec';
import {
  HeroSection,
  FeaturesSection,
  PricingSection,
  TestimonialsSection,
  FAQSection,
  ContactSection,
  CTASection,
  CustomSection,
} from './preview-sections';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface SitePreviewProps {
  siteDefinition: SiteDefinition | null;
  isLoading: boolean;
}

// Default theme fallback
const defaultTheme: SiteTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  accentColor: '#f59e0b',
  fontHeading: 'Inter, sans-serif',
  fontBody: 'Inter, sans-serif',
  darkMode: false,
};

export function SitePreview({ siteDefinition, isLoading }: SitePreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const previewWidth = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Generating site...</p>
        </div>
      </div>
    );
  }

  if (!siteDefinition) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground max-w-xs">
          <Monitor className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No site generated yet. Enter an idea to see a live preview.
          </p>
        </div>
      </div>
    );
  }

  const theme = siteDefinition.theme || defaultTheme;

  // Render a section based on its type
  const renderSection = (section: SiteDefinition['sections'][0]) => {
    const key = section.id;
    const commonProps = { section, theme };

    switch (section.type) {
      case 'hero':
        return <HeroSection key={key} {...commonProps} siteName={siteDefinition.name} />;
      case 'features':
        return <FeaturesSection key={key} {...commonProps} />;
      case 'pricing':
        return <PricingSection key={key} {...commonProps} />;
      case 'testimonials':
        return <TestimonialsSection key={key} {...commonProps} />;
      case 'faq':
        return <FAQSection key={key} {...commonProps} />;
      case 'contact':
        return <ContactSection key={key} {...commonProps} />;
      case 'cta':
        return <CTASection key={key} {...commonProps} />;
      case 'stats':
      case 'team':
      case 'gallery':
      case 'custom':
      default:
        return <CustomSection key={key} {...commonProps} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview controls */}
      <div className="h-10 border-b border-border/50 px-3 flex items-center justify-between bg-background/80 flex-shrink-0">
        <span className="text-xs text-muted-foreground">
          {siteDefinition.name || 'Generated Site'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setPreviewMode('desktop')}
          >
            <Monitor className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setPreviewMode('tablet')}
          >
            <Tablet className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview content - pure React rendering, no iframe */}
      <div className="flex-1 overflow-auto bg-[#1a1a1a] flex justify-center p-4">
        <div 
          data-preview-panel
          className={`${previewWidth[previewMode]} h-fit min-h-full rounded-lg overflow-hidden shadow-2xl transition-all duration-300`}
          style={{ 
            backgroundColor: theme.darkMode ? '#0a0a0a' : '#ffffff',
            fontFamily: theme.fontBody
          }}
        >
          {/* Navigation bar */}
          <nav 
            className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
            style={{ 
              backgroundColor: theme.darkMode ? '#111111' : '#ffffff',
              borderBottom: `1px solid ${theme.darkMode ? '#1f1f1f' : '#e5e7eb'}`
            }}
          >
            <span 
              className="font-bold text-lg"
              style={{ 
                fontFamily: theme.fontHeading,
                color: theme.primaryColor
              }}
            >
              {siteDefinition.name}
            </span>
            <div className="flex items-center gap-6">
              {siteDefinition.navigation?.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ 
                    color: theme.darkMode ? '#d1d5db' : '#4b5563'
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Render all sections */}
          <main>
            {siteDefinition.sections?.length > 0 ? (
              siteDefinition.sections.map(renderSection)
            ) : (
              <div className="py-20 text-center text-gray-500">
                No sections defined
              </div>
            )}
          </main>

          {/* Footer */}
          <footer 
            className="py-8 px-6 text-center"
            style={{ 
              backgroundColor: theme.darkMode ? '#0a0a0a' : '#f9fafb',
              borderTop: `1px solid ${theme.darkMode ? '#1f1f1f' : '#e5e7eb'}`
            }}
          >
            <p 
              className="text-sm"
              style={{ color: theme.darkMode ? '#6b7280' : '#9ca3af' }}
            >
              © {new Date().getFullYear()} {siteDefinition.name}. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
