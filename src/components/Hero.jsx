import React, { useState, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Clouds, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import './Hero.css';
import heroTextImg from '../assets/hero-text.png';

const MemoizedClouds = memo(() => {
  const cloudConfig = (
    <>
      <Cloud seed={10} segments={120} bounds={[50, 40, 2]} volume={60} color="#1a0b05" position={[0, 0, -18]} speed={0} opacity={1} />
      <Cloud seed={20} segments={80} bounds={[40, 30, 5]} volume={40} color="#2e1608" position={[0, 0, -14]} speed={0.02} opacity={0.95} />
      <Cloud seed={30} segments={60} bounds={[35, 25, 6]} volume={30} color="#542a0c" position={[0, 0, -10]} speed={0.05} opacity={0.85} />
      <Cloud seed={40} segments={50} bounds={[30, 20, 6]} volume={25} color="#783c12" position={[0, 0, -6]} speed={0.08} opacity={0.7} />
      <Cloud seed={50} segments={40} bounds={[25, 15, 4]} volume={20} color="#9c5219" position={[0, 0, -2]} speed={0.12} opacity={0.6} />
      <Cloud seed={60} segments={30} bounds={[20, 12, 4]} volume={15} color="#b86e28" position={[0, 0, 2]} speed={0.2} opacity={0.4} />
    </>
  );

  // Fix for Netlify production build mirroring issues
  // Use rotation to flip X and Y without inverting normals (which caused "weird" look)
  const isProd = import.meta.env.PROD;

  return (
    <group rotation={isProd ? [0, 0, Math.PI] : [0, 0, 0]}>
      <Clouds material={THREE.MeshBasicMaterial} limit={400}>
        {cloudConfig}
      </Clouds>
    </group>
  );
});

const Hero = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="hero-container">
      <div className="texture-overlay"></div>
      <div className="vignette-overlay"></div>

      <Canvas
        camera={{ position: [0, 0, 14], fov: 60, up: [0, 1, 0] }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1a0b05');
          setTimeout(() => setIsReady(true), 200);
        }}
        flat
      >
        {/* Boost light in production to compensate for darker rendering */}
        <ambientLight intensity={1.2 * (import.meta.env.PROD ? 1.5 : 1.0)} />
        <pointLight position={[10, 10, 10]} color="#ff7b00" intensity={5.0 * (import.meta.env.PROD ? 1.5 : 1.0)} />
        <pointLight position={[-10, -10, -5]} color="#8a3324" intensity={3.0} />
        <Sparkles count={800} scale={[40, 30, 2]} position={[0, 0, 10]} size={2} speed={0.4} opacity={1} color="#ffcc66" noise={1} />

        <MemoizedClouds />

        <color attach="background" args={['#1a0b05']} />
        <fog attach="fog" args={['#1a0b05', 5, 40]} />
      </Canvas>

      <div className="hero-content">
        <img
          src={heroTextImg}
          alt="Туркестан"
          className={`hero-text-image ${isReady ? 'visible' : ''}`}
        />
      </div>

      <div className="hero-transition-bottom"></div>
    </div>
  );
};

export default Hero;