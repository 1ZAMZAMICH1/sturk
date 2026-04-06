import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial, Environment, Float } from '@react-three/drei';
import { fetchSheetData } from '../services/api';
import './CategoriesMobile.css';

// Импорт картинок
import cityImg from '../assets/city.jpg';
import historyImg from '../assets/history.jpg';
import natureImg from '../assets/nature.jpg';

import gor1 from '../assets/gor1.png';
import ist1 from '../assets/ist1.png';
import duh1 from '../assets/duh1.png';
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
      vec4 tex = texture2D(uTexture, vUv);
      float edge = fwidth(tex.a);
      float alpha = smoothstep(0.5 - edge, 0.5 + edge, tex.a);
      if (alpha < 0.05) discard;
      float gradient = sin(vUv.x * 2.5 + uTime * 1.5) * 0.5 + 0.5;
      vec3 gold = mix(vec3(0.58, 0.42, 0.12), vec3(1.0, 0.9, 0.5), gradient);
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

// 1. ФОН: КЕРЕГЕ
const KeregeBackground = () => {
  const meshRef = useRef();
  const count = 68 * 2;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const radius = 40;
    let index = 0;
    const segments = 68;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
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
    <instancedMesh ref={meshRef} args={[null, null, count]} raycast={null}>
      <cylinderGeometry args={[0.08, 0.08, 45, 5]} />
      <meshStandardMaterial
        color="#5c4033"
        emissive="#2a1a10"
        emissiveIntensity={0.2}
        roughness={0.9}
        metalness={0.1}
      />
    </instancedMesh>
  );
};

// 2. ФОН: ПЕТРОГЛИФЫ
const sharedPlaneGeometry = new THREE.PlaneGeometry(1, 1);
const PetroglyphWall = () => {
  const textures = useTexture([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]);
  const materialsRef = useRef([]);

  const items = useMemo(() => {
    const glyphs = []; const count = 70; const radius = 50; const minDist = 10.0;
    let currentSeed = 9999; let attempts = 0;
    while (glyphs.length < count && attempts < 10000) {
      attempts++; currentSeed++;
      const angle = seededRandom(currentSeed) * Math.PI * 2;
      const y = (seededRandom(currentSeed + 7000) - 0.5) * 50;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const newPos = new THREE.Vector3(x, y, z);
      let tooClose = false;
      for (let other of glyphs) { if (newPos.distanceTo(other.vecPos) < minDist) { tooClose = true; break; } }
      if (!tooClose) {
        const rScale = seededRandom(currentSeed + 1000);
        glyphs.push({
          pos: [x, y, z], vecPos: newPos,
          rot: [0, angle + Math.PI, 0], scale: 5.0 + rScale * 8.0,
          texture: textures[Math.floor(seededRandom(currentSeed + 2000) * textures.length)],
          timeOffset: seededRandom(currentSeed + 3000) * 20
        });
      }
    }
    return glyphs;
  }, [textures]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    items.forEach((item, i) => { if (materialsRef.current[i]) materialsRef.current[i].uTime = time + item.timeOffset; });
  });

  return (
    <group>
      {items.map((item, i) => (
        <mesh key={i} position={item.pos} rotation={item.rot} scale={[item.scale, item.scale, 1]} geometry={sharedPlaneGeometry} raycast={null}>
          <petroSoftMaterial ref={el => materialsRef.current[i] = el} uTexture={item.texture} uColor={new THREE.Color("#d4af37")} side={THREE.DoubleSide} transparent={true} />
        </mesh>
      ))}
    </group>
  );
};

// 3. АРКА
const createArchShape = (width, height) => {
  const shape = new THREE.Shape();
  const w = width / 2; const h = height / 2;
  shape.moveTo(-w, -h); shape.lineTo(w, -h); shape.lineTo(w, h - 1.2);
  shape.quadraticCurveTo(w, h, 0, h + 1.0); shape.quadraticCurveTo(-w, h, -w, h - 1.2); shape.lineTo(-w, -h);
  return shape;
};

const createFrameRing = (width, height, border) => {
  const outer = createArchShape(width, height);
  const scale = (width - border) / width;
  const iw = (width / 2) * scale;
  const ih = (height / 2) * scale;
  const hole = new THREE.Path();
  hole.moveTo(-iw, -ih); hole.lineTo(iw, -ih); hole.lineTo(iw, ih - 1.2 * scale);
  hole.quadraticCurveTo(iw, ih, 0, ih + 1.0 * scale);
  hole.quadraticCurveTo(-iw, ih, -iw, ih - 1.2 * scale); hole.lineTo(-iw, -ih);
  outer.holes.push(hole);
  return { outerWithHole: outer, scale, iw, ih };
};

