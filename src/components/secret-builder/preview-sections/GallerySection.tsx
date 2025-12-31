import { SiteTheme, BusinessModel } from '@/types/app-spec';
import { ScrollAnimation, StaggerContainer } from '../animations/ScrollAnimations';

interface GalleryItem {
  image: string;
  title?: string;
  description?: string;
}

interface GalleryContent {
  title?: string;
  subtitle?: string;
  items?: GalleryItem[];
}

interface GallerySectionProps {
  section: { id: string; content?: any };
  theme: SiteTheme;
  asTile?: boolean;
  businessModel?: BusinessModel;
}

// Industry-specific fallback images - NEVER use cross-industry images
const industryImages: Record<string, string[]> = {
  // Food & Hospitality
  HOSPITALITY: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', // salad
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', // pizza
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', // gourmet
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', // burger
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80', // sub sandwich
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800&q=80', // deli sandwich
  ],
  // Retail & Commerce
  RETAIL_COMMERCE: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', // fashion store
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80', // clothing rack
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80', // t-shirts
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', // jeans
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80', // accessories
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80', // shopping bags
  ],
  // Service Based
  SERVICE_BASED: [
    'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80', // professional meeting
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80', // team work
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80', // business meeting
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80', // office
    'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80', // professional
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', // workspace
  ],
  // Portfolio / Creative
  PORTFOLIO_IDENTITY: [
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', // photography
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', // wedding
    'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&q=80', // portrait
    'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80', // design work
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', // creative
    'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?w=800&q=80', // art
  ],
};

// Neutral professional fallbacks - used when business type is unknown
const neutralImages = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80', // abstract gradient blue
  'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&q=80', // abstract gradient orange
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80', // gradient pink purple
  'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&q=80', // abstract paint
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', // geometric abstract
  'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=800&q=80', // minimal abstract
];

// Get appropriate fallback images based on business model
function getDefaultImages(businessModel?: BusinessModel): { image: string; title: string }[] {
  const images = businessModel && industryImages[businessModel] 
    ? industryImages[businessModel] 
    : neutralImages;
  
  return images.map((img, i) => ({ 
    image: img, 
    title: `Project ${i + 1}` 
  }));
}

export function GallerySection({ section, theme, asTile = false, businessModel }: GallerySectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || 'Gallery';
  const subtitle = content?.subtitle || 'Explore our work';
  
  // Use content items if provided, otherwise use business-appropriate defaults
  const items = content?.items?.length > 0 
    ? content.items 
    : getDefaultImages(businessModel);

  if (asTile) {
    return (
      <section 
        id={section.id}
        className="h-full min-h-[150px] p-4 contain-layout"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <h3 
          className="text-sm font-bold mb-3"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {items.slice(0, 4).map((item: GalleryItem, i: number) => (
            <div 
              key={i} 
              className="aspect-square rounded-lg overflow-hidden"
            >
              <img 
                src={item.image} 
                alt={item.title || `Gallery ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section 
      id={section.id}
      className="py-12 md:py-16 px-6 min-h-[300px] contain-layout"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <ScrollAnimation animation="fade-up">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ 
                fontFamily: theme.fontHeading || 'system-ui',
                color: isDark ? '#ffffff' : '#111827'
              }}
            >
              {title}
            </h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fade-up" delay={100}>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ 
                fontFamily: theme.fontBody || 'system-ui',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}
            >
              {subtitle}
            </p>
          </ScrollAnimation>
        </div>

        <StaggerContainer 
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          staggerDelay={100}
        >
          {items.map((item: GalleryItem, index: number) => (
            <div 
              key={index}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
            >
              <img 
                src={item.image} 
                alt={item.title || `Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {item.title && (
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                >
                  <span className="text-white font-medium">{item.title}</span>
                </div>
              )}
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
