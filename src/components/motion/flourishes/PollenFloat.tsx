import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';

interface PollenFloatProps {
  count?: number;
  className?: string;
}

export function PollenFloat({ count = 8, className = "" }: PollenFloatProps) {
  const { reducedMotion, profile } = useMotionProfile();

  if (reducedMotion) {
    return null;
  }

  const particles = Array.from({ length: count }, (_, i) => {
    const seed = profile.seed + i;
    const x = (seed % 100);
    const delay = (seed % 10) / 10;
    const duration = 15 + (seed % 10);
    const size = 3 + (seed % 4);

    return { id: i, x, delay, duration, size };
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-400/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: '-10px',
          }}
          animate={{
            y: [0, -800],
            x: [0, Math.sin(p.id) * 50, 0],
            opacity: [0, 0.6, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
