import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';

interface EnergySweepUnderlineProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function EnergySweepUnderline({ 
  children, 
  color = "hsl(var(--primary))",
  className = "" 
}: EnergySweepUnderlineProps) {
  const { reducedMotion } = useMotionProfile();

  if (reducedMotion) {
    return (
      <span className={`relative inline-block ${className}`}>
        {children}
        <span 
          className="absolute bottom-0 left-0 w-full h-1 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 h-1 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{
          duration: 0.6,
          delay: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </span>
  );
}
