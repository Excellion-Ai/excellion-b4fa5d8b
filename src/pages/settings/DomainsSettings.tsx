import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Globe, Plus, Trash2, Loader2, CheckCircle2, Clock, AlertCircle, Lock } from 'lucide-react';

type Domain = {
  id: string;
  domain: string;
  status: string;
  ssl_status: string;
  project_id: string;
  created_at: string;
};

const STATUS_BADGES: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  verified: { icon: <CheckCircle2 className="w-3 h-3" />, variant: 'default' },
  pending: { icon: <Clock className="w-3 h-3" />, variant: 'secondary' },
  failed: { icon: <AlertCircle className="w-3 h-3" />, variant: 'destructive' },
};

const SSL_BADGES: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { icon: <Lock className="w-3 h-3" />, variant: 'default' },
  pending: { icon: <Clock className="w-3 h-3" />, variant: 'secondary' },
  failed: { icon: <AlertCircle className="w-3 h-3" />, variant: 'destructive' },
};

export default function DomainsSettings() {
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [adding, setAdding] = useState(false);

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [domainToRemove, setDomainToRemove] = useState<Domain | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user's projects
      const { data: projectData } = await supabase
        .from('builder_projects')
        .select('id, name')
        .or(`user_id.eq.${user.id},user_id.is.null`);

      if (projectData) {
        setProjects(projectData);
        
        // Load domains for all projects
        const projectIds = projectData.map(p => p.id);
        if (projectIds.length > 0) {
          const { data: domainData } = await supabase
            .from('custom_domains')
            .select('*')
            .in('project_id', projectIds);

          if (domainData) {
            setDomains(domainData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim() || !selectedProject) return;
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('custom_domains')
        .insert({
          domain: newDomain.trim().toLowerCase(),
          project_id: selectedProject,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setDomains(prev => [...prev, data]);
      setAddDialogOpen(false);
      setNewDomain('');
      setSelectedProject('');
      toast.success('Domain added! Configure your DNS settings.');
    } catch (error: any) {
      console.error('Error adding domain:', error);
      if (error.code === '23505') {
        toast.error('This domain is already connected');
      } else {
        toast.error('Failed to add domain');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!domainToRemove) return;
    setRemoving(true);
    try {
      await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainToRemove.id);

      setDomains(prev => prev.filter(d => d.id !== domainToRemove.id));
      setRemoveDialogOpen(false);
      setDomainToRemove(null);
      toast.success('Domain removed');
    } catch (error) {
      toast.error('Failed to remove domain');
    } finally {
      setRemoving(false);
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domains</h1>
          <p className="text-muted-foreground">Connect custom domains to your projects</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Connect Domain
        </Button>
      </div>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Connected Domains
          </CardTitle>
          <CardDescription>
            Domains connected to your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No domains connected yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Connect Your First Domain
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => {
                const statusInfo = STATUS_BADGES[domain.status] || STATUS_BADGES.pending;
                const sslInfo = SSL_BADGES[domain.ssl_status] || SSL_BADGES.pending;
                
                return (
                  <div key={domain.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{domain.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        {getProjectName(domain.project_id)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusInfo.variant} className="gap-1">
                        {statusInfo.icon}
                        <span className="capitalize">{domain.status}</span>
                      </Badge>
                      <Badge variant={sslInfo.variant} className="gap-1">
                        {sslInfo.icon}
                        SSL {domain.ssl_status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDomainToRemove(domain);
                        setRemoveDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DNS Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DNS Configuration</CardTitle>
          <CardDescription>How to connect your domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add the following DNS records at your domain registrar:
          </p>
          <div className="bg-muted/50 p-4 rounded-lg space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="text-muted-foreground">Name</span>
              <span className="text-muted-foreground">Value</span>
            </div>
            <div className="flex justify-between">
              <span>A</span>
              <span>@</span>
              <span>185.158.133.1</span>
            </div>
            <div className="flex justify-between">
              <span>A</span>
              <span>www</span>
              <span>185.158.133.1</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            DNS changes can take up to 48 hours to propagate.
          </p>
        </CardContent>
      </Card>

      {/* Add Domain Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Domain</DialogTitle>
            <DialogDescription>
              Add a custom domain to one of your projects
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain</label>
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDomain} disabled={adding || !newDomain.trim() || !selectedProject}>
              {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Domain Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Domain</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{domainToRemove?.domain}</strong>?
              This will disconnect it from your project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveDomain} disabled={removing}>
              {removing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
