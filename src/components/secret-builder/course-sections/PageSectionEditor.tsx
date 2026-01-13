import React, { useState, useCallback, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SectionEditor } from './SectionEditor';
import { 
  getSectionsForPage, 
  DEFAULT_PAGE_SECTIONS 
} from './sectionConfigs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';

export interface PageSections {
  landing: string[];
  curriculum: string[];
  lesson: string[];
  dashboard: string[];
}

interface PageSectionEditorProps {
  courseId?: string;
  initialSections?: Partial<PageSections>;
  activeTab: 'landing' | 'curriculum' | 'lesson' | 'dashboard';
  onSectionsChange?: (sections: PageSections) => void;
}

export function PageSectionEditor({
  courseId,
  initialSections,
  activeTab,
  onSectionsChange,
}: PageSectionEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [sections, setSections] = useState<PageSections>(() => ({
    landing: initialSections?.landing || DEFAULT_PAGE_SECTIONS.landing,
    curriculum: initialSections?.curriculum || DEFAULT_PAGE_SECTIONS.curriculum,
    lesson: initialSections?.lesson || DEFAULT_PAGE_SECTIONS.lesson,
    dashboard: initialSections?.dashboard || DEFAULT_PAGE_SECTIONS.dashboard,
  }));

  useEffect(() => {
    if (initialSections) {
      setSections(prev => ({
        landing: initialSections.landing || prev.landing,
        curriculum: initialSections.curriculum || prev.curriculum,
        lesson: initialSections.lesson || prev.lesson,
        dashboard: initialSections.dashboard || prev.dashboard,
      }));
    }
  }, [initialSections]);

  const handleSectionsChange = useCallback((pageType: keyof PageSections, newSections: string[]) => {
    setSections(prev => {
      const updated = { ...prev, [pageType]: newSections };
      onSectionsChange?.(updated);
      return updated;
    });
  }, [onSectionsChange]);

  const handleSave = useCallback(async () => {
    if (!courseId) {
      toast.success('Layout updated locally');
      setIsEditMode(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update({ page_sections: JSON.parse(JSON.stringify(sections)) })
        .eq('id', courseId);

      if (error) throw error;

      toast.success('Page layout saved successfully');
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save page sections:', error);
      throw error;
    }
  }, [courseId, sections]);

  const currentSections = sections[activeTab];
  const availableSections = getSectionsForPage(activeTab);

  return (
    <Sheet open={isEditMode} onOpenChange={setIsEditMode}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 transition-colors',
            isEditMode
              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600'
              : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
          )}
        >
          <Settings2 className="w-4 h-4" />
          Edit Layout
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background border-l border-border">
        <SheetHeader>
          <SheetTitle className="text-amber-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-400" />
            Edit Page Layout
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <SectionEditor
            sections={currentSections}
            availableSections={availableSections}
            onSectionsChange={(newSections) => handleSectionsChange(activeTab, newSections)}
            onSave={handleSave}
            pageType={activeTab}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Hook for managing page sections
export function usePageSections(
  courseId?: string,
  initialSections?: Partial<PageSections>
) {
  const [sections, setSections] = useState<PageSections>(() => ({
    landing: initialSections?.landing || DEFAULT_PAGE_SECTIONS.landing,
    curriculum: initialSections?.curriculum || DEFAULT_PAGE_SECTIONS.curriculum,
    lesson: initialSections?.lesson || DEFAULT_PAGE_SECTIONS.lesson,
    dashboard: initialSections?.dashboard || DEFAULT_PAGE_SECTIONS.dashboard,
  }));

  useEffect(() => {
    if (initialSections) {
      setSections(prev => ({
        landing: initialSections.landing || prev.landing,
        curriculum: initialSections.curriculum || prev.curriculum,
        lesson: initialSections.lesson || prev.lesson,
        dashboard: initialSections.dashboard || prev.dashboard,
      }));
    }
  }, [initialSections]);

  const getSectionsForCurrentPage = useCallback((pageType: keyof PageSections) => {
    return sections[pageType];
  }, [sections]);

  const isSectionEnabled = useCallback((pageType: keyof PageSections, sectionId: string) => {
    return sections[pageType].includes(sectionId);
  }, [sections]);

  const saveSections = useCallback(async () => {
    if (!courseId) return;

    const { error } = await supabase
      .from('courses')
      .update({ page_sections: JSON.parse(JSON.stringify(sections)) })
      .eq('id', courseId);

    if (error) {
      toast.error('Failed to save page layout');
      throw error;
    }

    toast.success('Page layout saved');
  }, [courseId, sections]);

  return {
    sections,
    setSections,
    getSectionsForCurrentPage,
    isSectionEnabled,
    saveSections,
  };
}
