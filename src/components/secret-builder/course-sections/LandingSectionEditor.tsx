import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronUp, 
  ChevronDown, 
  X, 
  Plus,
  Save,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LandingSectionEditorProps {
  courseId?: string;
  sections: string[];
  onSectionsChange: (sections: string[]) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  outcomes: "What You'll Learn",
  curriculum: 'Curriculum Overview',
  instructor: 'Meet Your Instructor',
  testimonials: 'Student Testimonials',
  features: 'Course Features',
  faq: 'Frequently Asked Questions',
  guarantee: 'Money-Back Guarantee',
  bonus: 'Bonus Materials',
  cta: 'Enroll CTA',
};

const ALL_SECTIONS = ['hero', 'outcomes', 'curriculum', 'instructor', 'testimonials', 'features', 'faq', 'guarantee', 'bonus', 'cta'];
const REQUIRED_SECTIONS = ['hero', 'cta'];

export function LandingSectionEditor({
  courseId,
  sections,
  onSectionsChange,
  onSave,
  onCancel,
}: LandingSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    onSectionsChange(newSections);
  };

  const handleMoveDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    onSectionsChange(newSections);
  };

  const handleRemove = (sectionId: string) => {
    if (REQUIRED_SECTIONS.includes(sectionId)) return;
    onSectionsChange(sections.filter(s => s !== sectionId));
  };

  const handleAdd = (sectionId: string) => {
    if (!sections.includes(sectionId)) {
      onSectionsChange([...sections, sectionId]);
    }
  };

  const handleSave = async () => {
    if (!courseId) {
      toast.success('Layout saved locally');
      onSave?.();
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          page_sections: {
            landing: sections,
          },
        })
        .eq('id', courseId);

      if (error) throw error;
      toast.success('Layout saved successfully');
      onSave?.();
    } catch (error) {
      console.error('Failed to save layout:', error);
      toast.error('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  };

  const availableSections = ALL_SECTIONS.filter(s => !sections.includes(s));

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        {sections.map((sectionId, index) => {
          const isRequired = REQUIRED_SECTIONS.includes(sectionId);
          return (
            <div
              key={sectionId}
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-amber-500/30"
            >
              <span className="text-sm font-medium text-foreground">
                {SECTION_LABELS[sectionId] || sectionId}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {!isRequired && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(sectionId)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {availableSections.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full border-amber-500/30 text-amber-400">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {availableSections.map((sectionId) => (
              <DropdownMenuItem
                key={sectionId}
                onClick={() => handleAdd(sectionId)}
              >
                {SECTION_LABELS[sectionId] || sectionId}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Layout
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
