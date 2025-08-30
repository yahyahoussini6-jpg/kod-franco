import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three-stdlib';

interface ModelViewer3DProps {
  urlObj: string;
  urlMtl?: string;
}

function Model({ urlObj, onError, onLoad }: { urlObj: string; onError: (error: any) => void; onLoad: () => void }) {
  const [obj, setObj] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loader = new OBJLoader();
    
    console.log('Loading 3D model from:', urlObj);
    
    // First check if the URL is accessible
    fetch(urlObj, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log('Model URL is accessible, loading...');
        
        loader.load(
          urlObj,
          (loadedObj) => {
            console.log('3D model loaded successfully:', loadedObj);
            setObj(loadedObj);
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
      })
      .catch(error => {
        console.error('Error accessing model URL:', error);
        setIsLoading(false);
        onError(error);
      });
  }, [urlObj, onError, onLoad]);

  if (isLoading) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" wireframe />
      </mesh>
    );
  }

  if (!obj) return null;

  return <primitive object={obj} scale={[2, 2, 2]} position={[0, 0, 0]} />;
}

function ModelViewer3D({ urlObj }: ModelViewer3DProps) {
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleError = (error: any) => {
    console.error('ModelViewer3D Error:', error);
    setError(error);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (!urlObj) {
    return (
      <div className="h-[480px] w-full border rounded-lg overflow-hidden bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Aucun modèle 3D disponible</div>
      </div>
    );
  }

  return (
    <div className="h-[300px] md:h-[480px] w-full border rounded-lg overflow-hidden bg-background relative">
      {error ? (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 p-4">
          <div className="font-semibold">Impossible de charger le modèle 3D</div>
          <div className="text-sm opacity-75 text-center">
            {error?.message || 'Vérifiez que le fichier .obj est valide et accessible'}
          </div>
          <div className="text-xs opacity-50 max-w-xs text-center break-all">
            URL: {urlObj}
          </div>
          <button 
            onClick={() => window.open(urlObj, '_blank')} 
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
              camera={{ position: [0, 0, 5], fov: 50 }}
              onCreated={() => console.log('Canvas created, loading model:', urlObj)}
              style={{ 
                width: '100%', 
                height: '100%',
                display: 'block'
              }}
              gl={{ 
                preserveDrawingBuffer: true,
                antialias: true
              }}
            >
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <directionalLight position={[-10, -10, -5]} intensity={0.5} />
              <Suspense
                fallback={
                  <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="gray" wireframe />
                  </mesh>
                }
              >
                <Model urlObj={urlObj} onError={handleError} onLoad={handleLoad} />
              </Suspense>
              <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
                maxPolarAngle={Math.PI}
                minPolarAngle={0}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={0.5}
                zoomSpeed={0.5}
                panSpeed={0.5}
              />
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}

export default ModelViewer3D;