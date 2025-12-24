import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';
import { Heart } from 'lucide-react';

interface HeartbeatPulseProps {
  className?: string;
}

export function HeartbeatPulse({ className = "" }: HeartbeatPulseProps) {
  const { reducedMotion } = useMotionProfile();

  if (reducedMotion) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1, 1.15, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: "easeInOut",
        }}
      >
        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
      </motion.div>
    </motion.div>
  );
}
