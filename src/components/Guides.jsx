// src/components/Guides.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { useInView } from '../hooks/useInView';
import {
  Text,
  Image,
  Sparkles,
  Float,
  Environment
} from '@react-three/drei';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import './Guides.css';
import { fetchSheetData } from '../services/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Three.js Image Error caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// --- ГЕНЕРАТОР ПОЗИЦИЙ ---
const generatePositions = (seed, count) => {
  let localSeed = seed;
  const random = () => {
    const x = Math.sin(localSeed++) * 10000;
    return x - Math.floor(x);
  };
  const positions = [];
  const minDistance = 1.8;
  const xRange = 5.5;
  const yRange = 2.8;
  const safeZoneX = 3.6;
  const safeZoneY = 2.0;
  let attempts = 0;
  while (positions.length < count && attempts < 10000) {
    attempts++;
    const x = (random() - 0.5) * 2 * xRange;
    const y = (random() - 0.5) * 2 * yRange;
    const z = (random() - 0.5) * 2.5;
    if (Math.abs(x) < safeZoneX && Math.abs(y) < safeZoneY) continue;
    let tooClose = false;
    for (let pos of positions) {
      const dx = pos[0] - x;
      const dy = pos[1] - y;
      if (Math.sqrt(dx * dx + dy * dy) < minDistance) { tooClose = true; break; }
    }
    if (!tooClose) positions.push([x, y, z]);
  }
  return positions;
};

// --- КОМПОНЕНТ ЩИТА (ПК) ---
function ShieldItem({ data, index, openSignal }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const isOpen = data.isReal && openSignal;
    const targetRotation = isOpen ? Math.PI : 0;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation,
      delta * 5
    );
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + index * 132) * 0.05;
  });

  return (
    <group position={data.pos}>
      <mesh position={[0, 20, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 40, 8]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      <group ref={groupRef} scale={[0.5, 0.5, 0.5]}>
        <group position={[0, 0, 0.1]}>
          <mesh>
            <torusGeometry args={[1.6, 0.1, 16, 64]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, -0.05]}>
            <circleGeometry args={[1.6, 64]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.sin(i * Math.PI / 2) * 1.0, Math.cos(i * Math.PI / 2) * 1.0, 0.02]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} />
            </mesh>
          ))}
        </group>
        {data.isReal && (
          <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}>
            <mesh position={[0, 0, -0.06]}>
              <circleGeometry args={[1.55, 64]} />
              <meshStandardMaterial color="#261912" roughness={1} />
            </mesh>
            <React.Suspense fallback={null}>
              <ErrorBoundary>
                <Image
                  url={data.img || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=60"}
                  scale={[1.8, 1.8]}
                  position={[0, 0.5, 0.05]}
                  transparent opacity={0.9} radius={1}
                />
              </ErrorBoundary>
            </React.Suspense>
            <Text position={[0, -0.7, 0.1]} fontSize={0.22} maxWidth={2.0} textAlign="center"
              color="#d4af37" anchorX="center" anchorY="top" outlineWidth={0.015} outlineColor="#000" lineHeight={1.1}>
              {data.name}
            </Text>
            <Text position={[0, -1.1, 0.1]} fontSize={0.14} maxWidth={1.8} textAlign="center"
              color="#a89f91" anchorX="center" anchorY="top">
              {data.role}
            </Text>
          </group>
        )}
      </group>
    </group>
  );
}

// --- СЦЕНА (ПК) ---
const REAL_COUNT = 12;   // 12 активных щитов
const TOTAL_SHIELDS = 25;
const ITEMS_PER_PAGE = 12; // 12 гидов на страницу

