// src/components/Categories.jsx

import React, { useState, useEffect, useRef, useMemo, useLayoutEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useInView } from '../hooks/useInView';
import {
  Text,
  useCursor,
  Float,
  useTexture,
  useVideoTexture,
  Environment,
  shaderMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import './Categories.css';

// Импорт картинок
import cityImg from '../assets/city.jpg';
import historyImg from '../assets/history.jpg';
import natureImg from '../assets/nature.jpg';

import gor1 from '../assets/gor1.png';
import ist1 from '../assets/ist1.png';
import duh1 from '../assets/duh1.png';

// Файлы для фона арок (контент)
import gor2 from '../assets/gor2.png';
import ist2 from '../assets/ist2.png';
import duh2 from '../assets/duh2.png';

// Казахские подписи
import gor2kaz from '../assets/gor2kaz.png';
import ist2kaz from '../assets/ist2kaz.png';
import prir2kaz from '../assets/prir2kaz.png';

// Английские подписи
import gor3en from '../assets/gor3en.png';
import ist3en from '../assets/ist3en.png';
import prir3en from '../assets/prir3en.png';

// Китайские подписи
import gor4zn from '../assets/gor4zn.png';
import ist4zn from '../assets/ist4zn.png';
import prir4zn from '../assets/prir4zn.png';

import p1 from '../assets/petroglyph-1.png';
import p2 from '../assets/petroglyph-2.png';
import p3 from '../assets/petroglyph-3.png';
import p4 from '../assets/petroglyph-4.png';
import p5 from '../assets/petroglyph-5.png';
import p6 from '../assets/petroglyph-6.png';
import p7 from '../assets/petroglyph-7.png';
import p8 from '../assets/petroglyph-8.png';
import p9 from '../assets/petroglyph-9.png';
import p10 from '../assets/petroglyph-10.png';
import p11 from '../assets/petroglyph-11.png';
import p12 from '../assets/petroglyph-12.png';

const ARCH_WIDTH = 2.2;
const ARCH_HEIGHT = 3.4;

// ШЕЙДЕР
const PetroSoftMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#d4af37'), uTexture: null },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    void main() {
      vec4 tex = texture2D(uTexture, vUv);
      if (tex.a < 0.1) discard;
      float pos = (vUv.x + vUv.y) * 0.5;
      float wave = sin(pos * 1.5 - uTime * 0.7);
      float shimmer = wave * 0.5 + 0.5;
      vec3 lowGold = uColor * 0.3;  
      vec3 highGold = uColor * 0.8; 
      vec3 finalColor = mix(lowGold, highGold, shimmer);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Шейдер для серебряных надписей (Металлик с отсечением фона)
const MetalLabelMaterial = shaderMaterial(
  { uTime: 0, uTexture: null, uBaseColor: new THREE.Color('#ffffff') },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform vec3 uBaseColor;
    varying vec2 vUv;
    void main() {
      // Получаем текстуру
      vec4 tex = texture2D(uTexture, vUv);
      
      // СУПЕР-СГЛАЖИВАНИЕ (Anti-aliasing через производные)
      // Эту технику используют для идеально ровных краев
      float edge = fwidth(tex.a);
      float alpha = smoothstep(0.5 - edge, 0.5 + edge, tex.a);
      
      // Если прозрачность в самом файле совсем низкая - не рисуем
      if (alpha < 0.05) discard;
      
      // Насыщенное ЗОЛОТО
      float gradient = sin(vUv.x * 2.5 + uTime * 1.5) * 0.5 + 0.5;
      // Цвета: Глубокое золото -> Яркий блик
      vec3 gold = mix(vec3(0.58, 0.42, 0.12), vec3(1.0, 0.9, 0.5), gradient);
      
      // Дополнительный солнечный "перелив" (sheen)
      float sheen = pow(1.0 - vUv.y, 4.0) * 0.7;
      vec3 finalColor = gold + sheen;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

extend({ PetroSoftMaterial, MetalLabelMaterial });

const seededRandom = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// 1. ФОН: КЕРЕГЕ (Оптимизация: InstancedMesh + отключен Raycast)
const KeregeBackground = () => {
  const meshRef = useRef();
  const count = 24 * 2;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const radius = 14;
    let index = 0;
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, angle, Math.PI / 8);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index++, dummy.matrix);

      dummy.rotation.set(0, angle, -Math.PI / 8);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index++, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.02;
  });

  return (
    // raycast={null} — Важнейшая оптимизация. CPU игнорирует этот объект при наведении мыши.
    <instancedMesh ref={meshRef} args={[null, null, count]} raycast={null}>
      <cylinderGeometry args={[0.08, 0.08, 14, 5]} />
      <meshStandardMaterial color="#5c4033" roughness={0.9} metalness={0.1} />
    </instancedMesh>
  );
};

