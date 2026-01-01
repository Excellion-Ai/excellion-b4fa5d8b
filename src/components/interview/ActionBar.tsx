import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight, Lightbulb, SkipForward } from 'lucide-react';

interface ActionBarProps {
  isLastStep: boolean;
  canProceed: boolean;
  canSubmit: boolean;
  isGenerating: boolean;
  showSkip: boolean;
  onNext: () => void;
  onSkip: () => void;
  onSubmit: () => void;
}

export function ActionBar({
  isLastStep,
  canProceed,
  canSubmit,
  isGenerating,
  showSkip,
  onNext,
  onSkip,
  onSubmit,
}: ActionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="flex items-center justify-center gap-3 pt-4"
    >
      {showSkip && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground gap-1.5"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </Button>
      )}

      {isLastStep ? (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isGenerating}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 gap-2 px-6"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate My Site
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 gap-2 px-6"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}
