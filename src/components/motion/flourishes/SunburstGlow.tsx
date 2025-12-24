import { motion } from 'framer-motion';

interface SunburstGlowProps {
  className?: string;
}

export function SunburstGlow({ className = '' }: SunburstGlowProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 -translate-y-1/2 translate-x-1/2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <div 
          className="w-full h-full rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, hsl(45 93% 58% / 0.4) 0%, hsl(45 93% 58% / 0.1) 40%, transparent 70%)',
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent, hsl(45 93% 58% / 0.2), transparent, hsl(45 93% 58% / 0.15), transparent)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  );
}
