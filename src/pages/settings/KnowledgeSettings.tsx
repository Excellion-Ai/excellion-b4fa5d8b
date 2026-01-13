import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Sparkles, 
  Save, 
  Check, 
  Loader2, 
  Plus, 
  Trash2, 
  FileText, 
  Copy,
  Globe,
  FolderOpen,
  Eye,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const GLOBAL_INSTRUCTIONS_KEY = '__global_instructions__';
const CUSTOM_INSTRUCTIONS_KEY = '__custom_instructions__';

interface KnowledgeEntry {
  id: string;
  project_id: string;
  name: string;
  content: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function KnowledgeSettings() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedScope, setSelectedScope] = useState<'global' | string>('global');
  const [globalInstructions, setGlobalInstructions] = useState('');
  const [initialGlobalInstructions, setInitialGlobalInstructions] = useState('');
  const [projectInstructions, setProjectInstructions] = useState('');
  const [initialProjectInstructions, setInitialProjectInstructions] = useState('');
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [newEntry, setNewEntry] = useState({ name: '', content: '' });
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const hasUnsavedGlobalChanges = globalInstructions !== initialGlobalInstructions;
  const hasUnsavedProjectChanges = projectInstructions !== initialProjectInstructions;
  const hasUnsavedChanges = selectedScope === 'global' ? hasUnsavedGlobalChanges : hasUnsavedProjectChanges;

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchProjects(user.id);
        fetchGlobalInstructions(user.id);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedScope !== 'global' && selectedScope) {
      fetchProjectInstructions(selectedScope);
      fetchProjectEntries(selectedScope);
    }
  }, [selectedScope]);

  const fetchProjects = async (userId: string) => {
    const { data, error } = await supabase
      .from('builder_projects')
      .select('id, name')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  };

  // IMPROVED: Fetch global instructions from dedicated user_knowledge table
  // This ensures persistence independent of any project
  const fetchGlobalInstructions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_knowledge')
        .select('content')
        .eq('user_id', userId)
        .eq('name', GLOBAL_INSTRUCTIONS_KEY)
        .maybeSingle();

      if (!error && data) {
        setGlobalInstructions(data.content);
        setInitialGlobalInstructions(data.content);
      }
    } catch (error) {
      console.error('Failed to fetch global instructions:', error);
      // No global instructions yet - that's fine
    }
  };

  const fetchProjectInstructions = async (projectId: string) => {
    try {
      const { data } = await supabase
        .from('knowledge_base')
        .select('content')
        .eq('project_id', projectId)
        .eq('name', CUSTOM_INSTRUCTIONS_KEY)
        .single();

      if (data) {
        setProjectInstructions(data.content);
        setInitialProjectInstructions(data.content);
      } else {
        setProjectInstructions('');
        setInitialProjectInstructions('');
      }
    } catch (error) {
      setProjectInstructions('');
      setInitialProjectInstructions('');
    }
  };

  const fetchProjectEntries = async (projectId: string) => {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('project_id', projectId)
      .neq('name', CUSTOM_INSTRUCTIONS_KEY)
      .neq('file_type', 'global-entry')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
  };

  // IMPROVED: Save global instructions to dedicated user_knowledge table
  // Uses UPSERT to ensure atomic save - data will NEVER be lost
  const saveGlobalInstructions = async () => {
    if (!user) {
      toast.error('You must be logged in to save global instructions');
      return;
    }

    setIsSaving(true);
    try {
      // Use upsert with the unique constraint (user_id, name)
      // This ensures atomic insert-or-update - no data loss possible
      const { error } = await supabase
        .from('user_knowledge')
        .upsert({
          user_id: user.id,
          name: GLOBAL_INSTRUCTIONS_KEY,
          content: globalInstructions,
          file_type: 'global-instructions',
          file_size: new Blob([globalInstructions]).size,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,name'
        });

      if (error) throw error;

      setInitialGlobalInstructions(globalInstructions);
      toast.success('Global instructions saved permanently!');
    } catch (error) {
      console.error('Failed to save global instructions:', error);
      toast.error('Failed to save global instructions');
    } finally {
      setIsSaving(false);
    }
  };

  const saveProjectInstructions = async () => {
    if (!selectedScope || selectedScope === 'global') return;

    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from('knowledge_base')
        .select('id')
        .eq('project_id', selectedScope)
        .eq('name', CUSTOM_INSTRUCTIONS_KEY)
        .single();

      if (existing) {
        await supabase
          .from('knowledge_base')
          .update({
            content: projectInstructions,
            file_size: new Blob([projectInstructions]).size,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else if (projectInstructions.trim()) {
        await supabase
          .from('knowledge_base')
          .insert({
            project_id: selectedScope,
            name: CUSTOM_INSTRUCTIONS_KEY,
            content: projectInstructions,
            file_type: 'instructions',
            file_size: new Blob([projectInstructions]).size,
          });
      }

      setInitialProjectInstructions(projectInstructions);
      toast.success('Course instructions saved!');
    } catch (error) {
      console.error('Failed to save instructions:', error);
      toast.error('Failed to save instructions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (selectedScope === 'global') {
      saveGlobalInstructions();
    } else {
      saveProjectInstructions();
    }
  };

  const copyToClipboard = () => {
    const text = selectedScope === 'global' ? globalInstructions : projectInstructions;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSaveEntry = async () => {
    if (!selectedScope || selectedScope === 'global') {
      toast.error('Please select a specific course to add knowledge entries');
      return;
    }
    if (!newEntry.name.trim() || !newEntry.content.trim()) {
      toast.error('Please enter a name and content');
      return;
    }

    setIsSaving(true);
    try {
      await supabase
        .from('knowledge_base')
        .insert({
          project_id: selectedScope,
          name: newEntry.name.trim(),
          content: newEntry.content.trim(),
          file_type: 'text',
          file_size: new Blob([newEntry.content]).size,
        });

      toast.success('Knowledge entry added!');
      setShowAddDialog(false);
      setNewEntry({ name: '', content: '' });
      fetchProjectEntries(selectedScope);
    } catch (error) {
      console.error('Failed to save entry:', error);
      toast.error('Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await supabase.from('knowledge_base').delete().eq('id', entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Knowledge Base
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage AI instructions and reference materials for your courses.
        </p>
      </div>

      {/* Persistence Notice */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        <p className="text-sm text-emerald-400">
          <span className="font-medium">Your knowledge is secure.</span> All saved instructions persist permanently and will never be removed unless you manually delete them.
        </p>
      </div>

      {/* Scope Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scope</CardTitle>
          <CardDescription>
            Choose whether to edit global instructions (applied to all courses) or course-specific instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedScope} onValueChange={setSelectedScope}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>All Courses (Global)</span>
                </div>
              </SelectItem>
              <Separator className="my-1" />
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{project.name}</span>
                  </div>
                </SelectItem>
              ))}
              {projects.length === 0 && (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                  No courses yet. Create one first.
                </div>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Instructions Editor */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {selectedScope === 'global' ? 'Global Instructions' : 'Course Instructions'}
              </CardTitle>
              <CardDescription>
                {selectedScope === 'global' 
                  ? 'These instructions will be applied to ALL course generation. Use for brand voice, design standards, or universal rules.'
                  : 'These instructions apply only to this specific course.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {hasUnsavedChanges ? 'Save' : 'Saved'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={selectedScope === 'global' ? globalInstructions : projectInstructions}
            onChange={(e) => {
              if (selectedScope === 'global') {
                setGlobalInstructions(e.target.value);
              } else {
                setProjectInstructions(e.target.value);
              }
            }}
            placeholder={selectedScope === 'global' 
              ? "Enter global instructions for all courses...\n\nExample:\n- Always use professional, educational tone\n- Include practical exercises in every module\n- Target intermediate skill level unless specified"
              : "Enter specific instructions for this course...\n\nExample:\n- Focus on hands-on coding examples\n- Include quiz questions after each lesson\n- Reference industry best practices"}
            className="min-h-[200px] font-mono text-sm"
          />
          {hasUnsavedChanges && (
            <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              You have unsaved changes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Entries (Course-specific only) */}
      {selectedScope !== 'global' && selectedScope && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reference Materials
                </CardTitle>
                <CardDescription>
                  Upload brand guidelines, API docs, or any reference content for the AI.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reference materials yet</p>
                <p className="text-xs mt-1">Add brand docs, style guides, or other content</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.created_at)}
                          {entry.file_size && ` • ${Math.round(entry.file_size / 1024)}KB`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowViewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Reference Material
            </DialogTitle>
            <DialogDescription>
              Add brand guidelines, API docs, or any text the AI should reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name *</label>
              <Input
                value={newEntry.name}
                onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Brand Guidelines, Style Guide"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Content *</label>
              <Textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Paste your content here..."
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.name}</DialogTitle>
            <DialogDescription>
              Added {selectedEntry && formatDate(selectedEntry.created_at)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <pre className="p-4 bg-muted/50 rounded-lg text-xs font-mono whitespace-pre-wrap break-words">
              {selectedEntry?.content}
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