// 2. ФОН: ПЕТРОГЛИФЫ (Оптимизация: Общая геометрия + отключен Raycast)
const sharedPlaneGeometry = new THREE.PlaneGeometry(1, 1);

const PetroglyphWall = () => {
  const textures = useTexture([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]);
  const materialsRef = useRef([]);

  const items = useMemo(() => {
    const glyphs = []; const count = 60; const radius = 16; const minDist = 5.5;
    let currentSeed = 999; let attempts = 0;
    while (glyphs.length < count && attempts < 20000) {
      attempts++; currentSeed++;
      const angle = seededRandom(currentSeed) * Math.PI * 2;
      const y = (seededRandom(currentSeed + 5000) - 0.5) * 30;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const newPos = new THREE.Vector3(x, y, z);
      let tooClose = false;
      for (let other of glyphs) { if (newPos.distanceTo(other.vecPos) < minDist) { tooClose = true; break; } }
      if (!tooClose) {
        const rScale = seededRandom(currentSeed + 1000);
        const rTexIndex = seededRandom(currentSeed + 2000);
        glyphs.push({
          vecPos: newPos, pos: [x, y, z],
          rot: [0, angle + Math.PI, 0], scale: 3.5 + rScale * 3.5,
          texture: textures[Math.floor(rTexIndex * textures.length)],
          timeOffset: seededRandom(currentSeed + 3000) * 20
        });
      }
    }
    return glyphs;
  }, [textures]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const mats = materialsRef.current;
    for (let i = 0; i < items.length; i++) {
      if (mats[i]) mats[i].uTime = time + items[i].timeOffset;
    }
  });

  return (
    <group>
      {items.map((item, i) => (
        <mesh
          key={i}
          position={item.pos}
          rotation={item.rot}
          scale={[item.scale, item.scale, 1]}
          geometry={sharedPlaneGeometry}
          raycast={null} // Отключаем проверку кликов для камней
        >
          <petroSoftMaterial
            ref={el => materialsRef.current[i] = el}
            uTexture={item.texture}
            uColor={new THREE.Color("#d4af37")}
            side={THREE.DoubleSide}
            transparent={true}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3. ГЕОМЕТРИЯ АРКИ
// Внешняя форма (для кольца-рамки)
const createArchShape = (width, height) => {
  const shape = new THREE.Shape();
  const w = width / 2; const h = height / 2;
  shape.moveTo(-w, -h); shape.lineTo(w, -h); shape.lineTo(w, h - 1.2);
  shape.quadraticCurveTo(w, h, 0, h + 1.0); shape.quadraticCurveTo(-w, h, -w, h - 1.2); shape.lineTo(-w, -h);
  return shape;
};

// Рамка-кольцо: внешний контур с «дыркой» внутри
const createFrameRing = (width, height, border) => {
  const outer = createArchShape(width, height);
  const scale = (width - border) / width;
  const iw = (width / 2) * scale;
  const ih = (height / 2) * scale;
  const hole = new THREE.Path();
  hole.moveTo(-iw, -ih);
  hole.lineTo(iw, -ih);
  hole.lineTo(iw, ih - 1.2 * scale);
  hole.quadraticCurveTo(iw, ih, 0, ih + 1.0 * scale);
  hole.quadraticCurveTo(-iw, ih, -iw, ih - 1.2 * scale);
  hole.lineTo(-iw, -ih);
  outer.holes.push(hole);
  return { outerWithHole: outer, scale, iw, ih };
};

// 4. КАРТОЧКА
const PortalCard = ({ index, url, title, color, position, rotation, hoveredState, setHovered, onClick }) => {
  const groupRef = useRef();
  const labelMatRef = useRef();
  const { i18n } = useTranslation();
  const isHovered = hoveredState === index;

  // ФИНАЛЬНЫЕ КООРДИНАТЫ
  const debugState = {
    0: { zoom: 0.9, offsetX: -0.33, offsetY: 0.02 },
    1: { zoom: 0.85, offsetX: -0.21, offsetY: -0.03 },
    2: { zoom: 0.95, offsetX: -0.31, offsetY: 0.02 }
  };
  const { zoom = 1, offsetX = 0, offsetY = 0 } = debugState[index] || {};

  // Изображения контента из ассетов
  const archContentAssets = [gor2, ist2, duh2];
  const activeUrl = archContentAssets[index % 3];

  const texture = useTexture(activeUrl);
  
  // Выбор текстуры подписи в зависимости от языка
  const labelTexturesRU = useTexture([gor1, ist1, duh1]);
  const labelTexturesKZ = useTexture([gor2kaz, ist2kaz, prir2kaz]);
  const labelTexturesEN = useTexture([gor3en, ist3en, prir3en]);
  const labelTexturesZH = useTexture([gor4zn, ist4zn, prir4zn]);
  
  const activeLabel = useMemo(() => {
    if (i18n.language === 'kz') return labelTexturesKZ[index % 3];
    if (i18n.language === 'en') return labelTexturesEN[index % 3];
    if (i18n.language === 'zh') return labelTexturesZH[index % 3];
    return labelTexturesRU[index % 3];
  }, [i18n.language, index, labelTexturesKZ, labelTexturesEN, labelTexturesZH, labelTexturesRU]);

  useLayoutEffect(() => {
    if (activeLabel) {
       // Сверхсглаживание краев
       activeLabel.anisotropy = 16;
       activeLabel.minFilter = THREE.LinearFilter;
       activeLabel.magFilter = THREE.LinearFilter;
       activeLabel.needsUpdate = true;
    }
  }, [activeLabel]);
  
  useLayoutEffect(() => {
    if (texture && texture.image) {
      const imageAspect = texture.image.width / texture.image.height;
      const archAspect = ARCH_WIDTH / ARCH_HEIGHT;

      texture.center.set(0.5, 0.5);
      
      const finalZoom = zoom;
      
      if (imageAspect > archAspect) {
        texture.repeat.set((archAspect / imageAspect) * finalZoom, 1 * finalZoom);
        texture.offset.x = ((1 - (archAspect / imageAspect) * finalZoom) / 2) + offsetX;
        texture.offset.y = ((1 - finalZoom) / 2) + offsetY;
      } else {
        texture.repeat.set(1 * finalZoom, (imageAspect / archAspect) * finalZoom);
        texture.offset.x = ((1 - finalZoom) / 2) + offsetX;
        texture.offset.y = ((1 - (imageAspect / archAspect) * finalZoom) / 2) + offsetY;
      }

      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    }
  }, [texture, zoom, offsetX, offsetY]);


  const { frameGeometry, imageGeometry } = useMemo(() => {
    const BORDER = 0.05;
    const { outerWithHole, scale, iw, ih } = createFrameRing(ARCH_WIDTH, ARCH_HEIGHT, BORDER);
    const fGeo = new THREE.ExtrudeGeometry(outerWithHole, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 32 });
    
    // Внутренняя форма
    const innerShape = new THREE.Shape();
    innerShape.moveTo(-iw, -ih); innerShape.lineTo(iw, -ih); innerShape.lineTo(iw, ih - 1.2 * scale);
    innerShape.quadraticCurveTo(iw, ih, 0, ih + 1.0 * scale);
    innerShape.quadraticCurveTo(-iw, ih, -iw, ih - 1.2 * scale);
    innerShape.lineTo(-iw, -ih);
    const iGeo = new THREE.ShapeGeometry(innerShape, 64);
    
    const uvAttr = iGeo.attributes.uv;
    const posAttr = iGeo.attributes.position;
    const fullH = ih + ih + 1.0 * scale;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i); const y = posAttr.getY(i);
      uvAttr.setXY(i, (x + iw) / (iw * 2), (y + ih) / fullH);
    }
    uvAttr.needsUpdate = true;

    return { frameGeometry: fGeo, imageGeometry: iGeo };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    // Для центральной арки (index 1) делаем базовый масштаб чуть больше (1.1), так как она стоит глубже
    const baseScale = index === 1 ? 1.1 : 1.0;
    const targetScale = isHovered ? baseScale * 1.05 : baseScale;
    const targetZ = isHovered ? 0.3 : 0;

    if (groupRef.current) {
      const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, dt * 4);
      groupRef.current.scale.set(s, s, s);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2] + targetZ, dt * 4);
    }
    if (labelMatRef.current) {
      labelMatRef.current.uTime = state.clock.elapsedTime;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(index); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
      onClick={(e) => { e.stopPropagation(); onClick(index); }}
    >
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Рамка-кольцо. Передняя грань на z=0.18 */}
        <mesh geometry={frameGeometry} position={[0, 0, -0.09]}>
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} envMapIntensity={1.5} />
        </mesh>

        {/* Картинка по форме внутреннего проёма, лежит в центре кольца */}
        <mesh geometry={imageGeometry} position={[0, 0, 0]}>
          <meshBasicMaterial
            map={texture}
            transparent={false}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* ВАШИ ГРАФИЧЕСКИЕ ПОДПИСИ К АРКАМ (Размер: scale, Позиция: position) */}
        {/* Индивидуальная подгонка высоты и вылета вперед для боковых арок */}
        {/* ВАШИ ГРАФИЧЕСКИЕ ПОДПИСИ К АРКАМ (Умный шейдер для серебра) */}
        <mesh 
          position={[0, (index === 0 || index === 2) ? -1.8 : -2.2, 0.35]} 
          scale={[4.2, 0.9, 1]}
        >
          <planeGeometry args={[1, 1]} />
          <metalLabelMaterial 
            ref={labelMatRef}
            uTexture={activeLabel}
            transparent={true} 
            depthWrite={false}
          />
        </mesh>
      </Float>
    </group>
  );
};

