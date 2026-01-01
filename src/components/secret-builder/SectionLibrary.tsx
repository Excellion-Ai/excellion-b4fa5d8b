import { useState } from 'react';
import { Plus, X, Type, Grid3X3, DollarSign, MessageSquare, HelpCircle, Mail, Zap, BarChart3, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SectionType, SiteSection, HeroContent, FeaturesContent, PricingContent, TestimonialsContent, FAQContent, ContactContent, CTAContent, StatsContent, AnimationConfig } from '@/types/site-spec';
import { AnimationPicker } from './AnimationPicker';

type SectionTemplate = {
  type: SectionType;
  label: string;
  icon: React.ReactNode;
  description: string;
  defaultContent: any;
};

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'hero',
    label: 'Hero',
    icon: <Type className="h-5 w-5" />,
    description: 'Large headline with call-to-action buttons',
    defaultContent: {
      headline: 'Your Headline Here',
      subheadline: 'Add a compelling subheadline that describes your value proposition.',
      ctas: [
        { label: 'Get Started', href: '#', variant: 'primary' },
        { label: 'Learn More', href: '#', variant: 'secondary' },
      ],
    } as HeroContent,
  },
  {
    type: 'features',
    label: 'Features',
    icon: <Grid3X3 className="h-5 w-5" />,
    description: 'Showcase your product features or services',
    defaultContent: {
      title: 'Our Features',
      subtitle: 'Everything you need to succeed',
      items: [
        { title: 'Feature One', description: 'Description of your first feature' },
        { title: 'Feature Two', description: 'Description of your second feature' },
        { title: 'Feature Three', description: 'Description of your third feature' },
        { title: 'Feature Four', description: 'Description of your fourth feature' },
      ],
    } as FeaturesContent,
  },
  {
    type: 'pricing',
    label: 'Pricing',
    icon: <DollarSign className="h-5 w-5" />,
    description: 'Display your pricing tiers',
    defaultContent: {
      title: 'Simple Pricing',
      subtitle: 'Choose the plan that works for you',
      items: [
        { name: 'Basic', price: '$9', period: '/month', features: ['Feature 1', 'Feature 2', 'Feature 3'], ctaText: 'Get Started' },
        { name: 'Pro', price: '$29', period: '/month', features: ['Everything in Basic', 'Feature 4', 'Feature 5'], highlighted: true, ctaText: 'Get Started' },
        { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Pro', 'Feature 6', 'Priority Support'], ctaText: 'Contact Us' },
      ],
    } as PricingContent,
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Customer reviews and social proof',
    defaultContent: {
      title: 'What Our Customers Say',
      subtitle: 'Trusted by thousands of happy customers',
      items: [
        { name: 'John Doe', role: 'CEO, Company', quote: 'This product changed our business completely.', rating: 5 },
        { name: 'Jane Smith', role: 'Marketing Director', quote: 'Best decision we ever made.', rating: 5 },
        { name: 'Bob Johnson', role: 'Founder', quote: 'Incredible value for the price.', rating: 5 },
      ],
    } as TestimonialsContent,
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: <HelpCircle className="h-5 w-5" />,
    description: 'Frequently asked questions',
    defaultContent: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know',
      items: [
        { question: 'What is your refund policy?', answer: 'We offer a 30-day money-back guarantee.' },
        { question: 'How do I get started?', answer: 'Simply sign up and follow our onboarding guide.' },
        { question: 'Do you offer support?', answer: 'Yes, we offer 24/7 customer support.' },
        { question: 'Can I cancel anytime?', answer: 'Yes, you can cancel your subscription at any time.' },
      ],
    } as FAQContent,
  },
  {
    type: 'contact',
    label: 'Contact',
    icon: <Mail className="h-5 w-5" />,
    description: 'Contact form and information',
    defaultContent: {
      title: 'Get in Touch',
      subtitle: 'We\'d love to hear from you',
      email: 'hello@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, Your City, State 12345',
      formFields: ['name', 'email', 'message'],
    } as ContactContent,
  },
  {
    type: 'cta',
    label: 'Call to Action',
    icon: <Zap className="h-5 w-5" />,
    description: 'Encourage visitors to take action',
    defaultContent: {
      headline: 'Let\'s Work Together',
      subheadline: 'We\'re here to help. Reach out today.',
      ctas: [
        { label: 'Contact Us', href: '#contact', variant: 'primary' },
      ],
    } as CTAContent,
  },
  {
    type: 'stats',
    label: 'Stats',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'Display impressive numbers',
    defaultContent: {
      title: 'By the Numbers',
      items: [
        { value: '10K+', label: 'Happy Customers' },
        { value: '99%', label: 'Satisfaction Rate' },
        { value: '24/7', label: 'Support' },
        { value: '5M+', label: 'Tasks Completed' },
      ],
    } as StatsContent,
  },
];

interface SectionLibraryProps {
  onAddSection: (section: SiteSection) => void;
  onRemoveSection: (sectionId: string) => void;
  onUpdateAnimation?: (sectionId: string, animation: AnimationConfig) => void;
  existingSections: SiteSection[];
}

export function SectionLibrary({ onAddSection, onRemoveSection, onUpdateAnimation, existingSections }: SectionLibraryProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleAddSection = (template: SectionTemplate) => {
    const newSection: SiteSection = {
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      label: template.label,
      content: { ...template.defaultContent },
    };
    onAddSection(newSection);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Sections
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Sections</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {/* Current Sections with Animation Controls */}
          {existingSections.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Current Sections
              </p>
              <div className="space-y-2">
                {existingSections.map((section) => (
                  <Collapsible
                    key={section.id}
                    open={expandedSection === section.id}
                    onOpenChange={(open) => setExpandedSection(open ? section.id : null)}
                  >
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                      <div className="flex items-center justify-between p-3">
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center gap-2 hover:text-primary transition-colors">
                            {expandedSection === section.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">{section.label}</span>
                            {section.animation && section.animation.type !== 'none' && (
                              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {section.animation.type}
                              </span>
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onRemoveSection(section.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-1 border-t border-border">
                          {onUpdateAnimation ? (
                            <AnimationPicker
                              config={section.animation}
                              onChange={(animation) => onUpdateAnimation(section.id, animation)}
                            />
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Animation editing not available
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}

          {/* Add New Section */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium mb-3">Add New Section</p>
            <div className="grid grid-cols-2 gap-3">
              {SECTION_TEMPLATES.map((template) => (
                <button
                  key={template.type}
                  onClick={() => handleAddSection(template)}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-colors text-left"
                >
                  <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                    {template.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{template.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
