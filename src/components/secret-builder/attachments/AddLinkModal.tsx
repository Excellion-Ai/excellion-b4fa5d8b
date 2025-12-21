import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'lucide-react';

interface AddLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (url: string) => void;
}

const isValidUrl = (string: string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    // Try adding https:// prefix
    try {
      new URL(`https://${string}`);
      return true;
    } catch {
      return false;
    }
  }
};

export function AddLinkModal({ open, onOpenChange, onAdd }: AddLinkModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!url.trim()) return;
    
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    if (!isValidUrl(finalUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    onAdd(finalUrl);
    setUrl('');
    setError('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Link className="w-5 h-5 text-primary" />
            Add Link
          </DialogTitle>
          <DialogDescription>
            Add a reference URL for inspiration or content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Input
              value={url}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="bg-background border-border focus-visible:ring-primary"
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive mt-1.5">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!url.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
