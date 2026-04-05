import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import './Hospitality.css';

const Hospitality = () => {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchSheetData('restaurants');
      setRestaurants(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="loading-state">{t('hospitality.loading')}</div>;

  const displayRestaurants = restaurants.slice(0, 5);

  return (
    <div className="hospitality-section">
      <div className="hosp-content">
        <div className="mosaic-col left-mosaic">
          <div className="mosaic-grid">
            {displayRestaurants.map((item, index) => (
              <div className={`khan-card ${index === 4 ? 'large' : 'small'}`} key={item.id}>
                <div className="khan-img-box">
                  <img src={item.image} alt={item.name} />
                  <div className="grain-overlay"></div>
                </div>
                <div className="khan-border">
                  <div className="corner c-tl"></div>
                  <div className="corner c-tr"></div>
                  <div className="corner c-bl"></div>
                  <div className="corner c-br"></div>
                </div>
                <div className="khan-info">
                  <span className="khan-type">{item.cuisine || item.type}</span>
                  <h4 className="khan-title">{item.name}</h4>
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default Hospitality;