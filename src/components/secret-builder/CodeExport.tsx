import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GeneratedCode } from '@/types/app-spec';
import { useToast } from '@/hooks/use-toast';

interface CodeExportProps {
  generatedCode: GeneratedCode | null;
}

export function CodeExport({ generatedCode }: CodeExportProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyCode = async () => {
    if (!generatedCode?.reactCode) return;
    await navigator.clipboard.writeText(generatedCode.reactCode);
    setCopied(true);
    toast({ title: 'Copied!', description: 'React code copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (!generatedCode?.reactCode) return;
    const blob = new Blob([generatedCode.reactCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedSite.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'GeneratedSite.tsx saved' });
  };

  if (!generatedCode) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No code generated yet</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border/50 flex items-center justify-between flex-shrink-0">
        <span className="text-xs text-muted-foreground">React + Tailwind Component</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyCode} className="gap-1.5 h-7 text-xs">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode} className="gap-1.5 h-7 text-xs">
            <Download className="w-3 h-3" />
            Download
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {generatedCode.reactCode}
        </pre>
      </ScrollArea>
    </div>
  );
}
