import { FlourishId } from '@/lib/motion/types';
import { useMotionProfile } from './MotionProvider';
import {
  PressurePulseBadge,
  PollenFloat,
  LeafSway,
  RepCounter,
  EnergySweepUnderline,
  SteamWisp,
  ListingShimmerLine,
  GridParallaxGlow,
  LegalScaleBalance,
  HeartbeatPulse,
  CreativeBrushStroke,
  PipeTraceLine,
  SunburstGlow,
  CircuitGlowTrace,
  EnergyRing,
  TrustBadgeShine,
  ConfettiSparkle,
  MenuUnderlineSlider,
} from './flourishes';

interface SignatureFlourishProps {
  position?: 'hero' | 'section' | 'background';
  className?: string;
}

export function SignatureFlourish({ position = 'hero', className = '' }: SignatureFlourishProps) {
  const { flourishId, intensity } = useMotionProfile();

  // Don't render for off intensity
  if (intensity === 'off' || flourishId === 'none') return null;

  const flourishMap: Record<FlourishId, React.ReactNode> = {
    pressurePulseBadge: <PressurePulseBadge className={className} />,
    pollenFloat: <PollenFloat className={className} />,
    leafSway: <LeafSway className={className} />,
    repCounter: <RepCounter className={className} />,
    energySweepUnderline: null,
    steamWisp: <SteamWisp className={className} />,
    listingShimmerLine: <ListingShimmerLine className={className} />,
    gridParallaxGlow: <GridParallaxGlow className={className} />,
    legalScaleBalance: <LegalScaleBalance className={className} />,
    heartbeatPulse: <HeartbeatPulse className={className} />,
    creativeBrushStroke: <CreativeBrushStroke className={className} />,
    // New flourishes
    pipeTraceLine: <PipeTraceLine className={className} />,
    sunburstGlow: <SunburstGlow className={className} />,
    circuitGlowTrace: <CircuitGlowTrace className={className} />,
    energyRing: <EnergyRing className={className} />,
    trustBadgeShine: <TrustBadgeShine className={className} />,
    confettiSparkle: <ConfettiSparkle className={className} />,
    menuUnderlineSlider: <MenuUnderlineSlider className={className} />,
    none: null,
  };

  return flourishMap[flourishId] || null;
}
