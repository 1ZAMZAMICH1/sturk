import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import './Hotels.css';

const Hotels = () => {
    const { t } = useTranslation();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHotels = async () => {
            const data = await fetchSheetData('hotels');
            setHotels(data.length > 0 ? data : []);
            setLoading(false);
        };
        loadHotels();
    }, []);

    if (loading) return <div className="loading-state">{t('hotels.loading')}</div>;

    const displayHotels = hotels.slice(0, 5);

    return (
        <div className="hotels-section">
            <div className="hotels-content">
                <div className="hotels-text-block left-text">
                    <h2 className="hotels-subtitle">{t('hotels.title')}</h2>
                    <p className="hotels-description">
                        {t('hotels.description')}
                    </p>
                    <div className="hotels-ornament"></div>
                    <Link to="/hotels" className="hotels-explore-btn">
                        {t('hotels.btn')}
                        <span className="btn-arrow">→</span>
                    </Link>
                </div>

                <div className="mosaic-col right-mosaic">
                    <div className="mosaic-grid">
                        {displayHotels.map((item, index) => (
                            <div className={`khan-card ${index === 4 ? 'large' : 'small'}`} key={item.id}>
                                <div className="khan-img-box">
                                    <img src={item.image || item.img} alt={item.name || item.title} />
                                    <div className="grain-overlay"></div>
                                </div>
                                <div className="khan-border">
                                    <div className="corner c-tl"></div>
                                    <div className="corner c-tr"></div>
                                    <div className="corner c-bl"></div>
                                    <div className="corner c-br"></div>
                                </div>
                                <div className="khan-info">
                                    <span className="khan-type">{item.type}</span>
                                    <h4 className="khan-title">{item.name || item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hotels;
