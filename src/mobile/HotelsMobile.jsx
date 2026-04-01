import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import './HotelsMobile.css';

// Зеркальный 3D фон для отелей (Песчаная атмосфера)
const SandsOfTimeAtmosphere = () => (
  <>
    <ambientLight intensity={0.6} />
    <pointLight position={[5, 10, -5]} intensity={2} color="#ffcc33" />
    <Sparkles count={300} scale={[15, 10, 5]} size={4} speed={0.2} opacity={0.5} color="#ffd700" noise={1} />
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[2, -2, -10]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#b8920f" wireframe />
        </mesh>
    </Float>
  </>
);

const HotelsMobile = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchSheetData('hotels');
      setHotels(Array.isArray(data) && data.length > 0 ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="mob-loading">Залы ожидания готовятся...</div>;

  return (
    <div className="hot-mob-root">
      {/* ЗАГОЛОВОК СВЕРХУ (Нормальный вид) */}
      <div className="hot-mob-header">
        <h2 className="hot-mob-title">Отдых Достойный<br />Великих Ханов</h2>
        <p className="hot-mob-desc">
          После долгого пути обретите покой в лучших отелях Туркестана.
          Мы объединили современный комфорт с уникальным национальным колоритом.
        </p>
        <div className="hot-mob-ornament" />
        <Link to="/hotels" className="hot-mob-btn">
          Смотреть все отели <span>→</span>
        </Link>
      </div>

      {/* МОЗАИКА СНИЗУ */}
      <div className="hot-mob-mosaic">
        {hotels.slice(0, 5).map((item, index) => (
          <div className={`khan-card-mob ${index === 4 ? 'large' : 'small'}`} key={item.id}>
            <div className="khan-img-box-mob">
              <img src={item.image} alt={item.name} />
              <div className="grain-overlay-mob" />
            </div>
            <div className="khan-border-mob">
              <div className="corner c-tl" /><div className="corner c-tr" />
              <div className="corner c-bl" /><div className="corner c-br" />
            </div>
            <div className="khan-info-mob">
               <span className="khan-type-mob">{item.type}</span>
               <h4 className="khan-title-mob">{item.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelsMobile;
