import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteSpec, SiteSection, SiteTheme, AnimationConfig } from '@/types/site-spec';
import { SiteTheme as AppSiteTheme, HeroContent, FeaturesContent, FeatureItem } from '@/types/app-spec';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  HeroSection,
  FeaturesSection,
  PricingSection,
  TestimonialsSection,
  FAQSection,
  ContactSection,
  CTASection,
  CustomSection,
  StatsSection,
} from './preview-sections';
import { EditableText } from './EditableText';
import { DraggableSection } from './DraggableSection';
import { AnimatedSection } from './AnimatedSection';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface SiteRendererProps {
  siteSpec: SiteSpec | null;
  pageIndex?: number;
  isLoading: boolean;
  onUpdateHeroContent?: (sectionId: string, field: keyof HeroContent, value: string) => void;
  onUpdateFeaturesContent?: (sectionId: string, field: keyof FeaturesContent, value: string) => void;
  onUpdateFeatureItem?: (sectionId: string, index: number, field: keyof FeatureItem, value: string) => void;
  onUpdateSiteName?: (name: string) => void;
  onUpdateNavItem?: (index: number, label: string) => void;
  onReorderSections?: (oldIndex: number, newIndex: number) => void;
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
  pageIndex = 0,
  isLoading,
  onUpdateHeroContent,
  onUpdateFeaturesContent,
  onUpdateFeatureItem,
  onUpdateSiteName,
  onUpdateNavItem,
  onReorderSections,
}: SiteRendererProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  const currentPage = pages[pageIndex] || pages[0];
  const legacyTheme = toSectionTheme(theme);
  const isEditable = !!onUpdateHeroContent;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && onReorderSections) {
      const sections = currentPage?.sections || [];
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderSections(oldIndex, newIndex);
      }
    }
  };

  const renderSection = (section: SiteSection) => {
    const key = section.id;
    const legacySection = toLegacySection(section);
    const commonProps = { section: legacySection, theme: legacyTheme };

    let sectionContent;
    switch (section.type) {
      case 'hero':
        sectionContent = (
          <HeroSection 
            {...commonProps} 
            siteName={siteSpec.name}
            onUpdateContent={onUpdateHeroContent ? (field, value) => onUpdateHeroContent(section.id, field, value) : undefined}
          />
        );
        break;
      case 'features':
        sectionContent = (
          <FeaturesSection 
            {...commonProps}
            onUpdateContent={onUpdateFeaturesContent ? (field, value) => onUpdateFeaturesContent(section.id, field, value) : undefined}
            onUpdateItem={onUpdateFeatureItem ? (index, field, value) => onUpdateFeatureItem(section.id, index, field, value) : undefined}
          />
        );
        break;
      case 'pricing':
        sectionContent = <PricingSection {...commonProps} />;
        break;
      case 'testimonials':
        sectionContent = <TestimonialsSection {...commonProps} />;
        break;
      case 'faq':
        sectionContent = <FAQSection {...commonProps} />;
        break;
      case 'contact':
        sectionContent = <ContactSection {...commonProps} />;
        break;
      case 'cta':
        sectionContent = <CTASection {...commonProps} />;
        break;
      case 'stats':
        sectionContent = (
          <StatsSection 
            content={section.content as any}
            theme={{
              primaryColor: theme.primaryColor,
              backgroundColor: theme.backgroundColor,
              textColor: theme.textColor,
            }}
          />
        );
        break;
      default:
        sectionContent = <CustomSection {...commonProps} />;
    }

    return (
      <DraggableSection key={key} id={section.id} isEditable={isEditable}>
        <AnimatedSection animation={section.animation}>
          {sectionContent}
        </AnimatedSection>
      </DraggableSection>
    );
  };

  const sectionIds = currentPage?.sections?.map((s) => s.id) || [];

  return (
    <div className="h-full flex flex-col">
      {/* Preview controls */}
      <div className="h-10 border-b border-border/50 px-3 flex items-center justify-between bg-background/80 flex-shrink-0">
        <span className="text-xs text-muted-foreground">
          {siteSpec.name || 'Generated Site'}
          {isEditable && <span className="ml-2 text-primary">(Click text to edit, drag to reorder)</span>}
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

          {/* Render all sections with drag and drop */}
          <main>
            {currentPage?.sections?.length > 0 ? (
              isEditable && onReorderSections ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                    {currentPage.sections.map(renderSection)}
                  </SortableContext>
                </DndContext>
              ) : (
                currentPage.sections.map(renderSection)
              )
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
