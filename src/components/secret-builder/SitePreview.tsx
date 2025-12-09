import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Loader2, RefreshCw, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneratedCode } from '@/types/app-spec';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface SitePreviewProps {
  generatedCode: GeneratedCode | null;
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
}

export function SitePreview({ generatedCode, isLoading, error, onRetry }: SitePreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [iframeError, setIframeError] = useState<string | null>(null);

  const previewWidth = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  // Generate the preview HTML
  const previewHtml = useMemo(() => {
    if (!generatedCode?.reactCode) return null;

    // Create a self-contained HTML document with the React component
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${generatedCode.reactCode}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<GeneratedSite />);
  </script>
</body>
</html>`;
  }, [generatedCode?.reactCode]);

  useEffect(() => {
    setIframeError(null);
  }, [generatedCode]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Generating site code...</p>
        </div>
      </div>
    );
  }

  if (error || iframeError) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20 p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-10 h-10 mx-auto text-destructive" />
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Preview Error</h3>
            <p className="text-xs text-muted-foreground">{error || iframeError}</p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!generatedCode) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground max-w-xs">
          <Monitor className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Generate a blueprint first, then click "Build Site" to see a live preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview controls */}
      <div className="h-10 border-b border-border/50 px-3 flex items-center justify-between bg-background/80 flex-shrink-0">
        <span className="text-xs text-muted-foreground">
          {generatedCode.siteDefinition?.name || 'Generated Site'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setPreviewMode('desktop')}
          >
            <Monitor className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setPreviewMode('tablet')}
          >
            <Tablet className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-auto bg-[#1a1a1a] flex justify-center p-4">
        <div className={`${previewWidth[previewMode]} h-full bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300`}>
          {previewHtml && (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Site Preview"
              sandbox="allow-scripts"
              onError={() => setIframeError('Failed to render preview')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
