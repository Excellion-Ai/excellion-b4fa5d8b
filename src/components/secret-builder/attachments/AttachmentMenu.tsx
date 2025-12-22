import { useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Paperclip, 
  Upload, 
  FileText, 
  Link, 
  Scissors, 
  Palette,
  Database 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttachmentItem, BrandKit } from './types';
import { PasteTextModal } from './PasteTextModal';
import { AddLinkModal } from './AddLinkModal';
import { BrandKitModal } from './BrandKitModal';
import { ConnectSourcesModal } from './ConnectSourcesModal';
import { SnippingTool } from './SnippingTool';

interface AttachmentMenuProps {
  onAddAttachment: (attachment: AttachmentItem) => void;
  disabled?: boolean;
  attachmentCount?: number;
  previewRef?: React.RefObject<HTMLElement>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function AttachmentMenu({ onAddAttachment, disabled, attachmentCount = 0, previewRef }: AttachmentMenuProps) {
  const [open, setOpen] = useState(false);
  const [pasteTextOpen, setPasteTextOpen] = useState(false);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [brandKitOpen, setBrandKitOpen] = useState(false);
  const [connectSourcesOpen, setConnectSourcesOpen] = useState(false);
  const [snippingToolOpen, setSnippingToolOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [existingBrandKit, setExistingBrandKit] = useState<BrandKit | undefined>();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit`,
          variant: 'destructive',
        });
        return;
      }

      onAddAttachment({
        id: generateId(),
        type: 'file',
        name: file.name,
        data: file,
        mimeType: file.type,
      });
    });

    e.target.value = '';
    setOpen(false);
  };

  const handlePasteText = (text: string) => {
    onAddAttachment({
      id: generateId(),
      type: 'text',
      name: 'Pasted text',
      data: text,
    });
  };

  const handleAddLink = (url: string) => {
    // Extract domain for display name
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      onAddAttachment({
        id: generateId(),
        type: 'link',
        name: domain,
        url,
      });
    } catch {
      onAddAttachment({
        id: generateId(),
        type: 'link',
        name: 'Link',
        url,
      });
    }
  };

  const handleTakeScreenshot = async () => {
    setOpen(false);
    
    if (!previewRef?.current) {
      toast({
        title: 'No preview available',
        description: 'Generate a site first to capture a screenshot.',
        variant: 'destructive',
      });
      return;
    }
    
    // Capture the screenshot BEFORE opening the dialog
    try {
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      setSnippingToolOpen(true);
    } catch (error) {
      console.error('Failed to capture preview:', error);
      toast({
        title: 'Capture failed',
        description: 'Unable to capture the preview. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSnippingCapture = (file: File) => {
    onAddAttachment({
      id: generateId(),
      type: 'screenshot',
      name: 'Screenshot',
      data: file,
      mimeType: 'image/png',
    });
    toast({
      title: 'Screenshot captured',
      description: 'Your screenshot has been added as context.',
    });
  };

  const handleBrandKitSave = (brandKit: BrandKit) => {
    setExistingBrandKit(brandKit);
    onAddAttachment({
      id: generateId(),
      type: 'brandkit',
      name: 'Brand kit',
      brandKit,
    });
    toast({
      title: 'Brand kit saved',
      description: 'Your brand identity will be applied to generated sites.',
    });
  };

  const menuItems = [
    {
      icon: Upload,
      label: 'Upload files…',
      onClick: () => fileInputRef.current?.click(),
    },
    {
      icon: FileText,
      label: 'Paste text…',
      onClick: () => { setOpen(false); setPasteTextOpen(true); },
    },
    {
      icon: Link,
      label: 'Add link…',
      onClick: () => { setOpen(false); setAddLinkOpen(true); },
    },
    {
      icon: Scissors,
      label: 'Snip preview…',
      onClick: handleTakeScreenshot,
    },
  ];

  const advancedItems = [
    {
      icon: Palette,
      label: 'Brand kit…',
      onClick: () => { setOpen(false); setBrandKitOpen(true); },
    },
    {
      icon: Database,
      label: 'Connect sources…',
      onClick: () => { setOpen(false); setConnectSourcesOpen(true); },
    },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.docx,.txt"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 focus-visible:ring-primary/50"
            disabled={disabled}
          >
            <Paperclip className="w-4 h-4 mr-1.5" />
            Add context
            {attachmentCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/20 text-primary">
                {attachmentCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="start"
          className="w-52 p-1.5 bg-card border-border shadow-lg shadow-black/20 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-2.5 h-9 px-2.5 text-sm font-normal text-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:ring-primary/50"
                onClick={item.onClick}
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                {item.label}
              </Button>
            ))}
          </div>
          
          <Separator className="my-1.5 bg-border/60" />
          
          <div className="space-y-0.5">
            {advancedItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-2.5 h-9 px-2.5 text-sm font-normal text-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:ring-primary/50"
                onClick={item.onClick}
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                {item.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <PasteTextModal
        open={pasteTextOpen}
        onOpenChange={setPasteTextOpen}
        onAdd={handlePasteText}
      />

      <AddLinkModal
        open={addLinkOpen}
        onOpenChange={setAddLinkOpen}
        onAdd={handleAddLink}
      />

      <BrandKitModal
        open={brandKitOpen}
        onOpenChange={setBrandKitOpen}
        onSave={handleBrandKitSave}
        existingBrandKit={existingBrandKit}
      />

      <ConnectSourcesModal
        open={connectSourcesOpen}
        onOpenChange={setConnectSourcesOpen}
      />

      <SnippingTool
        open={snippingToolOpen}
        onOpenChange={(open) => {
          setSnippingToolOpen(open);
          if (!open) setCapturedImage(null);
        }}
        onCapture={handleSnippingCapture}
        capturedImage={capturedImage}
      />
    </>
  );
}
