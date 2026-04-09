import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import { HotelModal } from './HotelsPageMobile';
import { AttractionModal } from './CategoryPageMobile';
import { EditorialModal } from './RestaurantsPageMobile';
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
  const { t, i18n } = useTranslation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedOther, setSelectedOther] = useState(null);
  const [restos, setRestos] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [data, allRestos] = await Promise.all([
          fetchSheetData('hotels'),
          fetchSheetData('restaurants')
      ]);
      setHotels(Array.isArray(data) && data.length > 0 ? data : []);
      setRestos(allRestos);
      setLoading(false);
    };
    load();
  }, [i18n.language]);

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
        {hotels.slice(0, 5).map((item, index) => {
          const localizedName = item[`name_${i18n.language}`] || item.name_ru || item.name || item.title;
          const localizedType = item[`type_${i18n.language}`] || item.type_ru || item.type;
          
          return (
            <div className={`khan-card-mob ${index === 4 ? 'large' : 'small'}`} key={item.id} onClick={() => setSelectedHotel(item)}>
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
      
      {selectedHotel && (
        <HotelModal 
            hotel={selectedHotel} 
            onClose={() => setSelectedHotel(null)} 
            onOpenOther={(item, type) => setSelectedOther({ item, type })}
        />
      )}

      {selectedOther?.type === 'attraction' && (
          <AttractionModal 
              item={selectedOther.item} 
              hots={hotels} 
              restos={restos} 
              onClose={() => setSelectedOther(null)} 
              onNavigate={(newItem) => setSelectedOther({ ...selectedOther, item: newItem })} 
          />
      )}

      {selectedOther?.type === 'restaurant' && (
          <EditorialModal 
              res={selectedOther.item} 
              onClose={() => setSelectedOther(null)} 
              onOpenOther={(item, type) => setSelectedOther({ item, type })}
          />
      )}
    </div>
  );
};

export default HotelsMobile;
