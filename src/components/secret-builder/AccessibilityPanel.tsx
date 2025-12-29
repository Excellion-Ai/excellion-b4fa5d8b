import React, { useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Image, 
  Type, 
  FormInput, 
  Heading, 
  Palette,
  RefreshCw,
  Wand2,
  Info
} from 'lucide-react';
import { SiteSpec, SiteSection } from '@/types/site-spec';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'alt-text' | 'contrast' | 'form-labels' | 'headings' | 'aria';
  title: string;
  description: string;
  location: string;
  sectionId?: string;
  fieldPath?: string;
  suggestion?: string;
  autoFixable: boolean;
}

interface AccessibilityScanResult {
  score: number;
  issues: AccessibilityIssue[];
  scannedAt: Date;
}

interface AccessibilityPanelProps {
  siteSpec: SiteSpec | null;
  onApplyFix?: (issue: AccessibilityIssue) => void;
}

const checkAltText = (sections: SiteSection[]): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];
  
  sections.forEach((section, sectionIndex) => {
    const content = section.content as Record<string, any> | undefined;
    
    if (content?.backgroundImage && !content.backgroundImageAlt) {
      issues.push({
        id: `alt-${section.id}-bg`,
        type: 'error',
        category: 'alt-text',
        title: 'Missing background image alt text',
        description: `Background image in ${section.type} section has no alternative text`,
        location: `Section ${sectionIndex + 1}: ${section.type}`,
        sectionId: section.id,
        fieldPath: 'content.backgroundImageAlt',
        suggestion: `Describe the background image content`,
        autoFixable: false
      });
    }

    if (content?.image && !content.imageAlt) {
      issues.push({
        id: `alt-${section.id}-img`,
        type: 'error',
        category: 'alt-text',
        title: 'Missing image alt text',
        description: `Image in ${section.type} section lacks alternative text for screen readers`,
        location: `Section ${sectionIndex + 1}: ${section.type}`,
        sectionId: section.id,
        fieldPath: 'content.imageAlt',
        suggestion: `Add descriptive alt text for the image`,
        autoFixable: false
      });
    }

    if (content?.items) {
      content.items.forEach((item: any, itemIndex: number) => {
        if (item.image && !item.imageAlt && !item.alt) {
          issues.push({
            id: `alt-${section.id}-item-${itemIndex}`,
            type: 'error',
            category: 'alt-text',
            title: 'Missing item image alt text',
            description: `Image for "${item.title || item.name || `Item ${itemIndex + 1}`}" has no alt text`,
            location: `Section ${sectionIndex + 1}: ${section.type} → Item ${itemIndex + 1}`,
            sectionId: section.id,
            fieldPath: `content.items[${itemIndex}].imageAlt`,
            suggestion: `Describe what the image shows`,
            autoFixable: false
          });
        }
      });
    }

    if (content?.gallery) {
      content.gallery.forEach((img: any, imgIndex: number) => {
        if (img.url && !img.alt) {
          issues.push({
            id: `alt-${section.id}-gallery-${imgIndex}`,
            type: 'error',
            category: 'alt-text',
            title: 'Missing gallery image alt text',
            description: `Gallery image ${imgIndex + 1} has no alternative text`,
            location: `Section ${sectionIndex + 1}: ${section.type} → Gallery image ${imgIndex + 1}`,
            sectionId: section.id,
            fieldPath: `content.gallery[${imgIndex}].alt`,
            suggestion: `Describe the gallery image content`,
            autoFixable: false
          });
        }
      });
    }
  });

  return issues;
};

const checkColorContrast = (siteSpec: SiteSpec): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];
  const theme = siteSpec.theme;

  if (theme) {
    const lightTextOnLight = ['#fff', '#ffffff', 'white', '#fafafa', '#f5f5f5'];
    const darkTextOnDark = ['#000', '#000000', 'black', '#0a0a0a', '#1a1a1a'];

    if (theme.primaryColor && theme.backgroundColor) {
      const primaryLower = theme.primaryColor.toLowerCase();
      const bgLower = theme.backgroundColor.toLowerCase();
      
      if (lightTextOnLight.includes(primaryLower) && lightTextOnLight.includes(bgLower)) {
        issues.push({
          id: 'contrast-primary-bg',
          type: 'warning',
          category: 'contrast',
          title: 'Potential low contrast: primary on background',
          description: 'Primary color may have insufficient contrast against background',
          location: 'Theme settings',
          suggestion: 'Consider using a darker primary color or lighter background',
          autoFixable: false
        });
      }

      if (darkTextOnDark.includes(primaryLower) && darkTextOnDark.includes(bgLower)) {
        issues.push({
          id: 'contrast-primary-bg-dark',
          type: 'warning',
          category: 'contrast',
          title: 'Potential low contrast: dark on dark',
          description: 'Dark primary color on dark background may be hard to read',
          location: 'Theme settings',
          suggestion: 'Consider using a lighter primary color',
          autoFixable: false
        });
      }
    }
  }

  return issues;
};

