import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';

interface ListingShimmerLineProps {
  className?: string;
}

export function ListingShimmerLine({ className = "" }: ListingShimmerLineProps) {
  const { reducedMotion } = useMotionProfile();

  if (reducedMotion) {
    return (
      <div className={`h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent ${className}`} />
    );
  }

  return (
    <div className={`relative h-px overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <motion.div
        className="absolute inset-y-0 w-32"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)',
        }}
        animate={{
          x: ['-100%', '400%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
