import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RefreshCw, 
  ExternalLink,
  Loader2,
  AlertCircle,
  Layers,
  Palette,
  Search,
  Download,
  Copy,
  Check,
  GripVertical
} from 'lucide-react';
import { GeneratedCode, SiteSection } from '@/types/app-spec';
import { SitePreview } from '@/components/secret-builder/SitePreview';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BuilderPreviewPanelProps {
  generatedCode: GeneratedCode | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onExport: () => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function BuilderPreviewPanel({
  generatedCode,
  isLoading,
  error,
  onRefresh,
  onExport,
}: BuilderPreviewPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [copied, setCopied] = useState(false);
  
  // SEO state
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Sections state
  const [sections, setSections] = useState<(SiteSection & { enabled: boolean })[]>([]);

  // Initialize sections when generatedCode changes
  useState(() => {
    if (generatedCode?.siteDefinition?.sections) {
      setSections(
        generatedCode.siteDefinition.sections.map(s => ({ ...s, enabled: true }))
      );
    }
  });

  const handleCopyCode = async () => {
    if (!generatedCode?.reactCode) return;
    await navigator.clipboard.writeText(generatedCode.reactCode);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Code copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedCode?.reactCode) return;
    const blob = new Blob([generatedCode.reactCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'website.tsx saved' });
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 border-b border-border/50 px-4 flex items-center justify-between">
          <TabsList className="h-9 bg-muted/50">
            <TabsTrigger value="preview" className="text-xs gap-1.5 data-[state=active]:bg-background">
              <Monitor className="w-3.5 h-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="sections" className="text-xs gap-1.5 data-[state=active]:bg-background">
              <Layers className="w-3.5 h-3.5" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="styles" className="text-xs gap-1.5 data-[state=active]:bg-background">
              <Palette className="w-3.5 h-3.5" />
              Styles
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs gap-1.5 data-[state=active]:bg-background">
              <Search className="w-3.5 h-3.5" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs gap-1.5 data-[state=active]:bg-background">
              <Download className="w-3.5 h-3.5" />
              Export
            </TabsTrigger>
          </TabsList>

          {activeTab === 'preview' && (
            <div className="flex items-center gap-2">
              {/* Device toggles */}
              <div className="flex items-center border border-border/50 rounded-md p-0.5">
                <Button
                  variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setDeviceMode('desktop')}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant={deviceMode === 'tablet' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setDeviceMode('tablet')}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setDeviceMode('mobile')}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Preview Tab */}
        <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
          {error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md p-6">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                <h3 className="text-sm font-medium text-foreground mb-2">Build Error</h3>
                <p className="text-xs text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <SitePreview 
              siteDefinition={generatedCode?.siteDefinition || null}
              isLoading={isLoading}
            />
          )}
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-4">Drag to reorder, toggle to enable/disable sections.</p>
              {generatedCode?.siteDefinition?.sections?.map((section, index) => (
                <div 
                  key={section.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{section.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{section.type}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-8">No sections yet. Build a site first.</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Styles Tab */}
        <TabsContent value="styles" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Colors</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground/80">Primary</span>
                    <div 
                      className="h-10 rounded-md border border-border mt-1 cursor-pointer"
                      style={{ backgroundColor: generatedCode?.siteDefinition?.theme?.primaryColor || '#3b82f6' }}
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground/80">Secondary</span>
                    <div 
                      className="h-10 rounded-md border border-border mt-1 cursor-pointer"
                      style={{ backgroundColor: generatedCode?.siteDefinition?.theme?.secondaryColor || '#8b5cf6' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Typography</label>
                <div className="space-y-2">
                  <div className="p-3 rounded-md border border-border/50">
                    <span className="text-xs text-muted-foreground/80">Heading Font</span>
                    <p className="text-sm font-semibold mt-1">
                      {generatedCode?.siteDefinition?.theme?.fontHeading || 'Inter'}
                    </p>
                  </div>
                  <div className="p-3 rounded-md border border-border/50">
                    <span className="text-xs text-muted-foreground/80">Body Font</span>
                    <p className="text-sm mt-1">
                      {generatedCode?.siteDefinition?.theme?.fontBody || 'Inter'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Border Radius</label>
                <div className="flex gap-2">
                  {['None', 'Small', 'Medium', 'Large', 'Full'].map((radius) => (
                    <button
                      key={radius}
                      className="flex-1 py-2 text-xs rounded-md border border-border hover:border-primary transition-colors"
                    >
                      {radius}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Page Title</label>
                <Input
                  value={seoTitle || generatedCode?.siteDefinition?.name || ''}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="My Awesome Website"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 50-60 characters</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meta Description</label>
                <textarea
                  value={seoDescription || generatedCode?.siteDefinition?.description || ''}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="A brief description of your website..."
                  className="w-full h-20 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 150-160 characters</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Keywords</label>
                <Input
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="web design, business, services"
                  className="text-sm"
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                <h3 className="text-sm font-medium text-foreground mb-2">Download Code</h3>
                <p className="text-xs text-muted-foreground mb-3">Get the React/Tailwind source code for your site.</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyCode}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
                    <Download className="w-3.5 h-3.5" />
                    Download .tsx
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                <h3 className="text-sm font-medium text-foreground mb-2">Deploy</h3>
                <p className="text-xs text-muted-foreground mb-3">Publish your site to a live URL.</p>
                <Button size="sm" onClick={onExport}>
                  Publish Site
                </Button>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-border/50">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Coming Soon</h3>
                <ul className="text-xs text-muted-foreground/80 space-y-1">
                  <li>• Export to Lovable</li>
                  <li>• Export to v0.dev</li>
                  <li>• Custom domain setup</li>
                  <li>• GitHub integration</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
