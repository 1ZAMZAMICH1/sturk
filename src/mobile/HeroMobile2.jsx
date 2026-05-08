import React, { useState, memo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { Clouds, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import AIChat from '../components/AIChat';
import './HeroMobile.css';

import heroTextImgRU from '../assets/hero-text.png';
import heroTextImgKZ from '../assets/hero-textkz.png';
import heroTextImgEN from '../assets/hero-texten.png';
import heroTextImgZH from '../assets/hero-textzh.png';

const ShaderAnimator = () => {
    useFrame((state) => {
      state.scene.traverse((obj) => {
        if (obj.material && obj.material.userData && obj.material.userData.shader) {
          obj.material.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
        }
      });
    });
    return null;
};

const MemoizedClouds = memo(() => {
  const cloudsRef = useRef();

  useEffect(() => {
    if (cloudsRef.current) {
        // 🟢 ТРЮК 1: "ЗАМОРОЗКА" ПРОЦЕССОРА
        // Говорим CPU: "Обсчитай позиции 275 облаков один раз и ЗАБУДЬ про них"
        cloudsRef.current.traverse((obj) => {
            if (obj.isMesh) {
                obj.matrixAutoUpdate = false;
                obj.updateMatrix();
            }
        });
    }
  }, []);

  const cloudConfig = (
    <>
      <Cloud seed={10} segments={80} bounds={[30, 20, 1]} volume={60} color="#1a0b05" position={[0, 0, -18]} speed={0} opacity={1} />
      <Cloud seed={20} segments={60} bounds={[25, 18, 2]} volume={40} color="#2e1608" position={[0, 0, -14]} speed={0.02} opacity={0.95} />
      <Cloud seed={30} segments={45} bounds={[20, 15, 3]} volume={30} color="#542a0c" position={[0, 0, -10]} speed={0.05} opacity={0.85} />
      <Cloud seed={40} segments={35} bounds={[18, 12, 3]} volume={25} color="#783c12" position={[0, 0, -6]} speed={0.08} opacity={0.7} />
      <Cloud seed={50} segments={30} bounds={[15, 10, 2]} volume={20} color="#9c5219" position={[0, 0, -2]} speed={0.12} opacity={0.6} />
      <Cloud seed={60} segments={25} bounds={[12, 8, 2]} volume={15} color="#b86e28" position={[0, 0, 2]} speed={0.2} opacity={0.4} />
    </>
  );

  return (
    <group rotation={import.meta.env.PROD ? [0, 0, Math.PI] : [0, 0, 0]}>
      <Clouds ref={cloudsRef} limit={400} frustumCulled={true}>
        <meshBasicMaterial 
          transparent 
          depthWrite={false} 
          onBeforeCompile={(shader) => {
            // 🟢 ТРЮК 2: ПЕРЕНОС АНИМАЦИИ НА ВИДЕОКАРТУ
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `vec3 transformed = vec3( position ); 
               transformed.x += sin(uTime * 0.2 + position.y * 0.1) * 0.5; 
               transformed.y += cos(uTime * 0.1 + position.x * 0.1) * 0.3;`
            );
            // 🟢 ТРЮК 3: ОТСЕЧЕНИЕ ПРОЗРАЧНОСТИ (AlphaTest)
            // Видеокарта не будет рисовать пиксели, которые почти не видны
            shader.fragmentShader = shader.fragmentShader.replace(
              'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
              'if (diffuseColor.a < 0.05) discard; gl_FragColor = vec4( outgoingLight, diffuseColor.a );'
            );
            shader.userData.shader = shader;
          }}
        />
        {cloudConfig}
      </Clouds>
    </group>
  );
});

const HeroMobile2 = () => {
  const [isReady, setIsReady] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();
  
  const OFFSETS = {
    ru: { x: 0, y: 0 },
    kz: { x: 43, y: -17 },
    en: { x: 68, y: 4 },
    zh: { x: 91, y: -19 }
  };
  const currentOffset = OFFSETS[currentLang] || OFFSETS.ru;

  const heroImages = {
    ru: heroTextImgRU, kz: heroTextImgKZ, en: heroTextImgEN, zh: heroTextImgZH
  };
  const currentHeroImg = heroImages[currentLang] || heroTextImgRU;

  return (
    <div className="hero-container-mob" style={{ overflow: 'hidden' }}>
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

      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <Canvas
            camera={{ position: [0, 0, 14], fov: 60, up: [0, 1, 0] }}
            style={{ width: '100%', height: '100%' }}
            // 🟢 ТРЮК 4: ЭКСТРЕМАЛЬНОЕ СНИЖЕНИЕ РАЗРЕШЕНИЯ
            // Рисуем всё в 0.4 от реального размера и растягиваем. Для облаков - ИДЕАЛЬНО.
            dpr={0.4}
            gl={{
              antialias: false,
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
            <ambientLight intensity={1.2 * (import.meta.env.PROD ? 3.0 : 1.0)} />
            <pointLight position={[10, 10, 10]} color="#ff7b00" intensity={5.0 * (import.meta.env.PROD ? 3.0 : 1.0)} />
            <pointLight position={[-10, -10, -5]} color="#8a3324" intensity={3.0} />
            <Sparkles count={400} scale={[40, 30, 2]} position={[0, 0, 10]} size={2} speed={0.4} opacity={1} color="#ffcc66" noise={1} />
            <MemoizedClouds />
            <ShaderAnimator />
            <color attach="background" args={['#1a0b05']} />
            <fog attach="fog" args={['#1a0b05', 5, 40]} />
        </Canvas>
      </div>

      <div className="hero-content-mob" style={{ zIndex: 10, pointerEvents: 'none', flexDirection: 'column' }}>
        <img
          key={currentLang}
          src={currentHeroImg}
          alt="Turkistan"
          className={`hero-text-mob ${isReady ? 'visible' : ''}`}
          style={{ transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)` }}
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

export default HeroMobile2;
