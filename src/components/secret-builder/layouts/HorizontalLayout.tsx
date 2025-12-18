import React, { useRef, useEffect, useState } from 'react';
import { SiteTheme, SiteSection, NavItem } from '@/types/site-spec';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalLayoutProps {
  children: React.ReactNode;
  theme: SiteTheme;
  sections: SiteSection[];
  siteName: string;
  navigation: NavItem[];
}

// Minimal top bar navigation for horizontal layout
interface HorizontalNavProps {
  siteName: string;
  navigation: NavItem[];
  theme: SiteTheme;
  currentIndex: number;
  totalSections: number;
}

export function HorizontalNav({ siteName, navigation, theme, currentIndex, totalSections }: HorizontalNavProps) {
  const isDark = theme.darkMode;
  
  return (
    <nav 
      className="absolute top-0 left-0 right-0 z-40 px-6 lg:px-12 py-4 flex items-center justify-between"
      style={{ 
        backgroundColor: `${theme.backgroundColor}e6`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <span 
        className="text-lg font-bold"
        style={{ 
          fontFamily: theme.fontHeading,
          color: theme.primaryColor,
        }}
      >
        {siteName}
      </span>
      
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSections }).map((_, i) => (
          <div 
            key={i}
            className="h-1 rounded-full transition-all duration-500"
            style={{ 
              width: i === currentIndex ? '2rem' : '0.5rem',
              backgroundColor: i === currentIndex ? theme.primaryColor : (isDark ? '#333' : '#ddd'),
            }}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-6">
        {navigation?.slice(0, 3).map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="text-sm font-medium transition-opacity hover:opacity-60 hidden lg:block"
            style={{ 
              color: isDark ? '#d1d5db' : '#4b5563',
            }}
          >
            {item.label}
          </a>
        ))}
        <button
          className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: theme.primaryColor }}
        >
          Contact
        </button>
      </div>
    </nav>
  );
}

// Horizontal scroll container with snap points
interface HorizontalScrollSectionProps {
  children: React.ReactNode;
  theme: SiteTheme;
  onScrollChange?: (index: number) => void;
}

export function HorizontalScrollSection({ children, theme, onScrollChange }: HorizontalScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDark = theme.darkMode;

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculate current index for progress indicator
      const itemWidth = clientWidth * 0.85;
      const currentIndex = Math.round(scrollLeft / itemWidth);
      onScrollChange?.(currentIndex);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState);
      updateScrollState();
      return () => el.removeEventListener('scroll', updateScrollState);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.85;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ChevronLeft style={{ color: isDark ? '#fff' : '#000' }} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ChevronRight style={{ color: isDark ? '#fff' : '#000' }} />
        </button>
      )}

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 px-6 lg:px-12 py-8"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Individual horizontal card/slide
interface HorizontalCardProps {
  children: React.ReactNode;
  theme: SiteTheme;
  isHero?: boolean;
}

