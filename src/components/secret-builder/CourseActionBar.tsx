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
        {/* Left: Save Status & Checklist */}
        <div className="flex items-center gap-4">
          {/* Auto-save indicator */}
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

          {/* Checklist summary */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  {checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
                        item.complete
                          ? 'bg-green-500/10 text-green-500'
                          : item.required
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.complete ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                    </div>
                  ))}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">Publishing Checklist</p>
                  {checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {item.complete ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : item.required ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
                      )}
                      <span className={item.complete ? 'text-foreground' : 'text-muted-foreground'}>
                        {item.label}
                        {!item.required && ' (optional)'}
                      </span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="sm"
                    onClick={onPublish}
                    disabled={!canPublish || isPublishing}
                    className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {isPublishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                    <span>Publish Course</span>
                  </Button>
                </span>
              </TooltipTrigger>
              {!canPublish && (
                <TooltipContent side="top">
                  Complete all required items to publish
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
