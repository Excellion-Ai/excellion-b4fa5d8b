import { Variants } from 'framer-motion';
import { 
  Niche, 
  EasingType,
  MotionProfile, 
  MotionVariants, 
  NichePack,
  FlourishId,
  BackgroundAccentStyle,
  MicroEffect,
  MotionIntensity,
} from './types';
import { NICHE_PACKS } from './packs';

// Seeded random number generator for deterministic randomness
export function createSeed(businessName: string, niche: Niche): number {
  let hash = 0;
  const str = `${businessName}-${niche}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// Detect niche from business info
export function detectNiche(input: { 
  businessName?: string; 
  description?: string; 
  services?: string[];
}): Niche {
  const text = [
    input.businessName || '',
    input.description || '',
    ...(input.services || [])
  ].join(' ').toLowerCase();

  // Score each niche based on keyword matches
  let bestNiche: Niche = 'GENERIC';
  let bestScore = 0;

  for (const [niche, pack] of Object.entries(NICHE_PACKS)) {
    const score = pack.keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche as Niche;
    }
  }

  return bestNiche;
}

// Get intensity effect counts
function getIntensityConfig(intensity: MotionIntensity): {
  minEffects: number;
  maxEffects: number;
  showFlourish: boolean;
  showBackgroundAccent: boolean;
  durationMultiplier: number;
} {
  switch (intensity) {
    case 'off':
      return { minEffects: 0, maxEffects: 0, showFlourish: false, showBackgroundAccent: false, durationMultiplier: 1 };
    case 'subtle':
      return { minEffects: 3, maxEffects: 6, showFlourish: false, showBackgroundAccent: false, durationMultiplier: 1.2 };
    case 'premium':
      return { minEffects: 8, maxEffects: 14, showFlourish: true, showBackgroundAccent: true, durationMultiplier: 1 };
    case 'wild':
      return { minEffects: 14, maxEffects: 20, showFlourish: true, showBackgroundAccent: true, durationMultiplier: 0.85 };
    default:
      return { minEffects: 8, maxEffects: 14, showFlourish: true, showBackgroundAccent: true, durationMultiplier: 1 };
  }
}

// Generate motion profile for a niche with intensity
export function pickMotionProfile(niche: Niche, seed: number, intensity: MotionIntensity = 'premium'): MotionProfile {
  const pack = NICHE_PACKS[niche];
  const rng = seededRng(seed);
  const intensityConfig = getIntensityConfig(intensity);
  
  // Pick random flourish from pool using seeded RNG
  const flourishId: FlourishId = intensityConfig.showFlourish && pack.flourishPool.length > 0
    ? pack.flourishPool[Math.floor(rng() * pack.flourishPool.length)]
    : 'none';
  
  // Pick background accent style
  const backgroundAccentStyle: BackgroundAccentStyle = intensityConfig.showBackgroundAccent && pack.backgroundAccents.length > 0
    ? pack.backgroundAccents[Math.floor(rng() * pack.backgroundAccents.length)]
    : 'none';
  
  // Pick micro effects based on intensity
  const effectCount = Math.floor(rng() * (intensityConfig.maxEffects - intensityConfig.minEffects + 1)) + intensityConfig.minEffects;
  const shuffledEffects = [...pack.microEffectPool].sort(() => rng() - 0.5);
  const microEffects: MicroEffect[] = shuffledEffects.slice(0, Math.min(effectCount, shuffledEffects.length));
  
  // Calculate stagger value
  const staggerValue = pack.staggerRange.min + rng() * (pack.staggerRange.max - pack.staggerRange.min);
  
  // Apply duration multiplier based on intensity
  const dm = intensityConfig.durationMultiplier;
  
  return {
    packName: pack.packName,
    niche,
    intensity,
    easing: pack.baseEasing,
    durations: {
      fast: pack.baseDurations.fast * dm,
      normal: pack.baseDurations.normal * dm,
      slow: pack.baseDurations.slow * dm,
      reveal: pack.baseDurations.reveal * dm,
    },
    stagger: {
      min: staggerValue,
      max: staggerValue + 0.05,
    },
    backgroundAccentStyle,
    signatureFlourishId: flourishId,
    microEffects,
    seed,
  };
}

// Convert our easing to framer-motion format
function getEasing(easing: EasingType): any {
  if (Array.isArray(easing)) {
    return easing;
  }
  return easing;
}

// Get hero reveal variants based on pack style
function getHeroVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { reveal: duration } = profile.durations;
  const easing = getEasing(profile.easing);

  const baseHidden = { opacity: 0 };
  const baseVisible = { opacity: 1, transition: { duration, ease: easing } };

  switch (pack.heroRevealStyle) {
    case 'maskUp':
      return {
        hidden: { ...baseHidden, y: 60, clipPath: 'inset(100% 0 0 0)' },
        visible: { 
          ...baseVisible, 
          y: 0, 
          clipPath: 'inset(0% 0 0 0)',
          transition: { duration: duration * 1.2, ease: easing }
        },
      };
    case 'fadeBlur':
      return {
        hidden: { ...baseHidden, filter: 'blur(12px)', y: 30 },
        visible: { 
          ...baseVisible, 
          filter: 'blur(0px)', 
          y: 0,
          transition: { duration, ease: easing }
        },
      };
    case 'scaleRotate':
      return {
        hidden: { ...baseHidden, scale: 0.85, rotate: -3 },
        visible: { 
          ...baseVisible, 
          scale: 1, 
          rotate: 0,
          transition: { duration, ease: easing }
        },
      };
    case 'slideIn':
      return {
        hidden: { ...baseHidden, x: -80 },
        visible: { 
          ...baseVisible, 
          x: 0,
          transition: { duration, ease: easing }
        },
      };
    case 'typewriter':
      return {
        hidden: { ...baseHidden, clipPath: 'inset(0 100% 0 0)' },
        visible: { 
          ...baseVisible, 
          clipPath: 'inset(0 0% 0 0)',
          transition: { duration: duration * 1.5, ease: easing }
        },
      };
    default:
      return {
        hidden: baseHidden,
        visible: baseVisible,
      };
  }
}

// Get section reveal variants
function getSectionVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { normal: duration } = profile.durations;
  const easing = getEasing(profile.easing);

  return {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration, ease: easing }
    },
  };
}

// Get card variants
function getCardVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { fast, normal } = profile.durations;
  const easing = getEasing(profile.easing);

  const enterVariants: Record<string, any> = {
    fadeUp: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
    scaleIn: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
    slideRight: { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } },
    flipIn: { hidden: { opacity: 0, rotateY: 90 }, visible: { opacity: 1, rotateY: 0 } },
    bounceIn: { hidden: { opacity: 0, scale: 0.6 }, visible: { opacity: 1, scale: 1 } },
  };

  const hoverVariants: Record<string, any> = {
    lift: { y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
    glow: { boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' },
    tilt: { rotateX: 5, rotateY: 5 },
    pulse: { scale: 1.03 },
    border: { borderColor: 'rgba(59, 130, 246, 0.5)' },
  };

  const enter = enterVariants[pack.cardEnterStyle] || enterVariants.fadeUp;
  const hover = hoverVariants[pack.cardHoverStyle] || hoverVariants.lift;

  return {
    hidden: enter.hidden,
    visible: { 
      ...enter.visible,
      transition: { duration: normal, ease: easing }
    },
    hover: {
      ...hover,
      transition: { duration: fast, ease: easing }
    },
  };
}

// Get button variants
function getButtonVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { fast } = profile.durations;
  const easing = getEasing(profile.easing);

  const hoverVariants: Record<string, any> = {
    sheen: { scale: 1.02 },
    scale: { scale: 1.05 },
    glow: { boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)' },
    bounce: { scale: 1.05, y: -2 },
    fill: { scale: 1.02 },
  };

  const hover = hoverVariants[pack.ctaHoverStyle] || hoverVariants.sheen;

  return {
    initial: { scale: 1 },
    hover: {
      ...hover,
      transition: { duration: fast, ease: easing }
    },
    tap: {
      scale: 0.97,
      transition: { duration: fast * 0.5 }
    },
  };
}

// Get nav variants
function getNavVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { fast, normal } = profile.durations;
  const easing = getEasing(profile.easing);

  const styleVariants: Record<string, Variants> = {
    fadeSlide: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0, transition: { duration: normal, ease: easing } },
    },
    stagger: {
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0, transition: { duration: fast, ease: easing } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: normal, ease: easing } },
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(8px)' },
      visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: normal, ease: easing } },
    },
  };

  return styleVariants[pack.navBehavior] || styleVariants.fadeSlide;
}

// Get accordion variants
function getAccordionVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { fast, normal } = profile.durations;
  const easing = getEasing(profile.easing);

  return {
    collapsed: { 
      height: 0, 
      opacity: 0,
      transition: { duration: fast, ease: easing }
    },
    expanded: { 
      height: 'auto', 
      opacity: 1,
      transition: { duration: normal, ease: easing }
    },
  };
}

// Get image variants
function getImageVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { fast } = profile.durations;
  const easing = getEasing(profile.easing);

  return {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: fast, ease: easing }
    },
  };
}

// Get stagger container variants
function getStaggerVariants(profile: MotionProfile): Variants {
  const { stagger } = profile;
  const avgStagger = (stagger.min + stagger.max) / 2;

  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: avgStagger,
        delayChildren: 0.1,
      }
    },
  };
}

// Get text reveal variants
function getTextVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { normal } = profile.durations;
  const easing = getEasing(profile.easing);

  return {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: normal, ease: easing }
    },
  };
}

// Get icon animation variants
function getIconVariants(pack: NichePack, profile: MotionProfile): Variants {
  const { fast } = profile.durations;
  const easing = getEasing(profile.easing);

  return {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: 5,
      transition: { duration: fast, ease: easing }
    },
  };
}

// Main function to get all variants from a profile
export function getVariants(profile: MotionProfile): MotionVariants {
  const pack = NICHE_PACKS[profile.niche];

  return {
    hero: getHeroVariants(pack, profile),
    section: getSectionVariants(pack, profile),
    card: getCardVariants(pack, profile),
    button: getButtonVariants(pack, profile),
    nav: getNavVariants(pack, profile),
    accordion: getAccordionVariants(pack, profile),
    image: getImageVariants(pack, profile),
    stagger: getStaggerVariants(profile),
    text: getTextVariants(pack, profile),
    icon: getIconVariants(pack, profile),
  };
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get reduced motion variants (minimal animations)
export function getReducedMotionVariants(): MotionVariants {
  const instant = { duration: 0.001 };
  const simple = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: instant },
  };

  return {
    hero: simple,
    section: simple,
    card: { ...simple, hover: {} },
    button: { initial: {}, hover: {}, tap: {} },
    nav: simple,
    accordion: {
      collapsed: { height: 0, opacity: 0, transition: instant },
      expanded: { height: 'auto', opacity: 1, transition: instant },
    },
    image: { initial: {}, hover: {} },
    stagger: { hidden: {}, visible: { transition: { staggerChildren: 0 } } },
    text: simple,
    icon: { initial: {}, hover: {} },
  };
}

// Export a convenience function for full pipeline
export function createMotionSystem(input: {
  businessName: string;
  description?: string;
  services?: string[];
}): {
  niche: Niche;
  profile: MotionProfile;
  variants: MotionVariants;
} {
  const niche = detectNiche(input);
  const seed = createSeed(input.businessName, niche);
  const profile = pickMotionProfile(niche, seed);
  const variants = prefersReducedMotion() 
    ? getReducedMotionVariants() 
    : getVariants(profile);

  return { niche, profile, variants };
}
