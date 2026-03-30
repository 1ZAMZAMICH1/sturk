// src/components/Guides.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Text,
  Image,
  useCursor,
  Sparkles,
  Float,
  Environment
} from '@react-three/drei';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { Icons } from '../admin/AdminIcons';
import './Guides.css';

import { fetchSheetData } from '../services/api';

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
function ShieldItem({ data, index }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [autoFlipped, setAutoFlipped] = useState(false);

  useCursor(hovered && data.isReal);

  useEffect(() => {
    setAutoFlipped(false);
    setHovered(false);
  }, [data.id]);

  useEffect(() => {
    if (!data.isReal) return;
    let timeoutId;
    const scheduleNextFlip = () => {
      const delay = 3000 + Math.random() * 5000;
      timeoutId = setTimeout(() => {
        setAutoFlipped(true);
        setTimeout(() => {
          setAutoFlipped(false);
          scheduleNextFlip();
        }, 4000);
      }, delay);
    };
    timeoutId = setTimeout(scheduleNextFlip, Math.random() * 4000);
    return () => clearTimeout(timeoutId);
  }, [data.isReal, data.id]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const isOpen = data.isReal && (hovered || autoFlipped);
    const targetRotation = isOpen ? Math.PI : 0;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation,
      delta * 6
    );

    const sway = Math.sin(state.clock.elapsedTime * 0.8 + index * 132) * 0.05;
    groupRef.current.rotation.z = sway;
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
            <meshStandardMaterial color="#5c3a21" roughness={0.8} bumpScale={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[
              Math.sin(i * Math.PI / 2) * 1.0,
              Math.cos(i * Math.PI / 2) * 1.0,
              0.02
            ]}>
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
            <Image
              url={data.img || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=60"}
              scale={[1.8, 1.8]}
              position={[0, 0.5, 0.05]}
              transparent
              opacity={0.9}
              radius={1}
            />
            <Text
              position={[0, -0.7, 0.1]}
              fontSize={0.22}
              maxWidth={2.0}
              textAlign="center"
              color="#d4af37"
              anchorX="center"
              anchorY="top"
              outlineWidth={0.015}
              outlineColor="#000"
              lineHeight={1.1}
            >
              {data.name}
            </Text>
            <Text
              position={[0, -1.1, 0.1]}
              fontSize={0.14}
              maxWidth={1.8}
              textAlign="center"
              color="#a89f91"
              anchorX="center"
              anchorY="top"
            >
              {data.role}
            </Text>
          </group>
        )}

        {data.isReal && (
          <mesh
            visible={false}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <cylinderGeometry args={[1.8, 1.8, 1.5, 32]} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// --- СЦЕНА ---
function GuidesScene({ page, allGuides }) {
  const guidesData = useMemo(() => {
    if (!allGuides || allGuides.length === 0) return [];
    
    const itemsPerPage = 6;
    const startIndex = (page - 1) * itemsPerPage;
    const pageGuides = allGuides.slice(startIndex, startIndex + itemsPerPage);
    
    // Используем фиксированные сиды для позиций, чтобы щиты не прыгали
    const positions = generatePositions(777, 25);

    const sortedByDepth = positions.map((pos, index) => ({ index, z: pos[2] }));
    sortedByDepth.sort((a, b) => b.z - a.z);
    
    // Ближайшие 6 щитов будут "реальными"
    const top6Indices = sortedByDepth.slice(0, 6).map(item => item.index);
    const realIndicesSet = new Set(top6Indices);

    let guideIdx = 0;
    return positions.map((pos, i) => {
      const isReal = realIndicesSet.has(i);
      const guide = isReal ? pageGuides[guideIdx % pageGuides.length] : null;
      if (isReal) guideIdx++;

      return {
        id: `${page}-${i}`,
        pos: pos,
        isReal: !!guide,
        name: guide?.name?.toUpperCase() || "",
        role: guide?.specialty?.toUpperCase() || "",
        img: guide?.photo || "",
      };
    });
  }, [page, allGuides]);

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
            <ShieldItem key={guide.id} data={guide} index={i} />
          ))}
        </group>
      </Float>

      <fog attach="fog" args={['#1a0b05', 12, 40]} />
    </>
  );
}

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      const data = await fetchSheetData('guides');
      setGuides(data);
      setLoading(false);
    };
    load();
  }, []);

  const nextPage = () => setPage(prev => (prev === 1 ? 2 : 1));
  const prevPage = () => setPage(prev => (prev === 2 ? 1 : 2));

  if (loading) return <div className="loading-state">Загрузка мастеров пути...</div>;

  return (
    <div className="guides-section">
      <div className="noise-overlay"></div>
      <div className="vignette-guides"></div>

      <div className="center-text-container">
        <h2 className="center-title">ГИДЫ</h2>
        <span className="center-subtitle">Жолбасшылар (Стр. {page})</span>
      </div>

      {/* ЗОНА НАВИГАЦИИ ВПРАВО */}
      {(page * 6) < guides.length && (
        <div className="nav-zone right" onClick={nextPage}>
          <svg className="nav-arrow-svg" viewBox="0 0 50 100">
            <path d="M10,10 Q40,50 10,90" fill="none" />
            <path d="M15,10 Q45,50 15,90" fill="none" opacity="0.5" />
          </svg>
        </div>
      )}

      {/* ЗОНА НАВИГАЦИИ ВЛЕВО */}
      {page > 1 && (
        <div className="nav-zone left" onClick={prevPage}>
          <svg className="nav-arrow-svg" viewBox="0 0 50 100">
            <path d="M40,10 Q10,50 40,90" fill="none" />
            <path d="M35,10 Q5,50 35,90" fill="none" opacity="0.5" />
          </svg>
        </div>
      )}

      <div className="guides-canvas-container">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }} dpr={[1, 2]}>
          <GuidesScene page={page} allGuides={guides} />
        </Canvas>
      </div>

      <div className="guides-hint">Наведите на щит, чтобы узнать имя батыра</div>

      <Link to="/guides" className="guides-explore-link">
        Смотреть всех гидов
        <Icons.Crown style={{ width: '20px', marginLeft: '10px', color: 'var(--hp-gold)' }} />
      </Link>
    </div>
  );
};

export default Guides;