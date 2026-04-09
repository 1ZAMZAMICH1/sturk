import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './CategoryPageMobile.css';
import { fetchSheetData } from '../services/api';
import { HotelModal } from './HotelsPageMobile';
import { EditorialModal } from './RestaurantsPageMobile';
import { Icons } from '../admin/AdminIcons';
import { Stars } from './HotelsPageMobile';
import LeafletMapWidget from '../components/LeafletMapWidget';

import heroTextImgRU from '../assets/hero-text.png';
import heroTextImgKZ from '../assets/hero-textkz.png';
import heroTextImgEN from '../assets/hero-texten.png';
import heroTextImgZH from '../assets/hero-textzh.png';

const heroImages = {
  ru: heroTextImgRU,
  kz: heroTextImgKZ,
  en: heroTextImgEN,
  zh: heroTextImgZH
};

export const AttractionModal = ({ item, onClose, onNavigate, hots = [], restos = [], guides = [] }) => {
    const { t, i18n } = useTranslation();
    const [activeImg, setActiveImg] = useState(item.image || item.img);
    const all = [item.image || item.img, ...(item.gallery || [])].filter(Boolean);

    const nearbyData = useMemo(() => {
        const filteredHots = (item.nearbyHotels || []).map(id => hots.find(h => String(h.id) === String(id))).filter(Boolean);
        const filteredRestos = (item.nearbyRestaurants || []).map(id => restos.find(r => String(r.id) === String(id))).filter(Boolean);
        
        const name = (item.name || item.title || "").toLowerCase();
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

    return createPortal(
        <div className="cp-modal-overlay" onClick={onClose}>
            <div className="cp-modal-inner-wrapper" onClick={e => e.stopPropagation()}>
                <button className="cp-modal-close" onClick={onClose}><Icons.Close /></button>
                <div className="cp-modal-left">
                    <img src={activeImg} alt={item.name || item.title} className="cp-modal-main-img" />
                    <div className="cp-modal-bottom-fade" />
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
                    <div className="cp-modal-eyebrow">{item[`category_${i18n.language}`] || item.category || t('category.meta.sub')}</div>
                    <h2 className="cp-modal-title">{item[`name_${i18n.language}`] || item.name_ru || item.name || item.title}</h2>
                    <p className="cp-modal-desc">{item[`fullDescription_${i18n.language}`] || item.fullDescription_ru || item.fullDescription || item[`description_${i18n.language}`] || item.description_ru || item.description}</p>
                        <div className="cp-modal-map" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
                             <div className="cp-sub-h" style={{ color: 'var(--gold)', marginBottom: '10px' }}>{t('restos_page.sec_location')}</div>
                             <div style={{ height: '220px', borderRadius: '12px', background: '#0a1628', marginTop: '10px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                                 <LeafletMapWidget 
                                    lat={item.lat || item.latitude} 
                                    lng={item.lng || item.longitude} 
                                    title={item.name || item.title} 
                                 />
                             </div>
                             <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#f3e5c3', opacity: 1, fontWeight: '400' }}>
                                {item.city || t('category.default_region')}, {item.location}
                             </p>
                        </div>
                    <div className="cp-modal-rich-sections">
                        {nearbyData.hotels.length > 0 && (
                            <div className="cp-modal-sub-section">
                                <h4 className="cp-sub-h">{t('category.nearby_hotels')}</h4>
                                <div className="cp-mini-grid">
                                    {nearbyData.hotels.map(h => (
                                        <div key={h.id} className="cp-mini-card clickable" onClick={() => onNavigate && onNavigate(h)}>
                                            <img src={h.image || h.img} alt="" />
                                            <div><h6>{h.name || h.title}</h6><Stars count={h.stars} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {nearbyData.restaurants.length > 0 && (
                            <div className="cp-modal-sub-section">
                                <h4 className="cp-sub-h">{t('category.nearby_restaurants')}</h4>
                                <div className="cp-mini-grid">
                                    {nearbyData.restaurants.map(r => (
                                        <div key={r.id} className="cp-mini-card clickable" onClick={() => onNavigate && onNavigate(r)}>
                                            <img src={r.image || r.img} alt="" />
                                            <div><h6>{r.name || r.title}</h6><span>{r.cuisine || r.type}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const CategoryPage = () => {
    const { id: catId } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hots, setHots] = useState([]);
    const [restos, setRestos] = useState([]);
    const [guides, setGuides] = useState([]);
    const [activeCity, setActiveCity] = useState('все');
    const [selected, setSelected] = useState(null);
    const queryId = useMemo(() => new URLSearchParams(window.location.search).get('id'), [window.location.search]);

    const currentLogo = heroImages[i18n.language] || heroImages.ru;

    useEffect(() => {
        const loadAll = async () => {
            const [allHots, allRestos, allGuides, allAtts] = await Promise.all([
                fetchSheetData('hotels'),
                fetchSheetData('restaurants'),
                fetchSheetData('guides'),
                fetchSheetData('attractions')
            ]);
            
            const filteredData = (allAtts || []).filter(a => a.category_tag === catId || a.type === catId);
            setData(filteredData);
            setHots(allHots || []);
            setRestos(allRestos || []);
            setGuides(allGuides || []);

            if (queryId) {
                const item = (filteredData || []).find(i => String(i.id).trim() === String(queryId).trim());
                if (item) setSelected(item);
            }
            setLoading(false);
        };
        loadAll();
    }, [catId, queryId]);

    const cities = useMemo(() => {
        const set = new Set(data.map(i => i.city).filter(Boolean));
        return ['все', ...set];
    }, [data]);

    const filtered = useMemo(() =>
        activeCity === 'все' ? data : data.filter(i => i.city === activeCity),
        [data, activeCity]
    );

    if (loading) return <div className="loading-state">{t('category.loading')}</div>;

    const meta = {
        city: { title: t('category.meta.city'), sub: t('category.meta.sub') || 'Heritage' },
        spirit: { title: t('category.meta.spirit'), sub: t('category.meta.sub') || 'Spirit' },
        nature: { title: t('category.meta.nature'), sub: t('category.meta.sub') || 'Nature' },
    }[catId] || { title: t('category.meta.spirit'), sub: t('category.meta.sub') || 'Heritage' };

    return (
        <div className="cp-root">
            <div className="cp-header-wrap">
                <div className="cp-topbar">
                    <Link to="/" className="cp-back">{t('ui.back')}</Link>
                    <div className="cp-logo-container"><img src={currentLogo} alt="Turkistan" className="cp-header-logo" /></div>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '2px', opacity: .5 }}>{t('category.objects_count', { count: filtered.length })}</span>
                </div>
                <div className="cp-loc-row">
                    <span className="cp-loc-label">{t('category.location_label')}</span>
                    {cities.map(cityItem => (
                        <button key={cityItem} className={`cp-loc-btn ${activeCity === cityItem ? 'active' : ''}`} onClick={() => setActiveCity(cityItem)}>
                            <span className="cp-loc-btn-inner">{cityItem === 'все' ? t('filters.all') : cityItem}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="cp-hero">
                <h1 className="cp-hero-h">
                    <span style={{ 
                        whiteSpace: 'nowrap', 
                        display: 'block', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        width: '100%' 
                    }}>{meta.title}</span>
                </h1>
            </div>

            <main className="cp-mosaic-container">
                <div className="cp-mosaic-grid-mobile">
                    {filtered.map((item) => (
                        <div key={item.id} className="cp-card-wrapper-mobile" onClick={() => setSelected(item)}>
                            <article className="cp-double-arch">
                                <div className="cp-arch-content">
                                    <div className="cp-img-box">
                                        <img src={item.image || item.img} alt={item.name || item.title} className="cp-img" loading="lazy" />
                                        <div className="cp-img-blend" />
                                    </div>
                                    <div className="cp-text-box">
                                        <h2 className="cp-tile-name">{item[`name_${i18n.language}`] || item.name_ru || item.name || item.title}</h2>
                                        <p className="cp-tile-desc">{item[`description_${i18n.language}`] || item.description_ru || item.description}</p>
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            </main>

            {selected && (
                <>
                    {'stars' in selected ? (
                        <HotelModal 
                            hotel={selected} 
                            atts={data} 
                            onClose={() => setSelected(null)} 
                            onOpenOther={(type, item) => setSelected(item)}
                        />
                    ) : 'cuisine' in selected ? (
                        <EditorialModal 
                            res={selected} 
                            hots={hots} 
                            atts={data} 
                            onClose={() => setSelected(null)} 
                            onOpenOther={(type, item) => setSelected(item)}
                        />
                    ) : (
                        <AttractionModal 
                            item={selected} 
                            hots={hots} 
                            restos={restos} 
                            guides={guides}
                            onClose={() => setSelected(null)} 
                            onNavigate={(newItem) => setSelected(newItem)} 
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryPage;
