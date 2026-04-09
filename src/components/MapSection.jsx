// src/components/MapSection.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { useNavigate } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
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

// Данные будут загружаться из API. Оставлено как образец структуры.
const FALLBACK_POINTS = [
  { id: 1, type: 'sight', pos: [43.296, 68.277], title: 'Мавзолей Ясави', desc: 'Святыня Тюркского мира' },
  { id: 2, type: 'city', pos: [43.516, 67.767], title: 'Сауран', desc: 'Древнее городище' },
  { id: 3, type: 'nature', pos: [43.033, 69.310], title: 'Акмешит', desc: 'Пещера дракона' },
  { id: 4, type: 'sight', pos: [42.855, 68.300], title: 'Отырар', desc: 'Великая библиотека' },
  { id: 5, type: 'nature', pos: [42.333, 70.433], title: 'Аксу-Жабагылы', desc: 'Тюльпаны Грейга' },
  { id: 6, type: 'hotel', pos: [43.290, 68.285], title: 'Rixos', desc: '5 звезд в степи' },
];

const FALLBACK_ROUTES = [
  { 
    id: 'f1', 
    title: 'Демо: Шелковый путь', 
    nodes: [[43.296, 68.277], [43.300, 68.280], [43.310, 68.290]], 
    color: '#00e5ff' 
  }
];

const FILTERS = [
  { id: 'all', label: 'Всё' },
  { id: 'sight', label: 'История' },
  { id: 'nature', label: 'Природа' },
  { id: 'hotel', label: 'Отели' },
  { id: 'restaurant', label: 'Рестораны' },
];

const TYPE_COLORS = { 
  sight: '#00ffff', 
  nature: '#00ff7f', 
  hotel: '#ff9800', 
  restaurant: '#e91e63',
  city: '#ffd700' 
};

// ОПТИМИЗАЦИЯ: Кэш иконок, чтобы не создавать L.divIcon каждый рендер
const iconsCache = {};

