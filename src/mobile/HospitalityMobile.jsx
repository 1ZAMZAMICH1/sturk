import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import { Canvas } from '@react-three/fiber';
import { Cloud, Sparkles } from '@react-three/drei';
import { EditorialModal } from './RestaurantsPageMobile';
import { AttractionModal } from './CategoryPageMobile';
import { HotelModal } from './HotelsPageMobile';
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
  const { t, i18n } = useTranslation();
  const [restaurants, setRestaurants] = useState([]);
  const [atts, setAtts] = useState([]);
  const [hots, setHots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResto, setSelectedResto] = useState(null);
  const [otherModal, setOtherModal] = useState(null);

  const handleOpenOther = (type, rawData) => {
    const data = { ...rawData };
    if (data.gallery && typeof data.gallery === 'string') {
        try { data.gallery = JSON.parse(data.gallery); } catch(e) { data.gallery = []; }
    }
    if (data.lat && data.lng) {
        data.coordinates = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
    }
    setOtherModal({ type, data });
  };

  useEffect(() => {
    const load = async () => {
      const [rData, aData, hData] = await Promise.all([
        fetchSheetData('restaurants'),
        fetchSheetData('attractions'),
        fetchSheetData('hotels')
      ]);
      setRestaurants(Array.isArray(rData) && rData.length > 0 ? rData : []);
      setAtts(aData || []);
      setHots(hData || []);
      setLoading(false);
    };
    load();
  }, [i18n.language]);

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
        {restaurants.slice(0, 5).map((item, index) => {
          const localizedName = item[`name_${i18n.language}`] || item.name_ru || item.name || item.title;
          const localizedType = item[`cuisine_${i18n.language}`] || item[`specialty_${i18n.language}`] || item.cuisine_ru || item.specialty_ru || item.cuisine || item.type;
          
          return (
            <div className={`khan-card-mob ${index === 4 ? 'large' : 'small'}`} key={item.id} onClick={() => setSelectedResto(item)}>
              <div className="khan-img-box-mob">
                <img src={item.image || item.img} alt={localizedName} />
                <div className="grain-overlay-mob" />
              </div>
              <div className="khan-border-mob">
                <div className="corner c-tl" /><div className="corner c-tr" />
                <div className="corner c-bl" /><div className="corner c-br" />
              </div>
              <div className="khan-info-mob">
                <span className="khan-type-mob">{localizedType}</span>
                <h4 className="khan-title-mob">{localizedName}</h4>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedResto && (
        <EditorialModal 
            res={selectedResto}
            atts={atts}
            hots={hots}
            onClose={() => setSelectedResto(null)}
            onOpenOther={handleOpenOther}
        />
      )}

      {otherModal?.type === 'attraction' && (
          <AttractionModal
              item={otherModal.data}
              onClose={() => setOtherModal(null)}
          />
      )}

      {otherModal?.type === 'hotel' && (
          <HotelModal
              hotel={otherModal.data}
              onClose={() => setOtherModal(null)}
          />
      )}
    </div>
  );
};

export default HospitalityMobile;
