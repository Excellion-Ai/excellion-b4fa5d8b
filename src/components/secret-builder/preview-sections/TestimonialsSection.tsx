import { SiteSection, SiteTheme, TestimonialsContent, TestimonialItem } from '@/types/app-spec';
import { Star } from 'lucide-react';
import { ScrollAnimation } from '../animations/ScrollAnimations';

interface TestimonialsSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

const defaultTestimonials: TestimonialItem[] = [
  { 
    name: 'Sarah Johnson', 
    role: 'CEO, TechCorp',
    quote: 'This product has completely transformed how we work. Highly recommended!',
    rating: 5
  },
  { 
    name: 'Michael Chen', 
    role: 'Designer, Creative Studio',
    quote: "The best investment we've made this year. The results speak for themselves.",
    rating: 5
  },
  { 
    name: 'Emily Davis', 
    role: 'Founder, StartupXYZ',
    quote: "Outstanding service and incredible results. We couldn't be happier.",
    rating: 5
  },
];

export function TestimonialsSection({ section, theme }: TestimonialsSectionProps) {
  const content = section.content as TestimonialsContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || section.label || 'What Our Customers Say';
  const subtitle = content?.subtitle || section.description || 'Trusted by thousands of happy customers';
  const items = content?.items || defaultTestimonials;

  return (
    <section 
      id={section.id}
      className="py-20 px-6"
      style={{ 
        backgroundColor: isDark ? '#0a0a0a' : '#f9fafb'
      }}
    >
      <div className="max-w-6xl mx-auto">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.slice(0, 6).map((testimonial, index) => (
            <ScrollAnimation 
              key={index} 
              animation="fade-up" 
              delay={index * 100}
            >
              <div 
                className="p-6 rounded-xl h-full"
                style={{ 
                  backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 fill-current" 
                        style={{ color: theme.accentColor || '#f59e0b' }}
                      />
                    ))}
                  </div>
                )}
                <p 
                  className="text-base mb-6"
                  style={{ 
                    fontFamily: theme.fontBody || 'system-ui',
                    color: isDark ? '#d1d5db' : '#4b5563'
                  }}
                >
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p 
                      className="font-semibold text-sm"
                      style={{ 
                        fontFamily: theme.fontHeading || 'system-ui',
                        color: isDark ? '#ffffff' : '#111827'
                      }}
                    >
                      {testimonial.name}
                    </p>
                    <p 
                      className="text-xs"
                      style={{ 
                        color: isDark ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
