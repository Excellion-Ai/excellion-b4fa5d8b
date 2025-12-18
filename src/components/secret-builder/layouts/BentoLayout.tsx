import React from 'react';
import { SiteTheme, SiteSection, GridConfig } from '@/types/site-spec';

interface BentoLayoutProps {
  children: React.ReactNode;
  theme: SiteTheme;
  sections: SiteSection[];
}

// Get grid classes based on section type and gridConfig
function getGridClasses(section: SiteSection, index: number): string {
  const config = section.gridConfig;
  
  // If explicit grid config exists, use it
  if (config?.colSpan || config?.rowSpan) {
    const col = config.colSpan ? `col-span-${Math.min(config.colSpan, 12)}` : 'col-span-6';
    const row = config.rowSpan ? `row-span-${config.rowSpan}` : '';
    return `${col} ${row}`;
  }
  
  // Default asymmetric layout based on section type and position
  switch (section.type) {
    case 'hero':
      return 'col-span-12 lg:col-span-8 row-span-2';
    case 'stats':
      return 'col-span-12 lg:col-span-4 row-span-1';
    case 'features':
      return 'col-span-12 lg:col-span-6';
    case 'testimonials':
      return 'col-span-12 lg:col-span-6';
    case 'pricing':
      return 'col-span-12';
    case 'cta':
      return 'col-span-12 lg:col-span-8';
    case 'contact':
      return 'col-span-12 lg:col-span-4';
    case 'faq':
      return 'col-span-12 lg:col-span-6';
    default:
      // Alternate between larger and smaller tiles
      return index % 3 === 0 ? 'col-span-12 lg:col-span-8' : 'col-span-12 lg:col-span-4';
  }
}

export function BentoLayout({ children, theme, sections }: BentoLayoutProps) {
  const isDark = theme.darkMode;
  
  // Convert children to array for mapping with grid classes
  const childArray = React.Children.toArray(children);
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor }}>
      {/* Floating Pill Navigation */}
      <nav 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full backdrop-blur-xl shadow-2xl flex items-center gap-6"
        style={{ 
          backgroundColor: isDark ? 'rgba(17, 17, 17, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        {/* Nav items will be rendered by parent */}
      </nav>

      {/* Bento Grid Container */}
      <main className="p-4 lg:p-8">
        <div className="grid grid-cols-12 gap-4 lg:gap-6 auto-rows-min">
          {childArray.map((child, index) => {
            const section = sections[index];
            const gridClasses = section ? getGridClasses(section, index) : 'col-span-12';
            
            return (
              <div 
                key={index}
                className={`${gridClasses} transition-all duration-300`}
              >
                <div 
                  className="h-full rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: isDark ? '#111111' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  }}
                >
                  {child}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// Floating pill navigation component for Bento layout
interface BentoPillNavProps {
  siteName: string;
  navigation: { label: string; href: string }[];
  theme: SiteTheme;
  onUpdateSiteName?: (name: string) => void;
  onUpdateNavItem?: (index: number, label: string) => void;
}

export function BentoPillNav({ 
  siteName, 
  navigation, 
  theme,
  onUpdateSiteName,
  onUpdateNavItem,
}: BentoPillNavProps) {
  const isDark = theme.darkMode;
  
  return (
    <nav 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full backdrop-blur-xl shadow-2xl flex items-center gap-6"
      style={{ 
        backgroundColor: isDark ? 'rgba(17, 17, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
    >
      <span 
        className="font-bold text-sm"
        style={{ 
          fontFamily: theme.fontHeading,
          color: theme.primaryColor 
        }}
      >
        {siteName}
      </span>
      
      <div className="h-4 w-px bg-current opacity-20" />
      
      {navigation?.slice(0, 4).map((item, index) => (
        <a
          key={index}
          href={item.href}
          className="text-xs font-medium transition-colors hover:opacity-80"
          style={{ 
            color: isDark ? '#d1d5db' : '#4b5563'
          }}
        >
          {item.label}
        </a>
      ))}
      
      <button
        className="px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-transform hover:scale-105"
        style={{ backgroundColor: theme.primaryColor }}
      >
        Get Started
      </button>
    </nav>
  );
}
