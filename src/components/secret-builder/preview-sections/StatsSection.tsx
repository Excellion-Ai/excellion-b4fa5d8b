import { StatsContent } from '@/types/site-spec';

interface StatsSectionProps {
  content: StatsContent;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

export function StatsSection({ content, theme }: StatsSectionProps) {
  return (
    <section 
      className="py-16 px-6"
      style={{ backgroundColor: theme.primaryColor + '10' }}
    >
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2 
            className="text-3xl font-bold text-center mb-12"
            style={{ color: theme.textColor }}
          >
            {content.title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {content.items.map((stat, index) => (
            <div key={index} className="text-center">
              <div 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: theme.primaryColor }}
              >
                {stat.value}
              </div>
              <div 
                className="text-sm uppercase tracking-wider"
                style={{ color: theme.textColor + 'aa' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
