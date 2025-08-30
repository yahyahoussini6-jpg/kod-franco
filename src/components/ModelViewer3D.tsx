import React, { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three-stdlib';

interface ModelViewer3DProps {
  urlObj: string;
  urlMtl?: string;
}

function Model({ urlObj }: { urlObj: string }) {
  const obj = useLoader(OBJLoader, urlObj);
  return <primitive object={obj} scale={1} />;
}

function ModelViewer3D({ urlObj }: ModelViewer3DProps) {
  const [error, setError] = useState(false);

  return (
    <div className="h-[480px] w-full border rounded-lg overflow-hidden bg-background">
      {error ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Impossible de charger le modèle 3D.
        </div>
      ) : (
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense
            fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="gray" />
              </mesh>
            }
          >
            <Model urlObj={urlObj} />
          </Suspense>
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Canvas>
      )}
    </div>
  );
}

export default ModelViewer3D;