import React, { Suspense, useState } from 'react';
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

// Error boundary component
class ModelErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('3D Model Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
    modelPath,
    autoRotate = true
}) => {
    const [modelError, setModelError] = useState(false);

    // Placeholder when model fails to load
    const fallback = (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue/5 to-purple-50 rounded-2xl border-2 border-dashed border-brand-blue/20">
            <div className="text-center p-8">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-brand-lightText text-lg font-medium">3D Model Preview</p>
                <p className="text-brand-lightText/60 text-sm mt-2">Could not load model</p>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full relative">
            <ModelErrorBoundary fallback={fallback}>
                <Canvas
                    camera={{ position: [0, 0, 2.5], fov: 50 }}
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent'
                    }}
                    onCreated={({ gl }) => {
                        gl.setClearColor(0xffffff, 0);
                    }}
                >
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 10]} intensity={1} />
                        <directionalLight position={[-10, -10, -10]} intensity={0.3} />

                        <Model path={modelPath} onLoad={() => setIsLoading(false)} />

                        <OrbitControls
                            autoRotate={autoRotate}
                            autoRotateSpeed={2}
                            enableZoom={true}
                            enablePan={true}
                            enableDamping={true}
                            dampingFactor={0.05}
                        />
                    </Suspense>
                </Canvas>
            </ModelErrorBoundary>
        </div>
    );
};
