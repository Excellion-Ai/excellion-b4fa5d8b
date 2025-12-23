import { useState, useRef } from 'react';
import { Image, ChevronDown, ChevronUp, X, Sparkles, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LogoUploadProps {
  logo?: string;
  onUpdateLogo: (logo: string | undefined) => void;
}

export function LogoUpload({ logo, onUpdateLogo }: LogoUploadProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('builder-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('builder-images')
        .getPublicUrl(filePath);

      onUpdateLogo(publicUrl);
      toast.success('Logo uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerateLogo = async () => {
    if (!logoPrompt.trim()) {
      toast.error('Please enter a description for your logo');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-hero-image', {
        body: { 
          prompt: `Minimalist professional logo design: ${logoPrompt}. Simple, clean, iconic, suitable for a brand logo, white or transparent background, vector-style.`,
          width: 512,
          height: 512
        }
      });

      if (error) throw error;
      
      if (data?.imageUrl) {
        onUpdateLogo(data.imageUrl);
        toast.success('Logo generated!');
        setShowGenerateDialog(false);
        setLogoPrompt('');
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate logo');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Add logo</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
                {logo ? (
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <img 
                        src={logo} 
                        alt="Site logo" 
                        className="w-16 h-16 object-contain rounded-md border border-border bg-background p-1"
                      />
                      <button
                        onClick={() => onUpdateLogo(undefined)}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-destructive-foreground" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        Replace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10 gap-2"
                      onClick={() => setShowGenerateDialog(true)}
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate logo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10 gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                      Attach file
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generate Logo Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Logo
            </DialogTitle>
            <DialogDescription>
              Describe the logo you want to create for your brand.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-prompt">Logo description</Label>
              <Input
                id="logo-prompt"
                placeholder="e.g., A modern tech company logo with geometric shapes"
                value={logoPrompt}
                onChange={(e) => setLogoPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateLogo()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowGenerateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleGenerateLogo}
                disabled={isGenerating || !logoPrompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
