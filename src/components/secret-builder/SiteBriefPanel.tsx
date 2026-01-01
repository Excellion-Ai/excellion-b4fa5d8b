// SiteBriefPanel - Displays inferred business data and missing info checklist (like Wix)
import { useState } from 'react';
import { 
  FileText, MapPin, Phone, Clock, Globe, Image, Star, Users, 
  CheckCircle, Circle, ChevronDown, ChevronUp, Sparkles, Target,
  Package, MessageSquare, Hash, Palette, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { SiteSpec } from '@/types/site-spec';
import { cn } from '@/lib/utils';

export type BusinessIntent = 'product_store' | 'service_business' | 'booking_business' | 'saas' | 'portfolio';

export interface SiteBriefData {
  businessName: string | null;
  businessIntent: BusinessIntent;
  industry: string;
  primaryGoal: string;
  primaryCTA: string;
  pages: string[];
  seoKeywords: string[];
  tone: string[];
  offerings: string[];
  location?: { city?: string; state?: string } | null;
}

export interface MissingInfoItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
  value?: string;
  placeholder?: string;
  onUpdate?: (value: string) => void;
}

interface SiteBriefPanelProps {
  brief: SiteBriefData | null;
  siteSpec: SiteSpec | null;
  onUpdateSpec?: (updates: Partial<SiteSpec>) => void;
  onClose?: () => void;
  className?: string;
}

// Infer business intent from industry/keywords
export function inferBusinessIntent(industry: string, offerings: string[], hasEcommerce: boolean, hasBooking: boolean): BusinessIntent {
  if (hasEcommerce || industry.includes('retail') || industry.includes('shop') || industry.includes('store')) {
    return 'product_store';
  }
  if (hasBooking || ['salon', 'dental', 'yoga_fitness', 'restaurant', 'photography', 'tutoring', 'pet_services'].includes(industry)) {
    return 'booking_business';
  }
  if (industry === 'saas' || industry.includes('software') || industry.includes('platform') || industry.includes('app')) {
    return 'saas';
  }
  if (industry === 'photography' || industry.includes('portfolio') || industry.includes('creative') || industry.includes('artist')) {
    return 'portfolio';
  }
  return 'service_business';
}

// Display-friendly intent labels
const INTENT_LABELS: Record<BusinessIntent, { label: string; color: string }> = {
  product_store: { label: 'E-Commerce Store', color: 'bg-emerald-500/20 text-emerald-400' },
  service_business: { label: 'Service Business', color: 'bg-blue-500/20 text-blue-400' },
  booking_business: { label: 'Booking Business', color: 'bg-purple-500/20 text-purple-400' },
  saas: { label: 'SaaS / Software', color: 'bg-amber-500/20 text-amber-400' },
  portfolio: { label: 'Portfolio / Creative', color: 'bg-pink-500/20 text-pink-400' },
};

