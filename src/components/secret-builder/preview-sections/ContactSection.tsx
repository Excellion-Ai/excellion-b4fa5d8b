import { SiteSection, SiteTheme, ContactContent } from '@/types/app-spec';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ScrollAnimation } from '../animations/ScrollAnimations';
import { EditableText } from '../EditableText';

interface ContactSectionProps {
  section: SiteSection;
  theme: SiteTheme;
  onUpdateContent?: (field: keyof ContactContent, value: string) => void;
}

export function ContactSection({ section, theme, onUpdateContent }: ContactSectionProps) {
  const content = section.content as ContactContent | undefined;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || section.label || 'Contact Us';
  const subtitle = content?.subtitle || section.description || 'Get in touch with our team';
  const email = content?.email || 'hello@example.com';
  const phone = content?.phone || '+1 (555) 123-4567';
  const address = content?.address || '123 Main Street, City, ST 12345';

  return (
    <section id={section.id} className="py-10 md:py-14 px-6 w-full" style={{ backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }}>
      <div className="w-full">
        <div className="text-center mb-8">
          <ScrollAnimation animation="fade-up">
            {onUpdateContent ? (
              <EditableText value={title} onSave={(val) => onUpdateContent('title', val)} as="h2" className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.fontHeading || 'system-ui', color: isDark ? '#ffffff' : '#111827' }} />
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.fontHeading || 'system-ui', color: isDark ? '#ffffff' : '#111827' }}>{title}</h2>
            )}
          </ScrollAnimation>
          <ScrollAnimation animation="fade-up" delay={100}>
            {onUpdateContent ? (
              <EditableText value={subtitle} onSave={(val) => onUpdateContent('subtitle', val)} as="p" className="text-lg max-w-2xl mx-auto" style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }} />
            ) : (
              <p className="text-lg max-w-2xl mx-auto" style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }}>{subtitle}</p>
            )}
          </ScrollAnimation>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <ScrollAnimation animation="fade-right" delay={150}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                  <Mail className="w-6 h-6" style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ fontFamily: theme.fontHeading || 'system-ui', color: isDark ? '#ffffff' : '#111827' }}>Email</h3>
                  {onUpdateContent ? (
                    <EditableText value={email} onSave={(val) => onUpdateContent('email', val)} as="p" style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }} />
                  ) : (
                    <p style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }}>{email}</p>
                  )}
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-right" delay={250}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                  <Phone className="w-6 h-6" style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ fontFamily: theme.fontHeading || 'system-ui', color: isDark ? '#ffffff' : '#111827' }}>Phone</h3>
                  {onUpdateContent ? (
                    <EditableText value={phone} onSave={(val) => onUpdateContent('phone', val)} as="p" style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }} />
                  ) : (
                    <p style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }}>{phone}</p>
                  )}
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-right" delay={350}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                  <MapPin className="w-6 h-6" style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ fontFamily: theme.fontHeading || 'system-ui', color: isDark ? '#ffffff' : '#111827' }}>Address</h3>
                  {onUpdateContent ? (
                    <EditableText value={address} onSave={(val) => onUpdateContent('address', val)} as="p" style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }} />
                  ) : (
                    <p style={{ fontFamily: theme.fontBody || 'system-ui', color: isDark ? '#9ca3af' : '#6b7280' }}>{address}</p>
                  )}
                </div>
              </div>
            </ScrollAnimation>
          </div>
          <ScrollAnimation animation="fade-left" delay={200}>
            <div className="p-8 rounded-2xl" style={{ backgroundColor: isDark ? '#1f1f1f' : '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#d1d5db' : '#374151' }}>Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', borderColor: isDark ? '#404040' : '#e5e7eb', color: isDark ? '#ffffff' : '#111827' }} placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#d1d5db' : '#374151' }}>Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', borderColor: isDark ? '#404040' : '#e5e7eb', color: isDark ? '#ffffff' : '#111827' }} placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#d1d5db' : '#374151' }}>Message</label>
                  <textarea className="w-full px-4 py-3 rounded-lg border outline-none resize-none" rows={4} style={{ backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', borderColor: isDark ? '#404040' : '#e5e7eb', color: isDark ? '#ffffff' : '#111827' }} placeholder="Your message..." />
                </div>
                <button className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: theme.primaryColor }}>Send Message</button>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}