export function HorizontalCard({ children, theme, isHero = false }: HorizontalCardProps) {
  const isDark = theme.darkMode;
  
  return (
    <div 
      className={`flex-shrink-0 snap-center rounded-2xl overflow-hidden transition-transform duration-500 ${
        isHero ? 'w-[85vw] lg:w-[70vw] h-[70vh]' : 'w-[85vw] lg:w-[45vw] min-h-[50vh]'
      }`}
      style={{
        backgroundColor: isDark ? '#111111' : '#ffffff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {children}
    </div>
  );
}

// Hero slide for horizontal layout
interface HorizontalHeroProps {
  headline: string;
  subheadline: string;
  theme: SiteTheme;
  backgroundImage?: string;
}

export function HorizontalHero({ headline, subheadline, theme, backgroundImage }: HorizontalHeroProps) {
  const isDark = theme.darkMode;
  
  return (
    <div 
      className="h-full flex flex-col justify-end p-8 lg:p-12 relative"
      style={{
        background: backgroundImage 
          ? `linear-gradient(to top, ${theme.backgroundColor}ee 0%, transparent 50%), url(${backgroundImage})`
          : `linear-gradient(135deg, ${theme.primaryColor}30, ${theme.secondaryColor}20)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-2xl">
        <p 
          className="text-xs uppercase tracking-[0.3em] mb-4 opacity-60"
          style={{ color: isDark ? '#fff' : '#000' }}
        >
          Featured Work
        </p>
        <h1 
          className="text-4xl lg:text-6xl font-bold mb-4 leading-tight"
          style={{ 
            fontFamily: theme.fontHeading,
            color: isDark ? '#ffffff' : '#111111',
          }}
        >
          {headline}
        </h1>
        <p 
          className="text-base lg:text-lg opacity-70 max-w-lg"
          style={{ 
            fontFamily: theme.fontBody,
            color: isDark ? '#d1d5db' : '#4b5563',
          }}
        >
          {subheadline}
        </p>
        
        <div className="mt-8 flex gap-4">
          <button
            className="px-6 py-3 rounded-full font-semibold text-white text-sm transition-transform hover:scale-105"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Explore
          </button>
          <button
            className="px-6 py-3 rounded-full font-semibold text-sm border transition-transform hover:scale-105"
            style={{ 
              borderColor: isDark ? '#ffffff40' : '#00000020',
              color: isDark ? '#ffffff' : '#111111',
            }}
          >
            View All →
          </button>
        </div>
      </div>
    </div>
  );
}

export function HorizontalLayout({ children, theme, sections, siteName, navigation }: HorizontalLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDark = theme.darkMode;
  const childArray = React.Children.toArray(children);
  
  // Find hero section
  const heroIndex = sections.findIndex(s => s.type === 'hero');
  const heroSection = heroIndex >= 0 ? sections[heroIndex] : null;
  const heroContent = heroSection?.content as any;
  const otherSections = sections.filter((_, i) => i !== heroIndex);
  const otherChildren = childArray.filter((_, i) => i !== heroIndex);
  
  return (
    <div 
      className="min-h-screen relative"
      style={{ 
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontBody,
      }}
    >
      {/* Top Navigation */}
      <HorizontalNav
        siteName={siteName}
        navigation={navigation}
        theme={theme}
        currentIndex={currentIndex}
        totalSections={otherSections.length + 1}
      />

      {/* Main Content */}
      <div className="pt-20">
        {/* Hero Horizontal Section */}
        <section className="mb-8">
          <div className="px-6 lg:px-12 mb-4">
            <h2 
              className="text-xs uppercase tracking-[0.3em] opacity-50"
              style={{ color: isDark ? '#fff' : '#000' }}
            >
              Showcase
            </h2>
          </div>
          
          <HorizontalScrollSection theme={theme} onScrollChange={setCurrentIndex}>
            {/* Hero Card */}
            <HorizontalCard theme={theme} isHero>
              <HorizontalHero
                headline={heroContent?.headline || siteName}
                subheadline={heroContent?.subheadline || 'Creating extraordinary experiences'}
                theme={theme}
                backgroundImage={heroContent?.backgroundImage}
              />
            </HorizontalCard>
            
            {/* Feature cards in horizontal scroll */}
            {otherSections.slice(0, 4).map((section, index) => (
              <HorizontalCard key={section.id} theme={theme}>
                <div className="p-6 lg:p-8 h-full flex flex-col justify-between">
                  <div>
                    <span 
                      className="text-xs uppercase tracking-wider opacity-50"
                      style={{ color: isDark ? '#fff' : '#000' }}
                    >
                      0{index + 1}
                    </span>
                    <h3 
                      className="text-2xl lg:text-3xl font-bold mt-2 mb-4"
                      style={{ 
                        fontFamily: theme.fontHeading,
                        color: isDark ? '#ffffff' : '#111111',
                      }}
                    >
                      {section.label}
                    </h3>
                  </div>
                  {otherChildren[index]}
                </div>
              </HorizontalCard>
            ))}
          </HorizontalScrollSection>
        </section>

        {/* Remaining content in vertical flow */}
        {otherSections.length > 4 && (
          <section className="px-6 lg:px-12 py-12">
            {otherChildren.slice(4).map((child, index) => (
              <div key={index} className="mb-12">
                {child}
              </div>
            ))}
          </section>
        )}

        {/* Footer */}
        <footer 
          className="py-16 px-6 lg:px-12"
          style={{ 
            backgroundColor: isDark ? '#0a0a0a' : '#f9fafb',
            borderTop: `1px solid ${isDark ? '#1f1f1f' : '#e5e7eb'}`
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
            <span 
              className="text-xl font-bold"
              style={{ 
                fontFamily: theme.fontHeading,
                color: theme.primaryColor 
              }}
            >
              {siteName}
            </span>
            
            <div className="flex gap-8">
              {navigation?.map((item, i) => (
                <a 
                  key={i}
                  href={item.href}
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <p 
              className="text-xs"
              style={{ color: isDark ? '#4b5563' : '#9ca3af' }}
            >
              © {new Date().getFullYear()} {siteName}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
