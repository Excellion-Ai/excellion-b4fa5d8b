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
  GripVertical,
  Sparkles
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
  onBuildFromBrief: () => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function BuilderPreviewPanel({
  generatedCode,
  isLoading,
  error,
  onRefresh,
  onExport,
  onBuildFromBrief,
}: BuilderPreviewPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [copied, setCopied] = useState(false);
  
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const [sections, setSections] = useState<(SiteSection & { enabled: boolean })[]>([]);

  const hasContent = generatedCode?.siteDefinition;

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
    <div className="flex flex-col h-full bg-background/30">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Header with Tabs */}
        <div className="h-14 border-b border-border/40 px-5 flex items-center justify-between">
          <TabsList className="h-10 bg-muted/40 p-1">
            <TabsTrigger 
              value="preview" 
              className="text-xs font-medium gap-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Monitor className="w-3.5 h-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="sections" 
              className="text-xs font-medium gap-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              Sections
            </TabsTrigger>
            <TabsTrigger 
              value="styles" 
              className="text-xs font-medium gap-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Palette className="w-3.5 h-3.5" />
              Styles
            </TabsTrigger>
            <TabsTrigger 
              value="seo" 
              className="text-xs font-medium gap-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              SEO
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="text-xs font-medium gap-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Preview Controls - only show on preview tab */}
          {activeTab === 'preview' && hasContent && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border/50 rounded-lg p-0.5 bg-muted/30">
                <Button
                  variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => setDeviceMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceMode === 'tablet' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => setDeviceMode('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => setDeviceMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-border/50" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Preview Tab */}
        <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
          {error ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Build Error</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{error}</p>
                <Button variant="outline" onClick={onRefresh}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : !hasContent ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No preview yet</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Describe your website idea in the chat panel to generate a preview. You can also fill in the project setup to help guide the build.
                </p>
                <Button onClick={onBuildFromBrief} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Build from Brief
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "h-full flex items-center justify-center p-6 bg-muted/20",
              deviceMode === 'desktop' && "p-0",
              deviceMode === 'tablet' && "p-8",
              deviceMode === 'mobile' && "p-8"
            )}>
              <div className={cn(
                "h-full bg-background rounded-lg overflow-hidden shadow-2xl border border-border/50",
                deviceMode === 'desktop' && "w-full rounded-none border-0",
                deviceMode === 'tablet' && "w-[768px] max-w-full",
                deviceMode === 'mobile' && "w-[375px] max-w-full"
              )}>
                <SitePreview 
                  siteDefinition={generatedCode?.siteDefinition || null}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Page Sections</p>
              <p className="text-xs text-muted-foreground mb-5">Drag to reorder, toggle to enable/disable sections.</p>
              <div className="space-y-2">
                {generatedCode?.siteDefinition?.sections?.map((section, index) => (
                  <div 
                    key={section.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all group"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab group-hover:text-muted-foreground transition-colors" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{section.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">{section.type.replace('-', ' ')}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                )) || (
                  <div className="text-center py-12">
                    <Layers className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No sections yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Build a site first</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Styles Tab */}
        <TabsContent value="styles" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5 space-y-6">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Colors</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground mb-2 block">Primary</span>
                    <div 
                      className="h-12 rounded-xl border border-border cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                      style={{ backgroundColor: generatedCode?.siteDefinition?.theme?.primaryColor || '#3b82f6' }}
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground mb-2 block">Secondary</span>
                    <div 
                      className="h-12 rounded-xl border border-border cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                      style={{ backgroundColor: generatedCode?.siteDefinition?.theme?.secondaryColor || '#8b5cf6' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Typography</p>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border/50 bg-card/50">
                    <span className="text-xs text-muted-foreground">Heading Font</span>
                    <p className="text-base font-bold mt-1">
                      {generatedCode?.siteDefinition?.theme?.fontHeading || 'Inter'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card/50">
                    <span className="text-xs text-muted-foreground">Body Font</span>
                    <p className="text-base mt-1">
                      {generatedCode?.siteDefinition?.theme?.fontBody || 'Inter'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Border Radius</p>
                <div className="flex gap-2">
                  {['None', 'Small', 'Medium', 'Large', 'Full'].map((radius) => (
                    <button
                      key={radius}
                      className="flex-1 py-2.5 text-xs font-medium rounded-lg border border-border/50 hover:border-primary hover:bg-primary/5 transition-all"
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
            <div className="p-5 space-y-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">SEO Settings</p>
              
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Page Title</label>
                <Input
                  value={seoTitle || generatedCode?.siteDefinition?.name || ''}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="My Awesome Website"
                  className="h-11"
                />
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">Recommended: 50-60 characters</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Meta Description</label>
                <textarea
                  value={seoDescription || generatedCode?.siteDefinition?.description || ''}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="A brief description of your website..."
                  className="w-full h-24 px-4 py-3 text-sm rounded-xl border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">Recommended: 150-160 characters</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Keywords</label>
                <Input
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="web design, business, services"
                  className="h-11"
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5 space-y-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Export Options</p>

              <div className="p-5 rounded-xl border border-border/50 bg-card/50">
                <h3 className="text-sm font-semibold text-foreground mb-2">Download Code</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Get the React/Tailwind source code for your site.</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyCode}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                    Download .tsx
                  </Button>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-border/50 bg-card/50">
                <h3 className="text-sm font-semibold text-foreground mb-2">Deploy</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Publish your site to a live URL.</p>
                <Button size="sm" onClick={onExport} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Publish Site
                </Button>
              </div>

              <div className="p-5 rounded-xl border border-dashed border-border/40 bg-muted/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Coming Soon</h3>
                <ul className="text-xs text-muted-foreground/70 space-y-1.5">
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
