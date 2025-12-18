import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, FileText, Trash2, MoreVertical, Loader2, Upload, Check, Eye, X, File, FileCode, FileType } from 'lucide-react';
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

  useEffect(() => {
    if (projectId) {
      fetchEntries();
    }
  }, [projectId]);

  const fetchEntries = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('project_id', projectId)
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
      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          project_id: projectId,
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
          
          {isLoading ? (
            <div className="py-6 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No knowledge added</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Add brand docs, guidelines, or API specs
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="px-2 py-2 hover:bg-muted/50 rounded-md mx-1 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      className="flex-1 text-left flex items-start gap-2"
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowViewDialog(true);
                      }}
                    >
                      {getFileIcon(entry.file_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {entry.content.slice(0, 60)}...
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground/70">
                            {formatDate(entry.created_at)}
                          </span>
                          {entry.file_size && (
                            <span className="text-[10px] text-muted-foreground/70">
                              • {formatFileSize(entry.file_size)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedEntry(entry);
                          setShowViewDialog(true);
                        }}>
                          <Eye className="h-3.5 w-3.5 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
          
          <DropdownMenuSeparator />
          <div className="px-3 py-2">
            <p className="text-[10px] text-muted-foreground text-center">
              Knowledge is used by AI when generating your site
            </p>
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
