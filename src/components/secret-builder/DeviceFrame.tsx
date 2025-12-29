import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DeviceType = 'iphone-15' | 'iphone-se' | 'pixel-8' | 'galaxy-s24' | 'ipad' | 'ipad-mini' | 'none';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface DeviceFrameProps {
  children: ReactNode;
  deviceType: DeviceType;
  previewMode: PreviewMode;
  showSafeAreas?: boolean;
  showTouchZones?: boolean;
  className?: string;
}

const deviceConfigs: Record<DeviceType, {
  name: string;
  width: number;
  height: number;
  notchType: 'dynamic-island' | 'notch' | 'punch-hole' | 'none';
  cornerRadius: number;
  safeAreaTop: number;
  safeAreaBottom: number;
  bezelColor: string;
}> = {
  'iphone-15': {
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    notchType: 'dynamic-island',
    cornerRadius: 55,
    safeAreaTop: 59,
    safeAreaBottom: 34,
    bezelColor: '#1a1a1a',
  },
  'iphone-se': {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    notchType: 'none',
    cornerRadius: 40,
    safeAreaTop: 20,
    safeAreaBottom: 0,
    bezelColor: '#2a2a2a',
  },
  'pixel-8': {
    name: 'Pixel 8',
    width: 412,
    height: 915,
    notchType: 'punch-hole',
    cornerRadius: 45,
    safeAreaTop: 48,
    safeAreaBottom: 24,
    bezelColor: '#1f1f1f',
  },
  'galaxy-s24': {
    name: 'Galaxy S24',
    width: 412,
    height: 915,
    notchType: 'punch-hole',
    cornerRadius: 42,
    safeAreaTop: 44,
    safeAreaBottom: 20,
    bezelColor: '#0a0a0a',
  },
  'ipad': {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    notchType: 'none',
    cornerRadius: 28,
    safeAreaTop: 24,
    safeAreaBottom: 20,
    bezelColor: '#1a1a1a',
  },
  'ipad-mini': {
    name: 'iPad Mini',
    width: 744,
    height: 1133,
    notchType: 'none',
    cornerRadius: 24,
    safeAreaTop: 20,
    safeAreaBottom: 20,
    bezelColor: '#2a2a2a',
  },
  'none': {
    name: 'No Frame',
    width: 375,
    height: 812,
    notchType: 'none',
    cornerRadius: 12,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    bezelColor: 'transparent',
  },
};

export function DeviceFrame({ 
  children, 
  deviceType, 
  previewMode,
  showSafeAreas = false,
  showTouchZones = false,
  className 
}: DeviceFrameProps) {
  const config = deviceConfigs[deviceType];
  const isFramed = deviceType !== 'none' && previewMode !== 'desktop';
  
  if (!isFramed) {
    return (
      <div className={cn("relative", className)}>
        {children}
        {showSafeAreas && previewMode !== 'desktop' && (
          <SafeAreaOverlay config={config} />
        )}
        {showTouchZones && previewMode !== 'desktop' && (
          <TouchZoneOverlay />
        )}
      </div>
    );
  }

  const scale = previewMode === 'tablet' ? 0.6 : 0.75;
  const frameWidth = config.width + 16;
  const frameHeight = config.height + 16;

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ 
        width: frameWidth * scale,
        height: frameHeight * scale,
      }}
    >
      {/* Device Frame */}
      <div
        className="relative shadow-2xl"
        style={{
          width: frameWidth,
          height: frameHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: config.bezelColor,
          borderRadius: config.cornerRadius + 8,
          padding: 8,
        }}
      >
        {/* Screen */}
        <div
          className="relative overflow-hidden bg-background"
          style={{
            width: config.width,
            height: config.height,
            borderRadius: config.cornerRadius,
          }}
        >
          {/* Notch/Dynamic Island */}
          {config.notchType === 'dynamic-island' && (
            <div 
              className="absolute top-3 left-1/2 -translate-x-1/2 bg-black rounded-full z-50"
              style={{ width: 126, height: 37 }}
            />
          )}
          {config.notchType === 'notch' && (
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-black z-50"
              style={{ 
                width: 209, 
                height: 30,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}
            />
          )}
          {config.notchType === 'punch-hole' && (
            <div 
              className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-black rounded-full z-50"
              style={{ width: 24, height: 24 }}
            />
          )}

          {/* Content */}
          <div className="w-full h-full overflow-auto">
            {children}
          </div>

          {/* Safe Areas Overlay */}
          {showSafeAreas && <SafeAreaOverlay config={config} />}
          
          {/* Touch Zones Overlay */}
          {showTouchZones && <TouchZoneOverlay />}
        </div>

        {/* Home Indicator (for phones without home button) */}
        {config.safeAreaBottom > 0 && config.notchType !== 'none' && (
          <div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/30 rounded-full"
            style={{ width: 134, height: 5, bottom: config.safeAreaBottom / 2 - 2 }}
          />
        )}
      </div>

      {/* Device Label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
        {config.name}
      </div>
    </div>
  );
}

function SafeAreaOverlay({ config }: { config: typeof deviceConfigs['iphone-15'] }) {
  return (
    <>
      {/* Top Safe Area */}
      {config.safeAreaTop > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 pointer-events-none z-40"
          style={{ height: config.safeAreaTop }}
        >
          <div className="w-full h-full bg-blue-500/20 border-b-2 border-dashed border-blue-500/50" />
          <span className="absolute bottom-1 right-2 text-[10px] text-blue-400 font-mono">
            safe-area-top: {config.safeAreaTop}px
          </span>
        </div>
      )}
      
      {/* Bottom Safe Area */}
      {config.safeAreaBottom > 0 && (
        <div 
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-40"
          style={{ height: config.safeAreaBottom }}
        >
          <div className="w-full h-full bg-blue-500/20 border-t-2 border-dashed border-blue-500/50" />
          <span className="absolute top-1 right-2 text-[10px] text-blue-400 font-mono">
            safe-area-bottom: {config.safeAreaBottom}px
          </span>
        </div>
      )}
    </>
  );
}

function TouchZoneOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Thumb Zone - Bottom arc */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 border-2 border-dashed border-green-500/40 bg-green-500/5"
        style={{
          width: '100%',
          height: '55%',
          borderRadius: '50% 50% 0 0',
        }}
      />
      
      {/* Easy Reach Zone Label */}
      <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2">
        <span className="text-[10px] text-green-400/80 font-mono bg-background/80 px-1 rounded">
          thumb zone
        </span>
      </div>

      {/* Stretch Zone - Top corners */}
      <div className="absolute top-0 left-0 w-20 h-20 border-2 border-dashed border-amber-500/40 bg-amber-500/5 rounded-br-full" />
      <div className="absolute top-0 right-0 w-20 h-20 border-2 border-dashed border-amber-500/40 bg-amber-500/5 rounded-bl-full" />
      
      {/* Stretch Zone Labels */}
      <div className="absolute top-8 left-2">
        <span className="text-[9px] text-amber-400/80 font-mono">stretch</span>
      </div>
      <div className="absolute top-8 right-2">
        <span className="text-[9px] text-amber-400/80 font-mono">stretch</span>
      </div>
    </div>
  );
}

export function DeviceSelector({ 
  value, 
  onChange,
  previewMode,
}: { 
  value: DeviceType; 
  onChange: (device: DeviceType) => void;
  previewMode: PreviewMode;
}) {
  const mobileDevices: DeviceType[] = ['iphone-15', 'iphone-se', 'pixel-8', 'galaxy-s24'];
  const tabletDevices: DeviceType[] = ['ipad', 'ipad-mini'];
  
  const devices = previewMode === 'tablet' ? tabletDevices : mobileDevices;
  
  if (previewMode === 'desktop') return null;

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      <button
        onClick={() => onChange('none')}
        className={cn(
          "px-2 py-1 text-xs rounded transition-colors",
          value === 'none' ? "bg-background shadow-sm" : "hover:bg-background/50"
        )}
      >
        No Frame
      </button>
      {devices.map((device) => (
        <button
          key={device}
          onClick={() => onChange(device)}
          className={cn(
            "px-2 py-1 text-xs rounded transition-colors whitespace-nowrap",
            value === device ? "bg-background shadow-sm" : "hover:bg-background/50"
          )}
        >
          {deviceConfigs[device].name}
        </button>
      ))}
    </div>
  );
}

export type { DeviceType, PreviewMode };
export { deviceConfigs };
