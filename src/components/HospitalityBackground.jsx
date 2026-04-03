import { Cloud, Sparkles } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { useInView } from '../hooks/useInView';
import './Hospitality.css';

const DarkAtmosphere = () => {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[0, -10, 5]} intensity={1.5} color="#ff6600" />
            <Cloud position={[0, -5, -5]} speed={0.1} opacity={0.3} color="#5c2a2a" bounds={[10, 2, 2]} />
            <Sparkles count={250} scale={[15, 10, 5]} size={3} speed={0.3} opacity={0.6} color="#ffcc99" noise={0.5} />
        </>
    );
};

const HospitalityBackground = () => {
    const { ref: sectionRef, inView: canvasReady } = useInView({ rootMargin: '400px' });
    return (
        <div ref={sectionRef} className="hosp-canvas-container shared-background">
            <div className="sticky-bg-content">
                {canvasReady ? (
                    <Canvas camera={{ position: [0, 0, 10], fov: 50 }} style={{ touchAction: 'pan-y' }}>
                        <DarkAtmosphere />
                    </Canvas>
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#2a0a0a' }} />
                )}
                <div className="fabric-texture-overlay"></div>
                <div className="warm-vignette"></div>
            </div>
        </div>
    );
};

export default HospitalityBackground;
