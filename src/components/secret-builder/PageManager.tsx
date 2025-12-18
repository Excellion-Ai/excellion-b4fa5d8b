
import { X, FileText, Home, Info, Mail, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SitePage, SiteSection } from '@/types/site-spec';

const PAGE_ICONS: Record<string, React.ReactNode> = {
  '/': <Home className="h-4 w-4" />,
  '/about': <Info className="h-4 w-4" />,
  '/contact': <Mail className="h-4 w-4" />,
  '/services': <Briefcase className="h-4 w-4" />,
};

const PAGE_TEMPLATES: { title: string; path: string; sections: SiteSection[] }[] = [
  {
    title: 'About',
    path: '/about',
    sections: [
      {
        id: 'about-hero',
        type: 'hero',
        label: 'Hero',
        content: {
          headline: 'About Us',
          subheadline: 'Learn more about our story, mission, and values.',
          ctas: [],
        },
      },
      {
        id: 'about-features',
        type: 'features',
        label: 'Our Values',
        content: {
          title: 'Our Values',
          subtitle: 'What drives us every day',
          items: [
            { title: 'Quality', description: 'We never compromise on quality.' },
            { title: 'Innovation', description: 'We embrace new ideas and technologies.' },
            { title: 'Integrity', description: 'We operate with honesty and transparency.' },
            { title: 'Customer Focus', description: 'Your success is our success.' },
          ],
        },
      },
    ],
  },
  {
    title: 'Services',
    path: '/services',
    sections: [
      {
        id: 'services-hero',
        type: 'hero',
        label: 'Hero',
        content: {
          headline: 'Our Services',
          subheadline: 'Comprehensive solutions tailored to your needs.',
          ctas: [{ label: 'Get Started', href: '#contact', variant: 'primary' }],
        },
      },
      {
        id: 'services-features',
        type: 'features',
        label: 'Services',
        content: {
          title: 'What We Offer',
          items: [
            { title: 'Service One', description: 'Description of your first service.' },
            { title: 'Service Two', description: 'Description of your second service.' },
            { title: 'Service Three', description: 'Description of your third service.' },
            { title: 'Service Four', description: 'Description of your fourth service.' },
          ],
        },
      },
      {
        id: 'services-pricing',
        type: 'pricing',
        label: 'Pricing',
        content: {
          title: 'Pricing Plans',
          items: [
            { name: 'Basic', price: '$99', features: ['Feature 1', 'Feature 2'], ctaText: 'Choose' },
            { name: 'Pro', price: '$199', features: ['All Basic features', 'Feature 3'], highlighted: true, ctaText: 'Choose' },
          ],
        },
      },
    ],
  },
  {
    title: 'Contact',
    path: '/contact',
    sections: [
      {
        id: 'contact-hero',
        type: 'hero',
        label: 'Hero',
        content: {
          headline: 'Contact Us',
          subheadline: 'We\'d love to hear from you. Get in touch today.',
          ctas: [],
        },
      },
      {
        id: 'contact-form',
        type: 'contact',
        label: 'Contact Form',
        content: {
          title: 'Send Us a Message',
          subtitle: 'Fill out the form below and we\'ll get back to you.',
          email: 'hello@example.com',
          phone: '+1 (555) 123-4567',
          formFields: ['name', 'email', 'message'],
        },
      },
    ],
  },
  {
    title: 'Blank Page',
    path: '/new-page',
    sections: [],
  },
];

interface PageManagerProps {
  pages: SitePage[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: (page: SitePage) => void;
  onRemovePage: (index: number) => void;
  onRenamePage: (index: number, title: string) => void;
}

export function PageManager({
  pages,
  currentPageIndex,
  onSelectPage,
  onAddPage,
  onRemovePage,
  onRenamePage,
}: PageManagerProps) {

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      {pages.filter((page) => page.path !== '/').map((page, filteredIndex) => {
        const originalIndex = pages.findIndex(p => p.path === page.path);
        return (
          <div key={page.path} className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs gap-1 ${
                currentPageIndex === originalIndex ? 'bg-background shadow-sm' : ''
              }`}
              onClick={() => onSelectPage(originalIndex)}
              title={page.title}
            >
              {PAGE_ICONS[page.path] || <FileText className="h-3.5 w-3.5" />}
              <span className="max-w-[80px] truncate">{page.title}</span>
            </Button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemovePage(originalIndex);
              }}
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        );
      })}

    </div>
  );
}
