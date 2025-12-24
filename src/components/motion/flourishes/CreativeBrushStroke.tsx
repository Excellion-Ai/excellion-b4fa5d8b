import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';

interface CreativeBrushStrokeProps {
  className?: string;
}

export function CreativeBrushStroke({ className = "" }: CreativeBrushStrokeProps) {
  const { reducedMotion } = useMotionProfile();

  if (reducedMotion) {
    return (
      <div className={`absolute -z-10 ${className}`}>
        <svg width="200" height="60" viewBox="0 0 200 60">
          <path
            d="M 10 30 Q 50 10, 100 30 T 190 30"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className={`absolute -z-10 ${className}`}
    >
      <svg width="200" height="60" viewBox="0 0 200 60">
        <motion.path
          d="M 10 30 Q 50 10, 100 30 T 190 30"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.5,
            delay: 0.5,
            ease: "easeInOut",
          }}
        />
      </svg>
    </motion.div>
  );
}
