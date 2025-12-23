import React from 'react';
import { SiteTheme, SiteSection, NavItem } from '@/types/site-spec';

interface LayeredLayoutProps {
  children: React.ReactNode;
  theme: SiteTheme;
  sections: SiteSection[];
  siteName: string;
  navigation: NavItem[];
}

// Floating corner navigation for layered layout
interface LayeredNavProps {
  siteName: string;
  navigation: NavItem[];
  theme: SiteTheme;
  onPageChange?: (href: string) => void;
}

export function LayeredNav({ siteName, navigation, theme, onPageChange }: LayeredNavProps) {
  const isDark = theme.darkMode;
  
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    onPageChange?.(href);
  };
  
  return (
    <>
      {/* Top-left brand */}
      <div 
        className="absolute top-6 left-6 z-40"
      >
        <span 
          className="text-xl font-bold tracking-tight"
          style={{ 
            fontFamily: theme.fontHeading,
            color: theme.primaryColor,
          }}
        >
          {siteName}
        </span>
      </div>

      {/* Top-right navigation */}
      <nav 
        className="absolute top-6 right-6 z-40 flex items-center gap-6"
      >
        {navigation?.slice(0, 4).map((item, index) => (
          <button
            key={index}
            onClick={(e) => handleNavClick(e, item.href)}
            className="text-sm font-medium transition-all hover:opacity-60 relative group bg-transparent border-none cursor-pointer"
            style={{ 
              color: isDark ? '#ffffff' : '#111111',
            }}
          >
            {item.label}
            <span 
              className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: theme.primaryColor }}
            />
          </button>
        ))}
        <button
          className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: theme.primaryColor }}
        >
          Contact
        </button>
      </nav>
    </>
  );
}

// Layered hero section with dramatic positioning
interface LayeredHeroProps {
  headline: string;
  subheadline: string;
  theme: SiteTheme;
  backgroundImage?: string;
}

export function LayeredHero({ headline, subheadline, theme, backgroundImage }: LayeredHeroProps) {
  const isDark = theme.darkMode;
  
  return (
    <section 
      className="relative h-screen overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Background layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: backgroundImage 
            ? `url(${backgroundImage})` 
            : `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}10)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Diagonal overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(160deg, ${theme.backgroundColor} 40%, transparent 70%)`,
        }}
      />
      
      {/* Decorative shapes */}
      <div 
        className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-30 z-5"
        style={{ backgroundColor: theme.primaryColor }}
      />
      <div 
        className="absolute bottom-40 left-40 w-64 h-64 rounded-full blur-2xl opacity-20 z-5"
        style={{ backgroundColor: theme.secondaryColor }}
      />
      
      {/* Content layer - bottom left positioning */}
      <div className="absolute bottom-16 left-8 lg:bottom-24 lg:left-16 z-30 max-w-2xl">
        <h1 
          className="text-5xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] mb-6"
          style={{ 
            fontFamily: theme.fontHeading,
            color: isDark ? '#ffffff' : '#111111',
          }}
        >
          {headline.split(' ').map((word, i) => (
            <span 
              key={i} 
              className="block"
              style={{
                marginLeft: `${i * 1.5}rem`,
              }}
            >
              {word}
            </span>
          ))}
        </h1>
        <p 
          className="text-base lg:text-lg max-w-md ml-6 opacity-70"
          style={{ 
            fontFamily: theme.fontBody,
            color: isDark ? '#d1d5db' : '#4b5563',
          }}
        >
          {subheadline}
        </p>
        
        <div className="mt-10 ml-6 flex gap-4">
          <button
            className="px-8 py-4 rounded-full font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl"
            style={{ 
              backgroundColor: theme.primaryColor,
              boxShadow: `0 20px 40px ${theme.primaryColor}40`,
            }}
          >
            View Work
          </button>
          <button
            className="px-8 py-4 font-semibold transition-all hover:opacity-60"
            style={{ 
              color: isDark ? '#ffffff' : '#111111',
            }}
          >
            Learn More →
          </button>
        </div>
      </div>
      
      {/* Side accent text */}
      <div 
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block"
        style={{
          writingMode: 'vertical-lr',
          transform: 'rotate(180deg) translateY(50%)',
        }}
      >
        <span 
          className="text-xs tracking-[0.3em] uppercase opacity-40"
          style={{ color: isDark ? '#ffffff' : '#111111' }}
        >
          Scroll to explore
        </span>
      </div>
    </section>
  );
}

// Layered content section with overlap
interface LayeredContentSectionProps {
  children: React.ReactNode;
  theme: SiteTheme;
  index: number;
}

export function LayeredContentSection({ children, theme, index }: LayeredContentSectionProps) {
  const isDark = theme.darkMode;
  const isEven = index % 2 === 0;
  
  return (
    <div 
      className="relative"
      style={{
        marginTop: index === 0 ? '-10vh' : '-5vh',
        zIndex: 40 + index,
      }}
    >
      {/* Overlapping card effect */}
      <div 
        className={`relative mx-4 lg:mx-8 rounded-3xl overflow-hidden ${isEven ? 'lg:ml-20' : 'lg:mr-20'}`}
        style={{
          backgroundColor: isDark ? '#111111' : '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Accent line */}
        <div 
          className={`absolute top-0 ${isEven ? 'left-0' : 'right-0'} w-1 h-32`}
          style={{ backgroundColor: theme.primaryColor }}
        />
        
        {children}
      </div>
    </div>
  );
}

export function LayeredLayout({ children, theme, sections, siteName, navigation }: LayeredLayoutProps) {
  const isDark = theme.darkMode;
  const childArray = React.Children.toArray(children);
  
  // Find hero section
  const heroIndex = sections.findIndex(s => s.type === 'hero');
  const heroSection = heroIndex >= 0 ? sections[heroIndex] : null;
  const heroContent = heroSection?.content as any;
  const otherChildren = childArray.filter((_, i) => i !== heroIndex);
  const otherSections = sections.filter((_, i) => i !== heroIndex);
  
  return (
    <div 
      className="min-h-screen relative"
      style={{ 
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontBody,
      }}
    >
      {/* Floating Navigation */}
      <LayeredNav
        siteName={siteName}
        navigation={navigation}
        theme={theme}
      />

      {/* Layered Hero */}
      <LayeredHero
        headline={heroContent?.headline || siteName}
        subheadline={heroContent?.subheadline || 'Creating extraordinary digital experiences'}
        theme={theme}
        backgroundImage={heroContent?.backgroundImage}
      />

      {/* Overlapping Content Sections */}
      <div className="relative pb-20">
        {otherChildren.map((child, index) => (
          <LayeredContentSection 
            key={index} 
            theme={theme}
            index={index}
          >
            {child}
          </LayeredContentSection>
        ))}
      </div>

      {/* Footer with overlap */}
      <footer 
        className="relative z-10 py-16 px-8"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#f9fafb',
          marginTop: '-3rem',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
          <div>
            <span 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: theme.fontHeading,
                color: theme.primaryColor 
              }}
            >
              {siteName}
            </span>
            <p 
              className="text-sm mt-2"
              style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
            >
              Creating extraordinary digital experiences
            </p>
          </div>
          
          <div className="flex gap-8">
            {navigation?.slice(0, 4).map((item, i) => (
              <span 
                key={i}
                className="text-sm transition-opacity hover:opacity-60 cursor-pointer"
                style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
              >
                {item.label}
              </span>
            ))}
          </div>
          
          <p 
            className="text-xs"
            style={{ color: isDark ? '#4b5563' : '#9ca3af' }}
          >
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