function GuidesScene({ page, allGuides, openSignals }) {
  const { i18n } = useTranslation();
  const guidesData = useMemo(() => {
    if (!allGuides || allGuides.length === 0) return [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const pageGuides = allGuides.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const positions = generatePositions(777, TOTAL_SHIELDS);

    // Выбираем 12 щитов расположенных ближе к камере
    const sortedByDepth = positions.map((pos, index) => ({ index, z: pos[2] }));
    sortedByDepth.sort((a, b) => b.z - a.z);
    const topIndices = new Set(sortedByDepth.slice(0, REAL_COUNT).map(item => item.index));

    let guideIdx = 0;
    return positions.map((pos, i) => {
      const isReal = topIndices.has(i);
      const guide = isReal ? pageGuides[guideIdx % pageGuides.length] : null;
      if (isReal) guideIdx++;
      return {
        id: `${page}-${i}`,
        pos,
        isReal: !!guide,
        name: (guide?.[`name_${i18n.language}`] || guide?.name_ru || guide?.name || "").toUpperCase(),
        role: guide?.specialty?.toUpperCase() || "",
        img: guide?.photo || "",
      };
    });
  }, [page, allGuides, i18n.language]);

  return (
    <>
      <ambientLight intensity={0.7} color="#ffdcb3" />
      <pointLight position={[0, -8, 5]} intensity={5} color="#ff6600" distance={30} decay={2} />
      <spotLight position={[0, 10, 10]} intensity={2} color="#fff" angle={0.8} />
      <Environment preset="sunset" blur={0.8} />
      <Sparkles count={400} scale={[40, 30, 15]} position={[0, 0, -5]} size={4} speed={0.4} opacity={0.5} color="#ffaa00" />
      <Float speed={1} rotationIntensity={0.02} floatIntensity={0.1} floatingRange={[-0.05, 0.05]}>
        <group>
          {guidesData.map((guide, i) => (
            <ShieldItem key={guide.id} data={guide} index={i} openSignal={openSignals[i] || false} />
          ))}
        </group>
      </Float>
      <fog attach="fog" args={['#1a0b05', 12, 40]} />
    </>
  );
}

// --- КОНСТАНТЫ ЦИКЛА ---
const OPEN_DURATION = 15000;  // 15 сек открыты
const CLOSE_SPREAD = 4000;    // Разброс времени хаотичного закрытия
const PAUSE_DURATION = 2000;  // Пауза после закрытия перед сменой страницы

const Guides = () => {
  const { t, i18n } = useTranslation();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [openSignals, setOpenSignals] = useState(Array(TOTAL_SHIELDS).fill(false));
  const timersRef = useRef([]);

  useEffect(() => {
    fetchSheetData('guides').then(data => { setGuides(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const clearAll = () => timersRef.current.forEach(t => clearTimeout(t));

    const runCycle = () => {
      clearAll();
      timersRef.current = [];
      setOpenSignals(Array(TOTAL_SHIELDS).fill(false));

      // Хаотично открываем каждый щит в течение 15 сек
      for (let i = 0; i < TOTAL_SHIELDS; i++) {
        const openDelay = Math.random() * OPEN_DURATION;
        const t = setTimeout(() => {
          if (!isMounted) return;
          setOpenSignals(prev => { const n = [...prev]; n[i] = true; return n; });
        }, openDelay);
        timersRef.current.push(t);
      }

      // Хаотично закрываем после 15 сек (каждый щит — со своим случайным delay)
      for (let i = 0; i < TOTAL_SHIELDS; i++) {
        const closeDelay = OPEN_DURATION + Math.random() * CLOSE_SPREAD;
        const t = setTimeout(() => {
          if (!isMounted) return;
          setOpenSignals(prev => { const n = [...prev]; n[i] = false; return n; });
        }, closeDelay);
        timersRef.current.push(t);
      }

      // После полного закрытия — смена страницы
      const pageSwitch = setTimeout(() => {
        if (!isMounted) return;
        setPage(prev => {
          const totalPages = Math.ceil(guides.length / ITEMS_PER_PAGE);
          return totalPages > 1 ? (prev >= totalPages ? 1 : prev + 1) : prev;
        });
      }, OPEN_DURATION + CLOSE_SPREAD + PAUSE_DURATION);
      timersRef.current.push(pageSwitch);

      // Следующий цикл
      const nextCycle = setTimeout(runCycle, OPEN_DURATION + CLOSE_SPREAD + PAUSE_DURATION + 500);
      timersRef.current.push(nextCycle);
    };

    runCycle();
    return () => { isMounted = false; clearAll(); };
  }, [loading, guides.length]);

  const { ref: sectionRef, inView: canvasReady } = useInView({ rootMargin: '400px' });

  if (loading) return <div ref={sectionRef} className="guides-section loading-center">{t('guides.loading')}</div>;

  return (
    <div ref={sectionRef} className="guides-section">
      <div className="noise-overlay"></div>
      <div className="vignette-guides"></div>
      <div className="center-text-container">
        <h2 className="center-title">{t('guides.title')}</h2>
      </div>
      <div className="guides-canvas-container">
        {canvasReady ? (
          <Canvas camera={{ position: [0, 0, 12], fov: 45 }} dpr={[1, 2]}>
            <React.Suspense fallback={null}>
              <GuidesScene page={page} allGuides={guides} openSignals={openSignals} />
            </React.Suspense>
          </Canvas>
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#181614' }} />
        )}
      </div>
      <Link to="/guides" className="guides-explore-link">
        {t('guides.btn')}
      </Link>
    </div>
  );
};

export default Guides;