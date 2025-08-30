import React, { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three-stdlib';

interface ModelViewer3DProps {
  urlObj: string;
  urlMtl?: string;
}

function Model({ urlObj, onError }: { urlObj: string; onError: () => void }) {
  try {
    const obj = useLoader(OBJLoader, urlObj);
    return <primitive object={obj} scale={1} />;
  } catch (error) {
    console.error('Error loading 3D model:', error);
    onError();
    return null;
  }
}

function ModelViewer3D({ urlObj }: ModelViewer3DProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
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
    <div className="h-[480px] w-full border rounded-lg overflow-hidden bg-background">
      {error ? (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
          <div>Impossible de charger le modèle 3D</div>
          <div className="text-sm opacity-75">Vérifiez que le fichier .obj est valide</div>
        </div>
      ) : (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="text-muted-foreground">Chargement du modèle 3D...</div>
            </div>
          )}
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 50 }}
            onCreated={() => console.log('Canvas created, loading model:', urlObj)}
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
              <Model urlObj={urlObj} onError={handleError} />
            </Suspense>
            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              enableRotate={true}
              onStart={handleLoad}
            />
          </Canvas>
        </>
      )}
    </div>
  );
}

export default ModelViewer3D;