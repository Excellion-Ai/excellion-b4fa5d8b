import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <motion.div
          key={step}
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: step === currentStep ? 1.2 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            'rounded-full transition-all duration-300',
            step === currentStep
              ? 'w-3 h-3 bg-primary shadow-lg shadow-primary/40'
              : step < currentStep
              ? 'w-2.5 h-2.5 bg-primary/60'
              : 'w-2.5 h-2.5 bg-border/80'
          )}
        />
      ))}
    </div>
  );
}
