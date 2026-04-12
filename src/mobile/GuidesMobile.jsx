// src/mobile/GuidesMobile.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

// --- ГЕНЕРАТОР ПОЗИЦИЙ (мобайл) ---
const generatePositionsMobile = (seed, count) => {
  let localSeed = seed;
  const random = () => {
    const x = Math.sin(localSeed++) * 10000;
    return x - Math.floor(x);
  };
  const positions = [];
  const minDistance = 2.2;
  const xRange = 3.5;
  const yRange = 8.0;
  const safeZoneX = 2.2;
  const safeZoneY = 2.0;
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
      if (Math.sqrt(dx * dx + dy * dy) < minDistance) { tooClose = true; break; }
    }
    if (!tooClose) positions.push([x, y, z]);
  }
  return positions;
};

// --- КОМПОНЕНТ ЩИТА (мобайл) ---
function ShieldItemMobile({ data, index, openSignal }) {
  const groupRef = useRef();
  // Используем ref вместо state, чтобы не вызывать setState внутри useFrame
  const detailsRenderedRef = useRef(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    detailsRenderedRef.current = false;
    setDetailsVisible(false);
  }, [data.id]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const isOpen = data.isReal && openSignal;
    const targetRotation = isOpen ? Math.PI : 0;

    // Активируем рендер деталей только один раз через ref
    if (isOpen && !detailsRenderedRef.current) {
      detailsRenderedRef.current = true;
      setDetailsVisible(true);
    }

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation,
      delta * 4
    );
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7 + index * 132) * 0.04;
  });

  return (
    <group position={data.pos}>
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 30, 4]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      <group ref={groupRef} scale={[0.42, 0.42, 0.42]}>
        {/* Лицевая сторона */}
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
        {/* Обратная сторона — только для реальных */}
        {data.isReal && (
          <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}>
            <mesh position={[0, 0, -0.06]}>
              <circleGeometry args={[1.55, 48]} />
              <meshStandardMaterial color="#261912" />
            </mesh>
            {detailsVisible && (
              <React.Suspense fallback={null}>
                <ErrorBoundary>
                  <Image
                    url={data.img || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=60"}
                    scale={[1.8, 1.8]}
                    position={[0, 0.4, 0.05]}
                    transparent radius={1}
                  />
                </ErrorBoundary>
                <Text position={[0, -0.7, 0.1]} fontSize={0.24} maxWidth={2.0} textAlign="center"
                  color="#d4af37" anchorX="center" anchorY="top">
                  {data.name}
                </Text>
                <Text position={[0, -1.1, 0.1]} fontSize={0.16} maxWidth={1.8} textAlign="center"
                  color="#a89f91" anchorX="center" anchorY="top">
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

// --- КОНСТАНТЫ ---
const TOTAL_SHIELDS_MOB = 17;  // Всего щитов в сцене
const REAL_COUNT_MOB = 12;     // Из них 12 активных
const ITEMS_PER_PAGE_MOB = 12; // 12 гидов на страницу
const OPEN_DURATION = 15000;
const CLOSE_SPREAD = 4000;
const PAUSE_DURATION = 2000;

const GuidesMobile = () => {
  const { t } = useTranslation();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [openSignals, setOpenSignals] = useState(Array(TOTAL_SHIELDS_MOB).fill(false));
  const [inView, setInView] = useState(false);
  const rootRef = useRef(null);
  const timersRef = useRef([]);

  // IntersectionObserver — анимация только когда секция видна
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.05 });
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchSheetData('guides').then(data => { setGuides(data); setLoading(false); });
  }, []);

  // Данные: 17 щитов, 12 реальных
  const guidesData = useMemo(() => {
    if (!guides || guides.length === 0) return [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE_MOB;
    const pageGuides = guides.slice(startIndex, startIndex + ITEMS_PER_PAGE_MOB);
    const positions = generatePositionsMobile(777, TOTAL_SHIELDS_MOB);

    // Выбираем 12 ближайших к камере щитов
    const scored = positions.map((pos, index) => ({
      index,
      score: pos[2] + (12 - Math.sqrt(pos[0] ** 2 + pos[1] ** 2)) * 0.5
    }));
    scored.sort((a, b) => b.score - a.score);
    const topIndices = new Set(scored.slice(0, REAL_COUNT_MOB).map(item => item.index));

    let gIdx = 0;
    return positions.map((pos, i) => {
      const isReal = topIndices.has(i);
      const guide = isReal ? pageGuides[gIdx % pageGuides.length] : null;
      if (isReal) gIdx++;
      return {
        id: `${page}-${i}`,
        pos,
        isReal: !!guide,
        name: guide?.name?.toUpperCase() || "",
        role: guide?.specialty?.toUpperCase() || "",
        img: guide?.photo || "",
      };
    });
  }, [page, guides]);

  // Авто-анимация — запускается сразу после загрузки данных
  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const clearAll = () => timersRef.current.forEach(t => clearTimeout(t));

    const runCycle = () => {
      clearAll();
      timersRef.current = [];
      setOpenSignals(Array(TOTAL_SHIELDS_MOB).fill(false));

      // Хаотично открываем в течение 15 сек
      for (let i = 0; i < TOTAL_SHIELDS_MOB; i++) {
        const openDelay = Math.random() * OPEN_DURATION;
        const t = setTimeout(() => {
          if (!isMounted) return;
          setOpenSignals(prev => { const n = [...prev]; n[i] = true; return n; });
        }, openDelay);
        timersRef.current.push(t);
      }

      // Хаотично закрываем (каждый со своим delay)
      for (let i = 0; i < TOTAL_SHIELDS_MOB; i++) {
        const closeDelay = OPEN_DURATION + Math.random() * CLOSE_SPREAD;
        const t = setTimeout(() => {
          if (!isMounted) return;
          setOpenSignals(prev => { const n = [...prev]; n[i] = false; return n; });
        }, closeDelay);
        timersRef.current.push(t);
      }

      // Смена страницы
      const pageSwitch = setTimeout(() => {
        if (!isMounted) return;
        setPage(prev => {
          const totalPages = Math.ceil(guides.length / ITEMS_PER_PAGE_MOB);
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

  if (loading) return <div className="mob-loading">{t('guides.loading')}</div>;

  return (
    <div className="guides-mob-root" ref={rootRef}>
      <div className="noise-overlay" />
      <div className="vignette-guides" />

      <div className="guides-mob-header">
        <h2 className="guides-mob-title">{t('guides.title')}</h2>
        {/* Текст со страницей убран */}
      </div>

      <div className="guides-mob-canvas">
        <React.Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 16], fov: 60 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
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
                    openSignal={openSignals[i] || false}
                  />
                ))}
              </group>
            </Float>
            <fog attach="fog" args={['#1a0b05', 10, 45]} />
          </Canvas>
        </React.Suspense>
      </div>

      {/* Hint и nav-кнопки убраны — навигация теперь автоматическая */}

      <Link to="/guides" className="guides-mob-link">
        {t('guides.btn')} <span>→</span>
      </Link>
    </div>
  );
};

export default GuidesMobile;
