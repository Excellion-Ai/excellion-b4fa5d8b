import { SiteSpec, HeroContent, FeaturesContent } from '@/types/site-spec';

interface ProjectPreviewProps {
  spec: SiteSpec | null;
  themeColor?: string;
}

export function ProjectPreview({ spec, themeColor = '#3b82f6' }: ProjectPreviewProps) {
  // Extract first page sections
  const firstPage = spec?.pages?.[0];
  const heroSection = firstPage?.sections?.find(s => s.type === 'hero');
  const featuresSection = firstPage?.sections?.find(s => s.type === 'features');
  
  const heroContent = heroSection?.content as HeroContent | undefined;
  const featuresContent = featuresSection?.content as FeaturesContent | undefined;
  
  const primaryColor = spec?.theme?.primaryColor || themeColor;
  const bgColor = spec?.theme?.backgroundColor || '#ffffff';
  const textColor = spec?.theme?.textColor || '#1f2937';
  const isDark = spec?.theme?.darkMode;

  // If no spec or no meaningful content, show skeleton
  if (!spec || !firstPage?.sections?.length) {
    return (
      <div className="w-full h-full bg-background/80 rounded-md border border-border/50 p-2 flex flex-col gap-1.5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-1.5 rounded" style={{ backgroundColor: themeColor, opacity: 0.7 }} />
          <div className="flex gap-1">
            <div className="w-6 h-1.5 bg-muted-foreground/20 rounded" />
            <div className="w-6 h-1.5 bg-muted-foreground/20 rounded" />
          </div>
        </div>
        {/* Hero */}
        <div className="flex-1 flex gap-2 mt-1">
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-3/4 h-2 bg-foreground/20 rounded" />
            <div className="w-1/2 h-1.5 bg-muted-foreground/20 rounded" />
            <div className="w-10 h-3 rounded mt-1" style={{ backgroundColor: themeColor, opacity: 0.8 }} />
          </div>
          <div className="w-12 h-10 bg-muted-foreground/10 rounded" />
        </div>
        {/* Content */}
        <div className="flex gap-1.5 mt-auto">
          <div className="flex-1 h-4 bg-muted-foreground/10 rounded" />
          <div className="flex-1 h-4 bg-muted-foreground/10 rounded" />
          <div className="flex-1 h-4 bg-muted-foreground/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full rounded-md border border-border/50 p-1.5 flex flex-col gap-1 shadow-sm overflow-hidden"
      style={{ 
        backgroundColor: isDark ? '#0f0f0f' : bgColor,
        color: isDark ? '#f9fafb' : textColor 
      }}
    >
      {/* Mini Header */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div 
          className="text-[6px] font-semibold truncate max-w-[60px]"
          style={{ color: primaryColor }}
        >
          {spec.name || 'Site'}
        </div>
        <div className="flex gap-0.5">
          {spec.navigation?.slice(0, 3).map((nav, i) => (
            <div 
              key={i} 
              className="text-[4px] px-1 py-0.5 rounded"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
              }}
            >
              {nav.label?.slice(0, 6)}
            </div>
          ))}
        </div>
      </div>

      {/* Mini Hero */}
      {heroContent && (
        <div 
          className="flex-1 flex gap-1.5 p-1 rounded"
          style={{ 
            background: isDark 
              ? `linear-gradient(135deg, rgba(30,30,30,0.9), rgba(20,20,20,0.9))`
              : `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}05)`
          }}
        >
          <div className="flex-1 flex flex-col gap-0.5 justify-center min-w-0">
            <p 
              className="text-[5px] font-bold leading-tight truncate"
              style={{ color: isDark ? '#f9fafb' : textColor }}
            >
              {heroContent.headline?.slice(0, 30) || 'Headline'}
            </p>
            <p 
              className="text-[4px] leading-tight line-clamp-2"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
            >
              {heroContent.subheadline?.slice(0, 50) || 'Subheadline text'}
            </p>
            {heroContent.ctas?.[0] && (
              <div 
                className="w-fit px-1 py-0.5 rounded text-[4px] mt-0.5 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {heroContent.ctas[0].label?.slice(0, 12) || 'CTA'}
              </div>
            )}
          </div>
          {heroContent.backgroundImage ? (
            <div 
              className="w-10 h-8 rounded bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url(${heroContent.backgroundImage})` }}
            />
          ) : (
            <div 
              className="w-10 h-8 rounded shrink-0"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
              }}
            />
          )}
        </div>
      )}

      {/* Mini Features Grid */}
      {featuresContent?.items && featuresContent.items.length > 0 && (
        <div className="grid grid-cols-3 gap-0.5 mt-auto shrink-0">
          {featuresContent.items.slice(0, 3).map((item, i) => (
            <div 
              key={i}
              className="p-1 rounded"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
              }}
            >
              <div 
                className="w-2 h-2 rounded mb-0.5"
                style={{ backgroundColor: primaryColor, opacity: 0.3 }}
              />
              <p 
                className="text-[4px] font-medium truncate"
                style={{ color: isDark ? 'rgba(255,255,255,0.8)' : textColor }}
              >
                {item.title?.slice(0, 10)}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {/* Fallback content grid if no features */}
      {(!featuresContent?.items || featuresContent.items.length === 0) && (
        <div className="grid grid-cols-3 gap-0.5 mt-auto shrink-0">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="h-4 rounded"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
