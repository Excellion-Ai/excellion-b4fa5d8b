import React from 'react';
import { SiteTheme, SiteSection, NavItem } from '@/types/site-spec';

interface SplitScreenLayoutProps {
  children: React.ReactNode;
  theme: SiteTheme;
  sections: SiteSection[];
  siteName: string;
  navigation: NavItem[];
}

// Vertical sidebar navigation for split-screen layout
interface SplitSidebarNavProps {
  siteName: string;
  navigation: NavItem[];
  theme: SiteTheme;
  onUpdateSiteName?: (name: string) => void;
  onUpdateNavItem?: (index: number, label: string) => void;
}

export function SplitSidebarNav({ 
  siteName, 
  navigation, 
  theme,
}: SplitSidebarNavProps) {
  const isDark = theme.darkMode;
  
  return (
    <nav 
      className="absolute left-0 top-0 h-full w-16 lg:w-20 flex flex-col items-center justify-between py-8 z-40"
      style={{ 
        backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      {/* Logo/Brand */}
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ 
          backgroundColor: theme.primaryColor,
          color: '#ffffff',
        }}
      >
        {siteName.charAt(0).toUpperCase()}
      </div>
      
      {/* Vertical Nav Links */}
      <div className="flex flex-col items-center gap-6">
        {navigation?.slice(0, 5).map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all hover:scale-110"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#d1d5db' : '#4b5563',
            }}
            title={item.label}
          >
            {item.label.charAt(0).toUpperCase()}
          </a>
        ))}
      </div>
      
      {/* Bottom CTA */}
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{ 
          backgroundColor: theme.primaryColor,
          color: '#ffffff',
        }}
        title="Get Started"
      >
        →
      </button>
    </nav>
  );
}

export function SplitScreenLayout({ children, theme, sections, siteName, navigation }: SplitScreenLayoutProps) {
  const isDark = theme.darkMode;
  const childArray = React.Children.toArray(children);
  
  // Find hero section for the sticky left panel
  const heroIndex = sections.findIndex(s => s.type === 'hero');
  const heroChild = heroIndex >= 0 ? childArray[heroIndex] : null;
  const otherChildren = childArray.filter((_, i) => i !== heroIndex);
  
  return (
    <div 
      className="min-h-screen flex relative"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Vertical Sidebar Navigation */}
      <SplitSidebarNav
        siteName={siteName}
        navigation={navigation}
        theme={theme}
      />

      {/* Main Split Container */}
      <div className="flex-1 ml-16 lg:ml-20 flex min-h-screen">
        {/* Left Panel - Sticky Hero/Featured */}
        <div 
          className="w-[45%] lg:w-[40%] sticky top-0 h-screen overflow-hidden"
          style={{
            backgroundColor: theme.backgroundColor || (isDark ? '#0f0f0f' : '#f8f8f8'),
          }}
        >
          {heroChild ? (
            <div className="h-full w-full">
              {heroChild}
            </div>
          ) : (
            <div 
              className="h-full w-full flex items-center justify-center p-8"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}30, ${theme.secondaryColor}30, ${theme.backgroundColor || (isDark ? '#0f0f0f' : '#f8f8f8')})`,
                backgroundColor: theme.backgroundColor || (isDark ? '#0f0f0f' : '#f8f8f8'),
              }}
            >
              <h1 
                className="text-4xl lg:text-6xl font-bold"
                style={{ 
                  fontFamily: theme.fontHeading,
                  color: isDark ? '#ffffff' : '#111111',
                }}
              >
                {siteName}
              </h1>
            </div>
          )}
        </div>

        {/* Right Panel - Scrollable Content */}
        <div 
          className="w-[55%] lg:w-[60%] overflow-y-auto"
          style={{
            backgroundColor: theme.backgroundColor,
          }}
        >
          {otherChildren.map((child, index) => (
            <div key={index}>
              {child}
            </div>
          ))}
          
          {/* Footer */}
          <footer 
            className="py-12 px-8 text-center"
            style={{ 
              backgroundColor: isDark ? '#0a0a0a' : '#f9fafb',
              borderTop: `1px solid ${isDark ? '#1f1f1f' : '#e5e7eb'}`
            }}
          >
            <p 
              className="text-sm"
              style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
            >
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

// Split-screen specific hero variant (for left sticky panel)
interface SplitHeroProps {
  headline: string;
  subheadline: string;
  theme: SiteTheme;
  backgroundImage?: string;
}

export function SplitHero({ headline, subheadline, theme, backgroundImage }: SplitHeroProps) {
  const isDark = theme.darkMode;
  const fallbackBg = theme.backgroundColor || (isDark ? '#0f0f0f' : '#f8f8f8');
  
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: fallbackBg,
      }
    : {
        // Enhanced gradient with better visibility for light themes
        background: isDark 
          ? `linear-gradient(160deg, ${theme.primaryColor}40, ${theme.secondaryColor}25, ${fallbackBg})`
          : `linear-gradient(160deg, ${theme.primaryColor}20, ${theme.secondaryColor}15, ${theme.primaryColor}08, ${fallbackBg})`,
        backgroundColor: fallbackBg,
      };

  return (
    <div 
      className="h-full w-full flex flex-col justify-center lg:justify-end p-8 lg:p-12 relative overflow-hidden"
      style={backgroundStyle}
    >
      {/* Decorative elements for visual interest when no background image */}
      {!backgroundImage && (
        <>
          {/* Large accent blob - top right */}
          <div 
            className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
            style={{ 
              backgroundColor: theme.primaryColor,
              opacity: isDark ? 0.15 : 0.12,
            }}
          />
          {/* Secondary blob - bottom left */}
          <div 
            className="absolute -bottom-32 -left-32 w-[350px] h-[350px] rounded-full blur-3xl pointer-events-none"
            style={{ 
              backgroundColor: theme.secondaryColor,
              opacity: isDark ? 0.12 : 0.10,
            }}
          />
          {/* Accent shape - center */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full blur-2xl pointer-events-none"
            style={{ 
              backgroundColor: theme.primaryColor,
              opacity: isDark ? 0.08 : 0.06,
            }}
          />
        </>
      )}
      
      <div className="max-w-md relative z-10">
        <h1 
          className="text-3xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight"
          style={{ 
            fontFamily: theme.fontHeading,
            color: backgroundImage ? '#ffffff' : (isDark ? '#ffffff' : '#111111'),
          }}
        >
          {headline}
        </h1>
        <p 
          className="text-base lg:text-lg opacity-80"
          style={{ 
            fontFamily: theme.fontBody,
            color: backgroundImage ? '#e5e5e5' : (isDark ? '#d1d5db' : '#4b5563'),
          }}
        >
          {subheadline}
        </p>
        
        <div className="mt-8 flex gap-4">
          <button
            className="px-6 py-3 rounded-full font-semibold text-white text-sm transition-transform hover:scale-105"
            style={{ backgroundColor: theme.primaryColor }}
          >
            View Work
          </button>
          <button
            className="px-6 py-3 rounded-full font-semibold text-sm border transition-transform hover:scale-105"
            style={{ 
              borderColor: backgroundImage ? '#ffffff' : theme.primaryColor,
              color: backgroundImage ? '#ffffff' : theme.primaryColor,
              backgroundColor: 'transparent',
            }}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
