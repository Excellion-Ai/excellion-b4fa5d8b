import { motion } from 'framer-motion';
import { LucideIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  onClick: () => void;
  delay?: number;
}

export function OptionCard({ icon: Icon, label, selected, onClick, delay = 0 }: OptionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 p-5 rounded-xl border transition-all duration-200',
        'bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm',
        'hover:shadow-lg hover:shadow-primary/10',
        selected
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
          : 'border-border/50 hover:border-primary/50'
      )}
    >
      {/* Selection checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}

      {/* Icon */}
      <div className={cn(
        'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
        selected ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
      )}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Label */}
      <span className={cn(
        'text-sm font-medium text-center transition-colors',
        selected ? 'text-foreground' : 'text-foreground/80'
      )}>
        {label}
      </span>
    </motion.button>
  );
}
