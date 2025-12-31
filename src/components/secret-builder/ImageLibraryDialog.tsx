import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, 
  Loader2, 
  Search, 
  Grid3X3, 
  List, 
  Download, 
  Trash2, 
  Link, 
  X, 
  Check,
  ZoomIn,
  Calendar,
  FileImage,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedImage {
  name: string;
  url: string;
  type: 'image' | 'logo';
  createdAt: Date;
}

interface ImageLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: GeneratedImage[];
  isLoading: boolean;
  onRefresh: () => void;
  onDelete?: (name: string, type: 'image' | 'logo') => void;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'image' | 'logo';

export function ImageLibraryDialog({
  open,
  onOpenChange,
  images,
  isLoading,
  onRefresh,
  onDelete
}: ImageLibraryDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and search images
  const filteredImages = useMemo(() => {
    return images.filter(image => {
      const matchesSearch = image.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || image.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [images, searchQuery, filterType]);

  // Toggle selection
  const toggleSelection = useCallback((imageName: string) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(imageName)) {
        next.delete(imageName);
      } else {
        next.add(imageName);
      }
      return next;
    });
  }, []);

  // Select all visible
  const selectAll = useCallback(() => {
    setSelectedImages(new Set(filteredImages.map(img => img.name)));
  }, [filteredImages]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedImages(new Set());
  }, []);

  // Copy URL
  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard');
    } catch {
      toast.error('Failed to copy URL');
    }
  }, []);

  // Download single image
  const handleDownload = useCallback(async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch {
      toast.error('Failed to download image');
    }
  }, []);

  // Download selected images
  const handleDownloadSelected = useCallback(async () => {
    const selectedList = filteredImages.filter(img => selectedImages.has(img.name));
    if (selectedList.length === 0) return;

    toast.info(`Downloading ${selectedList.length} images...`);
    
    for (const image of selectedList) {
      await handleDownload(image);
      await new Promise(resolve => setTimeout(resolve, 300)); // Stagger downloads
    }
    
    toast.success(`Downloaded ${selectedList.length} images`);
    clearSelection();
  }, [filteredImages, selectedImages, handleDownload, clearSelection]);

  // Delete selected images
  const handleDeleteSelected = useCallback(async () => {
    if (!onDelete) return;
    
    const selectedList = filteredImages.filter(img => selectedImages.has(img.name));
    if (selectedList.length === 0) return;

    setIsDeleting(true);
    try {
      for (const image of selectedList) {
        await onDelete(image.name, image.type);
      }
      toast.success(`Deleted ${selectedList.length} images`);
      clearSelection();
    } catch {
      toast.error('Failed to delete some images');
    } finally {
      setIsDeleting(false);
    }
  }, [filteredImages, selectedImages, onDelete, clearSelection]);

  // Open in new tab
  const handleOpenInTab = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                AI Image Library
                {images.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {images.length} {images.length === 1 ? 'image' : 'images'}
                  </Badge>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Filter Tabs */}
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                <TabsList className="h-9">
                  <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                  <TabsTrigger value="image" className="text-xs px-3">Images</TabsTrigger>
                  <TabsTrigger value="logo" className="text-xs px-3">Logos</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 px-3 rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 px-3 rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedImages.size > 0 && (
              <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-lg">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{selectedImages.size} selected</span>
                <div className="flex-1" />
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleDownloadSelected}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                {onDelete && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-7 text-xs" 
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                    Delete
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            )}

            {/* Quick Select */}
            {filteredImages.length > 0 && selectedImages.size === 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="self-start text-xs h-auto p-0 mt-2"
                onClick={selectAll}
              >
                Select all ({filteredImages.length})
              </Button>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4 max-h-[65vh] scrollbar-always-visible" scrollbarVariant="purple">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileImage className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {images.length === 0 ? 'No images yet' : 'No matching images'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {images.length === 0
                    ? 'AI-generated images and logos will appear here. Start creating in the builder!'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                {filteredImages.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    className={`group relative aspect-square rounded-lg overflow-hidden border bg-muted/50 transition-all ${
                      selectedImages.has(image.name) 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover cursor-pointer"
                      loading="lazy"
                      onClick={() => setPreviewImage(image)}
                    />

                    {/* Selection Checkbox */}
                    <div 
                      className={`absolute top-2 right-2 transition-opacity ${
                        selectedImages.has(image.name) || 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Checkbox
                        checked={selectedImages.has(image.name)}
                        onCheckedChange={() => toggleSelection(image.name)}
                        className="h-5 w-5 bg-background/80 backdrop-blur-sm border-2"
                      />
                    </div>

                    {/* Type Badge */}
                    <Badge
                      className={`absolute top-2 left-2 text-[10px] ${
                        image.type === 'logo'
                          ? 'bg-violet-500/90 text-white'
                          : 'bg-blue-500/90 text-white'
                      }`}
                    >
                      {image.type === 'logo' ? 'Logo' : 'Image'}
                    </Badge>

                    {/* Hover Actions */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-white hover:bg-white/20"
                          onClick={() => setPreviewImage(image)}
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-white hover:bg-white/20"
                          onClick={() => handleCopyUrl(image.url)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-white hover:bg-white/20"
                          onClick={() => handleDownload(image)}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/20"
                            onClick={() => onDelete(image.name, image.type)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-white/60 mt-1.5 truncate">
                        {image.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {filteredImages.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                      selectedImages.has(image.name)
                        ? 'ring-2 ring-primary border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 bg-muted/30'
                    }`}
                  >
                    <Checkbox
                      checked={selectedImages.has(image.name)}
                      onCheckedChange={() => toggleSelection(image.name)}
                      className="h-5 w-5"
                    />
                    
                    <div 
                      className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer bg-muted"
                      onClick={() => setPreviewImage(image)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{image.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            image.type === 'logo' ? 'bg-violet-500/10 text-violet-600' : 'bg-blue-500/10 text-blue-600'
                          }`}
                        >
                          {image.type === 'logo' ? 'Logo' : 'Image'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {image.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setPreviewImage(image)}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleCopyUrl(image.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(image)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenInTab(image.url)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => onDelete(image.name, image.type)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Lightbox Preview */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
          {previewImage && (
            <div className="relative">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {/* Info Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{previewImage.name}</p>
                    <p className="text-white/60 text-sm">{previewImage.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyUrl(previewImage.url)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(previewImage)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenInTab(previewImage.url)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
