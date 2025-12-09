import { SiteSection, SiteTheme } from '@/types/app-spec';
import { Mail, MapPin, Phone } from 'lucide-react';

interface ContactSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

export function ContactSection({ section, theme }: ContactSectionProps) {
  return (
    <section 
      id={section.id}
      className="py-20 px-6"
      style={{ 
        backgroundColor: theme.darkMode ? '#0a0a0a' : '#f9fafb'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: theme.fontHeading,
              color: theme.darkMode ? '#ffffff' : '#111827'
            }}
          >
            {section.label || 'Contact Us'}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ 
              fontFamily: theme.fontBody,
              color: theme.darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            {section.description || 'Get in touch with our team'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.primaryColor}20` }}
              >
                <Mail className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <h3 
                  className="font-semibold mb-1"
                  style={{ 
                    fontFamily: theme.fontHeading,
                    color: theme.darkMode ? '#ffffff' : '#111827'
                  }}
                >
                  Email
                </h3>
                <p 
                  style={{ 
                    fontFamily: theme.fontBody,
                    color: theme.darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  hello@example.com
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.primaryColor}20` }}
              >
                <Phone className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <h3 
                  className="font-semibold mb-1"
                  style={{ 
                    fontFamily: theme.fontHeading,
                    color: theme.darkMode ? '#ffffff' : '#111827'
                  }}
                >
                  Phone
                </h3>
                <p 
                  style={{ 
                    fontFamily: theme.fontBody,
                    color: theme.darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  +1 (555) 123-4567
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.primaryColor}20` }}
              >
                <MapPin className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <h3 
                  className="font-semibold mb-1"
                  style={{ 
                    fontFamily: theme.fontHeading,
                    color: theme.darkMode ? '#ffffff' : '#111827'
                  }}
                >
                  Address
                </h3>
                <p 
                  style={{ 
                    fontFamily: theme.fontBody,
                    color: theme.darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  123 Main Street, City, ST 12345
                </p>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div 
            className="p-8 rounded-2xl"
            style={{ 
              backgroundColor: theme.darkMode ? '#1f1f1f' : '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.darkMode ? '#d1d5db' : '#374151' }}
                >
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                  style={{ 
                    backgroundColor: theme.darkMode ? '#2d2d2d' : '#f9fafb',
                    borderColor: theme.darkMode ? '#404040' : '#e5e7eb',
                    color: theme.darkMode ? '#ffffff' : '#111827'
                  }}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.darkMode ? '#d1d5db' : '#374151' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                  style={{ 
                    backgroundColor: theme.darkMode ? '#2d2d2d' : '#f9fafb',
                    borderColor: theme.darkMode ? '#404040' : '#e5e7eb',
                    color: theme.darkMode ? '#ffffff' : '#111827'
                  }}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.darkMode ? '#d1d5db' : '#374151' }}
                >
                  Message
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border outline-none transition-all resize-none"
                  rows={4}
                  style={{ 
                    backgroundColor: theme.darkMode ? '#2d2d2d' : '#f9fafb',
                    borderColor: theme.darkMode ? '#404040' : '#e5e7eb',
                    color: theme.darkMode ? '#ffffff' : '#111827'
                  }}
                  placeholder="Your message..."
                />
              </div>
              <button
                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
