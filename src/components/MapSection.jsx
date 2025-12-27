// src/components/MapSection.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Canvas } from '@react-three/fiber';
import { Clouds, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapSection.css';

// ИМПОРТЫ КАРТИНОК
import rollerLeftImg from '../assets/scroll-left.png';
import rollerRightImg from '../assets/scroll-right.png';
import paperTextureImg from '../assets/scroll-paper.png';

const MAP_POINTS = [
  { id: 1, type: 'sight', pos: [43.296, 68.277], title: 'Мавзолей Ясави', desc: 'Святыня Тюркского мира' },
  { id: 2, type: 'city', pos: [43.516, 67.767], title: 'Сауран', desc: 'Древнее городище' },
  { id: 3, type: 'nature', pos: [43.033, 69.310], title: 'Акмешит', desc: 'Пещера дракона' },
  { id: 4, type: 'sight', pos: [42.855, 68.300], title: 'Отырар', desc: 'Великая библиотека' },
  { id: 5, type: 'nature', pos: [42.333, 70.433], title: 'Аксу-Жабагылы', desc: 'Тюльпаны Грейга' },
  { id: 6, type: 'hotel', pos: [43.290, 68.285], title: 'Rixos', desc: '5 звезд в степи' },
];

const FILTERS = [
  { id: 'all', label: 'Всё' },
  { id: 'sight', label: 'История' },
  { id: 'nature', label: 'Природа' },
  { id: 'hotel', label: 'Отели' },
];

const TYPE_COLORS = { sight: '#00ffff', nature: '#00ff7f', hotel: '#da70d6', city: '#ffd700' };

// ОПТИМИЗАЦИЯ: Кэш иконок, чтобы не создавать L.divIcon каждый рендер
const iconsCache = {};

const getIcon = (type) => {
  if (!iconsCache[type]) {
    const color = TYPE_COLORS[type];
    iconsCache[type] = L.divIcon({
      className: 'custom-pin',
      html: `
        <div class="pin-glow" style="background: ${color}"></div>
        <div class="pin-core" style="background: ${color}"></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }
  return iconsCache[type];
};

const MapResizeController = () => {
  const map = useMap();
  useEffect(() => {
    // ОПТИМИЗАЦИЯ: requestAnimationFrame более плавный для анимации, чем setInterval
    let frameId;
    const startTime = Date.now();
    const duration = 3000;

    const animate = () => {
      const now = Date.now();
      if (now - startTime < duration) {
        map.invalidateSize();
        frameId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [map]);
  return null;
};

// --- МОДИФИЦИРОВАННЫЙ ФОН HERO ---
// Оборачиваем в memo, чтобы React не перерисовывал фон лишний раз
const HeroBackgroundScene = React.memo(() => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} color="#ffd700" intensity={2.5} />
      <pointLight position={[-10, -5, -5]} color="#d4af37" intensity={1.5} />

      {/* ОПТИМИЗАЦИЯ: Sparkles очень легкие, их можно не трогать */}
      <Sparkles 
        count={400} 
        scale={[40, 30, 10]} 
        position={[0, 0, -5]} 
        size={3} 
        speed={0.2} 
        opacity={0.5} 
        color="#ffcc66" 
        noise={1} 
      />

      {/* ОПТИМИЗАЦИЯ ОБЛАКОВ: Снизил segments. 
          Было 80/60/50, стало 40/30/25. Визуально для фона разницы нет, нагрузка в 2 раза меньше. */}
      <Clouds material={THREE.MeshBasicMaterial} limit={400}> 
        <Cloud seed={10} segments={40} bounds={[50, 40, 2]} volume={60} color="#3b251a" position={[0, 0, -20]} speed={0} opacity={0.9} />
        <Cloud seed={20} segments={30} bounds={[40, 30, 5]} volume={40} color="#5c4033" position={[0, 0, -16]} speed={0.02} opacity={0.8} />
        <Cloud seed={30} segments={25} bounds={[35, 25, 6]} volume={30} color="#8c6b4a" position={[0, 0, -12]} speed={0.05} opacity={0.6} />
        <Cloud seed={40} segments={20} bounds={[30, 20, 6]} volume={25} color="#a67c52" position={[0, 0, -8]} speed={0.08} opacity={0.4} />
      </Clouds>

      <color attach="background" args={['#261912']} />
      <fog attach="fog" args={['#261912', 5, 45]} />
    </>
  );
});

const MapSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activePoint, setActivePoint] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // ОПТИМИЗАЦИЯ: useMemo предотвращает пересчет массива при каждом рендере (например при движении карты)
  const filteredPoints = useMemo(() => {
    return MAP_POINTS.filter(p => filter === 'all' || p.type === filter);
  }, [filter]);

  return (
    <div className="map-section">
      
      {/* 3D ФОН */}
      <div className="hero-bg-container">
        {/* ОПТИМИЗАЦИЯ: dpr ограничено [1, 1.5] для производительности на Retina */}
        <Canvas camera={{ position: [0, 0, 14], fov: 60 }} dpr={[1, 1.5]}>
          <HeroBackgroundScene />
        </Canvas>
        
        <div className="color-grade-overlay"></div>
      </div>

      {/* СВИТОК */}
      <div className={`scroll-container ${isOpen ? 'open' : ''}`}>
        <div className="roller-wrapper left">
            <img src={rollerLeftImg} alt="" className="roller-img" />
        </div>

        <div className="paper-center">
            <img src={paperTextureImg} className="paper-bg-image" alt="" />
            <div className="map-mask-wrapper" style={{
                maskImage: `url(${paperTextureImg})`,
                WebkitMaskImage: `url(${paperTextureImg})`,
                maskSize: '100% 100%',
                WebkitMaskSize: '100% 100%'
            }}>
                <MapContainer 
                    center={[43.0, 68.5]} 
                    zoom={8} 
                    zoomControl={false}
                    scrollWheelZoom={false}
                    className="leaflet-instance"
                    preferCanvas={true} // ОПТИМИЗАЦИЯ: Использует Canvas для отрисовки векторов Leaflet (если будут линии)
                >
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Esri"
                    />
                    <MapResizeController />
                    <div className="inner-shadow-overlay"></div>
                    {filteredPoints.map(point => (
                        <Marker 
                            key={point.id} 
                            position={point.pos} 
                            // ОПТИМИЗАЦИЯ: Берем иконку из кэша
                            icon={getIcon(point.type)}
                            eventHandlers={{ click: () => setActivePoint(point) }}
                        >
                            <Popup className="glass-popup" closeButton={false} autoPan={true}>
                                <h3>{point.title}</h3>
                                <p>{point.desc}</p>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>

        <div className="roller-wrapper right">
             <img src={rollerRightImg} alt="" className="roller-img" />
        </div>
      </div>

      {/* UI */}
      <div className={`map-ui ${isOpen ? 'visible' : ''}`}>
        <h2 className="ui-title">Навигатор</h2>
        <div className="ui-filters">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`ui-btn ${filter === f.id ? 'active' : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapSection;