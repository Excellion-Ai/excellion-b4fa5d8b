import { useState } from 'react';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Download, Loader2, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { SiteSpec } from '@/types/site-spec';
import { generateHtmlFromSpec } from './CodeExport';

interface PWAExportProps {
  siteSpec: SiteSpec | null;
  projectName: string;
}

interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
}

function generateManifest(config: PWAConfig): string {
  return JSON.stringify({
    name: config.name,
    short_name: config.shortName,
    description: config.description,
    start_url: "/",
    display: "standalone",
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  }, null, 2);
}

function generateServiceWorker(): string {
  return `// Service Worker for PWA Offline Support
const CACHE_NAME = 'pwa-cache-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
`;
}

function generateOfflineHtml(siteName: string, themeColor: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - ${siteName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, ${themeColor}22, ${themeColor}11);
      color: #333;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    p {
      color: #666;
      margin-bottom: 1.5rem;
    }
    button {
      background: ${themeColor};
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>Please check your internet connection and try again.</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>`;
}

function generateIndexWithPWA(html: string, config: PWAConfig): string {
  // Insert PWA meta tags and manifest link into the HTML head
  const pwaHead = `
  <!-- PWA Meta Tags -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="${config.themeColor}">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="${config.shortName}">
  <link rel="apple-touch-icon" href="/icon-192.png">
  
  <!-- Register Service Worker -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW registered:', reg.scope))
          .catch(err => console.log('SW registration failed:', err));
      });
    }
  </script>`;

  // Insert before </head>
  return html.replace('</head>', `${pwaHead}\n</head>`);
}

async function downloadZip(files: { name: string; content: string }[], zipName: string) {
  const zip = new JSZip();
  
  for (const file of files) {
    zip.file(file.name, file.content);
  }
  
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function PWAExport({ siteSpec, projectName }: PWAExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [config, setConfig] = useState<PWAConfig>({
    name: projectName || 'My App',
    shortName: (projectName || 'My App').slice(0, 12),
    description: 'A progressive web app',
    themeColor: siteSpec?.theme.primaryColor || '#3b82f6',
    backgroundColor: siteSpec?.theme.backgroundColor || '#ffffff',
  });

  const handleExport = async () => {
    if (!siteSpec) {
      toast.error('No site to export');
      return;
    }

    setIsExporting(true);
    try {
      const baseHtml = generateHtmlFromSpec(siteSpec);
      const pwaHtml = generateIndexWithPWA(baseHtml, config);
      
      const files = [
        { name: 'index.html', content: pwaHtml },
        { name: 'manifest.json', content: generateManifest(config) },
        { name: 'sw.js', content: generateServiceWorker() },
        { name: 'offline.html', content: generateOfflineHtml(config.name, config.themeColor) },
      ];

      await downloadZip(files, `${config.shortName.toLowerCase().replace(/\s+/g, '-')}-pwa`);
      
      toast.success('PWA files downloaded! Add icon-192.png and icon-512.png to complete.');
      setIsOpen(false);
    } catch (error) {
      console.error('PWA export error:', error);
      toast.error('Failed to export PWA');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setIsOpen(true)}
        disabled={!siteSpec}
      >
        <Smartphone className="h-3.5 w-3.5" />
        PWA
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Export as PWA
            </DialogTitle>
            <DialogDescription>
              Create an installable Progressive Web App from your site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                PWAs can be installed on mobile devices and work offline. You'll need to add app icons (192x192 and 512x512 PNG) after export.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="pwa-name">App Name</Label>
                <Input
                  id="pwa-name"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome App"
                />
              </div>

              <div>
                <Label htmlFor="pwa-short-name">Short Name (max 12 chars)</Label>
                <Input
                  id="pwa-short-name"
                  value={config.shortName}
                  onChange={(e) => setConfig(prev => ({ ...prev, shortName: e.target.value.slice(0, 12) }))}
                  placeholder="MyApp"
                  maxLength={12}
                />
              </div>

              <div>
                <Label htmlFor="pwa-description">Description</Label>
                <Input
                  id="pwa-description"
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A brief description of your app"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pwa-theme">Theme Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="pwa-theme"
                      value={config.themeColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={config.themeColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pwa-bg">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="pwa-bg"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting} className="gap-2">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PWA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
