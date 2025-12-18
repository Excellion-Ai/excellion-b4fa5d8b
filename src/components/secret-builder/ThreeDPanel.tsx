import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text3D, Center, MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Box as BoxIcon, Loader2, RotateCw } from 'lucide-react';
import * as THREE from 'three';

interface Shape3DProps {
  shape: 'box' | 'sphere' | 'torus' | 'product';
  color: string;
  wireframe: boolean;
  distort: number;
  speed: number;
}

const AnimatedShape: React.FC<Shape3DProps> = ({ shape, color, wireframe, distort, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005 * speed;
      meshRef.current.rotation.y += 0.01 * speed;
    }
  });

  const materialProps = {
    color,
    wireframe,
    metalness: 0.5,
    roughness: 0.2,
  };

  if (shape === 'box') {
    return (
      <Box ref={meshRef} args={[2, 2, 2]}>
        <meshStandardMaterial {...materialProps} />
      </Box>
    );
  }

  if (shape === 'sphere') {
    return (
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial {...materialProps} distort={distort} speed={2} />
      </Sphere>
    );
  }

  if (shape === 'torus') {
    return (
      <Torus ref={meshRef} args={[1.2, 0.5, 32, 64]}>
        <meshStandardMaterial {...materialProps} />
      </Torus>
    );
  }

  // Product showcase - floating box with glow
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Box ref={meshRef} args={[2, 2.5, 0.3]}>
        <meshStandardMaterial {...materialProps} />
      </Box>
    </Float>
  );
};

const Scene: React.FC<Shape3DProps & { environment: string }> = (props) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
      
      <AnimatedShape {...props} />
      
      <OrbitControls 
        enablePan={false} 
        minDistance={3} 
        maxDistance={10}
        autoRotate={props.speed === 0}
        autoRotateSpeed={1}
      />
      
      {props.environment !== 'none' && (
        <Environment preset={props.environment as any} />
      )}
    </>
  );
};

export const ThreeDPanel: React.FC = () => {
  const [shape, setShape] = useState<'box' | 'sphere' | 'torus' | 'product'>('sphere');
  const [color, setColor] = useState('#8b5cf6');
  const [wireframe, setWireframe] = useState(false);
  const [distort, setDistort] = useState(0.4);
  const [speed, setSpeed] = useState(1);
  const [environment, setEnvironment] = useState('city');
  const [isLoading, setIsLoading] = useState(true);

  const colors = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const environments = [
    { name: 'None', value: 'none' },
    { name: 'City', value: 'city' },
    { name: 'Sunset', value: 'sunset' },
    { name: 'Dawn', value: 'dawn' },
    { name: 'Night', value: 'night' },
    { name: 'Studio', value: 'studio' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Shape</Label>
            <Select value={shape} onValueChange={(v) => setShape(v as any)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sphere">Sphere</SelectItem>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="torus">Torus</SelectItem>
                <SelectItem value="product">Product Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env.value} value={env.value}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Color</Label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c.value}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.value }}
                onClick={() => setColor(c.value)}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Distort: {distort.toFixed(1)}</Label>
            <Slider
              value={[distort]}
              onValueChange={([v]) => setDistort(v)}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Speed: {speed.toFixed(1)}</Label>
            <Slider
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
              min={0}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={wireframe ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => setWireframe(!wireframe)}
          >
            Wireframe
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative bg-gradient-to-br from-background to-muted">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading 3D scene...</span>
            </div>
          </div>
        )}
        
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          onCreated={() => setIsLoading(false)}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <Scene
              shape={shape}
              color={color}
              wireframe={wireframe}
              distort={distort}
              speed={speed}
              environment={environment}
            />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );
};
