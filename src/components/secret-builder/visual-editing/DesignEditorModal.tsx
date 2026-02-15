import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, GripVertical } from 'lucide-react';

interface DesignEditorModalProps {
  open: boolean;
  onClose: () => void;
  designConfig: any;
  layoutTemplate: string;
  sectionOrder: string[];
  onSave: (updates: { design_config: any; layout_template: string; section_order: string[] }) => Promise<void>;
}

export function DesignEditorModal({
  open,
  onClose,
  designConfig,
  layoutTemplate,
  sectionOrder: initialSectionOrder,
  onSave,
}: DesignEditorModalProps) {
  const [design, setDesign] = useState(designConfig || {});
  const [layout, setLayout] = useState(layoutTemplate || 'suspended');
  const [sectionOrder, setSectionOrder] = useState(initialSectionOrder || ['hero', 'outcomes', 'curriculum', 'faq', 'cta']);
  const [isSaving, setIsSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [wasOpen, setWasOpen] = useState(false);

  // Only re-sync local state when modal transitions from closed → open
  useEffect(() => {
    if (open && !wasOpen) {
      setDesign(designConfig || {});
      setLayout(layoutTemplate || 'suspended');
      setSectionOrder(initialSectionOrder || ['hero', 'outcomes', 'curriculum', 'faq', 'cta']);
    }
    setWasOpen(open);
  }, [open]);

  const updateColor = (key: string, value: string) => {
    setDesign({
      ...design,
      colors: { ...(design.colors || {}), [key]: value },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ design_config: design, layout_template: layout, section_order: sectionOrder });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const colorFields = [
    { key: 'primary', label: 'Primary', default: '#d4a853' },
    { key: 'secondary', label: 'Secondary', default: '#1a1a1a' },
    { key: 'accent', label: 'Accent', default: '#f59e0b' },
    { key: 'background', label: 'Background', default: '#0a0a0a' },
    { key: 'cardBackground', label: 'Card Background', default: '#111111' },
    { key: 'text', label: 'Text', default: '#ffffff' },
    { key: 'textMuted', label: 'Muted Text', default: '#9ca3af' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-700 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Design Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Layout Template */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Layout Style</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'suspended', title: 'Suspended', desc: 'Floating cards, professional' },
                { id: 'timeline', title: 'Timeline', desc: 'Journey focused, transformation' },
                { id: 'grid', title: 'Grid', desc: 'Visual focused, creative' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLayout(opt.id)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    layout === opt.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="font-medium text-foreground text-sm">{opt.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Colors</Label>
            <div className="grid grid-cols-2 gap-4">
              {colorFields.map((field) => (
                <div key={field.key}>
                  <Label className="text-xs text-muted-foreground mb-1 block">{field.label}</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={design.colors?.[field.key] || field.default}
                      onChange={(e) => updateColor(field.key, e.target.value)}
                      onInput={(e) => updateColor(field.key, (e.target as HTMLInputElement).value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded"
                    />
                    <Input
                      value={design.colors?.[field.key] || field.default}
                      onChange={(e) => updateColor(field.key, e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Typography</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Heading Font</Label>
                <Select
                  value={design.fonts?.heading || 'Inter'}
                  onValueChange={(v) => setDesign({ ...design, fonts: { ...design.fonts, heading: v } })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Inter', 'Playfair Display', 'Montserrat', 'Poppins', 'Oswald'].map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Body Font</Label>
                <Select
                  value={design.fonts?.body || 'Inter'}
                  onValueChange={(v) => setDesign({ ...design, fonts: { ...design.fonts, body: v } })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Inter', 'Open Sans', 'Lato', 'Roboto'].map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Spacing & Radius */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Spacing</Label>
              <Select
                value={design.spacing || 'normal'}
                onValueChange={(v) => setDesign({ ...design, spacing: v })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Border Radius</Label>
              <Select
                value={design.borderRadius || 'medium'}
                onValueChange={(v) => setDesign({ ...design, borderRadius: v })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Sharp)</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section Order */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Section Order</Label>
            <div className="space-y-2">
              {sectionOrder.map((section, index) => (
                <div
                  key={section}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null) return;
                    const newOrder = [...sectionOrder];
                    const [removed] = newOrder.splice(dragIndex, 1);
                    newOrder.splice(index, 0, removed);
                    setSectionOrder(newOrder);
                    setDragIndex(null);
                  }}
                  className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg cursor-move hover:bg-zinc-750 transition"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground capitalize flex-1 text-sm">{section}</span>
                  <button
                    onClick={() => setSectionOrder(sectionOrder.filter((s) => s !== section))}
                    className="text-red-500 text-sm hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-zinc-700">
          <Button variant="outline" onClick={onClose} className="bg-zinc-800 border-zinc-700">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 text-black hover:bg-amber-400">
            {isSaving ? 'Applying...' : 'Apply Design'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
