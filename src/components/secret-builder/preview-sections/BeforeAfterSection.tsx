import { useState } from 'react';
import { SiteTheme } from '@/types/app-spec';
import { ScrollAnimation } from '../animations/ScrollAnimations';

interface BeforeAfterItem {
  beforeImage: string;
  afterImage: string;
  caption?: string;
}

interface BeforeAfterContent {
  title?: string;
  subtitle?: string;
  items?: BeforeAfterItem[];
}

interface BeforeAfterSectionProps {
  section: { id: string; content?: any };
  theme: SiteTheme;
  asTile?: boolean;
}

const defaultItems: BeforeAfterItem[] = [
  {
    beforeImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
    caption: 'Complete exterior transformation',
  },
  {
    beforeImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop',
    caption: 'Kitchen renovation project',
  },
];

function BeforeAfterSlider({ item, theme }: { item: BeforeAfterItem; theme: SiteTheme }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="relative overflow-hidden rounded-xl group">
      <div className="relative w-full aspect-[4/3]">
        <img
          src={item.afterImage}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={item.beforeImage}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }}
          />
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-10"
          style={{ 
            left: `${sliderPosition}%`,
            backgroundColor: theme.primaryColor,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        />
        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
          Before
        </div>
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
          After
        </div>
      </div>
      {item.caption && (
        <p
          className="mt-3 text-center text-sm"
          style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
        >
          {item.caption}
        </p>
      )}
    </div>
  );
}

export function BeforeAfterSection({ section, theme, asTile = false }: BeforeAfterSectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';

  const title = content?.title || 'Our Results';
  const subtitle = content?.subtitle || 'See the difference our work makes';
  const items = content?.items || defaultItems;

  if (asTile) {
    return (
      <section
        id={section.id}
        className="h-full min-h-[150px] p-4 contain-layout"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <h3
          className="text-sm font-bold mb-2"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {title}
        </h3>
        <div className="flex gap-2">
          <div className="flex-1 aspect-square rounded bg-gray-200" />
          <div className="flex-1 aspect-square rounded" style={{ backgroundColor: theme.primaryColor }} />
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <ScrollAnimation animation="fade-up">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: theme.fontHeading || 'system-ui',
                color: isDark ? '#ffffff' : '#111827',
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
                color: isDark ? '#9ca3af' : '#6b7280',
              }}
            >
              {subtitle}
            </p>
          </ScrollAnimation>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <ScrollAnimation key={index} animation="fade-up" delay={index * 150}>
              <BeforeAfterSlider item={item} theme={theme} />
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}