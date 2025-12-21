import { X, Paperclip, FileText, Link, Camera, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AttachmentItem } from './types';

interface AttachmentChipsProps {
  attachments: AttachmentItem[];
  onRemove: (id: string) => void;
}

const getIcon = (type: AttachmentItem['type']) => {
  switch (type) {
    case 'file':
      return Paperclip;
    case 'text':
      return FileText;
    case 'link':
      return Link;
    case 'screenshot':
      return Camera;
    case 'brandkit':
      return Palette;
    default:
      return Paperclip;
  }
};

export function AttachmentChips({ attachments, onRemove }: AttachmentChipsProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
      {attachments.map((att) => {
        const Icon = getIcon(att.type);
        return (
          <Badge
            key={att.id}
            variant="secondary"
            className="pl-2 pr-1 py-1 gap-1 bg-secondary/80 hover:bg-secondary transition-colors"
          >
            <Icon className="w-3 h-3 text-primary/70" />
            <span className="text-xs max-w-28 truncate">{att.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 hover:bg-destructive/20 rounded-full"
              onClick={() => onRemove(att.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        );
      })}
    </div>
  );
}
