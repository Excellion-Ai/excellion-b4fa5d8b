import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check, Copy, ExternalLink, PartyPopper } from 'lucide-react';

interface CoursePublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseUrl: string;
  courseTitle: string;
}

export function CoursePublishDialog({
  open,
  onOpenChange,
  courseUrl,
  courseTitle,
}: CoursePublishDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(courseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            Your course is live!
          </DialogTitle>
          <DialogDescription>
            "{courseTitle}" is now published and accessible to students.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <input
              type="text"
              readOnly
              value={courseUrl}
              className="flex-1 bg-transparent text-sm text-foreground outline-none"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={copyUrl}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.open(courseUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              View Live Page
            </Button>
            <Button
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
