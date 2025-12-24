import { motion } from 'framer-motion';

interface CircuitGlowTraceProps {
  className?: string;
}

export function CircuitGlowTrace({ className = '' }: CircuitGlowTraceProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg 
        className="absolute w-full h-full opacity-20"
        viewBox="0 0 200 100" 
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Circuit path 1 */}
        <motion.path
          d="M 0,20 H 30 V 40 H 60 V 20 H 90"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        
        {/* Circuit path 2 */}
        <motion.path
          d="M 110,80 H 140 V 60 H 170 V 80 H 200"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
        />
        
        {/* Glow dots */}
        <motion.circle
          cx="30"
          cy="20"
          r="2"
          fill="hsl(var(--primary))"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        <motion.circle
          cx="140"
          cy="80"
          r="2"
          fill="hsl(var(--accent))"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />
      </svg>
    </div>
  );
}
