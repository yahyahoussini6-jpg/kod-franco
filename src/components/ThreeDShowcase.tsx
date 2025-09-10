import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ThreeDShowcaseProps {
  urlGlb: string;
  enableScroll?: boolean;
  containerId?: string;
}

function Model({ 
  urlGlb, 
  onError, 
  onLoad,
  groupRef,
}: { 
  urlGlb: string; 
  onError: (error: any) => void; 
  onLoad: (bounds: { center: THREE.Vector3; radius: number; scale: number }) => void;
  groupRef?: React.MutableRefObject<THREE.Group | null>;
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
        
        // Auto-fit model to viewport with proper scaling
        const tempScene = loadedGltf.scene;
        const box = new THREE.Box3().setFromObject(tempScene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // Calculate scale to fit viewport nicely (80% of view height)
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 1.2; // Viewport units
        const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
        
        tempScene.scale.setScalar(scale);
        tempScene.position.copy(center.clone().multiplyScalar(-scale));
        
        // Apply enhanced materials
        tempScene.traverse((child: any) => {
          if (child.isMesh) {
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
        
        // Compute bounds after scaling
        const sphere = new THREE.Sphere();
        new THREE.Box3().setFromObject(tempScene).getBoundingSphere(sphere);
        
        setGltf(loadedGltf);
        setIsLoading(false);
        onLoad({ center, radius: sphere.radius, scale });
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
    <group ref={(el) => { modelRef.current = el as any; if (groupRef) (groupRef as any).current = el as any; }}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Camera rig to map scroll progress to camera & model transforms
function CameraRig({ modelRef, progressRef }: { modelRef: React.RefObject<THREE.Group>, progressRef: React.MutableRefObject<number> }) {
  const { camera, size } = useThree();
  
  useFrame(() => {
    const p = progressRef.current || 0;
    
    // Auto-adjust camera distance based on screen aspect ratio
    const aspect = size.width / size.height;
    const baseDistance = aspect > 1 ? 2.8 : 3.5; // Closer on desktop, further on mobile
    const z = baseDistance + (baseDistance * 0.15) * (1 - p); // Dolly in slightly
    
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);

    if (modelRef.current) {
      const yaw = THREE.MathUtils.degToRad(-25 * (1 - p));
      modelRef.current.rotation.y = yaw;
    }
  });
  return null;
}

function ThreeDShowcase({ urlGlb, enableScroll = false, containerId }: ThreeDShowcaseProps) {
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modelGroupRef = useRef<THREE.Group>(null);
  const scrollProgressRef = useRef(0);
  const boundsRef = useRef<{ center: THREE.Vector3; radius: number; scale: number } | null>(null);

  console.log('ThreeDShowcase render:', { urlGlb, loading, error });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ScrollTrigger progress for hero reveal
  useEffect(() => {
    if (!enableScroll) return;
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=120%',
      scrub: true,
      pin: containerRef.current,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, [enableScroll]);

  const handleError = useCallback((error: any) => {
    console.error('ThreeDShowcase Error:', error);
    setError(error);
    setLoading(false);
  }, []);

  const handleLoad = useCallback((bounds: { center: THREE.Vector3; radius: number; scale: number }) => {
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
      className="h-[70vh] md:h-[80vh] w-full border rounded-lg overflow-hidden bg-background relative"
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
                position: [0, 0, 3.5],
                fov: 45,
                near: 0.1,
                far: 20
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
              frameloop={enableScroll ? 'always' : 'demand'}
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
                  onLoad={(b) => { boundsRef.current = b; handleLoad(b); }}
                  groupRef={modelGroupRef}
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
                minPolarAngle={0.2}
                maxPolarAngle={Math.PI - 0.2}
                enableDamping={true}
                dampingFactor={0.08}
                rotateSpeed={0.6}
                target={[0, 0, 0]}
              />

              {/* Camera rig for scroll-driven animation */}
              {enableScroll && (
                <CameraRig modelRef={modelGroupRef} progressRef={scrollProgressRef} />
              )}
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}

export default ThreeDShowcase;