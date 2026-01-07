import { useState } from 'react';
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
import { Settings, DollarSign, Globe, Search, Users, Upload, Image as ImageIcon } from 'lucide-react';

interface CourseSettings {
  price: number | null;
  currency: string;
  customDomain: string;
  seoTitle: string;
  seoDescription: string;
  enrollmentOpen: boolean;
  maxStudents: number | null;
  thumbnail: string | null;
}

interface CourseSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CourseSettings;
  onUpdateSettings: (settings: CourseSettings) => void;
  onUploadThumbnail: () => void;
}

export function CourseSettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  onUploadThumbnail,
}: CourseSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<CourseSettings>(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onOpenChange(false);
  };

  const updateSetting = <K extends keyof CourseSettings>(key: K, value: CourseSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Course Settings
          </DialogTitle>
          <DialogDescription>
            Configure pricing, SEO, and enrollment settings for your course.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pricing" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pricing" className="gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-1.5">
              <Search className="h-3.5 w-3.5" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="enrollment" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Enrollment
            </TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <div
                onClick={onUploadThumbnail}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {localSettings.thumbnail ? (
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
                <Label>Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={localSettings.price || ''}
                    onChange={(e) => updateSetting('price', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
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
