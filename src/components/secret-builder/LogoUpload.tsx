import { useState, useRef } from 'react';
import { Image, ChevronDown, ChevronUp, X, Sparkles, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface GeneratedImage {
  name: string;
  url: string;
}

interface LogoUploadProps {
  logo?: string;
  onUpdateLogo: (logo: string | undefined) => void;
  generatedImages?: GeneratedImage[];
  isLoadingImages?: boolean;
}

export function LogoUpload({ logo, onUpdateLogo, generatedImages = [], isLoadingImages = false }: LogoUploadProps) {
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
      // Use generate-image function which saves to the generated/ folder for the library
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: `Minimalist professional logo design: ${logoPrompt}. Simple, clean, iconic, suitable for a brand logo, white or transparent background, vector-style.`,
          width: 512,
          height: 512
        }
      });

      if (error) throw error;
      
      if (data?.imageUrl) {
        onUpdateLogo(data.imageUrl);
        toast.success('Logo generated and saved to library!');
        setShowGenerateDialog(false);
        setLogoPrompt('');
        // Dispatch event to refresh the image library
        window.dispatchEvent(new CustomEvent('refresh-image-library'));
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

  const handleSelectFromLibrary = (imageUrl: string) => {
    onUpdateLogo(imageUrl);
    setShowGenerateDialog(false);
    toast.success('Logo selected from library!');
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

      {/* Generate Logo Dialog - Excellion/Google Style */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 border-0 bg-transparent shadow-none overflow-visible max-h-[85vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header with gradient accent */}
            <div className="relative px-6 pt-6 pb-4 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-foreground tracking-tight">
                    Create your logo
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Describe your brand and let AI design a unique logo for you
                  </p>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="px-6 pb-4 flex-shrink-0">
              <div className="space-y-2">
                <Label 
                  htmlFor="logo-prompt" 
                  className="text-sm font-medium text-foreground/80"
                >
                  Brand description
                </Label>
                <div className="relative">
                  <Input
                    id="logo-prompt"
                    placeholder="A modern tech company with geometric shapes..."
                    value={logoPrompt}
                    onChange={(e) => setLogoPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerateLogo()}
                    className="h-12 px-4 text-base bg-muted/30 border-border/50 rounded-xl placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    disabled={isGenerating}
                  />
                </div>
                
                {/* Example chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Minimalist', 'Tech startup', 'Creative agency', 'E-commerce'].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setLogoPrompt(prev => prev ? `${prev}, ${example.toLowerCase()}` : example)}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      disabled={isGenerating}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowGenerateDialog(false)}
                  disabled={isGenerating}
                  className="h-10 px-5 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateLogo}
                  disabled={isGenerating || !logoPrompt.trim()}
                  className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:shadow-none"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Generate</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Image Library Section */}
            <div className="px-6 py-4 border-t border-border/30 bg-muted/10 flex-1 overflow-hidden flex flex-col min-h-0">
              <p className="text-sm font-medium text-muted-foreground mb-3 flex-shrink-0">
                Or select from library
              </p>
              {isLoadingImages ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : generatedImages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No images generated yet
                </p>
              ) : (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="grid grid-cols-5 gap-2 pb-2">
                    {generatedImages.map((image) => (
                      <button
                        key={image.name}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-border hover:border-primary hover:ring-2 hover:ring-primary/20 transition-all"
                        onClick={() => handleSelectFromLibrary(image.url)}
                        title="Click to use as logo"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs text-white font-medium">Use</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
