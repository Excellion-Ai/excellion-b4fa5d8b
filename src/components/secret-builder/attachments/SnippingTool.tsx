import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crop, Check, X, RotateCcw, Move } from 'lucide-react';

interface SnippingToolProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  capturedImage: string | null;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function SnippingTool({ open, onOpenChange, onCapture, capturedImage }: SnippingToolProps) {
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!open) {
      setCropArea(null);
      setIsCropping(false);
    }
  }, [open]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !capturedImage) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
    setIsCropping(true);
  }, [capturedImage]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isCropping || !cropStart || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const x = Math.min(cropStart.x, currentX);
    const y = Math.min(cropStart.y, currentY);
    const width = Math.abs(currentX - cropStart.x);
    const height = Math.abs(currentY - cropStart.y);
    
    setCropArea({ x, y, width, height });
  }, [isCropping, cropStart]);

  const handleMouseUp = useCallback(() => {
    setIsCropping(false);
    setCropStart(null);
  }, []);

  const handleReset = () => {
    setCropArea(null);
    setIsCropping(false);
    setCropStart(null);
  };

  const handleConfirm = useCallback(() => {
    if (!capturedImage || !imageRef.current || !containerRef.current) return;
    
    const img = imageRef.current;
    const container = containerRef.current;
    
    const scaleX = img.naturalWidth / container.clientWidth;
    const scaleY = img.naturalHeight / container.clientHeight;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    if (cropArea && cropArea.width > 10 && cropArea.height > 10) {
      const cropX = cropArea.x * scaleX;
      const cropY = cropArea.y * scaleY;
      const cropWidth = cropArea.width * scaleX;
      const cropHeight = cropArea.height * scaleY;
      
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
        onCapture(file);
        onOpenChange(false);
      }
    }, 'image/png');
  }, [capturedImage, cropArea, onCapture, onOpenChange]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0 gap-0 bg-card">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Crop className="w-4 h-4" />
            Capture Preview
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Click and drag to select an area, or confirm to use the full preview
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 flex-1 overflow-hidden">
          {capturedImage ? (
            <div 
              ref={containerRef}
              className="relative h-[60vh] overflow-hidden rounded-lg bg-muted/30 cursor-crosshair select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={capturedImage}
                alt="Preview capture"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
              
              {cropArea && cropArea.width > 0 && cropArea.height > 0 && (
                <>
                  <div 
                    className="absolute inset-0 bg-black/50 pointer-events-none"
                    style={{
                      clipPath: `polygon(
                        0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                        ${cropArea.x}px ${cropArea.y}px,
                        ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                        ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                        ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                        ${cropArea.x}px ${cropArea.y}px
                      )`
                    }}
                  />
                  
                  <div 
                    className="absolute border-2 border-primary border-dashed pointer-events-none"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                    }}
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] bg-primary text-primary-foreground rounded whitespace-nowrap">
                      {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                    </div>
                  </div>
                </>
              )}
              
              {!cropArea && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
                    <Move className="w-4 h-4" />
                    Drag to select area
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
              No preview available
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!cropArea}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={!capturedImage}
              className="gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {cropArea && cropArea.width > 10 ? 'Crop & Add' : 'Add Full'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