export function SiteBriefPanel({ brief, siteSpec, onUpdateSpec, onClose, className }: SiteBriefPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!brief) return null;

  const intentInfo = INTENT_LABELS[brief.businessIntent];

  // Build missing info checklist
  const missingInfoItems: MissingInfoItem[] = [
    {
      id: 'logo',
      label: 'Logo',
      icon: Image,
      isComplete: !!siteSpec?.logo,
      placeholder: 'Upload your logo',
    },
    {
      id: 'address',
      label: 'Address',
      icon: MapPin,
      isComplete: !!(brief.location?.city || brief.location?.state),
      value: brief.location ? `${brief.location.city || ''} ${brief.location.state || ''}`.trim() : undefined,
      placeholder: 'Add business address',
    },
    {
      id: 'hours',
      label: 'Business Hours',
      icon: Clock,
      isComplete: false, // TODO: Check spec for hours
      placeholder: 'Add operating hours',
    },
    {
      id: 'phone',
      label: 'Phone Number',
      icon: Phone,
      isComplete: false, // TODO: Check contact section
      placeholder: 'Add phone number',
    },
    {
      id: 'offerings',
      label: 'Products/Services',
      icon: Package,
      isComplete: brief.offerings.length > 2,
      value: brief.offerings.length > 0 ? `${brief.offerings.length} items` : undefined,
      placeholder: 'Add your offerings',
    },
    {
      id: 'social',
      label: 'Social Links',
      icon: Globe,
      isComplete: false, // TODO: Check footer for social
      placeholder: 'Connect social accounts',
    },
    {
      id: 'reviews',
      label: 'Testimonials',
      icon: Star,
      isComplete: siteSpec?.pages?.some(p => p.sections.some(s => s.type === 'testimonials')) || false,
      placeholder: 'Add customer reviews',
    },
  ];

  const completedCount = missingInfoItems.filter(i => i.isComplete).length;
  const completionPercent = Math.round((completedCount / missingInfoItems.length) * 100);

  const handleEditStart = (item: MissingInfoItem) => {
    setEditingItem(item.id);
    setEditValue(item.value || '');
  };

  const handleEditSave = (itemId: string) => {
    // TODO: Update spec based on item
    setEditingItem(null);
    setEditValue('');
  };

  return (
    <div className={cn(
      "bg-card border rounded-lg overflow-hidden shadow-lg",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Site Brief</span>
          <Badge variant="secondary" className="text-xs">
            {completionPercent}% Complete
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <ScrollArea className="max-h-[400px]">
            <div className="p-3 space-y-4">
              {/* Business Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Business Overview
                </h4>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("text-xs", intentInfo.color)}>
                    <Target className="h-3 w-3 mr-1" />
                    {intentInfo.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {brief.industry.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {brief.businessName && (
                  <p className="text-sm font-medium">{brief.businessName}</p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>Goal: <strong className="text-foreground">{brief.primaryGoal}</strong></span>
                  <span className="text-muted-foreground/50">→</span>
                  <Badge variant="secondary" className="text-xs h-5">
                    {brief.primaryCTA}
                  </Badge>
                </div>
              </div>

              {/* Pages Created */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Pages Created ({brief.pages.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {brief.pages.map((page, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {page}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* SEO Keywords */}
              {brief.seoKeywords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    SEO Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {brief.seoKeywords.slice(0, 6).map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        {kw}
                      </Badge>
                    ))}
                    {brief.seoKeywords.length > 6 && (
                      <Badge variant="secondary" className="text-xs font-normal opacity-60">
                        +{brief.seoKeywords.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Tone */}
              {brief.tone.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Tone & Style
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {brief.tone.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-xs capitalize">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Info Checklist */}
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Setup Checklist
                </h4>
                
                <div className="space-y-1.5">
                  {missingInfoItems.map((item) => {
                    const Icon = item.icon;
                    const isEditing = editingItem === item.id;
                    
                    return (
                      <div 
                        key={item.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md transition-colors",
                          item.isComplete ? "bg-emerald-500/10" : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        {item.isComplete ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        
                        {isEditing ? (
                          <div className="flex-1 flex gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-6 text-xs"
                              placeholder={item.placeholder}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditSave(item.id);
                                if (e.key === 'Escape') setEditingItem(null);
                              }}
                            />
                            <Button 
                              size="sm" 
                              className="h-6 text-xs px-2"
                              onClick={() => handleEditSave(item.id)}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className={cn(
                              "text-xs flex-1",
                              item.isComplete ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {item.label}
                              {item.value && (
                                <span className="ml-1 opacity-60">({item.value})</span>
                              )}
                            </span>
                            {!item.isComplete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                onClick={() => handleEditStart(item)}
                              >
                                Add
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Helper to extract SiteBriefData from a SiteSpec and BusinessBrief
export function extractSiteBriefFromSpec(
  spec: SiteSpec,
  briefData?: Partial<SiteBriefData>
): SiteBriefData {
  const pages = spec.pages?.map(p => p.title) || [];
  const industry = briefData?.industry || spec.businessModel?.toLowerCase().replace(/_/g, ' ') || 'general';
  
  return {
    businessName: spec.name || null,
    businessIntent: briefData?.businessIntent || inferBusinessIntent(industry, [], false, false),
    industry,
    primaryGoal: briefData?.primaryGoal || 'leads',
    primaryCTA: briefData?.primaryCTA || 'Contact Us',
    pages,
    seoKeywords: briefData?.seoKeywords || [],
    tone: briefData?.tone || ['professional', 'friendly'],
    offerings: briefData?.offerings || [],
    location: briefData?.location,
  };
}
