import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import './Hospitality.css';

const Hospitality = () => {
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

  if (loading) return <div className="loading-state">Ароматы востока наполняют комнату...</div>;

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
          <h2 className="hosp-subtitle">Вкус Великого Шелкового Пути</h2>
          <p className="hosp-description">
            Кухня Туркестана — это живая история, вобравшая в себя ароматы степи и изысканность восточных городов.
            От традиционного плова, приготовленного на открытом огне, до современных гастрономических интерпретаций —
            каждое блюдо здесь рассказывает свою легенду. Почувствуйте истинное восточное гостеприимство в лучших заведениях города.
          </p>
          <div className="hosp-ornament"></div>
          <Link to="/restaurants" className="hosp-explore-btn">
            Смотреть все заведения
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hospitality;