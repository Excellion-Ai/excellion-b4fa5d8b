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
  const { balance, loading, authenticated, plan, totalEarned } = useCredits();
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

  // Calculate percentage based on totalEarned (or use balance as max if totalEarned is 0)
  const maxCredits = totalEarned > 0 ? totalEarned : Math.max(balance, 100);
  const percentage = maxCredits > 0 ? (balance / maxCredits) * 100 : 0;
  
  // Color classes based on percentage thresholds
  const getColorClasses = () => {
    if (percentage >= 50) {
      return "text-green-600 dark:text-green-400 border-green-500/50";
    } else if (percentage >= 25) {
      return "text-yellow-600 dark:text-yellow-400 border-yellow-500/50";
    } else {
      return "text-red-600 dark:text-red-400 border-red-500/50";
    }
  };

  const isEmpty = balance <= 0;
  const colorClasses = getColorClasses();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/billing')}
            className={cn(
              "text-xs gap-1 sm:gap-1.5 font-medium px-2 sm:px-3",
              colorClasses,
              isEmpty && "animate-pulse",
              className
            )}
          >
            {isEmpty ? (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Coins className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="hidden sm:inline">{balance} credits</span>
            <span className="sm:hidden">{balance}</span>
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
            <p className={cn("font-medium pt-1", colorClasses)}>
              {Math.round(percentage)}% remaining
            </p>
            {isEmpty && (
              <p className="text-destructive font-medium pt-1">
                No credits remaining. Click to add more.
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
