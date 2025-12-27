// src/components/Categories.jsx

import React, { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { 
  Text, 
  useCursor, 
  Float, 
  useTexture, 
  Environment,
  shaderMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import './Categories.css';

// Импорт картинок
import cityImg from '../assets/city.jpg';
import historyImg from '../assets/history.jpg';
import natureImg from '../assets/nature.jpg';

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
  {
    uTime: 0,
    uColor: new THREE.Color('#d4af37'),
    uTexture: null,
  },
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
extend({ PetroSoftMaterial });

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
    if(meshRef.current) meshRef.current.rotation.y += delta * 0.02; 
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
const createArchShape = (width, height) => {
  const shape = new THREE.Shape();
  const w = width / 2; const h = height / 2;
  shape.moveTo(-w, -h); shape.lineTo(w, -h); shape.lineTo(w, h - 1.2); 
  shape.quadraticCurveTo(w, h, 0, h + 1.0); shape.quadraticCurveTo(-w, h, -w, h - 1.2); shape.lineTo(-w, -h); 
  return shape;
};

// 4. КАРТОЧКА
function PortalCard({ url, title, color, position, rotation, index, hoveredState, setHovered }) {
  const groupRef = useRef();
  const imageRef = useRef();
  const isHovered = hoveredState === index;
  const isAnyHovered = hoveredState !== null;
  const texture = useTexture(url);
  
  useLayoutEffect(() => {
    texture.center.set(0.5, 0.5); 
    texture.wrapS = THREE.ClampToEdgeWrapping; 
    texture.wrapT = THREE.ClampToEdgeWrapping;
    // Оптимизация памяти текстур: отключаем mipmaps (картинки всегда близко)
    texture.generateMipmaps = false; 
    texture.minFilter = THREE.LinearFilter;
  }, [texture]);

  useCursor(isHovered);

  const { frameGeometry, imageGeometry } = useMemo(() => {
    const s = createArchShape(ARCH_WIDTH, ARCH_HEIGHT);
    // Оптимизированное кол-во сегментов
    const fGeo = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4, curveSegments: 32 });
    const iGeo = new THREE.ShapeGeometry(s, 32);
    return { frameGeometry: fGeo, imageGeometry: iGeo };
  }, []);

  useLayoutEffect(() => {
    if (!imageRef.current) return;
    const geo = imageRef.current.geometry;
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i); const y = pos.getY(i);
      uv.setXY(i, (x / ARCH_WIDTH) + 0.5, (y / ARCH_HEIGHT) + 0.5);
    }
    uv.needsUpdate = true;
  }, [imageGeometry]);

  const targetColorNormal = useMemo(() => new THREE.Color(1, 1, 1), []);
  const targetColorDim = useMemo(() => new THREE.Color(0.2, 0.2, 0.2), []);
  
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1); 
    const targetScale = isHovered ? 1.1 : 1.0;
    const targetZ = isHovered ? 0.8 : 0;
    
    if (groupRef.current) {
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, dt * 4));
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2] + targetZ, dt * 4);
    }
    if (imageRef.current) {
        const target = (isAnyHovered && !isHovered) ? targetColorDim : targetColorNormal;
        imageRef.current.material.color.lerp(target, dt * 4);
    }
  });

  return (
    <Float speed={9} rotationIntensity={0.05} floatIntensity={0.2} floatingRange={[-0.05, 0.05]}>
      <group 
        ref={groupRef} 
        position={position} 
        rotation={rotation}
        // ВАЖНО: События вешаем только на группу, чтобы React не искал их внутри
        onPointerOver={(e) => { e.stopPropagation(); setHovered(index); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
      >
          <mesh geometry={frameGeometry} position={[0, 0, -0.1]}>
            {/* Оптимизация: MeshStandardMaterial вместо Physical. Быстрее рендерится. */}
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.4} envMapIntensity={1.5} />
          </mesh>
          <mesh ref={imageRef} geometry={imageGeometry} position={[0, 0, 0.11]}>
             <meshBasicMaterial map={texture} color="white" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <Text position={[0, -2.3, 0.2]} fontSize={0.25} color={isHovered ? color : "#dcc48e"} anchorX="center" anchorY="top" outlineWidth={0.02} outlineColor="#1a0b05" letterSpacing={0.1}>
            {title.toUpperCase()}
          </Text>
      </group>
    </Float>
  );
}

// --- СЦЕНА ---
function CategoriesScene() {
  const [hovered, setHovered] = useState(null);
  return (
    <>
      <Environment preset="city" blur={1} />
      <color attach="background" args={['#1a0b05']} /> 
      
      <PetroglyphWall />
      <KeregeBackground /> 
      
      <ambientLight intensity={0.4} /> 
      <pointLight position={[0, -5, 5]} intensity={2} color="#ffaa00" distance={15} />
      <spotLight position={[0, 10, 5]} intensity={3} color="#fff" angle={0.5} />
      
      <group position={[0, -0.5, 0]}>
        <PortalCard index={0} url={cityImg} title="Город" color="#40e0d0" position={[-3.4, 0, 0.5]} rotation={[0, 0.6, 0]} hoveredState={hovered} setHovered={setHovered} />
        <PortalCard index={1} url={historyImg} title="История" color="#ffd700" position={[0, 0, 0]} rotation={[0, 0, 0]} hoveredState={hovered} setHovered={setHovered} />
        <PortalCard index={2} url={natureImg} title="Природа" color="#50c878" position={[3.4, 0, 0.5]} rotation={[0, -0.6, 0]} hoveredState={hovered} setHovered={setHovered} />
      </group>
      <fog attach="fog" args={['#1a0b05', 15, 35]} />
    </>
  );
}

const Categories = () => {
  return (
    <div className="categories-container">
      <div className="categories-transition-top"></div>

      <div className="categories-header">
        <h2 className="categories-title">Врата Туркестана</h2>
      </div>
      <Canvas 
        camera={{ position: [0, 0, 9], fov: 50 }} 
        dpr={[1, 1.5]} 
        gl={{ 
          powerPreference: "high-performance",
          antialias: true
        }}
      >
        <CategoriesScene />
      </Canvas>
    </div>
  );
};

export default Categories;