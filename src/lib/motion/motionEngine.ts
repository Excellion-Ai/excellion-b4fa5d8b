import { Variants } from 'framer-motion';
import { 
  Niche, 
  MotionProfile, 
  MotionVariants, 
  EasingType,
  MicroEffect,
  FlourishId,
  BackgroundAccentStyle,
  NichePack
} from './types';
import { NICHE_PACKS, ALL_NICHES } from './packs';

// Deterministic seed from string
export function createSeed(businessName: string, niche: Niche): number {
  const str = `${businessName.toLowerCase().trim()}-${niche}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Seeded random number generator (mulberry32)
export function seededRng(seed: number): () => number {
  let state = seed;
  return function() {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Detect niche from business info
export function detectNiche(input: { 
  businessName?: string; 
  description?: string; 
  services?: string[] 
}): Niche {
  const text = [
    input.businessName || '',
    input.description || '',
    ...(input.services || [])
  ].join(' ').toLowerCase();

  // Score each niche by keyword matches
  let bestNiche: Niche = 'GENERIC';
  let bestScore = 0;

  for (const niche of ALL_NICHES) {
    if (niche === 'GENERIC') continue;
    
    const pack = NICHE_PACKS[niche];
    let score = 0;
    
    for (const keyword of pack.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length; // Longer keywords = more specific = higher score
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche;
    }
  }

  return bestNiche;
}

// Pick items from array using seeded RNG
function pickFromArray<T>(arr: T[], rng: () => number, count: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

// Pick single item from array
function pickOne<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Slight variation on a number
function vary(base: number, rng: () => number, variance: number = 0.15): number {
  const factor = 1 + (rng() - 0.5) * variance * 2;
  return Math.round(base * factor * 1000) / 1000;
}

// Create motion profile from niche and seed
export function pickMotionProfile(niche: Niche, seed: number): MotionProfile {
  const pack = NICHE_PACKS[niche];
  const rng = seededRng(seed);

  // Vary durations slightly based on seed
  const durations = {
    fast: vary(pack.baseDurations.fast, rng),
    normal: vary(pack.baseDurations.normal, rng),
    slow: vary(pack.baseDurations.slow, rng),
    reveal: vary(pack.baseDurations.reveal, rng),
  };

  // Vary stagger
  const staggerBase = pack.staggerRange.min + rng() * (pack.staggerRange.max - pack.staggerRange.min);
  const stagger = {
    min: staggerBase * 0.8,
    max: staggerBase * 1.2,
  };

  // Pick background accent
  const backgroundAccentStyle = pickOne(pack.backgroundAccents, rng);

  // Pick signature flourish
  const signatureFlourishId = pickOne(pack.flourishPool, rng);

  // Pick 10-18 micro effects
  const effectCount = 10 + Math.floor(rng() * 9);
  const microEffects = pickFromArray(pack.microEffectPool, rng, effectCount);

  return {
    packName: pack.packName,
    niche,
    easing: pack.baseEasing,
    durations,
    stagger,
    backgroundAccentStyle,
    signatureFlourishId,
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
