import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Save,
  Eye,
  Globe,
  Check,
  AlertTriangle,
  Loader2,
  Cloud,
  CloudOff,
} from 'lucide-react';

interface ChecklistItem {
  label: string;
  complete: boolean;
  required: boolean;
}

interface CourseActionBarProps {
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  checklist: ChecklistItem[];
}

export function CourseActionBar({
  onSaveDraft,
  onPreview,
  onPublish,
  isSaving,
  isPublishing,
  saveStatus,
  checklist,
}: CourseActionBarProps) {
  const requiredComplete = checklist.filter((item) => item.required && item.complete).length;
  const requiredTotal = checklist.filter((item) => item.required).length;
  const canPublish = requiredComplete === requiredTotal;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Save Status */}
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === 'saving' ? (
            <>
              <Cloud className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-muted-foreground">Saving...</span>
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Saved</span>
            </>
          ) : (
            <>
              <CloudOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Unsaved</span>
            </>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSaving || saveStatus === 'saved'}
            className="gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Save Draft</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="gap-1.5"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            size="sm"
            onClick={onPublish}
            disabled={isPublishing}
            className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            <span>Publish Course</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
