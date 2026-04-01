// src/mobile/GuidesMobile.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Text,
  Image,
  Sparkles,
  Float,
  Environment
} from '@react-three/drei';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import './GuidesMobile.css';

import { fetchSheetData } from '../services/api';

// --- ГЕНЕРАТОР ПОЗИЦИЙ ---
const generatePositionsMobile = (seed, count) => {
  let localSeed = seed;
  const random = () => {
    const x = Math.sin(localSeed++) * 10000;
    return x - Math.floor(x);
  };

  const positions = [];
  const minDistance = 2.2; // Гарантированный зазор между щитами
  const xRange = 3.5;    // Строго под ширину мобильного экрана (чтобы не обрезались)
  const yRange = 8.0;    // По вертикали
  const safeZoneX = 2.2; // Свободное место для текста по горизонтали
  const safeZoneY = 2.0; // Свободное место для текста по вертикали

  let attempts = 0;
  while (positions.length < count && attempts < 5000) {
    attempts++;
    const x = (random() - 0.5) * 2 * xRange;
    const y = (random() - 0.5) * 2 * yRange;
    const z = (random() - 0.5) * 3;

    if (Math.abs(x) < safeZoneX && Math.abs(y) < safeZoneY) continue;

    let tooClose = false;
    for (let pos of positions) {
      const dx = pos[0] - x;
      const dy = pos[1] - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) positions.push([x, y, z]);
  }
  return positions;
};

// --- КОМПОНЕНТ ЩИТА ---
function ShieldItemMobile({ data, index, realCountIdx, inView }) {
  const groupRef = useRef();
  const [isFlippedManual, setIsFlippedManual] = useState(false);
  const [shouldRenderDetails, setShouldRenderDetails] = useState(false);

  useEffect(() => {
    setIsFlippedManual(false);
    setShouldRenderDetails(false);
  }, [data.id]);

  useFrame((state, delta) => {
    if (!groupRef.current || !data.isReal || !inView) return;
    
    const time = state.clock.elapsedTime % 8;
    let isAutoOpen = false;

    const baseDelay = realCountIdx * 0.4;
    if (time > baseDelay && time < 5 + baseDelay) {
      isAutoOpen = true;
    }

    if ((isAutoOpen || isFlippedManual) && !shouldRenderDetails) {
      setShouldRenderDetails(true);
    }

    const isOpen = isFlippedManual || isAutoOpen;
    const targetRotation = isOpen ? Math.PI : 0;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation,
      delta * 4
    );

    const sway = Math.sin(state.clock.elapsedTime * 0.7 + index * 132) * 0.04;
    groupRef.current.rotation.z = sway;
  });

  return (
    <group position={data.pos}>
      {/* ШЕСТ — теперь у всех */}
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 30, 4]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      
      <group 
        ref={groupRef} 
        scale={[0.42, 0.42, 0.42]}
        onClick={(e) => {
          if (data.isReal) {
            e.stopPropagation();
            setIsFlippedManual(!isFlippedManual);
          }
        }}
      >
        {/* ЛИЦЕВАЯ СТОРОНА (НОРМАЛЬНЫЙ ВИД) — теперь у всех 60 щитов */}
        <group position={[0, 0, 0.1]}>
          <mesh>
            <torusGeometry args={[1.6, 0.08, 12, 48]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, -0.05]}>
            <circleGeometry args={[1.6, 48]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#b8860b" metalness={0.7} />
          </mesh>
        </group>

        {/* ОБРАТНАЯ СТОРОНА (ИНФО) — ТОЛЬКО ДЛЯ ГИДОВ */}
        {data.isReal && (
          <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}>
            <mesh position={[0, 0, -0.06]}>
              <circleGeometry args={[1.55, 48]} />
              <meshStandardMaterial color="#261912" />
            </mesh>
            {shouldRenderDetails && (
              <React.Suspense fallback={null}>
                <Image
                  url={data.img || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=60"}
                  scale={[1.8, 1.8]}
                  position={[0, 0.4, 0.05]}
                  transparent
                  radius={1}
                />
                <Text
                  position={[0, -0.7, 0.1]}
                  fontSize={0.24}
                  maxWidth={2.0}
                  textAlign="center"
                  color="#d4af37"
                  anchorX="center"
                  anchorY="top"
                >
                  {data.name}
                </Text>
                <Text
                  position={[0, -1.1, 0.1]}
                  fontSize={0.16}
                  maxWidth={1.8}
                  textAlign="center"
                  color="#a89f91"
                  anchorX="center"
                  anchorY="top"
                >
                  {data.role}
                </Text>
              </React.Suspense>
            )}
          </group>
        )}
      </group>
    </group>
  );
}

