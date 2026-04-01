import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import './Hotels.css';

const Hotels = () => {
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

    if (loading) return <div className="loading-state">Загрузка отелей...</div>;

    const displayHotels = hotels.slice(0, 5);

    return (
        <div className="hotels-section">
            <div className="hotels-content">
                <div className="hotels-text-block left-text">
                    <h2 className="hotels-subtitle">Отдых Достойный Ханов</h2>
                    <p className="hotels-description">
                        После долгого путешествия по священным местам, обретите покой и уют в отелях Туркестана.
                        Мы объединили современный комфорт мирового уровня с уникальным национальным колоритом.
                        Бутик-отели в стиле древних караван-сараев или роскошные курортные комплексы —
                        выберите идеальное место для восстановления сил в самом сердце Центральной Азии.
                    </p>
                    <div className="hotels-ornament"></div>
                    <Link to="/hotels" className="hotels-explore-btn">
                        Смотреть все отели
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
