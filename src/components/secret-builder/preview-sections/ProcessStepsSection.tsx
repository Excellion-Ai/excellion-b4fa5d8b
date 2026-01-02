import { SiteTheme } from '@/types/app-spec';
import { ScrollAnimation, StaggerContainer } from '../animations/ScrollAnimations';
import { Phone, ClipboardCheck, Wrench, CheckCircle, Calendar, MessageSquare, Truck, ThumbsUp } from 'lucide-react';

interface ProcessStep {
  number?: number;
  icon?: string;
  title: string;
  description: string;
}

interface ProcessStepsContent {
  title?: string;
  subtitle?: string;
  steps?: ProcessStep[];
}

interface ProcessStepsSectionProps {
  section: { id: string; content?: any };
  theme: SiteTheme;
  asTile?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  phone: Phone,
  clipboard: ClipboardCheck,
  wrench: Wrench,
  check: CheckCircle,
  calendar: Calendar,
  message: MessageSquare,
  truck: Truck,
  thumbsup: ThumbsUp,
};

const defaultSteps: ProcessStep[] = [
  {
    number: 1,
    icon: 'phone',
    title: 'Get in Touch',
    description: 'Call us or fill out our online form to schedule a free consultation.',
  },
  {
    number: 2,
    icon: 'clipboard',
    title: 'Free Estimate',
    description: 'We\'ll assess your needs and provide a detailed, no-obligation quote.',
  },
  {
    number: 3,
    icon: 'wrench',
    title: 'Expert Service',
    description: 'Our skilled team completes the work efficiently and professionally.',
  },
  {
    number: 4,
    icon: 'thumbsup',
    title: '100% Satisfaction',
    description: 'We ensure you\'re completely happy with the results before we leave.',
  },
];

export function ProcessStepsSection({ section, theme, asTile = false }: ProcessStepsSectionProps) {
  const content = section.content;
  const isDark = theme.darkMode ?? theme.backgroundStyle === 'dark';

  const title = content?.title || 'How It Works';
  const subtitle = content?.subtitle || 'Our simple, hassle-free process';
  const steps = content?.steps || defaultSteps;

  if (asTile) {
    return (
      <section
        id={section.id}
        className="h-full min-h-[150px] p-4 contain-layout"
        style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}
      >
        <h3
          className="text-sm font-bold mb-3"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {n}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id={section.id}
      className="py-12 md:py-16 px-6 min-h-[300px] contain-layout"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <ScrollAnimation animation="fade-up">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: theme.fontHeading || 'system-ui',
                color: isDark ? '#ffffff' : '#111827',
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
                color: isDark ? '#9ca3af' : '#6b7280',
              }}
            >
              {subtitle}
            </p>
          </ScrollAnimation>
        </div>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={150}>
          {steps.map((step, index) => {
            const IconComponent = iconMap[step.icon || 'check'] || CheckCircle;
            const stepNumber = step.number || index + 1;

            return (
              <div key={index} className="relative text-center">
                {index < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5"
                    style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative"
                    style={{ backgroundColor: `${theme.primaryColor}20` }}
                  >
                    <IconComponent
                      className="w-8 h-8"
                      style={{ color: theme.primaryColor }}
                    />
                    <div
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      {stepNumber}
                    </div>
                  </div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{
                      fontFamily: theme.fontHeading || 'system-ui',
                      color: isDark ? '#ffffff' : '#111827',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: theme.fontBody || 'system-ui',
                      color: isDark ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}