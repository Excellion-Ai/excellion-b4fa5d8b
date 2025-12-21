import { SiteTheme } from '@/types/app-spec';
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
}

const defaultImages = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
];

export function GallerySection({ section, theme, asTile = false }: GallerySectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || 'Gallery';
  const subtitle = content?.subtitle || 'Explore our work';
  const items = content?.items || defaultImages.map((img, i) => ({ 
    image: img, 
    title: `Project ${i + 1}` 
  }));

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
      className="py-12 md:py-16 px-6"
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
          {items.map((item, index) => (
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