const GuidesMobile = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [inView, setInView] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.05 });
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const load = async () => {
      const data = await fetchSheetData('guides');
      setGuides(data);
      setLoading(false);
    };
    load();
  }, []);

  const guidesData = useMemo(() => {
    if (!guides || guides.length === 0) return [];
    const itemsPerPage = 6;
    const startIndex = (page - 1) * itemsPerPage;
    const pageGuides = guides.slice(startIndex, startIndex + itemsPerPage);
    
    const positions = generatePositionsMobile(777, 60);
    
    // БЕРЕМ 6 ЩИТОВ, КОТОРЫЕ БЛИЖЕ К ЦЕНТРУ И К КАМЕРЕ
    const scoredPositions = positions.map((pos, index) => {
      const distFromCenter = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1]);
      const depthScore = pos[2];
      const score = (12 - distFromCenter) + (depthScore * 2);
      return { index, score };
    });
    
    scoredPositions.sort((a, b) => b.score - a.score);
    const top6Indices = scoredPositions.slice(0, 6).map(item => item.index);
    const realIndicesSet = new Set(top6Indices);

    let gIdx = 0;
    return positions.map((pos, i) => {
      const isReal = realIndicesSet.has(i);
      const guide = isReal ? pageGuides[gIdx % pageGuides.length] : null;
      let orderIdx = -1;
      if (isReal) {
        orderIdx = gIdx;
        gIdx++;
      }

      return {
        id: `${page}-${i}`,
        pos: pos,
        isReal: !!guide,
        realIdx: orderIdx,
        name: guide?.name?.toUpperCase() || "",
        role: guide?.specialty?.toUpperCase() || "",
        img: guide?.photo || "",
      };
    });
  }, [page, guides]);

  const nextPage = () => setPage(prev => ( (prev * 6) < guides.length ? prev + 1 : prev ));
  const prevPage = () => setPage(prev => (prev > 1 ? prev - 1 : prev));

  if (loading) return <div className="mob-loading">Зовем мастеров пути...</div>;

  return (
    <div className="guides-mob-root" ref={rootRef}>
      <div className="noise-overlay" />
      <div className="vignette-guides" />

      <div className="guides-mob-header">
        <h2 className="guides-mob-title">ГИДЫ</h2>
        <span className="guides-mob-subtitle">Страница {page}</span>
      </div>

      <div className="guides-mob-canvas">
        <React.Suspense fallback={null}>
          <Canvas 
            camera={{ position: [0, 0, 16], fov: 60 }} 
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          >
            <ambientLight intensity={1.2} color="#ffdcb3" />
            <pointLight position={[5, 10, 10]} intensity={3} color="#ffaa00" />
            <Environment preset="sunset" />
            <Sparkles count={50} scale={[25, 25, 10]} size={2} speed={0.3} opacity={0.4} color="#ffaa00" />
            
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
              <group>
                {guidesData.map((g, i) => (
                  <ShieldItemMobile 
                    key={g.id} 
                    data={g} 
                    index={i} 
                    realCountIdx={g.realIdx}
                    inView={inView}
                  />
                ))}
              </group>
            </Float>
            <fog attach="fog" args={['#1a0b05', 10, 45]} />
          </Canvas>
        </React.Suspense>
      </div>

      <div className="guides-mob-nav">
        {page > 1 && (
          <button className="mob-nav-btn left" onClick={prevPage}>
            <svg viewBox="0 0 50 100"><path d="M40,10 Q10,50 40,90" fill="none" stroke="#d4af37" strokeWidth="4" /></svg>
          </button>
        )}
        {(page * 6) < guides.length && (
          <button className="mob-nav-btn right" onClick={nextPage}>
            <svg viewBox="0 0 50 100"><path d="M10,10 Q40,50 10,90" fill="none" stroke="#d4af37" strokeWidth="4" /></svg>
          </button>
        )}
      </div>

      <div className="guides-mob-hint">Просто нажми на щит батыра</div>

      <Link to="/guides" className="guides-mob-link">
        Смотреть всех гидов <span>→</span>
      </Link>
    </div>
  );
};

export default GuidesMobile;
