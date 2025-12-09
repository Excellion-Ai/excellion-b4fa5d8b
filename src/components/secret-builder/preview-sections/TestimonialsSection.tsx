import { SiteSection, SiteTheme } from '@/types/app-spec';
import { Star } from 'lucide-react';

interface TestimonialsSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

const defaultTestimonials = [
  { 
    name: 'Sarah Johnson', 
    role: 'CEO, TechCorp',
    content: 'This product has completely transformed how we work. Highly recommended!',
    rating: 5
  },
  { 
    name: 'Michael Chen', 
    role: 'Designer, Creative Studio',
    content: 'The best investment we\'ve made this year. The results speak for themselves.',
    rating: 5
  },
  { 
    name: 'Emily Davis', 
    role: 'Founder, StartupXYZ',
    content: 'Outstanding service and incredible results. We couldn\'t be happier.',
    rating: 5
  },
];

export function TestimonialsSection({ section, theme }: TestimonialsSectionProps) {
  return (
    <section 
      id={section.id}
      className="py-20 px-6"
      style={{ 
        backgroundColor: theme.darkMode ? '#0a0a0a' : '#f9fafb'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: theme.fontHeading,
              color: theme.darkMode ? '#ffffff' : '#111827'
            }}
          >
            {section.label || 'What Our Customers Say'}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ 
              fontFamily: theme.fontBody,
              color: theme.darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            {section.description || 'Trusted by thousands of happy customers'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {defaultTestimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: theme.darkMode ? '#1f1f1f' : '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5 fill-current" 
                    style={{ color: theme.accentColor || '#f59e0b' }}
                  />
                ))}
              </div>
              <p 
                className="text-base mb-6"
                style={{ 
                  fontFamily: theme.fontBody,
                  color: theme.darkMode ? '#d1d5db' : '#4b5563'
                }}
              >
                "{testimonial.content}"
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
                      fontFamily: theme.fontHeading,
                      color: theme.darkMode ? '#ffffff' : '#111827'
                    }}
                  >
                    {testimonial.name}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ 
                      color: theme.darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
