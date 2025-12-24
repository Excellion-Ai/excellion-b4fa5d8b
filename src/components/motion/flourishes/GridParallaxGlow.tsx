import { motion } from 'framer-motion';
import { useMotionProfile } from '../MotionProvider';

interface GridParallaxGlowProps {
  className?: string;
}

export function GridParallaxGlow({ className = "" }: GridParallaxGlowProps) {
  const { reducedMotion, profile } = useMotionProfile();

  if (reducedMotion) {
    return (
      <div 
        className={`absolute inset-0 pointer-events-none opacity-20 ${className}`}
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    );
  }

  const glows = [
    { x: 20, y: 30, delay: 0 },
    { x: 70, y: 60, delay: 1 },
    { x: 40, y: 80, delay: 2 },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Floating glow orbs */}
      {glows.map((glow, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full"
          style={{
            left: `${glow.x}%`,
            top: `${glow.y}%`,
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            delay: glow.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
