import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';

interface PressurePulseBadgeProps {
  text?: string;
  className?: string;
}

export function PressurePulseBadge({ 
  text = "24/7 Emergency", 
  className = "" 
}: PressurePulseBadgeProps) {
  const { reducedMotion } = useMotionProfile();

  if (reducedMotion) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-sm font-medium ${className}`}>
        <span className="w-2 h-2 bg-red-500 rounded-full" />
        {text}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-sm font-medium ${className}`}
    >
      <motion.span
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-2 h-2 bg-red-500 rounded-full"
      />
      <motion.span
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
