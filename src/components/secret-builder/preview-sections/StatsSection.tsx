import { StatsContent, StatsItem } from '@/types/site-spec';
import { ScrollAnimation, Counter } from '../animations/ScrollAnimations';
import { EditableText } from '../EditableText';

interface StatsSectionProps {
  content: StatsContent;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  asTile?: boolean;
  onUpdateContent?: (field: keyof StatsContent, value: string) => void;
  onUpdateItem?: (index: number, field: keyof StatsItem, value: string) => void;
}

export function StatsSection({ content, theme, asTile = false, onUpdateContent, onUpdateItem }: StatsSectionProps) {
  // Defensive: ensure content and items exist
  const safeContent = content || { title: '', subtitle: '', items: [] };
  const safeItems = Array.isArray(safeContent.items) ? safeContent.items : [];
  
  // Tile mode for Bento layout - compact vertical stack
  if (asTile) {
    const displayItems = safeItems.slice(0, 4);
    return (
      <section 
        className="h-full min-h-[150px] p-5 flex flex-col justify-center contain-layout"
        style={{ backgroundColor: theme.primaryColor + '15' }}
      >
        {safeContent.title && (
          <ScrollAnimation animation="fade-up">
            {onUpdateContent ? (
              <EditableText
                value={safeContent.title}
                onSave={(val) => onUpdateContent('title', val)}
                as="h3"
                className="text-sm font-semibold mb-4 opacity-70"
                style={{ color: theme.textColor }}
              />
            ) : (
              <h3 
                className="text-sm font-semibold mb-4 opacity-70"
                style={{ color: theme.textColor }}
              >
                {safeContent.title}
              </h3>
            )}
          </ScrollAnimation>
        )}
        <div className="space-y-4">
          {displayItems.map((stat, index) => (
            <ScrollAnimation key={index} animation="fade-left" delay={index * 100}>
              <div className="flex items-baseline gap-2">
                {onUpdateItem ? (
                  <>
                    <EditableText
                      value={stat.value}
                      onSave={(val) => onUpdateItem(index, 'value', val)}
                      as="span"
                      className="text-2xl lg:text-3xl font-bold"
                      style={{ color: theme.primaryColor }}
                    />
                    <EditableText
                      value={stat.label}
                      onSave={(val) => onUpdateItem(index, 'label', val)}
                      as="span"
                      className="text-xs uppercase tracking-wider"
                      style={{ color: theme.textColor + 'aa' }}
                    />
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
      className="py-16 px-6 min-h-[200px] contain-layout"
      style={{ backgroundColor: theme.primaryColor + '10' }}
    >
      <div className="max-w-6xl mx-auto">
        {safeContent.title && (
          <ScrollAnimation animation="fade-up">
            {onUpdateContent ? (
              <EditableText
                value={safeContent.title}
                onSave={(val) => onUpdateContent('title', val)}
                as="h2"
                className="text-3xl font-bold text-center mb-12"
                style={{ color: theme.textColor }}
              />
            ) : (
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: theme.textColor }}
              >
                {safeContent.title}
              </h2>
            )}
          </ScrollAnimation>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {safeItems.map((stat, index) => {
            // Skip undefined or malformed stat items
            if (!stat || typeof stat.value !== 'string') return null;
            
            const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ''), 10);
            const hasNumeric = !isNaN(numericValue);
            const prefix = stat.value.match(/^[^0-9]*/)?.[0] || '';
            const suffix = stat.value.match(/[^0-9]*$/)?.[0] || '';
            
            return (
              <ScrollAnimation key={index} animation="scale-up" delay={index * 100}>
                <div className="text-center">
                  {onUpdateItem ? (
                    <EditableText
                      value={stat.value}
                      onSave={(val) => onUpdateItem(index, 'value', val)}
                      as="span"
                      className="text-4xl md:text-5xl font-bold mb-2 block"
                      style={{ color: theme.primaryColor }}
                    />
                  ) : (
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
                  )}
                  {onUpdateItem ? (
                    <EditableText
                      value={stat.label}
                      onSave={(val) => onUpdateItem(index, 'label', val)}
                      as="span"
                      className="text-sm uppercase tracking-wider block"
                      style={{ color: theme.textColor + 'aa' }}
                    />
                  ) : (
                    <div 
                      className="text-sm uppercase tracking-wider"
                      style={{ color: theme.textColor + 'aa' }}
                    >
                      {stat.label}
                    </div>
                  )}
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}