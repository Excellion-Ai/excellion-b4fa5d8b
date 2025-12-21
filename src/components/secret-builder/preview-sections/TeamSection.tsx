import { SiteTheme } from '@/types/app-spec';
import { ScrollAnimation, StaggerContainer } from '../animations/ScrollAnimations';
import { Linkedin, Twitter, Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

interface TeamContent {
  title?: string;
  subtitle?: string;
  items?: TeamMember[];
}

interface TeamSectionProps {
  section: { id: string; content?: TeamContent };
  theme: SiteTheme;
  asTile?: boolean;
}

const defaultTeam: TeamMember[] = [
  {
    name: 'Alex Johnson',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Visionary leader with 15+ years of industry experience.',
  },
  {
    name: 'Sarah Williams',
    role: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    bio: 'Expert in streamlining processes and driving efficiency.',
  },
  {
    name: 'Michael Chen',
    role: 'Lead Designer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Creative mind behind our award-winning designs.',
  },
  {
    name: 'Emily Davis',
    role: 'Customer Success',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    bio: 'Dedicated to ensuring every client achieves their goals.',
  },
];

export function TeamSection({ section, theme, asTile = false }: TeamSectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';
  
  const title = content?.title || 'Meet Our Team';
  const subtitle = content?.subtitle || 'The experts behind our success';
  const items = content?.items || defaultTeam;

  if (asTile) {
    return (
      <section 
        id={section.id}
        className="h-full p-4"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <h3 
          className="text-sm font-bold mb-3"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {items.slice(0, 4).map((member, i) => (
            <div key={i} className="text-center">
              <div 
                className="w-10 h-10 mx-auto rounded-full overflow-hidden mb-1"
                style={{ backgroundColor: isDark ? '#1f1f1f' : '#f3f4f6' }}
              >
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-xs font-bold"
                    style={{ color: theme.primaryColor }}
                  >
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <p 
                className="text-[10px] font-medium truncate"
                style={{ color: isDark ? '#ffffff' : '#111827' }}
              >
                {member.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section 
      id={section.id}
      className="py-12 md:py-16 px-6"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <ScrollAnimation animation="fade-up">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ 
                fontFamily: theme.fontHeading || 'system-ui',
                color: isDark ? '#ffffff' : '#111827'
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
                color: isDark ? '#9ca3af' : '#6b7280'
              }}
            >
              {subtitle}
            </p>
          </ScrollAnimation>
        </div>

        <StaggerContainer 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          staggerDelay={100}
        >
          {items.map((member, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              <div 
                className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 ring-4 ring-transparent group-hover:ring-primary/20 transition-all"
                style={{ backgroundColor: isDark ? '#1f1f1f' : '#f3f4f6' }}
              >
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-3xl font-bold"
                    style={{ color: theme.primaryColor }}
                  >
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <h3 
                className="text-lg font-bold mb-1"
                style={{ 
                  fontFamily: theme.fontHeading || 'system-ui',
                  color: isDark ? '#ffffff' : '#111827'
                }}
              >
                {member.name}
              </h3>
              
              <p 
                className="text-sm font-medium mb-2"
                style={{ color: theme.primaryColor }}
              >
                {member.role}
              </p>
              
              {member.bio && (
                <p 
                  className="text-sm mb-4"
                  style={{ 
                    fontFamily: theme.fontBody || 'system-ui',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}
                >
                  {member.bio}
                </p>
              )}
              
              <div className="flex justify-center gap-3">
                {member.linkedin && (
                  <a 
                    href={member.linkedin}
                    className="p-2 rounded-full transition-colors hover:bg-primary/10"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {member.twitter && (
                  <a 
                    href={member.twitter}
                    className="p-2 rounded-full transition-colors hover:bg-primary/10"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {member.email && (
                  <a 
                    href={`mailto:${member.email}`}
                    className="p-2 rounded-full transition-colors hover:bg-primary/10"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
