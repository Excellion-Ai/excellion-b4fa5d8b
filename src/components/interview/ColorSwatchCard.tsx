import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSwatchCardProps {
  label: string;
  primaryColor?: string;
  accentColor?: string;
  isCustom?: boolean;
  selected?: boolean;
  onClick: () => void;
  delay?: number;
}

export function ColorSwatchCard({ 
  label, 
  primaryColor, 
  accentColor, 
  isCustom,
  selected, 
  onClick, 
  delay = 0 
}: ColorSwatchCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200',
        'hover:shadow-lg hover:shadow-primary/10',
        selected
          ? 'border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20'
          : 'border-border/50 hover:border-primary/50'
      )}
    >
      {/* Selection checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md"
        >
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </motion.div>
      )}

      {/* Color Preview */}
      {isCustom ? (
        <div className="h-20 bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-dashed border-border">
            <Palette className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div className="h-20 flex">
          <div 
            className="flex-1" 
            style={{ backgroundColor: primaryColor }}
          />
          <div 
            className="w-1/3" 
            style={{ backgroundColor: accentColor }}
          />
        </div>
      )}

      {/* Label */}
      <div className={cn(
        'px-3 py-3 text-center transition-colors',
        'bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm',
        selected ? 'text-foreground' : 'text-foreground/80'
      )}>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </motion.button>
  );
}
