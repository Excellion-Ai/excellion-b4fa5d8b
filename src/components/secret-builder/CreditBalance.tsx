import { Coins, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCredits, CREDIT_COSTS } from '@/hooks/useCredits';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CreditBalanceProps {
  className?: string;
}

export function CreditBalance({ className }: CreditBalanceProps) {
  const { balance, loading, authenticated, plan } = useCredits();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse", className)}>
        <Coins className="h-3.5 w-3.5" />
        <span>...</span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/auth')}
        className={cn("text-xs gap-1.5", className)}
      >
        <Coins className="h-3.5 w-3.5" />
        Sign in for credits
      </Button>
    );
  }

  const isLow = balance <= 5;
  const isEmpty = balance <= 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isEmpty ? "destructive" : isLow ? "outline" : "ghost"}
            size="sm"
            onClick={() => navigate('/billing')}
            className={cn(
              "text-xs gap-1.5 font-medium",
              isEmpty && "animate-pulse",
              isLow && !isEmpty && "border-yellow-500/50 text-yellow-600 dark:text-yellow-400",
              className
            )}
          >
            {isEmpty ? (
              <AlertCircle className="h-3.5 w-3.5" />
            ) : (
              <Coins className="h-3.5 w-3.5" />
            )}
            <span>{balance} credits</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <p className="font-medium">Credit Costs:</p>
            <ul className="space-y-1">
              <li>• Generation: {CREDIT_COSTS.generation} credits</li>
              <li>• Edit/Modify: {CREDIT_COSTS.edit} credits</li>
              <li>• Chat: {CREDIT_COSTS.chat} credit</li>
              <li>• Image: {CREDIT_COSTS.image} credits</li>
              <li>• Export: {CREDIT_COSTS.export} credits</li>
              <li>• Publish: Free</li>
            </ul>
            {isEmpty && (
              <p className="text-destructive font-medium pt-1">
                No credits remaining. Click to add more.
              </p>
            )}
            {isLow && !isEmpty && (
              <p className="text-yellow-600 dark:text-yellow-400 font-medium pt-1">
                Low credits. Click to add more.
              </p>
            )}
            <p className="text-muted-foreground pt-1">
              Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
