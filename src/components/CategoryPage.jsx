import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './CategoryPage.css';
import { fetchSheetData } from '../services/api';
import { HotelModal } from './HotelsPage';
import { EditorialModal } from './RestaurantsPage';
import { Icons } from '../admin/AdminIcons';
import heroTextImg from '../assets/hero-text.png';
import { Stars } from './HotelsPage';

export const AttractionModal = ({ item, onClose, onNavigate, hots = [], restos = [], guides = [] }) => {
    const [activeImg, setActiveImg] = useState(item.image);
    const all = [item.image, ...(item.gallery || [])];

    const nearbyData = useMemo(() => {
        const filteredHots = (item.nearbyHotels || []).map(id => hots.find(h => h.id === id)).filter(Boolean);
        const filteredRestos = (item.nearbyRestaurants || []).map(id => restos.find(r => r.id === id)).filter(Boolean);
        
        // Smarter keywords for guides
        const name = item.name.toLowerCase();
        const keywords = name.replace(/мавзолей|ходжи|ахмеда|центр|визит|парк|озеро|река|пещера|комплекс|азрет|султан/g, '').trim().split(/\s+/);
        const relatedGuides = guides.filter(guide => 
            (guide.tours || []).some(tour => 
                tour.highlights?.some(h => keywords.some(k => k.length > 3 && h.toLowerCase().includes(k))) ||
                tour.title?.toLowerCase().includes(name)
            )
        );
        return { hotels: filteredHots, restaurants: filteredRestos, guides: relatedGuides };
    }, [item, hots, restos, guides]);

    const openMap = () => {
        if (item.coordinates && item.coordinates.lat) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${item.coordinates.lat},${item.coordinates.lng}`, '_blank');
        } else if (item.location) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`, '_blank');
        }
    };

    return (
        <div className="cp-modal-overlay" onClick={onClose}>
            <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button className="cp-modal-close" onClick={onClose}><Icons.Close /></button>
                <div className="cp-modal-left">
                    <img src={activeImg} alt={item.name} className="cp-modal-main-img" />
                    <div className="cp-modal-img-fade" />
                    {all.length > 1 && (
                        <div className="cp-modal-thumbs">
                            {all.map((img, i) => (
                                <img key={i} src={img} className={`cp-thumb ${activeImg === img ? 'active' : ''}`} onClick={() => setActiveImg(img)} alt="" />
                            ))}
                        </div>
                    )}
                </div>
                <div className="cp-modal-right">
                    <div className="cp-modal-eyebrow">{item.category}</div>
                    <h2 className="cp-modal-title">{item.name}</h2>
                    <p className="cp-modal-desc">{item.fullDescription || item.description}</p>
                    <div className="cp-modal-facts">
                        <div className="cp-fact">
                            <span className="cp-fact-label">Локация</span>
                            <span className="cp-fact-val">{item.city || 'Туркестанская область'}</span>
                        </div>
                        {item.hours && (
                            <div className="cp-fact">
                                <span className="cp-fact-label">Режим работы</span>
                                <span className="cp-fact-val">{item.hours}</span>
                            </div>
                        )}
                        <button className="cp-map-btn" onClick={openMap} style={{ marginTop: '20px', width: 'fit-content' }}>
                             <Icons.Pin style={{ width: 14 }} /> Показать на карте
                        </button>
                    </div>
                    <div className="cp-modal-rich-sections">
                        {nearbyData.hotels.length > 0 && (
                            <div className="cp-modal-sub-section">
                                <h4 className="cp-sub-h">Где остановиться рядом</h4>
                                <div className="cp-mini-grid">
                                    {nearbyData.hotels.map(h => (
                                        <div key={h.id} className="cp-mini-card clickable" onClick={() => onNavigate(h)}>
                                            <img src={h.image} alt="" />
                                            <div><h6>{h.name}</h6><Stars count={h.stars} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {nearbyData.restaurants.length > 0 && (
                            <div className="cp-modal-sub-section">
                                <h4 className="cp-sub-h">Где поесть рядом</h4>
                                <div className="cp-mini-grid">
                                    {nearbyData.restaurants.map(r => (
                                        <div key={r.id} className="cp-mini-card clickable" onClick={() => onNavigate(r)}>
                                            <img src={r.image} alt="" />
                                            <div><h6>{r.name}</h6><span>{r.cuisine}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CategoryPage = () => {
    const { id: catId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hots, setHots] = useState([]);
    const [restos, setRestos] = useState([]);
    const [guides, setGuides] = useState([]);
    const [activeCity, setActiveCity] = useState('все');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const loadAll = async () => {
            const [allAtts, allHots, allRestos, allGuides] = await Promise.all([
                fetchSheetData('attractions'),
                fetchSheetData('hotels'),
                fetchSheetData('restaurants'),
                fetchSheetData('guides')
            ]);
            setData(allAtts.filter(a => a.category_tag === catId || a.type === catId));
            setHots(allHots);
            setRestos(allRestos);
            setGuides(allGuides);
            setLoading(false);
        };
        loadAll();
    }, [catId]);

    const cities = useMemo(() => {
        const set = new Set(data.map(i => i.city).filter(Boolean));
        return ['все', ...set];
    }, [data]);

    const filtered = useMemo(() =>
        activeCity === 'все' ? data : data.filter(i => i.city === activeCity),
        [data, activeCity]
    );

    if (loading) return <div className="loading-state">Древние тайны раскрываются...</div>;

    const meta = {
        city: { title: 'Городские', sub: 'достопримечательности' },
        spirit: { title: 'Духовные', sub: 'достопримечательности' },
        nature: { title: 'Природные', sub: 'достопримечательности' },
    }[catId] || { title: 'Heritage', sub: 'Turkistan' };

    return (
        <div className="cp-root">
            <div className="cp-header-wrap">
                <div className="cp-topbar">
                    <Link to="/" className="cp-back">Назад</Link>
                    <div className="cp-logo-container"><img src={heroTextImg} alt="Turkistan" className="cp-header-logo" /></div>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '2px', opacity: .5 }}>{filtered.length} объектов</span>
                </div>
                <div className="cp-loc-row">
                    <span className="cp-loc-label">Локация</span>
                    {cities.map(city => (
                        <button key={city} className={`cp-loc-btn ${activeCity === city ? 'active' : ''}`} onClick={() => setActiveCity(city)}>
                            <span className="cp-loc-btn-inner">{city}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="cp-hero">
                <h1 className="cp-hero-h"><span>{meta.title}</span></h1>
            </div>

            <main className="cp-mosaic-container">
                <div className="cp-mosaic-grid">
                    {filtered.map((item) => (
                        <div key={item.id} className="cp-card-wrapper" onClick={() => setSelected(item)}>
                            <article className="cp-double-arch">
                                <div className="cp-arch-content">
                                    <div className="cp-img-box">
                                        <img src={item.image} alt={item.name} className="cp-img" loading="lazy" />
                                        <div className="cp-img-blend" />
                                    </div>
                                    <div className="cp-text-box">
                                        <h2 className="cp-tile-name">{item.name}</h2>
                                        <p className="cp-tile-desc">{item.description}</p>
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            </main>

            {selected && (
                <>
                    {'stars' in selected ? <HotelModal hotel={selected} onClose={() => setSelected(null)} /> :
                     'cuisine' in selected ? <EditorialModal res={selected} onClose={() => setSelected(null)} /> :
                     <AttractionModal 
                        item={selected} 
                        hots={hots} 
                        restos={restos} 
                        guides={guides}
                        onClose={() => setSelected(null)} 
                        onNavigate={(newItem) => setSelected(newItem)} 
                     />}
                </>
            )}
        </div>
    );
};

export default CategoryPage;
