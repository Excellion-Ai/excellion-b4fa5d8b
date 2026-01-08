import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, DollarSign, Globe, Search, Users, Image as ImageIcon, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseSettings {
  price: number | null;
  currency: string;
  customDomain: string;
  seoTitle: string;
  seoDescription: string;
  enrollmentOpen: boolean;
  maxStudents: number | null;
  thumbnail: string | null;
  instructorName: string;
  instructorBio: string;
}

interface CourseSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CourseSettings;
  onUpdateSettings: (settings: CourseSettings) => void;
  courseId?: string | null;
  userId?: string;
}

export function CourseSettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  courseId,
  userId,
}: CourseSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<CourseSettings>(settings);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onOpenChange(false);
  };

  const updateSetting = <K extends keyof CourseSettings>(key: K, value: CourseSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId || 'anon'}/${courseId || 'temp'}/thumbnail.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('course-thumbnails')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(path);

      updateSetting('thumbnail', publicUrl);
      toast.success('Thumbnail uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Format price for display
  const formatPrice = (cents: number | null, currency: string) => {
    if (!cents || cents === 0) return 'Free';
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
    return `${symbols[currency] || '$'}${(cents / 100).toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Course Settings
          </DialogTitle>
          <DialogDescription>
            Configure pricing, instructor info, SEO, and enrollment settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pricing" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pricing" className="gap-1.5 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="instructor" className="gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" />
              Instructor
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-1.5 text-xs">
              <Search className="h-3.5 w-3.5" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="enrollment" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              Enrollment
            </TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailUpload}
              />
              <div
                onClick={() => !isUploadingThumbnail && fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {isUploadingThumbnail ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </div>
                ) : localSettings.thumbnail ? (
                  <img
                    src={localSettings.thumbnail}
                    alt="Course thumbnail"
                    className="w-full h-32 object-cover rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Click to upload thumbnail</span>
                    <span className="text-xs">Recommended: 1280x720px</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (in dollars)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={localSettings.price || ''}
                    onChange={(e) => updateSetting('price', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="0 = Free"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Preview: {formatPrice(localSettings.price ? localSettings.price * 100 : 0, localSettings.currency)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={localSettings.currency}
                  onValueChange={(value) => updateSetting('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                    <SelectItem value="AUD">AUD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Domain</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={localSettings.customDomain}
                  onChange={(e) => updateSetting('customDomain', e.target.value)}
                  placeholder="courses.yourdomain.com"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Add a CNAME record pointing to our servers to use a custom domain.
              </p>
            </div>
          </TabsContent>

          {/* Instructor Tab */}
          <TabsContent value="instructor" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Instructor Name</Label>
              <Input
                value={localSettings.instructorName}
                onChange={(e) => updateSetting('instructorName', e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label>Instructor Bio</Label>
              <Textarea
                value={localSettings.instructorBio}
                onChange={(e) => updateSetting('instructorBio', e.target.value)}
                placeholder="Tell students about your background and expertise..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                {localSettings.instructorBio.length}/500 characters
              </p>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>SEO Title</Label>
              <Input
                value={localSettings.seoTitle}
                onChange={(e) => updateSetting('seoTitle', e.target.value)}
                placeholder="Enter SEO-friendly title"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {localSettings.seoTitle.length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                value={localSettings.seoDescription}
                onChange={(e) => updateSetting('seoDescription', e.target.value)}
                placeholder="Enter a compelling description for search engines"
                maxLength={160}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                {localSettings.seoDescription.length}/160 characters
              </p>
            </div>
          </TabsContent>

          {/* Enrollment Tab */}
          <TabsContent value="enrollment" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Open Enrollment</Label>
                <p className="text-xs text-muted-foreground">
                  Allow students to enroll in your course
                </p>
              </div>
              <Switch
                checked={localSettings.enrollmentOpen}
                onCheckedChange={(checked) => updateSetting('enrollmentOpen', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Maximum Students</Label>
              <Input
                type="number"
                value={localSettings.maxStudents || ''}
                onChange={(e) => updateSetting('maxStudents', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Unlimited"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited enrollment
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
