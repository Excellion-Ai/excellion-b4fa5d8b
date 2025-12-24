import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';

interface SteamWispProps {
  count?: number;
  className?: string;
}

export function SteamWisp({ count = 3, className = "" }: SteamWispProps) {
  const { reducedMotion, profile } = useMotionProfile();

  if (reducedMotion) {
    return null;
  }

  const wisps = Array.from({ length: count }, (_, i) => {
    const seed = profile.seed + i * 13;
    const x = 30 + (seed % 40);
    const delay = (seed % 5) / 2;
    const duration = 4 + (seed % 3);

    return { id: i, x, delay, duration };
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {wisps.map((wisp) => (
        <motion.div
          key={wisp.id}
          className="absolute"
          style={{
            left: `${wisp.x}%`,
            bottom: '20%',
          }}
        >
          <motion.div
            className="w-8 h-16 rounded-full"
            style={{
              background: 'linear-gradient(to top, transparent, rgba(255,255,255,0.15))',
              filter: 'blur(8px)',
            }}
            animate={{
              y: [0, -60, -120],
              opacity: [0, 0.4, 0],
              scaleX: [1, 1.5, 2],
              scaleY: [1, 1.2, 0.8],
            }}
            transition={{
              duration: wisp.duration,
              delay: wisp.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
