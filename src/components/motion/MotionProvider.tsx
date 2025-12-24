import React, { createContext, useContext, useMemo } from 'react';
import { 
  createMotionSystem, 
  prefersReducedMotion,
  getReducedMotionVariants 
} from '@/lib/motion/motionEngine';
import { MotionProfile, MotionVariants, Niche, FlourishId, BackgroundAccentStyle } from '@/lib/motion/types';

interface MotionContextValue {
  profile: MotionProfile;
  variants: MotionVariants;
  niche: Niche;
  reducedMotion: boolean;
  flourishId: FlourishId;
  backgroundStyle: BackgroundAccentStyle;
  hasMicroEffect: (effect: string) => boolean;
}

const defaultProfile: MotionProfile = {
  packName: 'Default',
  niche: 'GENERIC',
  easing: 'easeOut',
  durations: { fast: 0.2, normal: 0.4, slow: 0.6, reveal: 0.8 },
  stagger: { min: 0.05, max: 0.12 },
  backgroundAccentStyle: 'none',
  signatureFlourishId: 'none',
  microEffects: [],
  seed: 0,
};

const MotionContext = createContext<MotionContextValue | null>(null);

interface MotionProviderProps {
  children: React.ReactNode;
  businessName?: string;
  description?: string;
  services?: string[];
  niche?: Niche;
}

export function MotionProvider({ 
  children, 
  businessName = 'Business',
  description = '',
  services = [],
  niche: forcedNiche,
}: MotionProviderProps) {
  const value = useMemo(() => {
    const reducedMotion = prefersReducedMotion();
    
    const { niche, profile, variants } = createMotionSystem({
      businessName,
      description,
      services,
    });

    // Override niche if explicitly provided
    const finalNiche = forcedNiche || niche;
    const finalProfile = forcedNiche && forcedNiche !== niche
      ? { ...profile, niche: forcedNiche }
      : profile;

    const finalVariants = reducedMotion ? getReducedMotionVariants() : variants;

    return {
      profile: finalProfile,
      variants: finalVariants,
      niche: finalNiche,
      reducedMotion,
      flourishId: finalProfile.signatureFlourishId,
      backgroundStyle: finalProfile.backgroundAccentStyle,
      hasMicroEffect: (effect: string) => finalProfile.microEffects.includes(effect as any),
    };
  }, [businessName, description, services, forcedNiche]);

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionProfile(): MotionContextValue {
  const context = useContext(MotionContext);
  
  if (!context) {
    // Return default context if not within provider
    const reducedMotion = prefersReducedMotion();
    return {
      profile: defaultProfile,
      variants: getReducedMotionVariants(),
      niche: 'GENERIC',
      reducedMotion,
      flourishId: 'none',
      backgroundStyle: 'none',
      hasMicroEffect: () => false,
    };
  }
  
  return context;
}

// Hook for accessing just the variants
export function useMotionVariants() {
  const { variants } = useMotionProfile();
  return variants;
}

// Hook for checking reduced motion preference
export function useReducedMotion() {
  const { reducedMotion } = useMotionProfile();
  return reducedMotion;
}
