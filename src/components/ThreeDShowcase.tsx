import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';

interface ThreeDShowcaseProps {
  urlGlb: string;
  enableScroll?: boolean;
  containerId?: string;
}

function Model({ 
  urlGlb, 
  onError, 
  onLoad
}: { 
  urlGlb: string; 
  onError: (error: any) => void; 
  onLoad: () => void;
}) {
  const [gltf, setGltf] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (hasLoaded || !urlGlb) return;

    console.log('Loading 3D model from:', urlGlb);
    setHasLoaded(true);
    
    const loader = new GLTFLoader();
    
    loader.load(
      urlGlb,
      (loadedGltf) => {
        console.log('3D model loaded successfully:', loadedGltf);
        
        // Apply enhanced materials
        loadedGltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            // Ensure material exists and apply enhancements
            if (child.material) {
              // Glass material detection
              if (child.material.name?.toLowerCase().includes('glass') || 
                  child.material.name?.toLowerCase().includes('bottle')) {
                child.material = new THREE.MeshPhysicalMaterial({
                  transmission: 0.85,
                  roughness: 0.07,
                  ior: 1.5,
                  thickness: 0.0015,
                  transparent: true,
                  opacity: 0.95,
                });
              }
              
              // Label material
              else if (child.material.name?.toLowerCase().includes('label')) {
                child.material = new THREE.MeshStandardMaterial({
                  map: child.material.map,
                  roughness: 0.32,
                  metalness: 0.02,
                });
              }
              
              // Cap/metal material
              else if (child.material.name?.toLowerCase().includes('cap') || 
                       child.material.name?.toLowerCase().includes('metal')) {
                child.material = new THREE.MeshStandardMaterial({
                  map: child.material.map,
                  metalness: 0.8,
                  roughness: 0.25,
                });
              }
            }
            
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        setGltf(loadedGltf);
        setIsLoading(false);
        onLoad();
      },
      (progress) => {
        console.log('Loading progress:', progress);
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        setIsLoading(false);
        onError(error);
      }
    );
  }, [urlGlb]); // Minimal dependencies to prevent loops

  if (isLoading) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" wireframe />
      </mesh>
    );
  }

  if (!gltf) return null;

  return (
    <group ref={modelRef}>
      <primitive object={gltf.scene} scale={[2, 2, 2]} position={[0, 0, 0]} />
    </group>
  );
}

function ThreeDShowcase({ urlGlb, enableScroll = false, containerId }: ThreeDShowcaseProps) {
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('ThreeDShowcase render:', { urlGlb, loading, error });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('ThreeDShowcase Error:', error);
    setError(error);
    setLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    console.log('3D Model loaded successfully');
    setLoading(false);
  }, []);

  if (!urlGlb) {
    return (
      <div className="h-[480px] w-full border rounded-lg overflow-hidden bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Aucun modèle 3D disponible</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-[300px] md:h-[480px] w-full border rounded-lg overflow-hidden bg-background relative"
      id={containerId}
    >
      {error ? (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 p-4">
          <div className="font-semibold">Impossible de charger le modèle 3D</div>
          <div className="text-sm opacity-75 text-center">
            {error?.message || 'Vérifiez que le fichier .glb est valide et accessible'}
          </div>
          <div className="text-xs opacity-50 max-w-xs text-center break-all">
            URL: {urlGlb}
          </div>
          <button 
            onClick={() => window.open(urlGlb, '_blank')} 
            className="text-xs underline opacity-75 hover:opacity-100"
          >
            Tester l'URL directement
          </button>
        </div>
      ) : (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="text-muted-foreground">Chargement du modèle 3D...</div>
            </div>
          )}
          <div className="w-full h-full">
            <Canvas 
              camera={{ 
                position: [0.35, 0.24, 1.35],
                fov: 38,
                near: 0.1,
                far: 18
              }}
              onCreated={() => console.log('Canvas created, loading model:', urlGlb)}
              style={{ 
                width: '100%', 
                height: '100%',
                display: 'block'
              }}
              gl={{ 
                preserveDrawingBuffer: true,
                antialias: true,
                powerPreference: "high-performance"
              }}
              dpr={isMobile ? Math.min(1.5, window.devicePixelRatio) : Math.min(2, window.devicePixelRatio)}
              frameloop="demand"
            >
              {/* Enhanced Lighting Setup */}
              <Environment preset="studio" />
              
              {/* Key directional light with soft shadows */}
              <directionalLight 
                position={[0.7, 1.2, 0.8]} 
                intensity={2.0}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-bias={-0.0002}
              />
              
              {/* Hemispheric fill light */}
              <hemisphereLight 
                args={["#b3ccff", "#4d4033", 0.5]}
              />
              
              {/* Ambient light */}
              <ambientLight intensity={0.2} />

              <Suspense
                fallback={
                  <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="gray" wireframe />
                  </mesh>
                }
              >
                <Model 
                  urlGlb={urlGlb} 
                  onError={handleError} 
                  onLoad={handleLoad}
                />
                
                {/* Contact Shadows */}
                <ContactShadows
                  opacity={0.42}
                  scale={10}
                  blur={3}
                  far={0.4}
                  resolution={256}
                />
              </Suspense>
              
              {/* Orbit Controls */}
              <OrbitControls 
                enableZoom={!isMobile} 
                enablePan={false} 
                enableRotate={true}
                minPolarAngle={Math.PI * 0.4 / Math.PI}
                maxPolarAngle={Math.PI * 1.0 / Math.PI}
                minAzimuthAngle={-0.6}
                maxAzimuthAngle={0.6}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={0.5}
                target={[0, 0.09, 0]}
              />
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}

export default ThreeDShowcase;