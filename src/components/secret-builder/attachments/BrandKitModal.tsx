import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette, Upload, X } from 'lucide-react';
import { BrandKit, FONT_OPTIONS, TONE_OPTIONS } from './types';

interface BrandKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (brandKit: BrandKit) => void;
  existingBrandKit?: BrandKit;
}

export function BrandKitModal({ open, onOpenChange, onSave, existingBrandKit }: BrandKitModalProps) {
  const [logo, setLogo] = useState<string | undefined>(existingBrandKit?.logo);
  const [primaryColor, setPrimaryColor] = useState(existingBrandKit?.primaryColor || '#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState(existingBrandKit?.secondaryColor || '#F59E0B');
  const [font, setFont] = useState<BrandKit['font']>(existingBrandKit?.font || 'inter');
  const [tone, setTone] = useState<BrandKit['tone']>(existingBrandKit?.tone || 'professional');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      logo,
      primaryColor,
      secondaryColor,
      font,
      tone,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Palette className="w-5 h-5 text-primary" />
            Brand Kit
          </DialogTitle>
          <DialogDescription>
            Define your brand identity for consistent site generation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Logo</Label>
            <div className="flex items-center gap-3">
              {logo ? (
                <div className="relative">
                  <img 
                    src={logo} 
                    alt="Logo preview" 
                    className="w-16 h-16 object-contain rounded-lg border border-border bg-background"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive/90 hover:bg-destructive"
                    onClick={() => setLogo(undefined)}
                  >
                    <X className="w-3 h-3 text-white" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-16 w-16 border-dashed border-border hover:border-primary/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <p className="text-xs text-muted-foreground">
                Upload your logo (PNG, SVG recommended)
              </p>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-background border-border font-mono text-sm"
                  placeholder="#8B5CF6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-background border-border font-mono text-sm"
                  placeholder="#F59E0B"
                />
              </div>
            </div>
          </div>

          {/* Font */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font Family</Label>
            <Select value={font} onValueChange={(v) => setFont(v as BrandKit['font'])}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Brand Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as BrandKit['tone'])}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Brand Kit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
