import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FolderKanban, Camera, Trash2, Loader2, Crown } from 'lucide-react';

export default function WorkspaceSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
    logo_url: string | null;
    owner_id: string;
  } | null>(null);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (data) {
        setWorkspace(data);
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No workspace found</p>
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
          <Button onClick={handleSave} disabled={saving || !isOwner}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
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
    </div>
  );
}
