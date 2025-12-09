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
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const previewWidth = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  // Generate the preview HTML with better error handling
  const previewHtml = useMemo(() => {
    if (!generatedCode?.reactCode) return null;

    // Clean up the code - handle potential issues with the AI-generated code
    let cleanCode = generatedCode.reactCode;
    
    // If the code doesn't include GeneratedSite, wrap it
    if (!cleanCode.includes('GeneratedSite')) {
      cleanCode = `const GeneratedSite = () => { 
        return (
          <div className="p-8 text-center">
            <p className="text-gray-600">Preview rendering...</p>
          </div>
        );
      };`;
    }

    // Create a self-contained HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      font-family: 'Roboto', system-ui, -apple-system, sans-serif;
      background: white;
    }
    .font-inter { font-family: 'Inter', sans-serif; }
    .font-roboto { font-family: 'Roboto', sans-serif; }
    #root { min-height: 100vh; }
    #error-display {
      padding: 20px;
      background: #fee2e2;
      color: #dc2626;
      font-family: monospace;
      white-space: pre-wrap;
      display: none;
    }
  </style>
</head>
<body>
  <div id="error-display"></div>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    try {
      ${cleanCode}
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(GeneratedSite));
    } catch (err) {
      document.getElementById('error-display').style.display = 'block';
      document.getElementById('error-display').textContent = 'Render Error: ' + err.message;
      console.error('Preview error:', err);
    }
  </script>
  <script>
    window.onerror = function(msg, url, line, col, error) {
      document.getElementById('error-display').style.display = 'block';
      document.getElementById('error-display').textContent = 'Error: ' + msg;
      return true;
    };
  </script>
</body>
</html>`;
  }, [generatedCode?.reactCode]);

  useEffect(() => {
    setIframeError(null);
    setIframeLoaded(false);
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
            Describe your app idea and I'll generate a live preview.
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
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setIframeLoaded(true)}
              onError={() => setIframeError('Failed to render preview')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
