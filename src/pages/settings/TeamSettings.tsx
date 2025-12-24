import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, UserPlus, Copy, Trash2, Loader2, Check, Crown, Shield, Edit, Eye } from 'lucide-react';

type Member = {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  display_name?: string;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  created_at: string;
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-yellow-500" />,
  admin: <Shield className="w-4 h-4 text-blue-500" />,
  editor: <Edit className="w-4 h-4 text-green-500" />,
  viewer: <Eye className="w-4 h-4 text-muted-foreground" />,
};

export default function TeamSettings() {
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<{ id: string; owner_id: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: wsData } = await supabase
        .from('workspaces')
        .select('id, owner_id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (wsData) {
        setWorkspace(wsData);

        // Load members
        const { data: memberData } = await supabase
          .from('workspace_memberships')
          .select('id, user_id, role')
          .eq('workspace_id', wsData.id);

        if (memberData) {
          // Get profiles for members
          const userIds = memberData.map(m => m.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds);

          const membersWithProfiles = memberData.map(m => ({
            ...m,
            display_name: profiles?.find(p => p.id === m.user_id)?.display_name,
          }));

          setMembers(membersWithProfiles);
        }

        // Load invites
        const { data: inviteData } = await supabase
          .from('workspace_invites')
          .select('*')
          .eq('workspace_id', wsData.id)
          .eq('status', 'pending');

        if (inviteData) {
          setInvites(inviteData);
        }
      }
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !workspace) return;
    setInviting(true);
    try {
      const { data, error } = await supabase
        .from('workspace_invites')
        .insert({
          workspace_id: workspace.id,
          email: inviteEmail,
          role: inviteRole,
        })
        .select()
        .single();

      if (error) throw error;

      setInvites(prev => [...prev, data]);
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('viewer');
      toast.success('Invite created! Share the invite link with them.');
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error('Failed to create invite');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyInviteLink = async (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await supabase
        .from('workspace_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      setInvites(prev => prev.filter(i => i.id !== inviteId));
      toast.success('Invite revoked');
    } catch (error) {
      toast.error('Failed to revoke invite');
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    try {
      await supabase
        .from('workspace_memberships')
        .delete()
        .eq('id', membershipId);

      setMembers(prev => prev.filter(m => m.id !== membershipId));
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateRole = async (membershipId: string, newRole: string) => {
    try {
      await supabase
        .from('workspace_memberships')
        .update({ role: newRole })
        .eq('id', membershipId);

      setMembers(prev => prev.map(m =>
        m.id === membershipId ? { ...m, role: newRole } : m
      ));
      toast.success('Role updated');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const isOwner = user?.id === workspace?.owner_id;

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
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage who has access to your workspace</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} disabled={!isOwner}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Owner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Owner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Workspace owner</p>
            </div>
            <Badge variant="secondary">Owner</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({members.length})
          </CardTitle>
          <CardDescription>People with access to this workspace</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No members yet. Invite someone to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {member.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.display_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleUpdateRole(member.id, value)}
                    disabled={!isOwner}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={!isOwner}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Invites</CardTitle>
            <CardDescription>Invitations waiting to be accepted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{invite.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {ROLE_ICONS[invite.role]}
                      <span className="capitalize">{invite.role}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyInviteLink(invite.token)}
                  >
                    {copiedToken === invite.token ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRevokeInvite(invite.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invite link to add someone to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Can manage settings and members</SelectItem>
                  <SelectItem value="editor">Editor - Can edit projects</SelectItem>
                  <SelectItem value="viewer">Viewer - Can only view projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
              {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