const checkFormLabels = (sections: SiteSection[]): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];

  sections.forEach((section, sectionIndex) => {
    const content = section.content as Record<string, any> | undefined;
    
    if (section.type === 'contact' && content?.formFields) {
      content.formFields.forEach((field: any, fieldIndex: number) => {
        if (!field.label && !field.placeholder) {
          issues.push({
            id: `form-${section.id}-field-${fieldIndex}`,
            type: 'error',
            category: 'form-labels',
            title: 'Form field missing label',
            description: `Form field "${field.name || `Field ${fieldIndex + 1}`}" has no visible label or placeholder`,
            location: `Section ${sectionIndex + 1}: Contact form → Field ${fieldIndex + 1}`,
            sectionId: section.id,
            fieldPath: `content.formFields[${fieldIndex}].label`,
            suggestion: `Add a descriptive label for this field`,
            autoFixable: true
          });
        }

        if (field.type === 'checkbox' && !field.label) {
          issues.push({
            id: `form-${section.id}-checkbox-${fieldIndex}`,
            type: 'error',
            category: 'form-labels',
            title: 'Checkbox missing label',
            description: `Checkbox field requires a visible label for accessibility`,
            location: `Section ${sectionIndex + 1}: Contact form → Checkbox ${fieldIndex + 1}`,
            sectionId: section.id,
            fieldPath: `content.formFields[${fieldIndex}].label`,
            suggestion: `Add a label describing what this checkbox controls`,
            autoFixable: true
          });
        }
      });
    }
  });

  return issues;
};

const checkHeadingHierarchy = (sections: SiteSection[]): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];
  let lastHeadingLevel = 0;
  let hasH1 = false;

  sections.forEach((section, sectionIndex) => {
    const content = section.content as Record<string, any> | undefined;
    
    if (section.type === 'hero') {
      hasH1 = true;
      lastHeadingLevel = 1;
    } else if (content?.headline || content?.title) {
      const expectedLevel = lastHeadingLevel + 1;
      if (expectedLevel > 2 && !hasH1) {
        issues.push({
          id: `heading-${section.id}-skip`,
          type: 'warning',
          category: 'headings',
          title: 'Heading hierarchy skip',
          description: `Section heading may skip levels (no H1 found before H${expectedLevel})`,
          location: `Section ${sectionIndex + 1}: ${section.type}`,
          sectionId: section.id,
          suggestion: `Ensure headings follow a logical hierarchy (H1 → H2 → H3)`,
          autoFixable: false
        });
      }
      lastHeadingLevel = Math.min(lastHeadingLevel + 1, 6);
    }
  });

  if (!hasH1 && sections.length > 0) {
    issues.push({
      id: 'heading-no-h1',
      type: 'error',
      category: 'headings',
      title: 'Missing H1 heading',
      description: 'Page should have exactly one H1 heading, typically in the hero section',
      location: 'Page structure',
      suggestion: 'Add a hero section or ensure main headline uses H1',
      autoFixable: false
    });
  }

  const heroSections = sections.filter(s => s.type === 'hero');
  if (heroSections.length > 1) {
    issues.push({
      id: 'heading-multiple-h1',
      type: 'warning',
      category: 'headings',
      title: 'Multiple H1 headings',
      description: `Found ${heroSections.length} hero sections which may result in multiple H1 tags`,
      location: 'Page structure',
      suggestion: 'Consider using only one hero section per page',
      autoFixable: false
    });
  }

  return issues;
};

const calculateScore = (issues: AccessibilityIssue[]): number => {
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  const deductions = (errorCount * 15) + (warningCount * 5) + (infoCount * 1);
  return Math.max(0, 100 - deductions);
};

