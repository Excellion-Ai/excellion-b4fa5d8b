import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Eye, Upload, BookOpen, Loader2 } from 'lucide-react';

interface KnowledgeEntry {
  id: string;
  name: string;
  content: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  project_id: string;
  project_name?: string;
}

interface Project {
  id: string;
  name: string;
}

const MAX_FILE_SIZE = 500 * 1024;
const SUPPORTED_TYPES = ['.txt', '.md', '.json', '.css', '.html', '.xml', '.yaml', '.yml'];
const CUSTOM_INSTRUCTIONS_KEY = '__custom_instructions__';

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgeSettings() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [newEntry, setNewEntry] = useState({ name: '', content: '', projectId: '' });

  const fetchProjects = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('builder_projects')
      .select('id, name')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects(data || []);
    if (data && data.length > 0 && !newEntry.projectId) {
      setNewEntry(prev => ({ ...prev, projectId: data[0].id }));
    }
  }, [newEntry.projectId]);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    let query = supabase
      .from('knowledge_base')
      .select(`
        id, name, content, file_type, file_size, created_at, updated_at, project_id,
        builder_projects!inner(name, user_id)
      `)
      .neq('name', CUSTOM_INSTRUCTIONS_KEY)
      .order('created_at', { ascending: false });

    if (selectedProjectId !== 'all') {
      query = query.eq('project_id', selectedProjectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching knowledge:', error);
      toast.error('Failed to load knowledge base');
      setIsLoading(false);
      return;
    }

    const formatted = (data || [])
      .filter((item: any) => item.builder_projects?.user_id === user.id)
      .map((item: any) => ({
        ...item,
        project_name: item.builder_projects?.name || 'Unknown Project',
      }));

    setEntries(formatted);
    setIsLoading(false);
  }, [selectedProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchEntries();
    } else {
      setIsLoading(false);
    }
  }, [projects.length, fetchEntries]);

  const handleAddEntry = async () => {
    if (!newEntry.name.trim() || !newEntry.content.trim() || !newEntry.projectId) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from('knowledge_base')
      .insert({
        project_id: newEntry.projectId,
        name: newEntry.name.trim(),
        content: newEntry.content.trim(),
        file_type: 'text',
        file_size: new Blob([newEntry.content]).size,
      });

    if (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add knowledge entry');
      setIsSaving(false);
      return;
    }

    toast.success('Knowledge entry added');
    setNewEntry({ name: '', content: '', projectId: projects[0]?.id || '' });
    setShowAddDialog(false);
    setIsSaving(false);
    fetchEntries();
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
      return;
    }

    toast.success('Entry deleted');
    fetchEntries();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!SUPPORTED_TYPES.includes(ext)) {
      toast.error(`Unsupported file type. Supported: ${SUPPORTED_TYPES.join(', ')}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 500KB.');
      return;
    }

    const content = await file.text();
    setNewEntry(prev => ({
      ...prev,
      name: file.name,
      content,
    }));
  };

  if (projects.length === 0 && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage brand guidelines and reference materials for your projects.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a project first to start adding knowledge entries.
            </p>
            <Button onClick={() => window.location.href = '/secret-builder-hub'}>
              Go to Builder Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Manage brand guidelines, documentation, and reference materials for your AI builder.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Knowledge Entries
              </CardTitle>
              <CardDescription>
                These materials are used by the AI to understand your brand and generate better content.
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Knowledge Entry</DialogTitle>
                  <DialogDescription>
                    Add documentation, brand guidelines, or reference content for your project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select
                      value={newEntry.projectId}
                      onValueChange={(v) => setNewEntry(prev => ({ ...prev, projectId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., Brand Guidelines"
                      value={newEntry.name}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      placeholder="Paste your content here..."
                      value={newEntry.content}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Or upload a file</span>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept={SUPPORTED_TYPES.join(',')}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {SUPPORTED_TYPES.join(', ')} (max 500KB)
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add Entry
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground mb-2 block">Filter by Project</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No knowledge entries yet.</p>
              <p className="text-sm">Add brand guidelines, documentation, or other reference materials.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{entry.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{entry.project_name}</Badge>
                          <span>{formatFileSize(entry.file_size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowViewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.name}</DialogTitle>
            <DialogDescription>
              Project: {selectedEntry?.project_name}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-4">
            <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg">
              {selectedEntry?.content}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}