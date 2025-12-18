import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, RefreshCw, AlertTriangle, Info, XCircle } from 'lucide-react';
import { SiteSpec } from '@/types/site-spec';

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  location?: string;
  suggestion: string;
}

interface SecurityScanResult {
  score: number;
  issues: SecurityIssue[];
  scannedAt: Date;
}

// Security patterns to check
const SECURITY_PATTERNS = {
  // Critical issues
  hardcodedSecrets: {
    pattern: /(api[_-]?key|secret|password|token|auth)\s*[:=]\s*['"`][^'"`]{8,}['"`]/gi,
    severity: 'critical' as const,
    category: 'Secrets',
    title: 'Hardcoded Secret Detected',
    description: 'Sensitive credentials found in code',
    suggestion: 'Move secrets to environment variables or a secrets manager'
  },
  sqlInjection: {
    pattern: /(\$\{.*\}|['"`]\s*\+\s*\w+\s*\+\s*['"`]).*?(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)/gi,
    severity: 'critical' as const,
    category: 'Injection',
    title: 'Potential SQL Injection',
    description: 'User input may be directly concatenated into SQL queries',
    suggestion: 'Use parameterized queries or an ORM with proper escaping'
  },
  evalUsage: {
    pattern: /\beval\s*\(/gi,
    severity: 'critical' as const,
    category: 'Code Execution',
    title: 'Unsafe eval() Usage',
    description: 'eval() can execute arbitrary code and is a security risk',
    suggestion: 'Avoid eval(); use safer alternatives like JSON.parse()'
  },
  
  // High severity
  dangerousHtml: {
    pattern: /dangerouslySetInnerHTML|innerHTML\s*=/gi,
    severity: 'high' as const,
    category: 'XSS',
    title: 'Dangerous HTML Injection',
    description: 'Direct HTML injection can lead to XSS attacks',
    suggestion: 'Sanitize HTML content before rendering using DOMPurify'
  },
  unsafeHref: {
    pattern: /href\s*=\s*\{[^}]*\+[^}]*\}/gi,
    severity: 'high' as const,
    category: 'XSS',
    title: 'Unsafe Dynamic URL',
    description: 'Dynamic URLs in href can be exploited for javascript: attacks',
    suggestion: 'Validate URLs and use allowlists for protocols'
  },
  
  // Medium severity
  corsWildcard: {
    pattern: /Access-Control-Allow-Origin['":\s]*['"]\*['"]/gi,
    severity: 'medium' as const,
    category: 'CORS',
    title: 'Permissive CORS Policy',
    description: 'Wildcard CORS allows any origin to access resources',
    suggestion: 'Specify allowed origins explicitly in production'
  },
  httpLinks: {
    pattern: /['"`]http:\/\/(?!localhost|127\.0\.0\.1)/gi,
    severity: 'medium' as const,
    category: 'Transport',
    title: 'Insecure HTTP Link',
    description: 'HTTP links are vulnerable to man-in-the-middle attacks',
    suggestion: 'Use HTTPS for all external resources'
  },
  consoleLog: {
    pattern: /console\.(log|debug|info)\s*\([^)]*password|secret|token|key/gi,
    severity: 'medium' as const,
    category: 'Logging',
    title: 'Sensitive Data in Logs',
    description: 'Logging sensitive information can expose credentials',
    suggestion: 'Remove or mask sensitive data from log statements'
  },
  
  // Low severity
  todoSecurity: {
    pattern: /\/\/\s*(TODO|FIXME|HACK).*?(security|auth|password|secret)/gi,
    severity: 'low' as const,
    category: 'Technical Debt',
    title: 'Security TODO Found',
    description: 'Unresolved security-related TODO comment',
    suggestion: 'Address security TODOs before production deployment'
  },
  
  // Info
  debugMode: {
    pattern: /debug\s*[:=]\s*true/gi,
    severity: 'info' as const,
    category: 'Configuration',
    title: 'Debug Mode Enabled',
    description: 'Debug mode may expose sensitive information',
    suggestion: 'Ensure debug mode is disabled in production'
  }
};

const scanContent = (content: string): SecurityIssue[] => {
  const issues: SecurityIssue[] = [];
  
  Object.entries(SECURITY_PATTERNS).forEach(([id, config]) => {
    const matches = content.match(config.pattern);
    if (matches) {
      matches.forEach((match, index) => {
        // Find approximate line number
        const beforeMatch = content.substring(0, content.indexOf(match));
        const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
        
        issues.push({
          id: `${id}-${index}`,
          severity: config.severity,
          category: config.category,
          title: config.title,
          description: config.description,
          location: `Line ~${lineNumber}`,
          suggestion: config.suggestion
        });
      });
    }
  });
  
  return issues;
};

const calculateScore = (issues: SecurityIssue[]): number => {
  let score = 100;
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 8; break;
      case 'low': score -= 3; break;
      case 'info': score -= 1; break;
    }
  });
  
  return Math.max(0, score);
};