const getCategoryIcon = (category: AccessibilityIssue['category']) => {
  switch (category) {
    case 'alt-text': return Image;
    case 'contrast': return Palette;
    case 'form-labels': return FormInput;
    case 'headings': return Heading;
    case 'aria': return Type;
    default: return Info;
  }
};

const getTypeIcon = (type: AccessibilityIssue['type']) => {
  switch (type) {
    case 'error': return XCircle;
    case 'warning': return AlertTriangle;
    case 'info': return Info;
  }
};

const getTypeColor = (type: AccessibilityIssue['type']) => {
  switch (type) {
    case 'error': return 'text-destructive';
    case 'warning': return 'text-yellow-500';
    case 'info': return 'text-blue-500';
  }
};

export function AccessibilityPanel({ siteSpec, onApplyFix }: AccessibilityPanelProps) {
  const [scanResult, setScanResult] = useState<AccessibilityScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const runScan = useCallback(() => {
    if (!siteSpec) return;

    setIsScanning(true);

    setTimeout(() => {
      const sections = siteSpec.pages?.[0]?.sections || [];
      
      const allIssues: AccessibilityIssue[] = [
        ...checkAltText(sections),
        ...checkColorContrast(siteSpec),
        ...checkFormLabels(sections),
        ...checkHeadingHierarchy(sections)
      ];

      const score = calculateScore(allIssues);

      setScanResult({
        score,
        issues: allIssues,
        scannedAt: new Date()
      });

      setIsScanning(false);
    }, 500);
  }, [siteSpec]);

  const handleApplyFix = (issue: AccessibilityIssue) => {
    if (onApplyFix) {
      onApplyFix(issue);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-destructive';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle2;
    if (score >= 70) return AlertTriangle;
    return XCircle;
  };

  const errorCount = scanResult?.issues.filter(i => i.type === 'error').length || 0;
  const warningCount = scanResult?.issues.filter(i => i.type === 'warning').length || 0;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Accessibility Check</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={runScan}
            disabled={!siteSpec || isScanning}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan'}
          </Button>
        </div>

        {scanResult && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {React.createElement(getScoreIcon(scanResult.score), {
                className: `h-8 w-8 ${getScoreColor(scanResult.score)}`
              })}
              <div>
                <div className={`text-2xl font-bold ${getScoreColor(scanResult.score)}`}>
                  {scanResult.score}
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>

            <div className="flex gap-2 ml-auto">
              {errorCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  {errorCount} errors
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  {warningCount} warnings
                </Badge>
              )}
              {errorCount === 0 && warningCount === 0 && (
                <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
                  <CheckCircle2 className="h-3 w-3" />
                  All clear
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {!scanResult && !isScanning && (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Click "Scan" to check accessibility</p>
              <p className="text-xs mt-1">Checks alt text, contrast, form labels, and headings</p>
            </div>
          )}

          {isScanning && (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-3 animate-spin opacity-50" />
              <p>Scanning for accessibility issues...</p>
            </div>
          )}

          {scanResult && scanResult.issues.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-green-500">No issues detected!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your site passes basic accessibility checks
              </p>
            </div>
          )}

          {scanResult?.issues.map((issue) => {
            const CategoryIcon = getCategoryIcon(issue.category);
            const TypeIcon = getTypeIcon(issue.type);

            return (
              <div
                key={issue.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${getTypeColor(issue.type)}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{issue.title}</span>
                      <Badge variant="outline" className="text-xs gap-1">
                        <CategoryIcon className="h-3 w-3" />
                        {issue.category.replace('-', ' ')}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      {issue.description}
                    </p>

                    <div className="text-xs text-muted-foreground/70 mb-2">
                      📍 {issue.location}
                    </div>

                    {issue.suggestion && (
                      <div className="flex items-center gap-2 p-2 rounded bg-accent/10 text-xs">
                        <Wand2 className="h-3 w-3 text-primary shrink-0" />
                        <span>{issue.suggestion}</span>
                        {issue.autoFixable && onApplyFix && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto h-6 px-2 text-xs"
                            onClick={() => handleApplyFix(issue)}
                          >
                            Apply Fix
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {scanResult && (
        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          Last scanned: {scanResult.scannedAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
