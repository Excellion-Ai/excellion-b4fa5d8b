import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteSpec, SiteSection, SiteTheme, AnimationConfig, LayoutStructure } from '@/types/site-spec';
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
import { BentoLayout, BentoPillNav } from './layouts/BentoLayout';
import { SplitScreenLayout, SplitSidebarNav, SplitHero } from './layouts/SplitScreenLayout';
import { LayeredLayout, LayeredNav, LayeredHero, LayeredContentSection } from './layouts/LayeredLayout';
import { HorizontalLayout, HorizontalNav, HorizontalHero, HorizontalScrollSection, HorizontalCard } from './layouts/HorizontalLayout';
import { ScrollAnimation, StaggerContainer } from './animations/ScrollAnimations';

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
  const [horizontalScrollIndex, setHorizontalScrollIndex] = useState(0);
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

  const { theme, pages, navigation, footer, layoutStructure } = siteSpec;
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

  const renderSection = (section: SiteSection, asTile: boolean = false) => {
    const key = section.id;
    const legacySection = toLegacySection(section);
    const commonProps = { section: legacySection, theme: legacyTheme, asTile };

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
            asTile={asTile}
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

  // Determine layout type
  const useBentoLayout = layoutStructure === 'bento';
  const useSplitScreenLayout = layoutStructure === 'split-screen';
  const useLayeredLayout = layoutStructure === 'layered';
  const useHorizontalLayout = layoutStructure === 'horizontal';

  // Render Bento Layout
  const renderBentoLayout = () => {
    const sections = currentPage?.sections || [];
    
    return (
      <div className="min-h-screen relative" style={{ backgroundColor: theme.backgroundColor }}>
        {/* Floating Pill Navigation */}
        <BentoPillNav
          siteName={siteSpec.name}
          navigation={navigation || []}
          theme={theme}
          onUpdateSiteName={onUpdateSiteName}
          onUpdateNavItem={onUpdateNavItem}
        />

        {/* Bento Grid */}
        <main className="p-4 lg:p-8 pb-24">
          {isEditable && onReorderSections ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-12 gap-4 lg:gap-6 auto-rows-min">
                  {sections.map((section) => {
                    const gridConfig = section.gridConfig || getDefaultGridConfig(section);
                    const colSpan = gridConfig.colSpan || 6;
                    const rowSpan = gridConfig.rowSpan || 1;
                    
                    return (
                      <div 
                        key={section.id}
                        className={`col-span-12 lg:col-span-${colSpan} row-span-${rowSpan} transition-all duration-300`}
                        style={{
                          gridColumn: `span ${colSpan} / span ${colSpan}`,
                          gridRow: `span ${rowSpan} / span ${rowSpan}`,
                        }}
                      >
                        <div 
                          className="h-full rounded-2xl overflow-hidden"
                          style={{
                            backgroundColor: theme.darkMode ? '#111111' : '#ffffff',
                            border: `1px solid ${theme.darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                          }}
                        >
                          {renderSection(section, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid grid-cols-12 gap-4 lg:gap-6 auto-rows-min">
              {sections.map((section) => {
                const gridConfig = section.gridConfig || getDefaultGridConfig(section);
                const colSpan = gridConfig.colSpan || 6;
                const rowSpan = gridConfig.rowSpan || 1;
                
                return (
                  <div 
                    key={section.id}
                    className="transition-all duration-300"
                    style={{
                      gridColumn: `span ${colSpan} / span ${colSpan}`,
                      gridRow: `span ${rowSpan} / span ${rowSpan}`,
                    }}
                  >
                    <div 
                      className="h-full rounded-2xl overflow-hidden"
                      style={{
                        backgroundColor: theme.darkMode ? '#111111' : '#ffffff',
                        border: `1px solid ${theme.darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      }}
                    >
                      {renderSection(section, true)}
                    </div>
                  </div>
                );
              })}
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
    );
  };

  // Render Split-Screen Immersive Layout (Portfolio/Luxury)
  const renderSplitScreenLayout = () => {
    const sections = currentPage?.sections || [];
    const heroSection = sections.find(s => s.type === 'hero');
    const otherSections = sections.filter(s => s.type !== 'hero');
    const heroContent = heroSection?.content as any;
    
    return (
      <div 
        className="min-h-screen flex"
        style={{ 
          backgroundColor: theme.backgroundColor,
          fontFamily: theme.fontBody,
        }}
      >
        {/* Vertical Sidebar Navigation */}
        <SplitSidebarNav
          siteName={siteSpec.name}
          navigation={navigation || []}
          theme={theme}
        />

        {/* Main Split Container */}
        <div className="flex-1 ml-16 lg:ml-20 flex min-h-screen">
          {/* Left Panel - Sticky Hero */}
          <div 
            className="w-[45%] lg:w-[40%] sticky top-0 h-screen overflow-hidden"
            style={{
              backgroundColor: theme.darkMode ? '#0f0f0f' : '#f8f8f8',
            }}
          >
            {heroSection ? (
              <SplitHero
                headline={heroContent?.headline || siteSpec.name}
                subheadline={heroContent?.subheadline || 'Welcome to our website'}
                theme={theme}
                backgroundImage={heroContent?.backgroundImage}
              />
            ) : (
              <div 
                className="h-full flex items-center justify-center p-8"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}30, ${theme.secondaryColor}30)`,
                }}
              >
                <h1 
                  className="text-4xl lg:text-6xl font-bold"
                  style={{ 
                    fontFamily: theme.fontHeading,
                    color: theme.darkMode ? '#ffffff' : '#111111',
                  }}
                >
                  {siteSpec.name}
                </h1>
              </div>
            )}
          </div>

          {/* Right Panel - Scrollable Content */}
          <div 
            className="w-[55%] lg:w-[60%] overflow-y-auto"
            style={{
              backgroundColor: theme.backgroundColor,
            }}
          >
            {isEditable && onReorderSections ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={otherSections.map(s => s.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {otherSections.map((section) => (
                    <div key={section.id} className="border-b border-border/10 last:border-0">
                      {renderSection(section, false)}
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              otherSections.map((section) => (
                <div key={section.id} className="border-b border-border/10 last:border-0">
                  {renderSection(section, false)}
                </div>
              ))
            )}
            
            {/* Footer */}
            <footer 
              className="py-12 px-8 text-center"
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
  };

  // Render Layered Z-Index Layout (Creative/Agency)
  const renderLayeredLayout = () => {
    const sections = currentPage?.sections || [];
    const heroSection = sections.find(s => s.type === 'hero');
    const otherSections = sections.filter(s => s.type !== 'hero');
    const heroContent = heroSection?.content as any;
    
    return (
      <div 
        className="min-h-screen relative"
        style={{ 
          backgroundColor: theme.backgroundColor,
          fontFamily: theme.fontBody,
        }}
      >
        {/* Floating Navigation */}
        <LayeredNav
          siteName={siteSpec.name}
          navigation={navigation || []}
          theme={theme}
        />

        {/* Layered Hero */}
        <LayeredHero
          headline={heroContent?.headline || siteSpec.name}
          subheadline={heroContent?.subheadline || 'Creating extraordinary digital experiences'}
          theme={theme}
          backgroundImage={heroContent?.backgroundImage}
        />

        {/* Overlapping Content Sections */}
        <div className="relative pb-20">
          {isEditable && onReorderSections ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={otherSections.map(s => s.id)} 
                strategy={verticalListSortingStrategy}
              >
                {otherSections.map((section, index) => (
                  <LayeredContentSection 
                    key={section.id} 
                    theme={theme}
                    index={index}
                  >
                    {renderSection(section, false)}
                  </LayeredContentSection>
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            otherSections.map((section, index) => (
              <LayeredContentSection 
                key={section.id} 
                theme={theme}
                index={index}
              >
                {renderSection(section, false)}
              </LayeredContentSection>
            ))
          )}
        </div>

        {/* Footer with overlap */}
        <footer 
          className="relative z-50 py-16 px-8"
          style={{ 
            backgroundColor: theme.darkMode ? '#0a0a0a' : '#f9fafb',
            marginTop: '-3rem',
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
            <div>
              <span 
                className="text-2xl font-bold"
                style={{ 
                  fontFamily: theme.fontHeading,
                  color: theme.primaryColor 
                }}
              >
                {siteSpec.name}
              </span>
            </div>
            
            <p 
              className="text-xs"
              style={{ color: theme.darkMode ? '#4b5563' : '#9ca3af' }}
            >
              {footer?.copyright || `© ${new Date().getFullYear()} ${siteSpec.name}. All rights reserved.`}
            </p>
          </div>
        </footer>
      </div>
    );
  };

  // Render Horizontal Flow Layout (Gallery/Showcase)
  const renderHorizontalLayout = () => {
    const sections = currentPage?.sections || [];
    const heroSection = sections.find(s => s.type === 'hero');
    const otherSections = sections.filter(s => s.type !== 'hero');
    const heroContent = heroSection?.content as any;
    
    return (
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: theme.backgroundColor,
          fontFamily: theme.fontBody,
        }}
      >
        {/* Top Navigation */}
        <HorizontalNav
          siteName={siteSpec.name}
          navigation={navigation || []}
          theme={theme}
          currentIndex={horizontalScrollIndex}
          totalSections={otherSections.length + 1}
        />

        {/* Main Content */}
        <div className="pt-20">
          {/* Hero Horizontal Section */}
          <section className="mb-8">
            <div className="px-6 lg:px-12 mb-4">
              <h2 
                className="text-xs uppercase tracking-[0.3em] opacity-50"
                style={{ color: theme.darkMode ? '#fff' : '#000' }}
              >
                Showcase
              </h2>
            </div>
            
            <HorizontalScrollSection theme={theme} onScrollChange={setHorizontalScrollIndex}>
              {/* Hero Card */}
              <HorizontalCard theme={theme} isHero>
                <HorizontalHero
                  headline={heroContent?.headline || siteSpec.name}
                  subheadline={heroContent?.subheadline || 'Creating extraordinary experiences'}
                  theme={theme}
                  backgroundImage={heroContent?.backgroundImage}
                />
              </HorizontalCard>
              
              {/* Feature cards in horizontal scroll */}
              {otherSections.slice(0, 4).map((section, index) => (
                <HorizontalCard key={section.id} theme={theme}>
                  <div className="p-6 lg:p-8 h-full flex flex-col">
                    <span 
                      className="text-xs uppercase tracking-wider opacity-50 mb-2"
                      style={{ color: theme.darkMode ? '#fff' : '#000' }}
                    >
                      0{index + 1}
                    </span>
                    <ScrollAnimation animation="fade-up" delay={index * 100}>
                      {renderSection(section, false)}
                    </ScrollAnimation>
                  </div>
                </HorizontalCard>
              ))}
            </HorizontalScrollSection>
          </section>

          {/* Remaining content in vertical flow with animations */}
          {otherSections.length > 4 && (
            <section className="px-6 lg:px-12 py-12">
              <StaggerContainer staggerDelay={150} animation="fade-up">
                {otherSections.slice(4).map((section) => (
                  <div key={section.id} className="mb-12">
                    {renderSection(section, false)}
                  </div>
                ))}
              </StaggerContainer>
            </section>
          )}

          {/* Footer */}
          <footer 
            className="py-16 px-6 lg:px-12"
            style={{ 
              backgroundColor: theme.darkMode ? '#0a0a0a' : '#f9fafb',
              borderTop: `1px solid ${theme.darkMode ? '#1f1f1f' : '#e5e7eb'}`
            }}
          >
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
              <span 
                className="text-xl font-bold"
                style={{ 
                  fontFamily: theme.fontHeading,
                  color: theme.primaryColor 
                }}
              >
                {siteSpec.name}
              </span>
              
              <p 
                className="text-xs"
                style={{ color: theme.darkMode ? '#4b5563' : '#9ca3af' }}
              >
                {footer?.copyright || `© ${new Date().getFullYear()} ${siteSpec.name}. All rights reserved.`}
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  };

  // Render Standard Layout (default)
  const renderStandardLayout = () => (
    <div 
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
                {currentPage.sections.map((s) => renderSection(s, false))}
              </SortableContext>
            </DndContext>
          ) : (
            currentPage.sections.map((s) => renderSection(s, false))
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
  );

  return (
    <div className="h-full flex flex-col">
      {/* Preview controls */}
      <div className="h-10 border-b border-border/50 px-3 flex items-center justify-between bg-background/80 flex-shrink-0">
        <span className="text-xs text-muted-foreground">
          {siteSpec.name || 'Generated Site'}
          {layoutStructure && layoutStructure !== 'standard' && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary">
              {layoutStructure.toUpperCase()}
            </span>
          )}
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
        >
          {useBentoLayout 
            ? renderBentoLayout() 
            : useSplitScreenLayout 
              ? renderSplitScreenLayout() 
              : useLayeredLayout
                ? renderLayeredLayout()
                : useHorizontalLayout
                  ? renderHorizontalLayout()
                  : renderStandardLayout()
          }
        </div>
      </div>
    </div>
  );
}

// Default grid configuration based on section type
function getDefaultGridConfig(section: SiteSection): { colSpan: number; rowSpan: number } {
  switch (section.type) {
    case 'hero':
      return { colSpan: 8, rowSpan: 2 };
    case 'stats':
      return { colSpan: 4, rowSpan: 1 };
    case 'features':
      return { colSpan: 6, rowSpan: 1 };
    case 'testimonials':
      return { colSpan: 6, rowSpan: 1 };
    case 'pricing':
      return { colSpan: 12, rowSpan: 1 };
    case 'cta':
      return { colSpan: 8, rowSpan: 1 };
    case 'contact':
      return { colSpan: 4, rowSpan: 1 };
    case 'faq':
      return { colSpan: 6, rowSpan: 1 };
    default:
      return { colSpan: 6, rowSpan: 1 };
  }
}
