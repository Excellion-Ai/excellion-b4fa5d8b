import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, FileText, Trash2, MoreVertical, Loader2, Upload, Check, Eye, X, File, FileCode, FileType, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

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

interface KnowledgePanelProps {
  projectId: string | null;
}

const MAX_FILE_SIZE = 500 * 1024; // 500KB max for text content
const SUPPORTED_TYPES = ['.txt', '.md', '.json', '.css', '.html', '.xml', '.yaml', '.yml'];
const CUSTOM_INSTRUCTIONS_KEY = '__custom_instructions__';

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'markdown':
    case 'md':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'json':
    case 'yaml':
    case 'yml':
      return <FileCode className="h-4 w-4 text-green-500" />;
    case 'css':
    case 'html':
      return <FileType className="h-4 w-4 text-purple-500" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function KnowledgePanel({ projectId }: KnowledgePanelProps) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [newEntry, setNewEntry] = useState({ name: '', content: '' });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom instructions state
  const [customInstructions, setCustomInstructions] = useState('');
  const [initialInstructions, setInitialInstructions] = useState('');
  const [instructionsSaving, setInstructionsSaving] = useState(false);
  const [instructionsSaved, setInstructionsSaved] = useState(false);
  const hasUnsavedChanges = customInstructions !== initialInstructions;

  // Load custom instructions
  const loadCustomInstructions = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const { data } = await supabase
        .from('knowledge_base')
        .select('content')
        .eq('project_id', projectId)
        .eq('name', CUSTOM_INSTRUCTIONS_KEY)
        .single();
      
      if (data) {
        setCustomInstructions(data.content);
        setInitialInstructions(data.content);
      }
    } catch (error) {
      // No existing instructions - that's fine
    }
  }, [projectId]);

  // Manual save function for custom instructions
  const saveCustomInstructions = async () => {
    if (!projectId) return;
    
    setInstructionsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save');
        return;
      }

      // Check if entry exists
      const { data: existing } = await supabase
        .from('knowledge_base')
        .select('id')
        .eq('project_id', projectId)
        .eq('name', CUSTOM_INSTRUCTIONS_KEY)
        .single();

      if (existing) {
        await supabase
          .from('knowledge_base')
          .update({
            content: customInstructions,
            file_size: new Blob([customInstructions]).size,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else if (customInstructions.trim()) {
        await supabase
          .from('knowledge_base')
          .insert({
            project_id: projectId,
            user_id: user.id,
            name: CUSTOM_INSTRUCTIONS_KEY,
            content: customInstructions,
            file_type: 'instructions',
            file_size: new Blob([customInstructions]).size,
          });
      }
      
      setInitialInstructions(customInstructions);
      setInstructionsSaved(true);
      toast.success('Knowledge saved!');
      setTimeout(() => setInstructionsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save instructions:', error);
      toast.error('Failed to save knowledge');
    } finally {
      setInstructionsSaving(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchEntries();
      loadCustomInstructions();
    }
  }, [projectId, loadCustomInstructions]);

  const fetchEntries = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('project_id', projectId)
        .neq('name', CUSTOM_INSTRUCTIONS_KEY) // Exclude custom instructions from list
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
      toast.error('Failed to load knowledge base');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max size is ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_TYPES.includes(ext)) {
      toast.error(`Unsupported file type. Supported: ${SUPPORTED_TYPES.join(', ')}`);
      return;
    }

    try {
      const content = await file.text();
      setNewEntry({
        name: file.name.replace(/\.[^/.]+$/, ''),
        content: content,
      });
      setShowAddDialog(true);
    } catch (error) {
      console.error('Failed to read file:', error);
      toast.error('Failed to read file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSaveEntry = async () => {
    if (!projectId || !newEntry.name.trim() || !newEntry.content.trim()) {
      toast.error('Please enter a name and content');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save');
        return;
      }

      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          project_id: projectId,
          user_id: user.id,
          name: newEntry.name.trim(),
          content: newEntry.content.trim(),
          file_type: 'text',
          file_size: new Blob([newEntry.content]).size,
        });

      if (error) throw error;

      toast.success('Knowledge added!');
      setShowAddDialog(false);
      setNewEntry({ name: '', content: '' });
      fetchEntries();
    } catch (error) {
      console.error('Failed to save entry:', error);
      toast.error('Failed to save knowledge entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success('Entry deleted');
    } catch (error) {
      console.error('Failed to delete entry:', error);
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

  const totalSize = entries.reduce((acc, e) => acc + (e.file_size || 0), 0);

  return (
    <>
      {/* Trigger Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Knowledge
            {entries.length > 0 && (
              <span className="ml-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                {entries.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-2 py-1.5 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Knowledge Base</span>
              {entries.length > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  {formatFileSize(totalSize)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => {
                setNewEntry({ name: '', content: '' });
                setShowAddDialog(true);
              }}
              disabled={!projectId}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <DropdownMenuSeparator />
          
          {/* Drag & Drop Zone */}
          <div
            className={`mx-2 my-2 border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_TYPES.join(',')}
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Drop files here or click to upload
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              .txt, .md, .json, .css, .html supported
            </p>
          </div>
          
          <DropdownMenuSeparator />

          {/* Custom Instructions Section */}
          <div className="mx-2 my-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Custom Instructions</span>
              </div>
              {instructionsSaved && !instructionsSaving && (
                <span className="text-[10px] text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Saved
                </span>
              )}
            </div>
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Add custom instructions for the AI... (e.g., brand voice, design preferences, specific requirements)"
              className="min-h-[100px] text-xs resize-none"
              disabled={!projectId}
            />
            <p className="text-[10px] text-muted-foreground/70 mt-1 mb-2">
              These instructions will be used by the AI when generating your site.
            </p>
            <Button
              onClick={saveCustomInstructions}
              disabled={!projectId || instructionsSaving || !hasUnsavedChanges}
              size="sm"
              className="w-full gap-2"
            >
              {instructionsSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {hasUnsavedChanges ? 'Save Knowledge' : 'Saved'}
                </>
              )}
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Knowledge Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Knowledge
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
                placeholder="e.g., Brand Guidelines, API Spec"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Content *</label>
              <Textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Paste your brand guidelines, color palette, tone of voice, API documentation, etc."
                rows={10}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formatFileSize(new Blob([newEntry.content]).size)} / {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEntry}
              disabled={!newEntry.name.trim() || !newEntry.content.trim() || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Knowledge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Knowledge Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntry && getFileIcon(selectedEntry.file_type)}
              {selectedEntry?.name}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              Added {selectedEntry && formatDate(selectedEntry.created_at)}
              {selectedEntry?.file_size && (
                <Badge variant="secondary" className="text-[10px]">
                  {formatFileSize(selectedEntry.file_size)}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <pre className="p-4 bg-muted/50 rounded-lg text-xs font-mono whitespace-pre-wrap break-words">
              {selectedEntry?.content}
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedEntry) {
                  handleDeleteEntry(selectedEntry.id);
                  setShowViewDialog(false);
                }
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
