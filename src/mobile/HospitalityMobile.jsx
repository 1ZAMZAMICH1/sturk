// src/mobile/HospitalityMobile.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import { Canvas } from '@react-three/fiber';
import { Cloud, Sparkles } from '@react-three/drei';
import './HospitalityMobile.css';

// Тот же 3D-фон что и на ПК
const DarkAtmosphere = () => (
  <>
    <ambientLight intensity={0.4} />
    <pointLight position={[0, -10, 5]} intensity={1.5} color="#ff6600" />
    <Cloud position={[0, -5, -5]} speed={0.1} opacity={0.3} color="#5c2a2a" bounds={[10, 2, 2]} />
    <Sparkles count={250} scale={[15, 10, 5]} size={3} speed={0.3} opacity={0.6} color="#ffcc99" noise={0.5} />
  </>
);

const HospitalityMobile = () => {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchSheetData('restaurants');
      setRestaurants(Array.isArray(data) && data.length > 0 ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="mob-loading">{t('hospitality.loading')}</div>;

  return (
    <div className="hosp-mob-root">
      {/* Заголовок сверху по центру */}
      <div className="hosp-mob-header">
        <h2 className="hosp-mob-title" dangerouslySetInnerHTML={{ __html: t('hospitality.title') }} />
        <p className="hosp-mob-desc">
          {t('hospitality.description')}
        </p>
        <div className="hosp-mob-ornament" />
        <Link to="/restaurants" className="hosp-mob-btn">
          {t('hospitality.btn')} <span>→</span>
        </Link>
      </div>

      {/* Мозаичная сетка — как на ПК */}
      <div className="hosp-mob-mosaic">
        {restaurants.slice(0, 5).map((item, index) => (
          <div className={`khan-card-mob ${index === 4 ? 'large' : 'small'}`} key={item.id} onClick={() => window.location.href=`/restaurants?id=${item.id}`}>
            <div className="khan-img-box-mob">
              <img src={item.image || item.img} alt={item.name || item.title} />
              <div className="grain-overlay-mob" />
            </div>
            <div className="khan-border-mob">
              <div className="corner c-tl" /><div className="corner c-tr" />
              <div className="corner c-bl" /><div className="corner c-br" />
            </div>
            <div className="khan-info-mob">
              <span className="khan-type-mob">{item.cuisine || item.type}</span>
              <h4 className="khan-title-mob">{item.name || item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalityMobile;
