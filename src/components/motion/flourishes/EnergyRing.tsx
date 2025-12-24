import { motion } from 'framer-motion';

interface EnergyRingProps {
  className?: string;
}

export function EnergyRing({ className = '' }: EnergyRingProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Inner ring */}
        <motion.div
          className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        
        {/* Energy pulse */}
        <motion.div
          className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
}
