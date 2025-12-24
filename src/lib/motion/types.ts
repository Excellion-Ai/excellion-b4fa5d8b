import { Variants } from 'framer-motion';

export type Niche = 
  | 'HOME_SERVICES'
  | 'AGRICULTURE'
  | 'FITNESS'
  | 'RESTAURANT'
  | 'REAL_ESTATE'
  | 'HEALTH'
  | 'LEGAL'
  | 'CREATIVE'
  | 'SAAS'
  | 'RETAIL'
  | 'EDUCATION'
  | 'AUTOMOTIVE'
  | 'BEAUTY'
  | 'GENERIC';

export type EasingType = 
  | 'easeOut'
  | 'easeIn'
  | 'easeInOut'
  | 'circOut'
  | 'backOut'
  | 'anticipate'
  | [number, number, number, number];

export type BackgroundAccentStyle = 
  | 'orbs'
  | 'lines'
  | 'grain'
  | 'grid'
  | 'dots'
  | 'waves'
  | 'none';

export type MicroEffect = 
  | 'iconPulse'
  | 'textShimmer'
  | 'borderGlow'
  | 'shadowLift'
  | 'gradientShift'
  | 'scaleOnHover'
  | 'rotateIcon'
  | 'underlineSlide'
  | 'buttonSheen'
  | 'imageZoom'
  | 'cardTilt'
  | 'numberCount'
  | 'progressFill'
  | 'dotPulse'
  | 'arrowBounce'
  | 'checkmarkDraw'
  | 'rippleEffect'
  | 'glowPulse';

export type FlourishId = 
  | 'pressurePulseBadge'
  | 'pollenFloat'
  | 'leafSway'
  | 'repCounter'
  | 'energySweepUnderline'
  | 'steamWisp'
  | 'listingShimmerLine'
  | 'gridParallaxGlow'
  | 'legalScaleBalance'
  | 'heartbeatPulse'
  | 'creativeBrushStroke'
  | 'none';

export interface MotionProfile {
  packName: string;
  niche: Niche;
  easing: EasingType;
  durations: {
    fast: number;
    normal: number;
    slow: number;
    reveal: number;
  };
  stagger: {
    min: number;
    max: number;
  };
  backgroundAccentStyle: BackgroundAccentStyle;
  signatureFlourishId: FlourishId;
  microEffects: MicroEffect[];
  seed: number;
}

export interface MotionVariants {
  hero: Variants;
  section: Variants;
  card: Variants;
  button: Variants;
  nav: Variants;
  accordion: Variants;
  image: Variants;
  stagger: Variants;
  text: Variants;
  icon: Variants;
}

export interface NichePack {
  niche: Niche;
  packName: string;
  keywords: string[];
  baseEasing: EasingType;
  baseDurations: {
    fast: number;
    normal: number;
    slow: number;
    reveal: number;
  };
  staggerRange: { min: number; max: number };
  heroRevealStyle: 'maskUp' | 'fadeBlur' | 'scaleRotate' | 'slideIn' | 'typewriter';
  cardEnterStyle: 'fadeUp' | 'scaleIn' | 'slideRight' | 'flipIn' | 'bounceIn';
  cardHoverStyle: 'lift' | 'glow' | 'tilt' | 'pulse' | 'border';
  ctaHoverStyle: 'sheen' | 'scale' | 'glow' | 'bounce' | 'fill';
  navBehavior: 'fadeSlide' | 'stagger' | 'scale' | 'blur';
  flourishPool: FlourishId[];
  backgroundAccents: BackgroundAccentStyle[];
  microEffectPool: MicroEffect[];
}