const getSeverityColor = (severity: SecurityIssue['severity']) => {
  switch (severity) {
    case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'info': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getSeverityIcon = (severity: SecurityIssue['severity']) => {
  switch (severity) {
    case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'high': return <ShieldX className="h-4 w-4 text-orange-500" />;
    case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'low': return <ShieldAlert className="h-4 w-4 text-blue-500" />;
    case 'info': return <Info className="h-4 w-4 text-gray-500" />;
  }
};

interface SecurityScanPanelProps {
  siteSpec: SiteSpec | null;
}

export const SecurityScanPanel: React.FC<SecurityScanPanelProps> = ({ siteSpec }) => {
  const [result, setResult] = useState<SecurityScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const runScan = () => {
    setIsScanning(true);
    
    // Simulate async scan
    setTimeout(() => {
      if (!siteSpec) {
        setResult({
          score: 100,
          issues: [],
          scannedAt: new Date()
        });
        setIsScanning(false);
        return;
      }

      // Convert siteSpec to scannable content
      const contentToScan = JSON.stringify(siteSpec, null, 2);
      const issues = scanContent(contentToScan);
      const score = calculateScore(issues);

      setResult({
        score,
        issues,
        scannedAt: new Date()
      });
      setIsScanning(false);
    }, 1000);
  };

  useEffect(() => {
    if (siteSpec) {
      runScan();
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <ShieldCheck className="h-8 w-8 text-green-500" />;
    if (score >= 70) return <Shield className="h-8 w-8 text-yellow-500" />;
    if (score >= 50) return <ShieldAlert className="h-8 w-8 text-orange-500" />;
    return <ShieldX className="h-8 w-8 text-red-500" />;
  };

  const issuesByCategory = result?.issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) acc[issue.severity] = [];
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, SecurityIssue[]>) || {};

  return (
    <div className="h-full flex flex-col">
      {/* Header with Score */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {result ? getScoreIcon(result.score) : <Shield className="h-8 w-8 text-muted-foreground" />}
            <div>
              <div className={`text-2xl font-bold ${result ? getScoreColor(result.score) : 'text-muted-foreground'}`}>
                {result ? `${result.score}/100` : '--'}
              </div>
              <p className="text-xs text-muted-foreground">Security Score</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={runScan}
            disabled={isScanning}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Rescan'}
          </Button>
        </div>

        {result && (
          <div className="flex gap-2 flex-wrap">
            {['critical', 'high', 'medium', 'low', 'info'].map((severity) => {
              const count = issuesByCategory[severity]?.length || 0;
              if (count === 0) return null;
              return (
                <Badge
                  key={severity}
                  variant="outline"
                  className={getSeverityColor(severity as SecurityIssue['severity'])}
                >
                  {count} {severity}
                </Badge>
              );
            })}
            {result.issues.length === 0 && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                No issues found
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Issues List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {!result && !isScanning && (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Click "Rescan" to analyze your site for security issues
              </p>
            </div>
          )}

          {result?.issues.length === 0 && (
            <div className="text-center py-8">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <p className="text-sm font-medium text-green-500">All Clear!</p>
              <p className="text-xs text-muted-foreground mt-1">
                No security issues detected
              </p>
            </div>
          )}

          {result?.issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-start gap-2">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{issue.title}</span>
                    <Badge variant="outline" className="text-[10px] h-4">
                      {issue.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {issue.description}
                  </p>
                  {issue.location && (
                    <p className="text-[10px] text-muted-foreground/60 mb-1">
                      📍 {issue.location}
                    </p>
                  )}
                  <div className="bg-background/50 rounded p-2 text-xs">
                    <span className="font-medium">Fix: </span>
                    {issue.suggestion}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {result && (
        <div className="p-3 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground">
            Last scan: {result.scannedAt.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};
