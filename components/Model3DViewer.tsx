import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Model3DViewerProps {
    modelPath: string;
    autoRotate?: boolean;
}

const Model: React.FC<{ path: string }> = ({ path }) => {
    const { scene } = useGLTF(path);

    return <primitive object={scene} />;
};

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
    modelPath,
    autoRotate = true
}) => {
    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 2.5], fov: 50 }}
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent'
                }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 10]} intensity={1} />
                    <directionalLight position={[-10, -10, -10]} intensity={0.3} />

                    <Model path={modelPath} />

                    <OrbitControls
                        autoRotate={autoRotate}
                        autoRotateSpeed={2}
                        enableZoom={false}
                        enablePan={true}
                        enableDamping={true}
                        dampingFactor={0.05}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};
