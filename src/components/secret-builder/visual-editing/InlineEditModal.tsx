import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface EditTarget {
  label: string;
  type: 'text' | 'textarea';
  value: string;
  onSave: (newValue: string) => void;
}

interface InlineEditModalProps {
  target: EditTarget | null;
  onClose: () => void;
}

export function InlineEditModal({ target, onClose }: InlineEditModalProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (target) setValue(target.value || '');
  }, [target]);

  if (!target) return null;

  const handleSave = () => {
    target.onSave(value);
    onClose();
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle>Edit {target.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">{target.label}</Label>
          {target.type === 'textarea' ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              className="bg-zinc-800 border-zinc-700"
              autoFocus
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              autoFocus
            />
          )}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="bg-zinc-800 border-zinc-700">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-amber-500 text-black hover:bg-amber-400">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
