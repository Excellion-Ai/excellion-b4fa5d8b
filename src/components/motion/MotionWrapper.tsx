import { motion, Variants } from 'framer-motion';
import { useMotionProfile } from './MotionProvider';
import { useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  variant?: 'hero' | 'section' | 'card' | 'text' | 'icon';
  className?: string;
  delay?: number;
  once?: boolean;
}

export function MotionWrapper({ 
  children, 
  variant = 'section',
  className = '',
  delay = 0,
  once = true 
}: MotionWrapperProps) {
  const { variants, reducedMotion } = useMotionProfile();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const selectedVariant = variants[variant] as Variants;

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={selectedVariant}
      style={{ willChange: 'transform, opacity' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

interface MotionButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function MotionButton({ children, className = '', onClick, style }: MotionButtonProps) {
  const { variants, reducedMotion } = useMotionProfile();

  if (reducedMotion) {
    return <button className={className} onClick={onClick} style={style}>{children}</button>;
  }

  return (
    <motion.button
      className={className}
      onClick={onClick}
      style={style}
      variants={variants.button}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      {children}
    </motion.button>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
}

export function MotionStaggerContainer({ children, className = '', once = true }: StaggerContainerProps) {
  const { variants, reducedMotion } = useMotionProfile();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-30px' });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants.stagger}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}
