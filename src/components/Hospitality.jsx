import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import { EditorialModal } from './RestaurantsPage';
import { AttractionModal } from './CategoryPage';
import { HotelModal } from './HotelsPage';
import './Hospitality.css';

const Hospitality = () => {
  const { t, i18n } = useTranslation();
  const [restaurants, setRestaurants] = useState([]);
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
    const loadData = async () => {
      const data = await fetchSheetData('restaurants');
      setRestaurants(data);
      setLoading(false);
    };
    loadData();
  }, [i18n.language]);

  if (loading) return <div className="loading-state">{t('hospitality.loading')}</div>;

  const displayRestaurants = restaurants.slice(0, 5);

  return (
    <div className="hospitality-section">
      <div className="hosp-content">
        <div className="mosaic-col left-mosaic">
          <div className="mosaic-grid">
            {displayRestaurants.map((item, index) => {
              const localizedName = item[`name_${i18n.language}`] || item.name_ru || item.name;
              const localizedType = item[`specialty_${i18n.language}`] || item.specialty_ru || item.cuisine || item.type;
              
              return (
                <div 
                  className={`khan-card ${index === 4 ? 'large' : 'small'}`} 
                  key={item.id}
                  onClick={() => setSelectedResto(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="khan-img-box">
                    <img src={item.image} alt={localizedName} />
                    <div className="grain-overlay"></div>
                  </div>
                  <div className="khan-border">
                    <div className="corner c-tl"></div>
                    <div className="corner c-tr"></div>
                    <div className="corner c-bl"></div>
                    <div className="corner c-br"></div>
                  </div>
                  <div className="khan-info">
                    <span className="khan-type">{localizedType}</span>
                    <h4 className="khan-title">{localizedName}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hosp-text-block right-text">
          <h2 className="hosp-subtitle">{t('hospitality.title')}</h2>
          <p className="hosp-description">
            {t('hospitality.description')}
          </p>
          <div className="hosp-ornament"></div>
          <Link to="/restaurants" className="hosp-explore-btn">
            {t('hospitality.btn')}
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
      
      {selectedResto && (
        <EditorialModal 
          res={selectedResto} 
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

export default Hospitality;