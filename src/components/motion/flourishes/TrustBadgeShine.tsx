import { motion } from 'framer-motion';

interface TrustBadgeShineProps {
  className?: string;
}

export function TrustBadgeShine({ className = '' }: TrustBadgeShineProps) {
  return (
    <motion.div 
      className={`absolute top-4 right-4 pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'backOut', delay: 0.5 }}
    >
      <div className="relative">
        {/* Badge background */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 0 0 hsl(var(--primary) / 0.2)',
                '0 0 0 8px hsl(var(--primary) / 0)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          >
            {/* Checkmark or shield icon */}
            <svg 
              className="w-6 h-6 text-primary"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
              />
            </svg>
          </motion.div>
        </div>
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ transform: 'skewX(-20deg)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
