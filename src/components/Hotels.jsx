import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import { HotelModal } from './HotelsPage';
import { AttractionModal } from './CategoryPage';
import { EditorialModal } from './RestaurantsPage';
import './Hotels.css';

const Hotels = () => {
    const { t, i18n } = useTranslation();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedOther, setSelectedOther] = useState(null);
    const [restos, setRestos] = useState([]);

    useEffect(() => {
        const loadAll = async () => {
            const [hots, rs] = await Promise.all([
                fetchSheetData('hotels'),
                fetchSheetData('restaurants')
            ]);
            setHotels(hots.length > 0 ? hots : []);
            setRestos(rs);
            setLoading(false);
        };
        loadAll();
    }, [i18n.language]);

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
                            <div 
                                className={`khan-card ${index === 4 ? 'large' : 'small'}`} 
                                key={item.id}
                                onClick={() => setSelectedHotel(item)}
                                style={{ cursor: 'pointer' }}
                            >
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
                                    <h4 className="khan-title">{item[`name_${i18n.language}`] || item.name_ru || item.name_en || item.name_uz || item.name || item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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

export default Hotels;
