import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FolderKanban, 
  Camera, 
  Trash2, 
  Loader2, 
  Crown, 
  Check, 
  Plus, 
  Building2, 
  Calendar,
  Users,
  FolderOpen,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function WorkspaceSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
    logo_url: string | null;
    owner_id: string;
    created_at: string;
  } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create workspace state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Delete workspace state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Set default workspace name
      setNewWorkspaceName(`${user.email?.split('@')[0]}'s Workspace`);

      const { data } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (data) {
        setWorkspace(data);
        
        // Get project count
        const { count: projects } = await supabase
          .from('builder_projects')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', data.id);
        setProjectCount(projects || 0);

        // Get member count
        const { count: members } = await supabase
          .from('workspace_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', data.id);
        setMemberCount((members || 0) + 1); // +1 for owner
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!user || !newWorkspaceName.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspaceName.trim(),
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setWorkspace(data);
      setShowCreateDialog(false);
      toast.success('Workspace created successfully!');
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast.error(error.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!workspace) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ name: workspace.name })
        .eq('id', workspace.id);

      if (error) throw error;
      toast.success('Workspace saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving workspace:', error);
      toast.error('Failed to save workspace');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workspace) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${workspace.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('workspace-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('workspace-logos')
        .getPublicUrl(filePath);

      await supabase
        .from('workspaces')
        .update({ logo_url: publicUrl })
        .eq('id', workspace.id);

      setWorkspace(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      toast.success('Logo uploaded');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!workspace) return;
    try {
      await supabase
        .from('workspaces')
        .update({ logo_url: null })
        .eq('id', workspace.id);

      setWorkspace(prev => prev ? { ...prev, logo_url: null } : null);
      toast.success('Logo removed');
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace || deleteConfirmText !== workspace.name) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspace.id);

      if (error) throw error;

      setWorkspace(null);
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
      toast.success('Workspace deleted');
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      toast.error(error.message || 'Failed to delete workspace');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No workspace - show create prompt
  if (!workspace) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Workspace Settings</h1>
          <p className="text-muted-foreground">Create and manage your workspace</p>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Workspace Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a workspace to organize your projects, invite team members, and collaborate effectively.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Workspace
            </Button>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What's included in a workspace?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Project Organization</p>
                <p className="text-sm text-muted-foreground">Group all your projects in one place</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Team Collaboration</p>
                <p className="text-sm text-muted-foreground">Invite members and assign roles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Shared Resources</p>
                <p className="text-sm text-muted-foreground">Credits and assets shared across team</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Workspace Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Give your workspace a name. You can change this later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input
                  id="workspaceName"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateWorkspace} 
                disabled={creating || !newWorkspaceName.trim()}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workspace
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const isOwner = user?.id === workspace.owner_id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workspace Settings</h1>
        <p className="text-muted-foreground">Manage your workspace details</p>
      </div>

      {/* Workspace Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Workspace Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{projectCount}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{memberCount}</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(workspace.created_at), { addSuffix: true })}
                </p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Crown className="w-5 h-5 text-yellow-500" />
              <div>
                <Badge variant="secondary" className="text-xs">
                  {isOwner ? 'Owner' : 'Member'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Your Role</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workspace Logo</CardTitle>
          <CardDescription>Your workspace's visual identity</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="w-20 h-20 rounded-lg">
            <AvatarImage src={workspace.logo_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl rounded-lg">
              {workspace.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !isOwner}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              Upload Logo
            </Button>
            {workspace.logo_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="text-destructive"
                disabled={!isOwner}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workspace Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Workspace Name
          </CardTitle>
          <CardDescription>The name of your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspaceName">Name</Label>
            <Input
              id="workspaceName"
              value={workspace.name}
              onChange={(e) => setWorkspace(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="Workspace name"
              disabled={!isOwner}
            />
          </div>
          <Button onClick={handleSave} disabled={saving || saved || !isOwner}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2 text-green-500" />
            ) : null}
            {saved ? 'Changes Saved' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Ownership */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Ownership
          </CardTitle>
          <CardDescription>Workspace owner information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Current owner</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Transfer Ownership
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Ownership transfer is coming soon. Contact support for manual transfers.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for this workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Delete Workspace</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this workspace and all its data
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Workspace
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workspace
              <strong className="text-foreground"> "{workspace.name}"</strong> and remove all
              associated data including projects and team memberships.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="confirmDelete">
              Type <strong>{workspace.name}</strong> to confirm
            </Label>
            <Input
              id="confirmDelete"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Enter workspace name"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={deleteConfirmText !== workspace.name || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Workspace'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
