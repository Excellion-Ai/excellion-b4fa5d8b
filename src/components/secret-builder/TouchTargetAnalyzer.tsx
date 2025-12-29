import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, CheckCircle, Info, X, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TouchTargetIssue {
  element: string;
  width: number;
  height: number;
  minDimension: number;
  selector: string;
  rect: DOMRect;
}

interface TouchTargetAnalyzerProps {
  containerRef: React.RefObject<HTMLElement>;
  isActive: boolean;
  onClose: () => void;
}

const MIN_TOUCH_TARGET = 44; // Apple HIG and WCAG recommendation

export function TouchTargetAnalyzer({ containerRef, isActive, onClose }: TouchTargetAnalyzerProps) {
  const [issues, setIssues] = useState<TouchTargetIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const highlightRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const analyzeTouchTargets = useCallback(() => {
    if (!containerRef.current) return;
    
    setIsScanning(true);
    
    // Small delay to show scanning state
    setTimeout(() => {
      const container = containerRef.current;
      if (!container) {
        setIsScanning(false);
        return;
      }

      const interactiveElements = container.querySelectorAll(
        'button, a, input, textarea, select, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"]), .cursor-pointer'
      );

      const foundIssues: TouchTargetIssue[] = [];
      const containerRect = container.getBoundingClientRect();

      interactiveElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const minDimension = Math.min(width, height);

        // Skip hidden elements
        if (width === 0 || height === 0) return;

        // Check if below minimum
        if (minDimension < MIN_TOUCH_TARGET) {
          const tagName = el.tagName.toLowerCase();
          const className = el.className?.toString().slice(0, 30) || '';
          const text = (el.textContent || '').slice(0, 20).trim();
          
          foundIssues.push({
            element: text || `${tagName}${className ? `.${className.split(' ')[0]}` : ''}`,
            width: Math.round(width),
            height: Math.round(height),
            minDimension: Math.round(minDimension),
            selector: `[data-touch-id="${index}"]`,
            rect: new DOMRect(
              rect.left - containerRect.left,
              rect.top - containerRect.top,
              rect.width,
              rect.height
            ),
          });
        }
      });

      setIssues(foundIssues);
      setIsScanning(false);
    }, 300);
  }, [containerRef]);

  useEffect(() => {
    if (isActive) {
      analyzeTouchTargets();
    }
  }, [isActive, analyzeTouchTargets]);

  if (!isActive) return null;

  const issueCount = issues.length;
  const severity = issueCount === 0 ? 'success' : issueCount <= 3 ? 'warning' : 'error';

  return (
    <>
      {/* Issue Overlay on Preview */}
      {showOverlay && issues.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-40">
          {issues.map((issue, index) => (
            <div
              key={index}
              className="absolute border-2 border-red-500 bg-red-500/20 rounded"
              style={{
                left: issue.rect.x,
                top: issue.rect.y,
                width: issue.rect.width,
                height: issue.rect.height,
              }}
            >
              <span className="absolute -top-5 left-0 text-[10px] bg-red-500 text-white px-1 rounded whitespace-nowrap">
                {issue.width}×{issue.height}px
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Panel */}
      <div className="absolute bottom-4 right-4 w-80 bg-background border rounded-lg shadow-xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Touch Target Analysis</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary */}
        <div className={cn(
          "p-3 border-b",
          severity === 'success' && "bg-green-500/10",
          severity === 'warning' && "bg-amber-500/10",
          severity === 'error' && "bg-red-500/10",
        )}>
          <div className="flex items-center gap-2">
            {severity === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            {severity === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            
            <div>
              <p className="font-medium text-sm">
                {severity === 'success' && "All touch targets OK"}
                {severity === 'warning' && `${issueCount} small touch target${issueCount > 1 ? 's' : ''}`}
                {severity === 'error' && `${issueCount} accessibility issues`}
              </p>
              <p className="text-xs text-muted-foreground">
                Minimum recommended: {MIN_TOUCH_TARGET}×{MIN_TOUCH_TARGET}px
              </p>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="max-h-48 overflow-y-auto">
            {issues.map((issue, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{issue.element || 'Interactive element'}</p>
                  <p className="text-xs text-muted-foreground">
                    Size: {issue.width}×{issue.height}px
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-2 shrink-0",
                    issue.minDimension < 30 ? "border-red-500 text-red-500" : "border-amber-500 text-amber-500"
                  )}
                >
                  -{MIN_TOUCH_TARGET - issue.minDimension}px
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="p-2 border-t bg-muted/20 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={(e) => setShowOverlay(e.target.checked)}
              className="rounded"
            />
            Show highlights
          </label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={analyzeTouchTargets}
            disabled={isScanning}
            className="h-7 text-xs"
          >
            {isScanning ? 'Scanning...' : 'Rescan'}
          </Button>
        </div>

        {/* Info Footer */}
        <div className="p-2 bg-muted/40 border-t">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            <span>
              Touch targets under 44px make it hard for users to tap accurately on mobile devices.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function useTouchTargetAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const startAnalysis = () => setIsAnalyzing(true);
  const stopAnalysis = () => setIsAnalyzing(false);
  
  return { isAnalyzing, startAnalysis, stopAnalysis };
}
