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
  Loader2,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LOVABLE_IP = '185.158.133.1';

interface PublishSettings {
  status: 'draft' | 'published';
  seoTitle: string;
  seoDescription: string;
  customDomain: string;
  socialImageUrl: string;
  publishedUrl: string;
  subdomain: string;
}

interface DomainRecord {
  id: string;
  domain: string;
  status: string;
  verification_token: string;
  is_verified: boolean;
  ssl_provisioned: boolean;
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const socialImageInputRef = useRef<HTMLInputElement>(null);

  // Domain verification state
  const [domainRecord, setDomainRecord] = useState<DomainRecord | null>(null);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [isDeletingDomain, setIsDeletingDomain] = useState(false);

  useEffect(() => {
    if (open && courseId) {
      loadSettings();
      loadDomainRecord();
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

  const loadDomainRecord = async () => {
    if (!courseId) return;

    // Get the course's builder_project_id to find linked domain
    const { data: course } = await supabase
      .from('courses')
      .select('builder_project_id, custom_domain')
      .eq('id', courseId)
      .single();

    if (!course?.custom_domain) {
      setDomainRecord(null);
      return;
    }

    // Look up the domain record
    const { data: domainData } = await supabase
      .from('custom_domains')
      .select('id, domain, status, verification_token, is_verified, ssl_provisioned')
      .eq('domain', course.custom_domain)
      .maybeSingle();

    if (domainData) {
      setDomainRecord(domainData as DomainRecord);
    } else {
      setDomainRecord(null);
    }
  };

  const handleAddDomain = async () => {
    if (!courseId || !newDomainInput.trim()) return;

    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomainInput.trim())) {
      toast.error('Please enter a valid domain (e.g., learn.yourbrand.com)');
      return;
    }

    setIsAddingDomain(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const domain = newDomainInput.trim().toLowerCase();

      // Insert domain record linked directly to the course via course_id
      // No phantom builder_project needed anymore
      const { data: domainData, error: domainError } = await supabase
        .from('custom_domains')
        .insert({
          project_id: '00000000-0000-0000-0000-000000000000', // placeholder required by FK; course_id is the real link
          course_id: courseId,
          domain,
          user_id: userData.user?.id,
        })
        .select()
        .single();

      if (domainError) {
        if (domainError.code === '23505') {
          toast.error('This domain is already registered');
        } else {
          throw domainError;
        }
        return;
      }

      // Save the custom domain to the course record
      await supabase
        .from('courses')
        .update({ custom_domain: domain })
        .eq('id', courseId);

      setSettings(prev => ({ ...prev, customDomain: domain }));
      setDomainRecord(domainData as DomainRecord);
      setNewDomainInput('');
      toast.success('Domain added! Configure DNS records below.');
    } catch (error) {
      console.error('Error adding domain:', error);
      toast.error('Failed to add domain');
    } finally {
      setIsAddingDomain(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domainRecord) return;

    setIsVerifyingDomain(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain-dns', {
        body: { domain: domainRecord.domain, token: domainRecord.verification_token },
      });

      if (error) throw error;

      if (data?.verified) {
        await loadDomainRecord();
        toast.success('Domain verified successfully!');
      } else {
        toast.error(data?.message || 'Verification failed. Check your DNS records.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('Failed to verify domain');
    } finally {
      setIsVerifyingDomain(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!domainRecord || !courseId) return;

    setIsDeletingDomain(true);
    try {
      await supabase.from('custom_domains').delete().eq('id', domainRecord.id);
      await supabase.from('courses').update({ custom_domain: null }).eq('id', courseId);
      setDomainRecord(null);
      setSettings(prev => ({ ...prev, customDomain: '' }));
      toast.success('Domain removed');
    } catch (error) {
      console.error('Error removing domain:', error);
      toast.error('Failed to remove domain');
    } finally {
      setIsDeletingDomain(false);
    }
  };

  const handleSocialImageUpload = async (file: File) => {
    if (!courseId) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setIsUploadingImage(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `social/${courseId}/og-image.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('course-thumbnails')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(path);
      setSettings(prev => ({ ...prev, socialImageUrl: urlData.publicUrl }));
      toast.success('Social image uploaded!');
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
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
    navigator.clipboard.writeText(courseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const subdomain = settings.subdomain || courseSubdomain;
  // Course public URL — routes through the main app
  const courseUrl = `https://excellion.lovable.app/course/${subdomain}`;

  const getDomainStatusBadge = () => {
    if (!domainRecord) return null;
    if (domainRecord.is_verified || domainRecord.status === 'active') {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Verified {domainRecord.ssl_provisioned && '(SSL)'}
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
        <Clock className="w-3 h-3 mr-1" />
        Pending Verification
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] w-full">
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
                {/* Default Excellion URL */}
                <div className="space-y-3">
                  <Label>Default Course URL</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-sm text-foreground truncate">
                      {courseUrl}
                    </code>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 shrink-0">
                      Active
                    </Badge>
                  </div>
                </div>

                {/* Custom Domain Section */}
                {domainRecord ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Custom Domain</Label>
                      {getDomainStatusBadge()}
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="flex-1 text-sm text-foreground">
                        {domainRecord.domain}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-8"
                        onClick={handleRemoveDomain}
                        disabled={isDeletingDomain}
                      >
                        {isDeletingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                        Remove
                      </Button>
                    </div>

                    {/* DNS Instructions (show when not yet verified) */}
                    {!domainRecord.is_verified && domainRecord.status !== 'active' && (
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                        <Label className="text-primary">DNS Setup Instructions</Label>
                        <p className="text-sm text-muted-foreground">
                          Add these records at your domain registrar:
                        </p>

                        {/* A Record - Root */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">A Record (Root Domain)</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(LOVABLE_IP, 'IP Address')}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Type</span>
                              <p className="font-mono">A</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Name</span>
                              <p className="font-mono">@</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Value</span>
                              <p className="font-mono">{LOVABLE_IP}</p>
                            </div>
                          </div>
                        </div>

                        {/* A Record - WWW */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">A Record (WWW Subdomain)</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(LOVABLE_IP, 'IP Address')}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Type</span>
                              <p className="font-mono">A</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Name</span>
                              <p className="font-mono">www</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Value</span>
                              <p className="font-mono">{LOVABLE_IP}</p>
                            </div>
                          </div>
                        </div>

                        {/* TXT Record */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">TXT Record (Verification)</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(`excellion=${domainRecord.verification_token}`, 'TXT Value')}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Type</span>
                              <p className="font-mono">TXT</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Name</span>
                              <p className="font-mono">_excellion</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Value</span>
                              <p className="font-mono text-xs break-all">excellion={domainRecord.verification_token}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          DNS changes can take up to 72 hours to propagate. SSL will be automatically provisioned once verified.
                        </p>

                        <Button
                          className="w-full"
                          onClick={handleVerifyDomain}
                          disabled={isVerifyingDomain}
                        >
                          {isVerifyingDomain ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Verify Now
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Verified state */}
                    {(domainRecord.is_verified || domainRecord.status === 'active') && (
                      <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">Domain verified and active</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Your course is accessible at{' '}
                          <a href={`https://${domainRecord.domain}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            https://{domainRecord.domain}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="customDomain">Connect Custom Domain</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customDomain"
                        placeholder="learn.yourbrand.com"
                        value={newDomainInput}
                        onChange={(e) => setNewDomainInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                        className="bg-muted flex-1"
                      />
                      <Button onClick={handleAddDomain} disabled={isAddingDomain || !newDomainInput.trim()}>
                        {isAddingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Point your domain to your course with full DNS verification and SSL.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Social Sharing Tab */}
              <TabsContent value="social" className="space-y-6">
                {/* Hidden file input */}
                <input
                  ref={socialImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSocialImageUpload(file);
                    e.target.value = '';
                  }}
                />

                {/* Social Preview — click to upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Social Card Preview</Label>
                    {settings.socialImageUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => setSettings(prev => ({ ...prev, socialImageUrl: '' }))}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div
                    className="border rounded-lg overflow-hidden bg-white cursor-pointer group"
                    onClick={() => !isUploadingImage && socialImageInputRef.current?.click()}
                    title="Click to upload social image"
                  >
                    <div className="aspect-[1200/630] bg-muted flex items-center justify-center relative">
                      {isUploadingImage ? (
                        <div className="text-center text-muted-foreground">
                          <Loader2 className="h-10 w-10 mx-auto mb-2 animate-spin text-primary" />
                          <p className="text-sm">Uploading...</p>
                        </div>
                      ) : settings.socialImageUrl ? (
                        <>
                          <img
                            src={settings.socialImageUrl}
                            alt="Social preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center text-white">
                              <Upload className="h-8 w-8 mx-auto mb-1" />
                              <p className="text-sm font-medium">Replace image</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground group-hover:text-foreground transition-colors">
                          <div className="w-16 h-16 rounded-full bg-muted-foreground/10 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                            <Upload className="h-7 w-7 group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-sm font-medium">Click to upload social image</p>
                          <p className="text-xs text-muted-foreground mt-1">Recommended: 1200 × 630px · Max 5MB</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-left border-t">
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

                {/* URL field (secondary, for manual entry) */}
                <div className="space-y-2">
                  <Label htmlFor="socialImage" className="text-xs text-muted-foreground">Or paste an image URL</Label>
                  <Input
                    id="socialImage"
                    placeholder="https://example.com/og-image.jpg"
                    value={settings.socialImageUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialImageUrl: e.target.value }))}
                    className="bg-muted text-xs h-8"
                  />
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