import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Bookmark, BookmarkPlus, Clock, Trash2, RotateCcw, MoreVertical, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SiteSpec } from '@/types/site-spec';
import type { Json } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';

interface Bookmark {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  spec: SiteSpec;
  created_at: string;
}

interface BookmarksPanelProps {
  projectId: string | null;
  currentSpec: SiteSpec | null;
  onRestoreBookmark: (spec: SiteSpec) => void;
}

export function BookmarksPanel({ projectId, currentSpec, onRestoreBookmark }: BookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');
  const [bookmarkDescription, setBookmarkDescription] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchBookmarks();
    }
  }, [projectId]);

  const fetchBookmarks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBookmarks((data || []).map(b => ({
        ...b,
        spec: b.spec as unknown as SiteSpec
      })));
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBookmark = async () => {
    if (!projectId || !currentSpec || !bookmarkName.trim()) {
      toast.error('Please enter a name for this bookmark');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          project_id: projectId,
          name: bookmarkName.trim(),
          description: bookmarkDescription.trim() || null,
          spec: currentSpec as unknown as Json,
        });

      if (error) throw error;

      toast.success('Bookmark saved!');
      setShowSaveDialog(false);
      setBookmarkName('');
      setBookmarkDescription('');
      fetchBookmarks();
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      toast.error('Failed to save bookmark');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreBookmark = (bookmark: Bookmark) => {
    onRestoreBookmark(bookmark.spec);
    toast.success(`Restored "${bookmark.name}"`);
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;

      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      toast.success('Bookmark deleted');
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      toast.error('Failed to delete bookmark');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Bookmark className="h-3.5 w-3.5" />
            Bookmarks
            {bookmarks.length > 0 && (
              <span className="ml-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                {bookmarks.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <div className="px-2 py-1.5 flex items-center justify-between">
            <span className="text-sm font-medium">Saved Bookmarks</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setShowSaveDialog(true)}
              disabled={!projectId || !currentSpec}
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
          <DropdownMenuSeparator />
          
          {isLoading ? (
            <div className="py-6 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="py-6 text-center">
              <Bookmark className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No bookmarks yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Save your current progress</p>
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="px-2 py-2 hover:bg-muted/50 rounded-md mx-1 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      className="flex-1 text-left"
                      onClick={() => handleRestoreBookmark(bookmark)}
                    >
                      <p className="text-sm font-medium truncate">{bookmark.name}</p>
                      {bookmark.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {bookmark.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(bookmark.created_at)}
                      </p>
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
                        <DropdownMenuItem onClick={() => handleRestoreBookmark(bookmark)}>
                          <RotateCcw className="h-3.5 w-3.5 mr-2" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteBookmark(bookmark.id)}
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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Bookmark Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkPlus className="h-5 w-5 text-primary" />
              Save Bookmark
            </DialogTitle>
            <DialogDescription>
              Save the current state of your site to restore later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name *</label>
              <Input
                value={bookmarkName}
                onChange={(e) => setBookmarkName(e.target.value)}
                placeholder="e.g., Before hero redesign"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
              <Input
                value={bookmarkDescription}
                onChange={(e) => setBookmarkDescription(e.target.value)}
                placeholder="e.g., Working version with 3 sections"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBookmark}
              disabled={!bookmarkName.trim() || isSaving}
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
                  Save Bookmark
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