// --- СЦЕНА ---
function CategoriesScene({ onSelectCategory }) {
  const [hovered, setHovered] = useState(null);
  const [archData, setArchData] = useState([
    { tag: 'city', title: 'Городские', url: cityImg, color: '#40e0d0' },
    { tag: 'spirit', title: 'Исторические', url: historyImg, color: '#ffd700' },
    { tag: 'nature', title: 'Духовные', url: natureImg, color: '#50c878' }
  ]);

  useEffect(() => {
    const loadArches = async () => {
      try {
        const data = await fetchSheetData('categories');
        if (data && Array.isArray(data) && data.length >= 3) {
          setArchData(data);
        }
      } catch (err) {
        console.error('Error loading arches:', err);
      }
    };
    loadArches();
  }, []);

  const handlePortalClick = (index) => {
    const target = archData[index]?.tag || 'city';
    onSelectCategory(`/category/${target}`);
  };

  return (
    <>
      <Environment preset="city" blur={1} />
      <color attach="background" args={['#1a0b05']} />

      <PetroglyphWall />
      <KeregeBackground />

      <ambientLight intensity={0.4} />
      {/* Спекулятивный свет для ярких бликов на серебре */}
      <pointLight position={[0, 0, 5]} intensity={10} color="#ffffff" distance={20} />
      
      <pointLight position={[0, -5, 5]} intensity={2} color="#ffaa00" distance={15} />
      <spotLight position={[0, 10, 5]} intensity={3} color="#fff" angle={0.5} />

      <group position={[0, -0.5, 0]}>
        {archData.slice(0, 3).map((item, idx) => (
          <PortalCard
            key={idx}
            index={idx}
            url={item.url || item.image}
            title={item.title || item.name}
            color={item.color || '#ffd700'}
            position={[idx === 0 ? -3.8 : idx === 1 ? 0 : 3.8, 0, idx === 1 ? 0 : 0.5]}
            rotation={[0, idx === 0 ? 0.6 : idx === 2 ? -0.6 : 0, 0]}
            hoveredState={hovered}
            setHovered={setHovered}
            onClick={handlePortalClick}
          />
        ))}
      </group>
      <fog attach="fog" args={['#1a0b05', 15, 35]} />
    </>
  );
}

const Categories = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref: sectionRef, inView: canvasReady } = useInView({ rootMargin: '300px' });

  return (
    <div ref={sectionRef} className="categories-container" style={{ position: 'relative' }}>
      <div className="categories-transition-top"></div>

      <div className="categories-header">
        <h2 className="categories-title">{t('categories.title')}</h2>
      </div>

      {canvasReady ? (
        <Canvas
          camera={{ position: [0, 0, 9], fov: 50 }}
          dpr={[1, 2]}
          gl={{ powerPreference: "high-performance", antialias: true }}
        >
          <Suspense fallback={null}>
            <CategoriesScene onSelectCategory={(url) => navigate(url)} />
          </Suspense>
        </Canvas>
      ) : (
        <div style={{ width: '100%', flex: 1, background: '#1a0b05' }} />
      )}
    </div>
  );
};

export default Categories;