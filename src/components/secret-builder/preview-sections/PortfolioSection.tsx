import { SiteTheme } from '@/types/app-spec';
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
  section: { id: string; content?: PortfolioContent };
  theme: SiteTheme;
  asTile?: boolean;
}

const defaultPortfolio: PortfolioItem[] = [
  {
    title: 'Project Alpha',
    description: 'Complete brand redesign and web development',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    category: 'Web Design',
  },
  {
    title: 'Project Beta',
    description: 'E-commerce platform with custom features',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    category: 'E-commerce',
  },
  {
    title: 'Project Gamma',
    description: 'Mobile app UI/UX design',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    category: 'Mobile',
  },
  {
    title: 'Project Delta',
    description: 'Corporate identity and marketing materials',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    category: 'Branding',
  },
  {
    title: 'Project Epsilon',
    description: 'SaaS dashboard interface',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
    category: 'Web App',
  },
  {
    title: 'Project Zeta',
    description: 'Marketing campaign and landing pages',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    category: 'Marketing',
  },
];

export function PortfolioSection({ section, theme, asTile = false }: PortfolioSectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || 'Our Work';
  const subtitle = content?.subtitle || 'Explore our latest projects and case studies';
  const items = content?.items || defaultPortfolio;

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
