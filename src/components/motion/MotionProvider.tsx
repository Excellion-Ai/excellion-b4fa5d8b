import React, { createContext, useContext, useMemo } from 'react';
import { 
  createMotionSystem, 
  prefersReducedMotion,
  getReducedMotionVariants,
  detectNiche,
  createSeed,
  pickMotionProfile,
  getVariants,
} from '@/lib/motion/motionEngine';
import { MotionProfile, MotionVariants, Niche, FlourishId, BackgroundAccentStyle, MotionIntensity } from '@/lib/motion/types';

interface MotionContextValue {
  profile: MotionProfile;
  variants: MotionVariants;
  niche: Niche;
  intensity: MotionIntensity;
  reducedMotion: boolean;
  flourishId: FlourishId;
  backgroundStyle: BackgroundAccentStyle;
  hasMicroEffect: (effect: string) => boolean;
}

const defaultProfile: MotionProfile = {
  packName: 'Default',
  niche: 'GENERIC',
  intensity: 'premium',
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
  intensity?: MotionIntensity;
}

export function MotionProvider({ 
  children, 
  businessName = 'Business',
  description = '',
  services = [],
  niche: forcedNiche,
  intensity = 'premium',
}: MotionProviderProps) {
  const value = useMemo(() => {
    const reducedMotion = prefersReducedMotion();
    
    // Detect niche from business info
    const detectedNiche = detectNiche({ businessName, description, services });
    const finalNiche = forcedNiche || detectedNiche;
    
    // Create seed for deterministic randomness
    const seed = createSeed(businessName, finalNiche);
    
    // Apply intensity (if off or reduced motion, use minimal)
    const effectiveIntensity = reducedMotion ? 'off' : intensity;
    
    // Generate profile with intensity
    const profile = pickMotionProfile(finalNiche, seed, effectiveIntensity);
    
    // Get variants (reduced motion gets minimal variants)
    const variants = reducedMotion || intensity === 'off' 
      ? getReducedMotionVariants() 
      : getVariants(profile);

    return {
      profile,
      variants,
      niche: finalNiche,
      intensity: effectiveIntensity,
      reducedMotion,
      flourishId: profile.signatureFlourishId,
      backgroundStyle: profile.backgroundAccentStyle,
      hasMicroEffect: (effect: string) => profile.microEffects.includes(effect as any),
    };
  }, [businessName, description, services, forcedNiche, intensity]);

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
      intensity: 'premium',
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

// Hook for checking motion intensity
export function useMotionIntensity() {
  const { intensity } = useMotionProfile();
  return intensity;
}
