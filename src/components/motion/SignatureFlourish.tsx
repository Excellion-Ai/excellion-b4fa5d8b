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
} from './flourishes';

interface SignatureFlourishProps {
  position?: 'hero' | 'section' | 'background';
  className?: string;
}

export function SignatureFlourish({ position = 'hero', className = '' }: SignatureFlourishProps) {
  const { flourishId } = useMotionProfile();

  if (flourishId === 'none') return null;

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
    none: null,
  };

  return flourishMap[flourishId] || null;
}