const MobilePortalCard = ({ index, url, title, position, rotation, hoveredState, setHovered, onClick }) => {
  const groupRef = useRef();
  const labelMatRef = useRef();
  const { i18n } = useTranslation();
  const isHovered = hoveredState === index;

  const archContentAssets = [gor2, ist2, duh2];
  const activeUrl = archContentAssets[index % 3];
  const texture = useTexture(activeUrl);

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

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
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

  useLayoutEffect(() => {
    if (activeLabel) {
      activeLabel.anisotropy = 16;
      activeLabel.minFilter = THREE.LinearFilter;
      activeLabel.magFilter = THREE.LinearFilter;
    }
    if (texture && texture.image) {
      const imageAspect = texture.image.width / texture.image.height;
      const archAspect = ARCH_WIDTH / ARCH_HEIGHT;
      texture.center.set(0.5, 0.5);
      if (imageAspect > archAspect) {
        texture.repeat.set(archAspect / imageAspect, 1);
        texture.offset.x = (1 - texture.repeat.x) / 2;
      } else {
        texture.repeat.set(1, imageAspect / archAspect);
        texture.offset.y = (1 - texture.repeat.y) / 2;
      }
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    }
  }, [activeLabel, texture]);

  const { frameGeometry, imageGeometry } = useMemo(() => {
    const BORDER = 0.05;
    const { outerWithHole, scale, iw, ih } = createFrameRing(ARCH_WIDTH, ARCH_HEIGHT, BORDER);
    const fGeo = new THREE.ExtrudeGeometry(outerWithHole, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 32 });
    const innerShape = new THREE.Shape();
    innerShape.moveTo(-iw, -ih); innerShape.lineTo(iw, -ih); innerShape.lineTo(iw, ih - 1.2 * scale);
    innerShape.quadraticCurveTo(iw, ih, 0, ih + 1.0 * scale);
    innerShape.quadraticCurveTo(-iw, ih, -iw, ih - 1.2 * scale); innerShape.lineTo(-iw, -ih);
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


  return (
    <group
      ref={groupRef} position={position} rotation={rotation}
      onPointerOver={() => setHovered(index)} onPointerOut={() => setHovered(null)} onClick={() => onClick(index)}
    >
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh geometry={frameGeometry} position={[0, 0, -0.09]}>
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} envMapIntensity={1.5} />
        </mesh>
        <mesh geometry={imageGeometry} position={[0, 0, 0]}>
          <meshBasicMaterial map={texture} side={THREE.FrontSide} />
        </mesh>

        <mesh position={[0, (index === 1) ? -2.2 : -1.8, 0.35]} scale={[4.2, 0.9, 1]}>
          <planeGeometry args={[1, 1]} />
          <metalLabelMaterial ref={labelMatRef} uTexture={activeLabel} transparent={true} depthWrite={false} />
        </mesh>
      </Float>
    </group>
  );
};

const CategoriesMobile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [archData, setArchData] = useState([]);

  useEffect(() => {
    const loadArches = async () => {
      try {
        const data = await fetchSheetData('categories');
        if (data && Array.isArray(data) && data.length >= 3) { setArchData(data); }
        else { 
            setArchData([
                { tag: 'city', title: t('category.default_region'), url: cityImg }, 
                { tag: 'spirit', title: t('category.meta.history'), url: historyImg }, 
                { tag: 'nature', title: t('category.meta.nature'), url: natureImg }
            ]); 
        }
      } catch (err) { }
    };
    loadArches();
  }, [t]);

  const handlePortalClick = (index) => {
    const target = archData[index]?.tag || 'city';
    navigate(`/category/${target}`);
  };

  return (
    <div className="cat-mob-root">
      <div className="cat-mob-header">
        <h2 className="cat-mob-title">{t('categories.title')}</h2>
      </div>

      <Canvas camera={{ position: [0, 0, 24], fov: 42 }} style={{ touchAction: 'pan-y' }} dpr={1} gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}>
        <Environment preset="city" blur={1} />
        <color attach="background" args={['#1a0b05']} />
        <PetroglyphWall />
        <KeregeBackground />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 10]} intensity={6.0} color="#ffaa00" distance={100} />
        <spotLight position={[0, 15, 10]} intensity={5.0} color="#fff" angle={0.5} />

        <group position={[0, -0.5, 0]} scale={1.1}>
          {archData.slice(0, 3).map((item, idx) => (
            <MobilePortalCard
              key={idx}
              index={idx}
              url={item.url || item.image}
              title={item.title || item.name}
              position={
                idx === 0 ? [-1.40000, 3.80000, 0.20000] :
                  idx === 1 ? [-1.47000, -4.09000, 0.10000] : // Теперь тут нижняя позиция
                    [1.61000, 0.13000, 0.00000] // Теперь тут средняя позиция
              }
              rotation={[0, 0, 0]}
              hoveredState={hovered} setHovered={setHovered} onClick={handlePortalClick}
            />
          ))}
        </group>
        <fog attach="fog" args={['#1a0b05', 30, 95]} />
      </Canvas>
    </div>
  );
};

export default CategoriesMobile;