const getIcon = (type) => {
  const safeType = TYPE_COLORS[type] ? type : 'sight'; // Fallback to 'sight' if type unknown
  if (!iconsCache[safeType]) {
    const color = TYPE_COLORS[safeType];
    iconsCache[safeType] = L.divIcon({
      className: 'custom-pin',
      html: `
        <div class="pin-glow" style="background: ${color}"></div>
        <div class="pin-core" style="background: ${color}"></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }
  return iconsCache[safeType];
};

const MapResizeController = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Немедленный вызов при монтировании
    map.invalidateSize();

    // ResizeObserver — поймает точный момент изменения размера контейнера
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (container) observer.observe(container);

    // Принудительный вызов после анимации свитка (transition: 2.5s)
    const t1 = setTimeout(() => map.invalidateSize(), 2600);
    // Ещё один чуть позже на случай рендер-задержки
    const t2 = setTimeout(() => map.invalidateSize(), 3000);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
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
  const { t, i18n } = useTranslation();
  const { ref: sectionRef, inView: canvasReady } = useInView({ rootMargin: '300px' });
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activePoint, setActivePoint] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [mapRoutes, setMapRoutes] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activeRouteId, setActiveRouteId] = useState(null); // Новый стейт для выбора маршрута
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const [points, routes, atts, hots, restos] = await Promise.all([
          fetchSheetData('map_points'),
          fetchSheetData('map_routes'),
          fetchSheetData('attractions'),
          fetchSheetData('hotels'),
          fetchSheetData('restaurants')
      ]);
      
      setAttractions(atts || []);
      setHotels(hots || []);
      setRestaurants(restos || []);

      // Проверяем наличие валидных точек
      const hasValidPoints = points && Array.isArray(points) && points.length > 0 && points.some(p => p.pos);
      
      const parsedPoints = (hasValidPoints ? points : FALLBACK_POINTS).map(p => ({
        ...p,
        pos: Array.isArray(p.pos) ? p.pos : (typeof p.pos === 'string' && p.pos.includes(',') ? p.pos.split(',').map(Number) : [0,0])
      })).filter(p => !isNaN(p.pos[0]) && p.pos[0] !== 0);

      const parsedRoutes = (routes && Array.isArray(routes) && routes.length > 0) ? routes.map(r => {
        let nodes = [];
        if (Array.isArray(r.nodes)) {
          nodes = r.nodes;
        } else if (typeof r.nodes === 'string' && r.nodes.length > 0) {
          nodes = r.nodes.split(';').map(n => n.split(',').map(Number));
        }
        return { ...r, nodes };
      }).filter(r => r.nodes.length > 0) : [];

      const finalRoutes = (parsedRoutes.length > 0) ? parsedRoutes : FALLBACK_ROUTES;
      
      setMapPoints(parsedPoints.length > 0 ? parsedPoints : FALLBACK_POINTS);
      setMapRoutes(finalRoutes);
    };
    loadData();

    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, [i18n.language]);

  // ОПТИМИЗАЦИЯ: useMemo предотвращает пересчет массива при каждом рендере (например при движении карты)
  const filteredPoints = useMemo(() => {
    if (filter === 'none') return [];
    return mapPoints.filter(p => filter === 'all' || p.type === filter);
  }, [filter, mapPoints]);

  const handleOpenDetails = (point) => {
      console.log('Клик по точке на карте:', point.title, 'Тип:', point.type);
      
      let targetUrl = null;

      if (point.type === 'hotel') {
          const hotelId = point.hotelId || point.attractionId || point.articleId;
          const hotel = hotels.find(h => String(h.id) === String(hotelId)) || hotels.find(h => h.name === point.title);
          if (hotel) targetUrl = `/hotels?id=${hotel.id}`;
      } else if (point.type === 'restaurant') {
          const restoId = point.restaurantId || point.attractionId || point.articleId;
          const resto = restaurants.find(r => String(r.id) === String(restoId)) || restaurants.find(r => r.name === point.title);
          if (resto) targetUrl = `/restaurants?id=${resto.id}`;
      } else {
          // По умолчанию считаем достопримечательностью (sight, nature, city)
          const attrId = point.attractionId || point.articleId;
          const attr = attractions.find(a => String(a.id) === String(attrId)) || attractions.find(a => a.name === point.title);
          if (attr) {
              const cat = attr.category_tag || attr.type || 'history';
              targetUrl = `/category/${cat}?id=${attr.id}`;
          }
      }

      if (targetUrl) {
          console.log('Переход к объекту:', targetUrl);
          navigate(targetUrl);
      } else {
          console.warn('Не удалось найти данные для этой точки.');
          alert('Данные для этого объекта еще не заполнены или объект не найден.');
      }
  };

  return (
    <div ref={sectionRef} className={`map-section ${isOpen ? 'open' : ''}`}>

      <div className="map-transition-bottom"></div>

      {/* 3D ФОН — грузится только когда секция видна */}
      <div className="hero-bg-container">
        {canvasReady ? (
          <Canvas camera={{ position: [0, 0, 14], fov: 60 }} dpr={[1, 1.5]}>
            <HeroBackgroundScene />
          </Canvas>
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#261912' }} />
        )}
        <div className="color-grade-overlay"></div>
      </div>

      {/* UI HEADER (ЗАГОЛОВОК СВЕРХУ) */}
      <div className={`map-header ${isOpen ? 'visible' : ''}`}>
        <h2 className="ui-title">{t('map.title')}</h2>
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
              attributionControl={false}
              scrollWheelZoom={true}
              className="leaflet-instance"
              preferCanvas={true}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
              <MapResizeController />
              <div className="inner-shadow-overlay"></div>
              
              {mapRoutes.map(route => {
                const isActive = activeRouteId === route.id || activeRouteId === 'all';
                if (!isActive && activeRouteId !== null) return null;
                if (activeRouteId === null) return null; 

                return (
                  <React.Fragment key={route.id}>
                    {/* Линия свечения (Blur/Glow) */}
                    <Polyline 
                      positions={route.nodes} 
                      color={route.color || '#00e5ff'} 
                      weight={activeRouteId === route.id ? 12 : 8}
                      opacity={0.3}
                      lineJoin="round"
                    />
                    {/* Основная яркая линия */}
                    <Polyline 
                      positions={route.nodes} 
                      color={route.color || '#00e5ff'} 
                      weight={activeRouteId === route.id ? 5 : 3}
                      opacity={1}
                      lineJoin="round"
                      dashArray={activeRouteId === route.id ? 'none' : '12, 12'}
                    >
                        <Tooltip sticky direction="top" className="route-tooltip">
                            {route[`title_${i18n.language}`] || route.title_ru || route.title}
                        </Tooltip>
                    </Polyline>
                  </React.Fragment>
                );
              })}

              {filteredPoints.map(point => {
                let attr = null;
                if (point.type === 'hotel') {
                    attr = hotels.find(h => String(h.id) === String(point.hotelId || point.attractionId) || h.name === point.title);
                } else if (point.type === 'restaurant') {
                    attr = restaurants.find(r => String(r.id) === String(point.restaurantId || point.attractionId) || r.name === point.title);
                } else {
                    attr = attractions.find(a => String(a.id) === String(point.attractionId || point.articleId) || a.name === point.title);
                }
                
                return (
                  <Marker
                    key={point.id}
                    position={point.pos}
                    icon={point.icon ? L.icon({ 
                      iconUrl: point.icon, 
                      iconSize: [60, 60], 
                      iconAnchor: [30, 30],
                      className: 'premium-map-icon' 
                    }) : getIcon(point.type)}
                    eventHandlers={{ click: () => setActivePoint(point) }}
                  >
                    <Popup className="glass-popup" closeButton={false} autoPan={true}>
                      <div className="map-popup-card">
                          {attr?.image && <img src={attr.image} className="popup-preview-img" alt="" />}
                          <div className="popup-info">
                              <h3>{point[`title_${i18n.language}`] || point.title_ru || point.title}</h3>
                              <p>{(attr?.[`description_${i18n.language}`] || attr?.[`shortDescription_${i18n.language}`] || attr?.description_ru || point[`desc_${i18n.language}`] || point.desc_ru || point.desc)?.substring(0, 80)}...</p>
                              <button className="popup-more-btn" onClick={() => handleOpenDetails(point)}>{t('map.details')}</button>
                          </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="roller-wrapper right">
          <img src={rollerRightImg} alt="" className="roller-img" />
        </div>
      </div>

      {/* UI CONTROLS (КНОПКИ СНИЗУ) */}
      <div className={`map-ui ${isOpen ? 'visible' : ''}`}>
        <div className="ui-controls-wrapper">
          <div className="ui-section">
            <span className="section-label">{t('map.categories_label')}</span>
            <div className="ui-filters">
              {FILTERS.map(f => (
                <button 
                  key={f.id} 
                  onClick={() => setFilter(f.id)} 
                  className={`ui-btn ${filter === f.id ? 'active' : ''}`}
                >
                  {t(`filters.${f.id}`)}
                </button>
              ))}
            </div>
          </div>

          {mapRoutes.length > 0 && (
            <div className="ui-section">
              <span className="section-label">{t('map.routes_label')}</span>
              <div className="ui-filters">
                <button 
                  onClick={() => setActiveRouteId(activeRouteId === 'all' ? null : 'all')} 
                  className={`ui-btn ${activeRouteId === 'all' ? 'active' : ''}`}
                >
                  {t('map.all_routes')}
                </button>
                {mapRoutes.map(route => (
                  <button 
                    key={route.id} 
                    onClick={() => setActiveRouteId(activeRouteId === route.id ? null : route.id)} 
                    className={`ui-btn route-btn ${activeRouteId === route.id ? 'active' : ''}`}
                  >
                    🛤️ {route[`title_${i18n.language}`] || route.title_ru || route.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSection;