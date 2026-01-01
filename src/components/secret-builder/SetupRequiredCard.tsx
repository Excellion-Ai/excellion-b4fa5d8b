// SetupRequiredCard - Replaces blank/placeholder sections with actionable prompts
import { AlertCircle, Sparkles, Plus, Image, FileText, Star, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SetupType = 
  | 'content'
  | 'testimonials'
  | 'gallery'
  | 'products'
  | 'team'
  | 'features'
  | 'custom';

interface SetupRequiredCardProps {
  type: SetupType;
  sectionLabel?: string;
  onGenerate?: () => void;
  onManualAdd?: () => void;
  className?: string;
  compact?: boolean;
}

const SETUP_CONFIG: Record<SetupType, {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  generateLabel: string;
  manualLabel: string;
}> = {
  content: {
    icon: FileText,
    title: 'Content Needed',
    description: 'This section needs content to display properly',
    generateLabel: 'Generate Content',
    manualLabel: 'Add Manually',
  },
  testimonials: {
    icon: Star,
    title: 'Add Customer Reviews',
    description: 'Showcase what your customers say about you',
    generateLabel: 'Generate Examples',
    manualLabel: 'Add Reviews',
  },
  gallery: {
    icon: Image,
    title: 'Add Photos',
    description: 'Upload images to showcase your work or products',
    generateLabel: 'Generate Placeholders',
    manualLabel: 'Upload Images',
  },
  products: {
    icon: Package,
    title: 'Connect Your Catalog',
    description: 'Add products to display in your shop',
    generateLabel: 'Generate Samples',
    manualLabel: 'Add Products',
  },
  team: {
    icon: Users,
    title: 'Add Team Members',
    description: 'Introduce your team to build trust',
    generateLabel: 'Generate Examples',
    manualLabel: 'Add Team',
  },
  features: {
    icon: Sparkles,
    title: 'Add Value Propositions',
    description: 'Highlight what makes your business special',
    generateLabel: 'Generate for My Business',
    manualLabel: 'Add Manually',
  },
  custom: {
    icon: AlertCircle,
    title: 'Setup Required',
    description: 'This section needs configuration',
    generateLabel: 'Generate Content',
    manualLabel: 'Configure',
  },
};

export function SetupRequiredCard({
  type,
  sectionLabel,
  onGenerate,
  onManualAdd,
  className,
  compact = false,
}: SetupRequiredCardProps) {
  const config = SETUP_CONFIG[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5",
        className
      )}>
        <div className="p-1.5 rounded-md bg-amber-500/10">
          <Icon className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {sectionLabel || config.title}
          </p>
        </div>
        {onGenerate && (
          <Button size="sm" variant="outline" onClick={onGenerate} className="shrink-0 text-xs h-7">
            <Sparkles className="h-3 w-3 mr-1" />
            Generate
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 rounded-xl",
      "border-2 border-dashed border-amber-500/30 bg-amber-500/5",
      "min-h-[200px]",
      className
    )}>
      <div className="p-3 rounded-full bg-amber-500/10 mb-4">
        <Icon className="h-6 w-6 text-amber-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {sectionLabel || config.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        {config.description}
      </p>
      
      <div className="flex items-center gap-2">
        {onGenerate && (
          <Button onClick={onGenerate} size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {config.generateLabel}
          </Button>
        )}
        {onManualAdd && (
          <Button onClick={onManualAdd} size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {config.manualLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper to detect if content is a placeholder or empty
export function isPlaceholderContent(content: unknown): boolean {
  if (!content) return true;
  
  const contentStr = typeof content === 'string' 
    ? content 
    : JSON.stringify(content);
  
  const placeholderPatterns = [
    /custom\s*section\s*content\s*goes\s*here/i,
    /lorem\s*ipsum/i,
    /placeholder/i,
    /coming\s*soon/i,
    /insert\s*(text|content)\s*here/i,
    /\[.*\]/,  // [Placeholder text]
    /^TBD$/i,
    /^N\/A$/i,
    /sample\s*(text|content)/i,
  ];
  
  for (const pattern of placeholderPatterns) {
    if (pattern.test(contentStr)) {
      return true;
    }
  }
  
  // Check for empty arrays/objects
  if (typeof content === 'object') {
    if (Array.isArray(content) && content.length === 0) return true;
    if (Object.keys(content as object).length === 0) return true;
  }
  
  return false;
}

// Determine setup type based on section type
export function getSetupTypeForSection(sectionType: string): SetupType {
  const typeMap: Record<string, SetupType> = {
    'testimonials': 'testimonials',
    'gallery': 'gallery',
    'portfolio': 'gallery',
    'products': 'products',
    'team': 'team',
    'features': 'features',
    'services': 'features',
    'custom': 'custom',
  };
  
  return typeMap[sectionType] || 'content';
}
