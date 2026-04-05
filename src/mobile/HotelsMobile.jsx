import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  if (loading) return <div className="mob-loading">{t('hotels.loading')}</div>;

  return (
    <div className="hot-mob-root">
      {/* ЗАГОЛОВОК СВЕРХУ (Нормальный вид) */}
      <div className="hot-mob-header">
        <h2 className="hot-mob-title" dangerouslySetInnerHTML={{ __html: t('hotels.title') }} />
        <p className="hot-mob-desc">
          {t('hotels.description')}
        </p>
        <div className="hot-mob-ornament" />
        <Link to="/hotels" className="hot-mob-btn">
          {t('hotels.btn')} <span>→</span>
        </Link>
      </div>

      {/* МОЗАИКА СНИЗУ */}
      <div className="hot-mob-mosaic">
        {hotels.slice(0, 5).map((item, index) => (
          <div className={`khan-card-mob ${index === 4 ? 'large' : 'small'}`} key={item.id} onClick={() => window.location.href=`/hotels?id=${item.id}`}>
            <div className="khan-img-box-mob">
              <img src={item.image || item.img} alt={item.name || item.title} />
              <div className="grain-overlay-mob" />
            </div>
            <div className="khan-border-mob">
              <div className="corner c-tl" /><div className="corner c-tr" />
              <div className="corner c-bl" /><div className="corner c-br" />
            </div>
            <div className="khan-info-mob">
               <span className="khan-type-mob">{item.type}</span>
               <h4 className="khan-title-mob">{item.name || item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelsMobile;
