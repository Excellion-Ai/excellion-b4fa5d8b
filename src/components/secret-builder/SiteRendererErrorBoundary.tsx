import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onHeal?: (errorMessage: string, componentStack: string) => void;
  siteName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isHealing: boolean;
}

export class SiteRendererErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isHealing: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SiteRenderer Error]', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, isHealing: false });
    this.props.onRetry?.();
  };

  handleHeal = async () => {
    const { error, errorInfo } = this.state;
    if (!error || !this.props.onHeal) return;
    
    this.setState({ isHealing: true });
    
    const errorMessage = `${error.name}: ${error.message}`;
    const componentStack = errorInfo?.componentStack || 'No stack available';
    
    try {
      await this.props.onHeal(errorMessage, componentStack);
      // Reset error state after healing attempt
      this.setState({ hasError: false, error: null, errorInfo: null, isHealing: false });
    } catch (healError) {
      console.error('[Heal failed]', healError);
      this.setState({ isHealing: false });
    }
  };

  render() {
    const { hasError, error, isHealing } = this.state;
    const { children, siteName, onHeal } = this.props;

    if (hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="max-w-md mx-auto p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Preview Error
              </h3>
              <p className="text-sm text-muted-foreground">
                {siteName ? `"${siteName}" encountered` : 'The site preview encountered'} a rendering issue. 
                This can happen with complex layouts or malformed content.
              </p>
            </div>

            {error && (
              <div className="bg-muted/50 rounded-lg p-3 text-left">
                <code className="text-xs text-destructive break-all">
                  {error.message.slice(0, 200)}
                  {error.message.length > 200 && '...'}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              {onHeal && (
                <Button
                  onClick={this.handleHeal}
                  disabled={isHealing}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {isHealing ? 'Fixing...' : 'Ask AI to Fix'}
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              If the issue persists, try regenerating the site or editing the content.
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}
