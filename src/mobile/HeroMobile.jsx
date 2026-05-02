import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { Clouds, Cloud, Sparkles, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import AIChat from '../components/AIChat';
import './HeroMobile.css';
import heroTextImgRU from '../assets/hero-text.png';
import heroTextImgKZ from '../assets/hero-textkz.png';
import heroTextImgEN from '../assets/hero-texten.png';
import heroTextImgZH from '../assets/hero-textzh.png';

const MemoizedClouds = memo(() => {
  const cloudConfig = (
    <>
      <Cloud seed={10} segments={30} bounds={[50, 40, 2]} volume={80} color="#1a0b05" position={[0, 0, -18]} speed={0} opacity={1} scale={3.5} />
      <Cloud seed={20} segments={25} bounds={[40, 30, 5]} volume={60} color="#2e1608" position={[0, 0, -14]} speed={0.02} opacity={0.95} scale={3.0} />
      <Cloud seed={30} segments={20} bounds={[35, 25, 6]} volume={50} color="#542a0c" position={[0, 0, -10]} speed={0.05} opacity={0.85} scale={2.5} />
      <Cloud seed={40} segments={15} bounds={[30, 20, 6]} volume={40} color="#783c12" position={[0, 0, -6]} speed={0.08} opacity={0.7} scale={2.0} />
      <Cloud seed={50} segments={10} bounds={[25, 15, 4]} volume={30} color="#9c5219" position={[0, 0, -2]} speed={0.12} opacity={0.6} scale={1.5} />
      <Cloud seed={60} segments={10} bounds={[20, 12, 4]} volume={20} color="#b86e28" position={[0, 0, 2]} speed={0.2} opacity={0.4} scale={1.2} />
    </>
  );
  return (
    <group rotation={import.meta.env.PROD ? [0, 0, Math.PI] : [0, 0, 0]}>
      <Clouds material={THREE.MeshBasicMaterial} limit={150} frustumCulled={true}>{cloudConfig}</Clouds>
    </group>
  );
});

const HeroMobile = () => {
  const [isReady, setIsReady] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();
  
  // Идеальные координаты для мобильной версии, которые мы настроили
  const OFFSETS = {
    ru: { x: 0, y: 0 },
    kz: { x: 43, y: -17 },
    en: { x: 68, y: 4 },
    zh: { x: 91, y: -19 }
  };

  const currentOffset = OFFSETS[currentLang] || OFFSETS.ru;

  const heroImages = {
    ru: heroTextImgRU,
    kz: heroTextImgKZ,
    en: heroTextImgEN,
    zh: heroTextImgZH
  };
  
  const currentHeroImg = heroImages[currentLang] || heroTextImgRU;

  return (
    <div className="hero-container-mob" style={{ overflow: 'hidden' }}>
      
      {/* 🟢 ВЫБОР ЯЗЫКА */}
      <div className="language-selector-mob" style={{ zIndex: 99999 }}>
        {['ru', 'kz', 'en', 'zh'].map((lng) => (
          <button 
            key={lng} 
            onClick={() => i18n.changeLanguage(lng)}
            className={`lang-btn-mob ${currentLang === lng ? 'active' : ''}`}
            style={{ pointerEvents: 'auto' }}
          >
            {lng.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 3D CANVAS - ФОНОВЫЙ СЛОЙ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <Canvas
            camera={{ position: [0, 0, 14], fov: 60, up: [0, 1, 0] }}
            style={{ touchAction: 'pan-y' }}
            dpr={1}
            gl={{
                antialias: false,
                powerPreference: "high-performance",
                alpha: false,
                stencil: false,
                depth: true,
                precision: 'lowp'
            }}
            onCreated={({ gl }) => {
                gl.setClearColor('#1a0b05');
                setTimeout(() => setIsReady(true), 200);
            }}
            flat
        >
            <Stats />
            <ambientLight intensity={1.2 * (import.meta.env.PROD ? 3.0 : 1.0)} />
            <pointLight position={[10, 10, 10]} color="#ff7b00" intensity={5.0 * (import.meta.env.PROD ? 3.0 : 1.0)} />
            <pointLight position={[-10, -10, -5]} color="#8a3324" intensity={3.0} />
            
            <Sparkles count={150} scale={[40, 30, 2]} position={[0, 0, 10]} size={2} speed={0.4} opacity={1} color="#ffcc66" noise={1} />

            <MemoizedClouds />

            <color attach="background" args={['#1a0b05']} />
            <fog attach="fog" args={['#1a0b05', 5, 40]} />
        </Canvas>
      </div>

      {/* 🖼 КАРТИНКА И КНОПКА - ПОСЕРЕДИНЕ */}
      <div className="hero-content-mob" style={{ zIndex: 10, pointerEvents: 'none', flexDirection: 'column' }}>
        <img
          key={currentLang}
          src={currentHeroImg}
          alt="Turkistan"
          className={`hero-text-mob ${isReady ? 'visible' : ''}`}
          style={{
            transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`
          }}
        />

        <button 
          className={`hero-history-btn ${isReady ? 'visible' : ''}`}
          style={{ pointerEvents: 'auto', marginTop: '20px' }}
          onClick={() => navigate('/history')}
        >
          {t('hero.history_btn')}
        </button>
      </div>

      <div className="texture-overlay-mob" style={{ zIndex: 20 }}></div>
      <div className="vignette-overlay-mob" style={{ zIndex: 21 }}></div>
      <div className="hero-trans-bottom-mob" style={{ zIndex: 22 }}></div>

      <AIChat />
    </div>
  );
};

export default HeroMobile;
