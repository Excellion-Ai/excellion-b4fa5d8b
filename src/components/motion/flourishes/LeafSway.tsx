import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';

interface LeafSwayProps {
  count?: number;
  className?: string;
}

export function LeafSway({ count = 5, className = "" }: LeafSwayProps) {
  const { reducedMotion, profile } = useMotionProfile();

  if (reducedMotion) {
    return null;
  }

  const leaves = Array.from({ length: count }, (_, i) => {
    const seed = profile.seed + i * 7;
    const x = 10 + (seed % 80);
    const delay = (seed % 8) / 4;
    const duration = 4 + (seed % 3);

    return { id: i, x, delay, duration };
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute text-green-500/40"
          style={{
            left: `${leaf.x}%`,
            top: `${20 + (leaf.id * 15) % 60}%`,
            fontSize: '24px',
          }}
          animate={{
            rotate: [-10, 10, -10],
            x: [-5, 5, -5],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
}
