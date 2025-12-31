import { SiteSection, SiteTheme, FAQContent, FAQItem } from '@/types/app-spec';
import { ScrollAnimation } from '../animations/ScrollAnimations';
import { Download, Shield, Headphones } from 'lucide-react';
import { EditableText } from '../EditableText';

interface FAQSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  onUpdateContent?: (field: keyof FAQContent, value: string) => void;
  onUpdateItem?: (index: number, field: keyof FAQItem, value: string) => void;
}

const trustBlocks = [
  { icon: Download, title: 'Ownership & Export', description: 'You own 100% of your code. Export your full project anytime.' },
  { icon: Shield, title: 'Security & Uptime', description: 'Enterprise-grade hosting with 99.9% uptime SLA.' },
  { icon: Headphones, title: 'Support Response', description: 'Priority support with <4 hour response times.' },
];

export function FAQSection({ section, theme, onUpdateContent }: FAQSectionProps) {
  const content = section.content as FAQContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || 'Why Trust Us';
  const subtitle = content?.subtitle || section.description || 'Built for reliability and peace of mind';

  return (
    <section id={section.id} className="py-10 md:py-14 px-6 w-full min-h-[250px] contain-layout" style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}>
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <ScrollAnimation animation="fade-up">
            {onUpdateContent ? (
              <EditableText value={title} onSave={(val) => onUpdateContent('title', val)} as="h2" className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.fontHeading || 'system-ui', color: isDark ? '#ffffff' : '#111827' }} />
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.fontHeading || 'system-ui', color: isDark ? '#ffffff' : '#111827' }}>{title}</h2>
            )}
          </ScrollAnimation>
          <ScrollAnimation animation="fade-up" delay={100}>
            {onUpdateContent ? (
              <EditableText value={subtitle} onSave={(val) => onUpdateContent('subtitle', val)} as="p" className="text-lg" style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }} />
            ) : (
              <p className="text-lg" style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }}>{subtitle}</p>
            )}
          </ScrollAnimation>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustBlocks.map((block, index) => (
            <ScrollAnimation key={index} animation="fade-up" delay={index * 100}>
              <div className="rounded-xl p-6 h-full flex flex-col items-center text-center" style={{ backgroundColor: isDark ? '#1f1f1f' : '#f9fafb', border: `1px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}` }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                  <block.icon className="w-6 h-6" style={{ color: theme.primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: theme.fontHeading || 'system-ui', color: isDark ? '#ffffff' : '#111827' }}>{block.title}</h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }}>{block.description}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}