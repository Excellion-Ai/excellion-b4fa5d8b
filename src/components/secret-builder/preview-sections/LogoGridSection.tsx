import { SiteTheme } from '@/types/app-spec';
import { ScrollAnimation, StaggerContainer } from '../animations/ScrollAnimations';

interface LogoItem {
  image: string;
  alt: string;
  link?: string;
}

interface LogoGridContent {
  title?: string;
  subtitle?: string;
  logos?: LogoItem[];
}

interface LogoGridSectionProps {
  section: { id: string; content?: any };
  theme: SiteTheme;
  asTile?: boolean;
}

const defaultLogos: LogoItem[] = [
  { image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop', alt: 'Partner 1' },
  { image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop', alt: 'Partner 2' },
  { image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop', alt: 'Partner 3' },
  { image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop', alt: 'Partner 4' },
  { image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop', alt: 'Partner 5' },
  { image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop', alt: 'Partner 6' },
];

export function LogoGridSection({ section, theme, asTile = false }: LogoGridSectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';

  const title = content?.title || 'Trusted By';
  const subtitle = content?.subtitle;
  const logos = content?.logos || defaultLogos;

  if (asTile) {
    return (
      <section
        id={section.id}
        className="h-full min-h-[100px] p-4 contain-layout"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <h3
          className="text-xs font-bold mb-2"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {title}
        </h3>
        <div className="flex gap-2 opacity-50">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-8 h-4 rounded"
              style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id={section.id}
      className="py-10 md:py-12 px-6 contain-layout"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <ScrollAnimation animation="fade-up">
            <h2
              className="text-xl md:text-2xl font-semibold mb-2"
              style={{
                fontFamily: theme.fontHeading || 'system-ui',
                color: isDark ? '#9ca3af' : '#6b7280',
              }}
            >
              {title}
            </h2>
          </ScrollAnimation>
          {subtitle && (
            <ScrollAnimation animation="fade-up" delay={100}>
              <p
                className="text-sm"
                style={{
                  fontFamily: theme.fontBody || 'system-ui',
                  color: isDark ? '#6b7280' : '#9ca3af',
                }}
              >
                {subtitle}
              </p>
            </ScrollAnimation>
          )}
        </div>

        <StaggerContainer
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
          staggerDelay={100}
        >
          {logos.map((logo, index) => {
            const LogoWrapper = logo.link ? 'a' : 'div';
            const wrapperProps = logo.link
              ? { href: logo.link, target: '_blank', rel: 'noopener noreferrer' }
              : {};

            return (
              <LogoWrapper
                key={index}
                {...wrapperProps}
                className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={logo.image}
                  alt={logo.alt}
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </LogoWrapper>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}