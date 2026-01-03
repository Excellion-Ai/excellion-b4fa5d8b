import { StatsContent } from '@/types/site-spec';
import { ScrollAnimation, Counter } from '../animations/ScrollAnimations';

interface StatsSectionProps {
  content: StatsContent;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  asTile?: boolean;
}

export function StatsSection({ content, theme, asTile = false }: StatsSectionProps) {
  // Tile mode for Bento layout - compact vertical stack
  if (asTile) {
    const displayItems = content.items?.slice(0, 4) || [];
    
    return (
      <section 
        className="h-full p-5 flex flex-col justify-center"
        style={{ backgroundColor: theme.primaryColor + '15' }}
      >
        {content.title && (
          <ScrollAnimation animation="fade-up">
            <h3 
              className="text-sm font-semibold mb-4 opacity-70"
              style={{ color: theme.textColor }}
            >
              {content.title}
            </h3>
          </ScrollAnimation>
        )}
        <div className="space-y-4">
          {displayItems.map((stat, index) => (
            <ScrollAnimation key={index} animation="fade-left" delay={index * 100}>
              <div className="flex items-baseline gap-2">
                <div 
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: theme.primaryColor }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-xs uppercase tracking-wider"
                  style={{ color: theme.textColor + 'aa' }}
                >
                  {stat.label}
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </section>
    );
  }

  // Standard full-width layout
  return (
    <section 
      className="py-16 px-6"
      style={{ backgroundColor: theme.primaryColor + '10' }}
    >
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <ScrollAnimation animation="fade-up">
            <h2 
              className="text-3xl font-bold text-center mb-12"
              style={{ color: theme.textColor }}
            >
              {content.title}
            </h2>
          </ScrollAnimation>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {content.items.map((stat, index) => {
            // Extract numeric value for counter animation
            const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ''), 10);
            const hasNumeric = !isNaN(numericValue);
            const prefix = stat.value.match(/^[^0-9]*/)?.[0] || '';
            const suffix = stat.value.match(/[^0-9]*$/)?.[0] || '';
            
            return (
              <ScrollAnimation key={index} animation="scale-up" delay={index * 100}>
                <div className="text-center">
                  <div 
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{ color: theme.primaryColor }}
                  >
                    {hasNumeric ? (
                      <Counter 
                        end={numericValue} 
                        prefix={prefix} 
                        suffix={suffix}
                        duration={2000}
                      />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div 
                    className="text-sm uppercase tracking-wider"
                    style={{ color: theme.textColor + 'aa' }}
                  >
                    {stat.label}
                  </div>
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
