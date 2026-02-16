import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, RefreshCw, CheckCircle2, Clock, AlertCircle, Copy, ExternalLink, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomDomain {
  id: string;
  domain: string;
  status: 'pending' | 'verifying' | 'active' | 'failed' | 'offline';
  verification_token: string;
  ssl_provisioned: boolean;
  is_verified: boolean;
  ssl_status: string;
  created_at: string;
  verified_at: string | null;
}

interface CustomDomainsPanelProps {
  projectId: string;
}

const LOVABLE_IP = '185.158.133.1';
const EXCELLION_DOMAIN = 'excellion.app';
const STORAGE_BASE_URL = 'https://ejrbfyvlkibbaufcyxtc.supabase.co/storage/v1/object/public/published-sites';

export function CustomDomainsPanel({ projectId }: CustomDomainsPanelProps) {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  
  // Temp domain state
  const [tempDomainSlug, setTempDomainSlug] = useState<string>('');
  const [isEditingTempDomain, setIsEditingTempDomain] = useState(false);
  const [editTempDomainValue, setEditTempDomainValue] = useState('');
  const [isSavingTempDomain, setIsSavingTempDomain] = useState(false);

  useEffect(() => {
    fetchDomains();
    fetchTempDomain();
  }, [projectId]);

  const fetchTempDomain = async () => {
    const { data, error } = await supabase
      .from('builder_projects')
      .select('published_url')
      .eq('id', projectId)
      .single();

    if (!error && data?.published_url) {
      // Extract slug from URL like https://.../published-sites/my-slug/index.html
      const match = data.published_url.match(/published-sites\/([^/]+)\//);
      if (match) {
        setTempDomainSlug(match[1]);
      }
    }
  };

  const fetchDomains = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching domains:', error);
      toast.error('Failed to load domains');
    } else {
      setDomains((data || []) as CustomDomain[]);
    }
    setIsLoading(false);
  };

  const handleEditTempDomain = () => {
    setEditTempDomainValue(tempDomainSlug);
    setIsEditingTempDomain(true);
  };

  const handleSaveTempDomain = async () => {
    const newSlug = editTempDomainValue.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    if (!newSlug) {
      toast.error('Please enter a valid subdomain');
      return;
    }

    if (newSlug === tempDomainSlug) {
      setIsEditingTempDomain(false);
      return;
    }

    setIsSavingTempDomain(true);
    try {
      // Check if new slug is available by listing files
      const { data: existing } = await supabase.storage
        .from('published-sites')
        .list(newSlug);

      if (existing && existing.length > 0) {
        toast.error('This subdomain is already taken');
        setIsSavingTempDomain(false);
        return;
      }

      // Copy old files to new location
      const { data: oldFiles } = await supabase.storage
        .from('published-sites')
        .list(tempDomainSlug);

      if (oldFiles && oldFiles.length > 0) {
        for (const file of oldFiles) {
          const { data: fileData } = await supabase.storage
            .from('published-sites')
            .download(`${tempDomainSlug}/${file.name}`);

          if (fileData) {
            await supabase.storage
              .from('published-sites')
              .upload(`${newSlug}/${file.name}`, fileData, { upsert: true });
          }
        }

        // Delete old files
        const filesToDelete = oldFiles.map(f => `${tempDomainSlug}/${f.name}`);
        await supabase.storage
          .from('published-sites')
          .remove(filesToDelete);
      }

      // Update project with new URL
      const newUrl = `${STORAGE_BASE_URL}/${newSlug}/index.html`;
      await supabase
        .from('builder_projects')
        .update({ published_url: newUrl })
        .eq('id', projectId);

      setTempDomainSlug(newSlug);
      setIsEditingTempDomain(false);
      toast.success('Subdomain updated successfully!');
    } catch (error) {
      console.error('Error updating subdomain:', error);
      toast.error('Failed to update subdomain');
    } finally {
      setIsSavingTempDomain(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim()) return;

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain.trim())) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setIsAdding(true);
    
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('custom_domains')
      .insert({
        project_id: projectId,
        domain: newDomain.trim().toLowerCase(),
        user_id: userData.user?.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('This domain is already registered');
      } else {
        console.error('Error adding domain:', error);
        toast.error('Failed to add domain');
      }
    } else {
      setDomains([data as CustomDomain, ...domains]);
      setNewDomain('');
      toast.success('Domain added! Configure DNS records below.');
    }
    setIsAdding(false);
  };

  const verifyDomain = async (domain: CustomDomain) => {
    setIsVerifying(domain.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain-dns', {
        body: { domain: domain.domain, token: domain.verification_token },
      });

      if (error) throw error;

      if (data?.verified) {
        // Refresh domains to get updated status
        await fetchDomains();
        toast.success('Domain verified successfully!');
      } else {
        toast.error(data?.message || 'Verification failed. Check your DNS records.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('Failed to verify domain. Please try again.');
    }
    
    setIsVerifying(null);
  };

  const removeDomain = async (domainId: string) => {
    const { error } = await supabase
      .from('custom_domains')
      .delete()
      .eq('id', domainId);

    if (error) {
      console.error('Error removing domain:', error);
      toast.error('Failed to remove domain');
    } else {
      setDomains(domains.filter(d => d.id !== domainId));
      toast.success('Domain removed');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusBadge = (domain: CustomDomain) => {
    if (domain.is_verified) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Verified {domain.ssl_provisioned && '(SSL)'}
        </Badge>
      );
    }
    
    switch (domain.status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active {domain.ssl_provisioned && '(SSL)'}
          </Badge>
        );
      case 'verifying':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Verifying DNS
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'offline':
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending Setup
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Temp Domain Section */}
      {tempDomainSlug && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Published URL
                </CardTitle>
                <CardDescription>
                  Your site's default shareable link
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingTempDomain ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={editTempDomainValue}
                    onChange={(e) => setEditTempDomainValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="my-site-name"
                    className="flex-1 font-mono"
                    disabled={isSavingTempDomain}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveTempDomain}
                    disabled={isSavingTempDomain || !editTempDomainValue.trim()}
                    className="gap-1"
                  >
                    {isSavingTempDomain ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingTempDomain(false)}
                    disabled={isSavingTempDomain}
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-between">
                <code className="text-sm bg-muted px-3 py-2 rounded-md flex-1 truncate">
                  {tempDomainSlug}.{EXCELLION_DOMAIN}
                </code>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleEditTempDomain}
                    title="Edit subdomain"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${tempDomainSlug}.${EXCELLION_DOMAIN}`);
                      toast.success('URL copied!');
                    }}
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(`https://${tempDomainSlug}.${EXCELLION_DOMAIN}`, '_blank')}
                    title="Open site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Domain Section */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Connect Custom Domain
          </CardTitle>
          <CardDescription>
            Connect your own domain to your published site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="yourdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDomain()}
              className="flex-1"
            />
            <Button onClick={addDomain} disabled={isAdding || !newDomain.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Domain List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
          Loading domains...
        </div>
      ) : domains.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No custom domains configured</p>
          <p className="text-sm mt-1">Add a domain above to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id} className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-mono">{domain.domain}</CardTitle>
                    {getStatusBadge(domain)}
                  </div>
                  <div className="flex items-center gap-2">
                    {(domain.is_verified || domain.status === 'active') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchDomains()}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDomain(domain.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {!domain.is_verified && domain.status !== 'active' && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        DNS Configuration Required
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add these records at your domain registrar:
                      </p>
                    </div>

                    {/* A Record for root */}
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">A Record (Root Domain)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyToClipboard(LOVABLE_IP, 'IP Address')}
                        >
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

                    {/* A Record for www */}
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">A Record (WWW Subdomain)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyToClipboard(LOVABLE_IP, 'IP Address')}
                        >
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

                    {/* TXT Record for verification */}
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">TXT Record (Verification)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyToClipboard(`excellion=${domain.verification_token}`, 'TXT Value')}
                        >
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
                          <p className="font-mono text-xs break-all">excellion={domain.verification_token}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      DNS changes can take up to 72 hours to propagate. SSL will be automatically provisioned once verified.
                    </p>
                    
                    <Button
                      className="w-full"
                      onClick={() => verifyDomain(domain)}
                      disabled={isVerifying === domain.id}
                    >
                      {isVerifying === domain.id ? (
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
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
