import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon,
  Video,
  Music,
  Archive, 
  File, 
  Plus, 
  Trash2, 
  Download, 
  Loader2,
  Upload,
  Paperclip,
} from 'lucide-react';

interface LessonResource {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
}

interface ResourceManagerProps {
  courseId: string;
  lessonId: string;
  isEditing?: boolean;
  onResourcesChange?: (count: number) => void;
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return <File className="w-5 h-5 text-muted-foreground" />;
  
  if (fileType.includes('pdf')) {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  if (fileType.includes('word') || fileType.includes('document')) {
    return <FileText className="w-5 h-5 text-blue-500" />;
  }
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  }
  if (fileType.includes('image')) {
    return <ImageIcon className="w-5 h-5 text-purple-500" />;
  }
  if (fileType.includes('video') || fileType.includes('mp4')) {
    return <Video className="w-5 h-5 text-orange-500" />;
  }
  if (fileType.includes('audio') || fileType.includes('mp3')) {
    return <Music className="w-5 h-5 text-pink-500" />;
  }
  if (fileType.includes('zip') || fileType.includes('archive')) {
    return <Archive className="w-5 h-5 text-amber-500" />;
  }
  return <File className="w-5 h-5 text-muted-foreground" />;
};

export function ResourceManager({ 
  courseId, 
  lessonId, 
  isEditing = false,
  onResourcesChange,
}: ResourceManagerProps) {
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Store callback in a ref to avoid re-triggering effects
  const onResourcesChangeRef = useRef(onResourcesChange);
  onResourcesChangeRef.current = onResourcesChange;

  const fetchResources = useCallback(async () => {
    if (!courseId || !lessonId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('lesson_resources')
      .select('id, title, file_url, file_type, file_size_bytes')
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching resources:', error);
    } else {
      setResources(data || []);
      onResourcesChangeRef.current?.(data?.length || 0);
    }
    setIsLoading(false);
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    setSelectedFile(file);
    if (!resourceTitle) {
      // Auto-set title from filename (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setResourceTitle(nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !resourceTitle.trim()) {
      toast.error('Please provide a title and select a file');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `${courseId}/${lessonId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-resources')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('course-resources')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('lesson_resources')
        .insert({
          course_id: courseId,
          lesson_id: lessonId,
          title: resourceTitle.trim(),
          file_url: urlData.publicUrl,
          file_type: selectedFile.type,
          file_size_bytes: selectedFile.size,
        });

      if (insertError) throw insertError;

      toast.success('Resource uploaded');
      setShowModal(false);
      setResourceTitle('');
      setSelectedFile(null);
      fetchResources();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return;

    const { error } = await supabase
      .from('lesson_resources')
      .delete()
      .eq('id', resourceId);

    if (error) {
      toast.error('Failed to delete resource');
    } else {
      toast.success('Resource deleted');
      fetchResources();
    }
  };

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Student view (non-editing mode)
  if (!isEditing) {
    if (resources.length === 0) return null;
    
    return (
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Lesson Resources
        </h3>
        <div className="space-y-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
            >
              {getFileIcon(resource.file_type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{resource.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(resource.file_size_bytes)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(resource.file_url, resource.title)}
                className="shrink-0 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Editor view
  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <div>
        <Label className="text-sm font-medium flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Lesson Resources
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Add downloadable files for students
        </p>
      </div>

      {/* Resource List */}
      {resources.length > 0 && (
        <div className="space-y-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
            >
              {getFileIcon(resource.file_type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{resource.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(resource.file_size_bytes)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(resource.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Button */}
      <Button
        variant="outline"
        onClick={() => setShowModal(true)}
        className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/10"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Resource
      </Button>

      {/* Upload Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Title Field */}
            <div className="space-y-2">
              <Label>Resource Title</Label>
              <Input
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                placeholder="Worksheet, Cheat Sheet, Template..."
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload File</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    {getFileIcon(selectedFile.type)}
                    <span className="text-sm">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drop file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, Word, Excel, Video, Audio, ZIP, Images (max 10MB)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.mp4,.mov,.mp3,.wav,.pptx,.txt,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setResourceTitle('');
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !resourceTitle.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
