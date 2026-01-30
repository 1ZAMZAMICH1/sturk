import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Cloud } from '@react-three/drei';
import './Hotels.css';

const HOTEL_IMG = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop";

const DATA = {
    hotels: [
        { id: 2, title: "Karavan", type: "Boutique", size: "small", img: HOTEL_IMG },
        { id: 3, title: "Hampton", type: "Hotel", size: "small", img: HOTEL_IMG },
        { id: 4, title: "Silk Way", type: "Hostel", size: "small", img: HOTEL_IMG },
        { id: 5, title: "Grand", type: "Hotel", size: "small", img: HOTEL_IMG },
        { id: 1, title: "Rixos", type: "Resort", size: "large", img: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/291667636.jpg?k=123456" },
    ]
};

const Hotels = () => {
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
                </div>

                <div className="mosaic-col right-mosaic">
                    <div className="mosaic-grid">
                        {DATA.hotels.map((item) => (
                            <div className={`khan-card ${item.size}`} key={item.id}>
                                <div className="khan-img-box">
                                    <img src={item.img} alt={item.title} />
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
                                    <h4 className="khan-title">{item.title}</h4>
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
