import { motion } from 'framer-motion';

interface MenuUnderlineSliderProps {
  className?: string;
}

export function MenuUnderlineSlider({ className = '' }: MenuUnderlineSliderProps) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-1 pointer-events-none ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-transparent via-primary to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.6 }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
          delay: 0.3,
        }}
        style={{ transformOrigin: 'left' }}
      />
      
      {/* Animated highlight */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 4,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
