import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteSpec, SiteSection, SiteTheme } from '@/types/site-spec';
import { SiteTheme as AppSiteTheme, HeroContent, FeaturesContent, FeatureItem } from '@/types/app-spec';
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
import { EditableText } from './EditableText';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface SiteRendererProps {
  siteSpec: SiteSpec | null;
  isLoading: boolean;
  onUpdateHeroContent?: (sectionId: string, field: keyof HeroContent, value: string) => void;
  onUpdateFeaturesContent?: (sectionId: string, field: keyof FeaturesContent, value: string) => void;
  onUpdateFeatureItem?: (sectionId: string, index: number, field: keyof FeatureItem, value: string) => void;
  onUpdateSiteName?: (name: string) => void;
  onUpdateNavItem?: (index: number, label: string) => void;
}

// Convert SiteSpec theme to app-spec compatible theme
function toSectionTheme(theme: SiteTheme): AppSiteTheme {
  return {
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    fontHeading: theme.fontHeading,
    fontBody: theme.fontBody,
    darkMode: theme.darkMode,
    backgroundStyle: theme.darkMode ? 'dark' : 'light',
  };
}

// Convert section format for preview components
function toLegacySection(section: SiteSection) {
  return {
    id: section.id,
    type: section.type as any,
    label: section.label,
    content: section.content,
  };
}

export function SiteRenderer({ 
  siteSpec, 
  isLoading,
  onUpdateHeroContent,
  onUpdateFeaturesContent,
  onUpdateFeatureItem,
  onUpdateSiteName,
  onUpdateNavItem,
}: SiteRendererProps) {
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

  if (!siteSpec) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground max-w-xs">
          <Monitor className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Describe your business to see a live preview.
          </p>
        </div>
      </div>
    );
  }

  const { theme, pages, navigation, footer } = siteSpec;
  const currentPage = pages[0];
  const legacyTheme = toSectionTheme(theme);
  const isEditable = !!onUpdateHeroContent;

  const renderSection = (section: SiteSection) => {
    const key = section.id;
    const legacySection = toLegacySection(section);
    const commonProps = { section: legacySection, theme: legacyTheme };

    switch (section.type) {
      case 'hero':
        return (
          <HeroSection 
            key={key} 
            {...commonProps} 
            siteName={siteSpec.name}
            onUpdateContent={onUpdateHeroContent ? (field, value) => onUpdateHeroContent(section.id, field, value) : undefined}
          />
        );
      case 'features':
        return (
          <FeaturesSection 
            key={key} 
            {...commonProps}
            onUpdateContent={onUpdateFeaturesContent ? (field, value) => onUpdateFeaturesContent(section.id, field, value) : undefined}
            onUpdateItem={onUpdateFeatureItem ? (index, field, value) => onUpdateFeatureItem(section.id, index, field, value) : undefined}
          />
        );
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
      default:
        return <CustomSection key={key} {...commonProps} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview controls */}
      <div className="h-10 border-b border-border/50 px-3 flex items-center justify-between bg-background/80 flex-shrink-0">
        <span className="text-xs text-muted-foreground">
          {siteSpec.name || 'Generated Site'}
          {isEditable && <span className="ml-2 text-primary">(Click text to edit)</span>}
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

      {/* Preview content */}
      <div className="flex-1 overflow-auto bg-[#1a1a1a] flex justify-center p-4">
        <div 
          className={`${previewWidth[previewMode]} h-fit min-h-full rounded-lg overflow-hidden shadow-2xl transition-all duration-300`}
          style={{ 
            backgroundColor: theme.backgroundColor,
            fontFamily: theme.fontBody,
            color: theme.textColor,
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
            {onUpdateSiteName ? (
              <EditableText
                value={siteSpec.name}
                onSave={onUpdateSiteName}
                as="span"
                className="font-bold text-lg"
                style={{ 
                  fontFamily: theme.fontHeading,
                  color: theme.primaryColor
                }}
              />
            ) : (
              <span 
                className="font-bold text-lg"
                style={{ 
                  fontFamily: theme.fontHeading,
                  color: theme.primaryColor
                }}
              >
                {siteSpec.name}
              </span>
            )}
            <div className="flex items-center gap-6">
              {navigation?.map((item, index) => (
                onUpdateNavItem ? (
                  <EditableText
                    key={index}
                    value={item.label}
                    onSave={(val) => onUpdateNavItem(index, val)}
                    as="span"
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ 
                      color: theme.darkMode ? '#d1d5db' : '#4b5563'
                    }}
                  />
                ) : (
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
                )
              ))}
            </div>
          </nav>

          {/* Render all sections */}
          <main>
            {currentPage?.sections?.length > 0 ? (
              currentPage.sections.map(renderSection)
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
              {footer?.copyright || `© ${new Date().getFullYear()} ${siteSpec.name}. All rights reserved.`}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
