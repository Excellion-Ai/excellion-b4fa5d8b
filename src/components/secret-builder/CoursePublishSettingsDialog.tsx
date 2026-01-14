import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Check, 
  Globe, 
  Search, 
  Share2, 
  Settings,
  ExternalLink,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PublishSettings {
  status: 'draft' | 'published';
  seoTitle: string;
  seoDescription: string;
  customDomain: string;
  socialImageUrl: string;
  publishedUrl: string;
  subdomain: string;
}

interface CoursePublishSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
  courseTitle: string;
  courseSubdomain: string;
  onStatusChange?: (status: 'draft' | 'published') => void;
}

export function CoursePublishSettingsDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  courseSubdomain,
  onStatusChange,
}: CoursePublishSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<PublishSettings>({
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    customDomain: '',
    socialImageUrl: '',
    publishedUrl: '',
    subdomain: courseSubdomain,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load settings when dialog opens
  useEffect(() => {
    if (open && courseId) {
      loadSettings();
    }
  }, [open, courseId]);

  const loadSettings = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('status, seo_title, seo_description, custom_domain, social_image_url, published_url, subdomain')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          status: (data.status as 'draft' | 'published') || 'draft',
          seoTitle: data.seo_title || '',
          seoDescription: data.seo_description || '',
          customDomain: data.custom_domain || '',
          socialImageUrl: data.social_image_url || '',
          publishedUrl: data.published_url || '',
          subdomain: data.subdomain || courseSubdomain,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!courseId) {
      toast.error('No course to save');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          status: settings.status,
          seo_title: settings.seoTitle || null,
          seo_description: settings.seoDescription || null,
          custom_domain: settings.customDomain || null,
          social_image_url: settings.socialImageUrl || null,
          published_at: settings.status === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', courseId);

      if (error) throw error;

      toast.success('Settings saved!');
      onStatusChange?.(settings.status);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      status: checked ? 'published' : 'draft',
    }));
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/course/${settings.subdomain || courseSubdomain}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const courseUrl = `${window.location.origin}/course/${settings.subdomain || courseSubdomain}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Publishing Settings
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="general" className="gap-1.5 text-xs">
                  <Globe className="h-3.5 w-3.5" />
                  General
                </TabsTrigger>
                <TabsTrigger value="seo" className="gap-1.5 text-xs">
                  <Search className="h-3.5 w-3.5" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="domain" className="gap-1.5 text-xs">
                  <Globe className="h-3.5 w-3.5" />
                  Domain
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-1.5 text-xs">
                  <Share2 className="h-3.5 w-3.5" />
                  Social
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <div className="space-y-3">
                  <Label>Your Course URL</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-sm text-foreground truncate">
                      {courseUrl}
                    </code>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => window.open(courseUrl, '_blank')}
                      disabled={settings.status !== 'published'}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Publication Status</Label>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={settings.status === 'published' ? 'default' : 'secondary'}
                        className={settings.status === 'published' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                      >
                        {settings.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {settings.status === 'published' 
                          ? 'Your course is live and accessible to students'
                          : 'Your course is not visible to students'
                        }
                      </span>
                    </div>
                    <Switch
                      checked={settings.status === 'published'}
                      onCheckedChange={handleStatusToggle}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <span className={`text-xs ${settings.seoTitle.length > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {settings.seoTitle.length}/60
                    </span>
                  </div>
                  <Input
                    id="seoTitle"
                    placeholder={courseTitle}
                    value={settings.seoTitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, seoTitle: e.target.value }))}
                    maxLength={70}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears in search results. Keep under 60 characters.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seoDescription">Meta Description</Label>
                    <span className={`text-xs ${settings.seoDescription.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {settings.seoDescription.length}/160
                    </span>
                  </div>
                  <Textarea
                    id="seoDescription"
                    placeholder="A compelling description of your course..."
                    value={settings.seoDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, seoDescription: e.target.value }))}
                    maxLength={200}
                    className="bg-muted min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears below title in search. Keep under 160 characters.
                  </p>
                </div>

                {/* Search Preview */}
                <div className="space-y-3">
                  <Label>Search Preview</Label>
                  <div className="p-4 bg-white rounded-lg border text-left">
                    <div className="text-blue-600 text-lg font-medium truncate hover:underline cursor-pointer">
                      {settings.seoTitle || courseTitle}
                    </div>
                    <div className="text-green-700 text-sm truncate">
                      {courseUrl}
                    </div>
                    <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {settings.seoDescription || 'Add a meta description to improve your search appearance.'}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Domain Tab */}
              <TabsContent value="domain" className="space-y-6">
                <div className="space-y-3">
                  <Label>Excellion URL</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-sm text-foreground">
                      excellion.lovable.app/course/{settings.subdomain || courseSubdomain}
                    </code>
                    <Badge variant="outline" className="text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                  <Input
                    id="customDomain"
                    placeholder="learn.yourbrand.com"
                    value={settings.customDomain}
                    onChange={(e) => setSettings(prev => ({ ...prev, customDomain: e.target.value }))}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: learn.yourbrand.com or courses.yourcompany.com
                  </p>
                </div>

                {settings.customDomain && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <Label className="text-primary">DNS Setup Instructions</Label>
                    <p className="text-sm text-muted-foreground">
                      Add this CNAME record to your domain's DNS settings:
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <div className="text-xs text-muted-foreground mb-1">Type</div>
                        <div className="font-mono">CNAME</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-xs text-muted-foreground mb-1">Name</div>
                        <div className="font-mono truncate">{settings.customDomain.split('.')[0]}</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-xs text-muted-foreground mb-1">Value</div>
                        <div className="font-mono text-xs">courses.excellion.com</div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Social Sharing Tab */}
              <TabsContent value="social" className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="socialImage">Social Share Image URL</Label>
                  <Input
                    id="socialImage"
                    placeholder="https://example.com/og-image.jpg"
                    value={settings.socialImageUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialImageUrl: e.target.value }))}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 1200 x 630 pixels
                  </p>
                </div>

                {/* Social Preview */}
                <div className="space-y-3">
                  <Label>Social Card Preview</Label>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="aspect-[1200/630] bg-muted flex items-center justify-center">
                      {settings.socialImageUrl ? (
                        <img 
                          src={settings.socialImageUrl} 
                          alt="Social preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No image set</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-left">
                      <div className="text-xs text-gray-500 uppercase">
                        excellion.lovable.app
                      </div>
                      <div className="text-gray-900 font-semibold mt-1 line-clamp-1">
                        {settings.seoTitle || courseTitle}
                      </div>
                      <div className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {settings.seoDescription || 'Add a description for better social sharing.'}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
