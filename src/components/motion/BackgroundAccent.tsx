import { motion } from 'framer-motion';
import { useMotionProfile } from './MotionProvider';

interface BackgroundAccentProps {
  className?: string;
  position?: 'hero' | 'section';
}

export function BackgroundAccent({ className = '', position = 'hero' }: BackgroundAccentProps) {
  const { backgroundStyle, intensity, reducedMotion } = useMotionProfile();

  // Don't render for off/subtle intensity or reduced motion
  if (intensity === 'off' || intensity === 'subtle' || backgroundStyle === 'none') {
    return null;
  }

  const baseClasses = `absolute inset-0 pointer-events-none overflow-hidden ${className}`;

  // Reduced motion = static background only
  if (reducedMotion) {
    return (
      <div className={baseClasses}>
        <StaticAccent style={backgroundStyle} />
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <AccentRenderer style={backgroundStyle} position={position} />
    </div>
  );
}

function StaticAccent({ style }: { style: string }) {
  switch (style) {
    case 'orbs':
      return (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
        </div>
      );
    case 'grid':
      return (
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      );
    case 'dots':
      return (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      );
    case 'grain':
      return (
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      );
    default:
      return null;
  }
}

function AccentRenderer({ style, position }: { style: string; position: string }) {
  switch (style) {
    case 'orbs':
      return <OrbsAccent position={position} />;
    case 'grid':
      return <GridAccent />;
    case 'dots':
      return <DotsAccent />;
    case 'lines':
      return <LinesAccent />;
    case 'grain':
      return <GrainAccent />;
    case 'waves':
      return <WavesAccent />;
    default:
      return null;
  }
}

function OrbsAccent({ position }: { position: string }) {
  const isHero = position === 'hero';
  
  return (
    <div className="absolute inset-0 opacity-25">
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-primary/40 blur-3xl"
        style={{ top: '10%', left: '15%' }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-accent/30 blur-3xl"
        style={{ bottom: '20%', right: '20%' }}
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 25, -15, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      {isHero && (
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-secondary/20 blur-2xl"
          style={{ top: '50%', left: '60%' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
}

function GridAccent() {
  return (
    <motion.div 
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
      animate={{
        backgroundPosition: ['0px 0px', '40px 40px'],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

function DotsAccent() {
  return (
    <motion.div 
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
      animate={{
        opacity: [0.08, 0.12, 0.08],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function LinesAccent() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <motion.div
        className="absolute w-[200%] h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        style={{ top: '30%', left: '-50%', rotate: '-45deg' }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="absolute w-[200%] h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        style={{ top: '60%', left: '-50%', rotate: '-45deg' }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
          delay: 3,
        }}
      />
    </div>
  );
}

function GrainAccent() {
  return (
    <motion.div 
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
      animate={{
        opacity: [0.03, 0.05, 0.03],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function WavesAccent() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      <motion.div
        className="absolute inset-x-0 h-64 -bottom-32"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)',
          borderRadius: '50% 50% 0 0',
        }}
        animate={{
          scaleY: [1, 1.1, 1],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute inset-x-0 h-48 -bottom-24"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(var(--accent) / 0.08) 50%, transparent 100%)',
          borderRadius: '50% 50% 0 0',
        }}
        animate={{
          scaleY: [1, 1.15, 1],
          y: [0, -8, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
}
