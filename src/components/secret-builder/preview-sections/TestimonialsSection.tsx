import { SiteSection, SiteTheme } from '@/types/app-spec';
import { TestimonialsContent, TestimonialItem } from '@/types/site-spec';
import { Star, ExternalLink } from 'lucide-react';
import { ScrollAnimation } from '../animations/ScrollAnimations';
import { EditableText } from '../EditableText';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TestimonialsSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  onUpdateContent?: (field: keyof TestimonialsContent, value: string) => void;
  onUpdateItem?: (index: number, field: keyof TestimonialItem, value: string) => void;
}

const templateTestimonials: TestimonialItem[] = [
  { 
    name: 'Customer Name', 
    role: 'Your Client',
    quote: 'Add your customer review here. Connect Google Reviews to display real feedback from your customers.',
    rating: 5
  },
  { 
    name: 'Happy Customer', 
    role: 'Verified Buyer',
    quote: 'Your testimonial goes here. Replace this with a real review from Google, Yelp, or another review platform.',
    rating: 5
  },
  { 
    name: 'Your Client', 
    role: 'Satisfied Customer',
    quote: 'Click to edit this placeholder. Import real reviews to build trust with potential customers.',
    rating: 5
  },
];

export function TestimonialsSection({ section, theme, onUpdateContent, onUpdateItem }: TestimonialsSectionProps) {
  const content = section.content as TestimonialsContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || section.label || 'What Our Customers Say';
  const subtitle = content?.subtitle || section.description || 'Trusted by thousands of happy customers';
  const items = content?.items || templateTestimonials;

  const isTemplateContent = items.some(item => 
    item.name === 'Customer Name' || 
    item.name === 'Happy Customer' || 
    item.name === 'Your Client' ||
    item.quote.includes('Add your customer review') ||
    item.quote.includes('Your testimonial goes here')
  );

  const handleConnectGoogleReviews = () => {
    toast.info('Google Reviews Integration', {
      description: 'To import real reviews, visit your Google Business Profile and copy your reviews, or use a reviews widget service like EmbedSocial or Elfsight.',
      duration: 8000,
    });
  };

  return (
    <section 
      id={section.id}
      className="py-10 md:py-14 px-4 md:px-8 w-full min-h-[300px] contain-layout"
      style={{ 
        backgroundColor: isDark ? '#0a0a0a' : '#f9fafb'
      }}
    >
      <div className="w-full">
        <div className="text-center mb-6 md:mb-8">
          <ScrollAnimation animation="fade-up">
            {onUpdateContent ? (
              <EditableText
                value={title}
                onSave={(val) => onUpdateContent('title', val)}
                as="h2"
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: isDark ? '#ffffff' : '#111827'
                }}
              />
            ) : (
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: isDark ? '#ffffff' : '#111827'
                }}
              >
                {title}
              </h2>
            )}
          </ScrollAnimation>
          <ScrollAnimation animation="fade-up" delay={100}>
            {onUpdateContent ? (
              <EditableText
                value={subtitle}
                onSave={(val) => onUpdateContent('subtitle', val)}
                as="p"
                className="text-base md:text-lg max-w-2xl mx-auto px-4"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}
              />
            ) : (
              <p 
                className="text-base md:text-lg max-w-2xl mx-auto px-4"
                style={{ 
                  fontFamily: theme.fontBody || 'system-ui',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}
              >
                {subtitle}
              </p>
            )}
          </ScrollAnimation>
          
          {isTemplateContent && (
            <ScrollAnimation animation="fade-up" delay={150}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectGoogleReviews}
                className="mt-4 gap-2"
                style={{
                  borderColor: theme.primaryColor,
                  color: theme.primaryColor,
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Connect Google Reviews
              </Button>
            </ScrollAnimation>
          )}
        </div>
        
        <div 
          className="grid gap-6 md:gap-8 w-full"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))'
          }}
        >
          {items.slice(0, 6).map((testimonial, index) => (
            <ScrollAnimation 
              key={index} 
              animation="fade-up" 
              delay={index * 100}
            >
              <div 
                className="p-6 md:p-8 rounded-xl h-full flex flex-col"
                style={{ 
                  backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  minWidth: '280px'
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
                {onUpdateItem ? (
                  <EditableText
                    value={testimonial.quote}
                    onSave={(val) => onUpdateItem(index, 'quote', val)}
                    as="p"
                    multiline
                    className="text-base md:text-lg mb-6 flex-grow leading-relaxed break-words"
                    style={{ 
                      fontFamily: theme.fontBody || 'system-ui',
                      color: isDark ? '#d1d5db' : '#4b5563',
                      overflowWrap: 'anywhere'
                    }}
                  />
                ) : (
                  <p 
                    className="text-base md:text-lg mb-6 flex-grow leading-relaxed break-words"
                    style={{ 
                      fontFamily: theme.fontBody || 'system-ui',
                      color: isDark ? '#d1d5db' : '#4b5563',
                      overflowWrap: 'anywhere'
                    }}
                  >
                    "{testimonial.quote}"
                  </p>
                )}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    {onUpdateItem ? (
                      <>
                        <EditableText
                          value={testimonial.name}
                          onSave={(val) => onUpdateItem(index, 'name', val)}
                          as="p"
                          className="font-semibold text-sm truncate"
                          style={{ 
                            fontFamily: theme.fontHeading || 'system-ui',
                            color: isDark ? '#ffffff' : '#111827'
                          }}
                        />
                        <EditableText
                          value={testimonial.role}
                          onSave={(val) => onUpdateItem(index, 'role', val)}
                          as="p"
                          className="text-xs truncate"
                          style={{ 
                            color: isDark ? '#9ca3af' : '#6b7280'
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <p 
                          className="font-semibold text-sm truncate"
                          style={{ 
                            fontFamily: theme.fontHeading || 'system-ui',
                            color: isDark ? '#ffffff' : '#111827'
                          }}
                        >
                          {testimonial.name}
                        </p>
                        <p 
                          className="text-xs truncate"
                          style={{ 
                            color: isDark ? '#9ca3af' : '#6b7280'
                          }}
                        >
                          {testimonial.role}
                        </p>
                      </>
                    )}
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