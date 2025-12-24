import { motion } from 'framer-motion';

interface PipeTraceLineProps {
  className?: string;
}

export function PipeTraceLine({ className = '' }: PipeTraceLineProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg 
        className="absolute w-full h-full opacity-20"
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 0,50 Q 25,30 50,50 T 100,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{
            pathLength: { duration: 2, ease: 'easeOut' },
            opacity: { duration: 0.5 },
          }}
        />
      </svg>
    </div>
  );
}
