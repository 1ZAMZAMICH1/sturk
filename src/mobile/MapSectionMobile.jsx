// src/mobile/MapSectionMobile.jsx
// ОТКАТ К РАБОЧЕЙ ВЕРСИИ (с поворотом всего контейнера)

import React, { useState, useEffect, useMemo } from 'react';
import { fetchSheetData } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Canvas } from '@react-three/fiber';
import { Clouds, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapSectionMobile.css';

import rollerLeftImg from '../assets/scroll-left.png';
import rollerRightImg from '../assets/scroll-right.png';
import paperTextureImg from '../assets/scroll-paper.png';

const FALLBACK_POINTS = [
  { id: 1, type: 'sight', pos: [43.296, 68.277], title: 'Мавзолей Ясави', desc: 'Святыня Тюркского мира' },
  { id: 2, type: 'city',  pos: [43.516, 67.767], title: 'Сауран',          desc: 'Древнее городище' },
  { id: 3, type: 'nature',pos: [43.033, 69.310], title: 'Акмешит',         desc: 'Пещера дракона' },
  { id: 4, type: 'sight', pos: [42.855, 68.300], title: 'Отырар',          desc: 'Великая библиотека' },
];

const FILTERS = [
  { id: 'all',    label: 'Всё'     },
  { id: 'sight',  label: 'История' },
  { id: 'nature', label: 'Природа' },
  { id: 'hotel',  label: 'Отели'  },
];

const TYPE_COLORS = { sight: '#00ffff', nature: '#00ff7f', hotel: '#da70d6', city: '#ffd700' };

const iconsCache = {};
const getIcon = (type) => {
  const safeType = TYPE_COLORS[type] ? type : 'sight';
  if (!iconsCache[safeType]) {
    const color = TYPE_COLORS[safeType];
    iconsCache[safeType] = L.divIcon({
      className: 'custom-pin',
      html: `<div class="pin-glow" style="background:${color}"></div><div class="pin-core" style="background:${color}"></div>`,
      iconSize: [20, 20], iconAnchor: [10, 10],
    });
  }
  return iconsCache[safeType];
};

const MapResizeController = () => {
  const map = useMap();
  useEffect(() => {
    let id;
    const start = Date.now();
    const tick = () => { if (Date.now() - start < 3000) { map.invalidateSize(); id = requestAnimationFrame(tick); } };
    tick();
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
};

const MobileMapBackground = React.memo(() => (
  <>
    <ambientLight intensity={0.6} />
    <pointLight position={[10, 10, 10]} color="#ffd700" intensity={2.5} />
    <pointLight position={[-10, -5, -5]} color="#d4af37" intensity={1.5} />
    <Sparkles count={400} scale={[40, 30, 10]} position={[0, 0, -5]} size={3} speed={0.2} opacity={0.5} color="#ffcc66" noise={1} />
    <Clouds material={THREE.MeshBasicMaterial} limit={400}>
      <Cloud seed={10} segments={40} bounds={[50, 40, 2]} volume={60} color="#3b251a" position={[0, 0, -20]} speed={0} opacity={0.9} />
      <Cloud seed={20} segments={30} bounds={[40, 30, 5]} volume={40} color="#5c4033" position={[0, 0, -16]} speed={0.02} opacity={0.8} />
      <Cloud seed={30} segments={25} bounds={[35, 25, 6]} volume={30} color="#8c6b4a" position={[0, 0, -12]} speed={0.05} opacity={0.6} />
      <Cloud seed={40} segments={20} bounds={[30, 20, 6]} volume={25} color="#a67c52" position={[0, 0, -8]} speed={0.08} opacity={0.4} />
    </Clouds>
    <color attach="background" args={['#261912']} />
    <fog attach="fog" args={['#261912', 5, 45]} />
  </>
));

const MapSectionMobile = () => {
  const [isOpen, setIsOpen]       = useState(false);
  const [filter, setFilter]       = useState('all');
  const [mapPoints, setMapPoints] = useState([]);
  const [mapRoutes, setMapRoutes] = useState([]);
  const [activeRouteId, setActiveRouteId] = useState(null);

  useEffect(() => {
    (async () => {
      const pts  = await fetchSheetData('map_points');
      const rts  = await fetchSheetData('map_routes');
      const parsed = (pts && Array.isArray(pts) ? pts : FALLBACK_POINTS)
        .map(p => ({ ...p, pos: Array.isArray(p.pos) ? p.pos : (typeof p.pos === 'string' ? p.pos.split(',').map(Number) : [0,0]) }))
        .filter(p => !isNaN(p.pos[0]) && p.pos[0] !== 0);
      setMapPoints(parsed.length ? parsed : FALLBACK_POINTS);
      setMapRoutes(Array.isArray(rts) ? rts : []);
    })();
    const t = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  const filteredPoints = useMemo(() =>
    mapPoints.filter(p => filter === 'all' || p.type === filter),
  [filter, mapPoints]);

  return (
    <div className={`map-mob-root ${isOpen ? 'open' : ''}`}>

      <div className="mob-hero-bg">
        <Canvas camera={{ position:[0,0,14], fov:60 }} dpr={[1,1.5]}>
          <MobileMapBackground />
        </Canvas>
        <div className="mob-color-grade" />
      </div>

      <h2 className={`mob-ui-title ${isOpen ? 'visible' : ''}`}>Навигатор</h2>

      {/* ОБОЛОЧКА СВИКА ДЛЯ ПОЗИЦИОНИРОВАНИЯ */}
      <div className="mob-scroll-frame">
        <div className={`mob-scroll-wrap ${isOpen ? 'open' : ''}`}>
          <div className="mob-roller-wrapper left">
            <img src={rollerLeftImg} alt="" className="mob-roller-img" />
          </div>

          <div className="mob-paper-center">
            <img src={paperTextureImg} className="mob-paper-bg" alt="" />
            <div className="mob-map-mask" style={{
              maskImage:         `url(${paperTextureImg})`,
              WebkitMaskImage:   `url(${paperTextureImg})`,
              maskSize:          '100% 100%',
            }}>
              <MapContainer
                center={[43.0, 68.5]} zoom={8}
                zoomControl={false} attributionControl={false}
                className="mob-leaflet" preferCanvas={true}
              >
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                <MapResizeController />

                {mapRoutes.map(r => {
                  if (!activeRouteId) return null;
                  if (activeRouteId !== 'all' && activeRouteId !== r.id) return null;
                  return <Polyline key={r.id} positions={r.nodes} color={r.color||'#00e5ff'} weight={5} opacity={0.9} />;
                })}

                {filteredPoints.map(p => (
                  <Marker key={p.id} position={p.pos}
                    icon={p.icon ? L.icon({ iconUrl:p.icon, iconSize:[40,40], iconAnchor:[20,20] }) : getIcon(p.type)}>
                    <Popup className="glass-popup" closeButton={false}>
                      <h3>{p.title}</h3><p>{p.desc}</p>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="mob-roller-wrapper right">
            <img src={rollerRightImg} alt="" className="mob-roller-img" />
          </div>
        </div>
      </div>

      <div className={`mob-map-ui ${isOpen ? 'visible' : ''}`}>
        <div className="mob-ui-section">
          <span className="mob-section-label">Объекты</span>
          <div className="mob-ui-grid">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`mob-ui-btn ${filter === f.id ? 'active' : ''}`}>{f.label}</button>
            ))}
          </div>
        </div>
        {mapRoutes.length > 0 && (
          <div className="mob-ui-section">
          <span className="mob-section-label">Пути</span>
          <div className="mob-ui-grid">
            <button onClick={() => setActiveRouteId(activeRouteId === 'all' ? null : 'all')} className={`mob-ui-btn ${activeRouteId === 'all' ? 'active' : ''}`}>Все пути</button>
            {mapRoutes.map(r => (
              <button key={r.id} onClick={() => setActiveRouteId(activeRouteId === r.id ? null : r.id)} className={`mob-ui-btn ${activeRouteId === r.id ? 'active' : ''}`}>{r.title}</button>
            ))}
          </div>
        </div>
        )}
      </div>

    </div>
  );
};

export default MapSectionMobile;
