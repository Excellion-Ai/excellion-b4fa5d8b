import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';
import { Scale } from 'lucide-react';

interface LegalScaleBalanceProps {
  className?: string;
}

export function LegalScaleBalance({ className = "" }: LegalScaleBalanceProps) {
  const { reducedMotion } = useMotionProfile();

  if (reducedMotion) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Scale className="w-8 h-8 text-primary/50" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <motion.div
        animate={{ rotate: [-3, 3, -3] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Scale className="w-8 h-8 text-primary/50" />
      </motion.div>
    </motion.div>
  );
}
