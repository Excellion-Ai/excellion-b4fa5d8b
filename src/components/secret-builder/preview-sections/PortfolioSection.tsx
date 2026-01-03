import { SiteTheme, BusinessModel } from '@/types/app-spec';
import { ScrollAnimation, StaggerContainer } from '../animations/ScrollAnimations';
import { ExternalLink } from 'lucide-react';

interface PortfolioItem {
  title: string;
  description?: string;
  image: string;
  category?: string;
  link?: string;
}

interface PortfolioContent {
  title?: string;
  subtitle?: string;
  items?: PortfolioItem[];
}

interface PortfolioSectionProps {
  section: { id: string; content?: any };
  theme: SiteTheme;
  asTile?: boolean;
  businessModel?: BusinessModel;
}

// Industry-specific portfolio defaults - NEVER use cross-industry images
const industryPortfolio: Record<string, PortfolioItem[]> = {
  HOSPITALITY: [
    { title: 'Fresh Menu', description: 'Seasonal favorites made fresh daily', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', category: 'Menu' },
    { title: 'Signature Dish', description: 'Our chef\'s special creation', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', category: 'Featured' },
    { title: 'Deli Selection', description: 'Fresh sandwiches made to order', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80', category: 'Sandwiches' },
    { title: 'Catering Service', description: 'Events and group orders', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', category: 'Catering' },
  ],
  RETAIL_COMMERCE: [
    { title: 'New Collection', description: 'Latest arrivals in store', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', category: 'Featured' },
    { title: 'Best Sellers', description: 'Customer favorites', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80', category: 'Popular' },
    { title: 'Accessories', description: 'Complete your look', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80', category: 'Accessories' },
    { title: 'Sale Items', description: 'Limited time offers', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80', category: 'Sale' },
  ],
  SERVICE_BASED: [
    { title: 'Client Project', description: 'Successful partnership', image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80', category: 'Client Work' },
    { title: 'Team Excellence', description: 'Dedicated professionals', image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80', category: 'Team' },
    { title: 'Consultation', description: 'Expert guidance', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80', category: 'Services' },
    { title: 'Results', description: 'Proven track record', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80', category: 'Results' },
  ],
  PORTFOLIO_IDENTITY: [
    { title: 'Brand Design', description: 'Complete identity system', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80', category: 'Branding' },
    { title: 'Web Project', description: 'Custom web development', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', category: 'Web' },
    { title: 'Photography', description: 'Creative visual work', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', category: 'Photo' },
    { title: 'Art Direction', description: 'Creative campaign', image: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?w=800&q=80', category: 'Creative' },
  ],
};

// Neutral professional fallback
const defaultPortfolio: PortfolioItem[] = [
  { title: 'Project Alpha', description: 'Complete solution delivered', image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80', category: 'Featured' },
  { title: 'Project Beta', description: 'Innovative approach', image: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&q=80', category: 'Innovation' },
  { title: 'Project Gamma', description: 'Client success story', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80', category: 'Success' },
  { title: 'Project Delta', description: 'Award-winning work', image: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&q=80', category: 'Awards' },
];

// Get appropriate portfolio based on business model
function getDefaultPortfolio(businessModel?: BusinessModel): PortfolioItem[] {
  if (businessModel && industryPortfolio[businessModel]) {
    return industryPortfolio[businessModel];
  }
  return defaultPortfolio;
}

export function PortfolioSection({ section, theme, asTile = false, businessModel }: PortfolioSectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || 'Our Work';
  const subtitle = content?.subtitle || 'Explore our latest projects and case studies';
  // Use content items if provided, otherwise use business-appropriate defaults
  const items = content?.items?.length > 0 ? content.items : getDefaultPortfolio(businessModel);

  if (asTile) {
    return (
      <section 
        id={section.id}
        className="h-full p-4"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <h3 
          className="text-sm font-bold mb-3"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {items.slice(0, 4).map((item, i) => (
            <div 
              key={i} 
              className="aspect-video rounded-lg overflow-hidden relative group"
            >
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <span className="text-white text-[10px] font-medium">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section 
      id={section.id}
      className="py-12 md:py-16 px-6"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
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
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={100}
        >
          {items.map((item, index) => (
            <div 
              key={index}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ 
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              <div className="p-5">
                {item.category && (
                  <span 
                    className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-3"
                    style={{ 
                      backgroundColor: `${theme.primaryColor}20`,
                      color: theme.primaryColor
                    }}
                  >
                    {item.category}
                  </span>
                )}
                
                <h3 
                  className="text-lg font-bold mb-2 flex items-center gap-2"
                  style={{ 
                    fontFamily: theme.fontHeading || 'system-ui',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                >
                  {item.title}
                  {item.link && (
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </h3>
                
                {item.description && (
                  <p 
                    className="text-sm"
                    style={{ 
                      fontFamily: theme.fontBody || 'system-ui',
                      color: isDark ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
