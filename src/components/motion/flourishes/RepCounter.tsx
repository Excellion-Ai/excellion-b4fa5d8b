import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';
import { useState, useEffect } from 'react';

interface RepCounterProps {
  targetNumber?: number;
  label?: string;
  className?: string;
}

export function RepCounter({ 
  targetNumber = 500, 
  label = "reps completed",
  className = "" 
}: RepCounterProps) {
  const { reducedMotion } = useMotionProfile();
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (reducedMotion || hasAnimated) {
      setCount(targetNumber);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = targetNumber / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNumber) {
        setCount(targetNumber);
        setHasAnimated(true);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetNumber, reducedMotion, hasAnimated]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`inline-flex flex-col items-center ${className}`}
    >
      <motion.span
        className="text-4xl font-bold text-primary"
        animate={!reducedMotion ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        key={count}
      >
        {count.toLocaleString()}+
      </motion.span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </motion.div>
  );
}
