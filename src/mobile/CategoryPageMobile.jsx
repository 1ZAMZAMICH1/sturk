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
import LeafletMapWidget, { ExternalMapLinks } from '../components/LeafletMapWidget';
import { GuideModal } from '../components/GuidesPage';

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
    
    const all = useMemo(() => {
        const parseGallery = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try { return JSON.parse(val); } catch (e) { return []; }
        };
        const gallery = parseGallery(item.gallery);
        return [item.image || item.img, ...gallery].filter(Boolean);
    }, [item.image, item.img, item.gallery]);

    const nearbyData = useMemo(() => {
        const parseIds = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try { return JSON.parse(val); } catch (e) { return []; }
        };

        const hotelIds = parseIds(item.nearbyHotels);
        const restoIds = parseIds(item.nearbyRestaurants);
        const guideIds = parseIds(item.nearbyGuides);

        const filteredHots = (hotelIds || []).map(id => hots.find(h => String(h.id) === String(id))).filter(Boolean);
        const filteredRestos = (restoIds || []).map(id => restos.find(r => String(r.id) === String(id))).filter(Boolean);
        
        const name = (item.name || item.title || "").toLowerCase();
        const keywords = name.replace(/мавзолей|ходжи|ахмеда|центр|визит|парк|озеро|река|пещера|комплекс|азрет|султан/g, '').trim().split(/\s+/);
        
        const filteredGuidesById = (guideIds || []).map(id => guides.find(g => String(g.id) === String(id))).filter(Boolean);

        const relatedGuides = guides.filter(guide => {
            let toursArr = Array.isArray(guide.tours) ? guide.tours : [];
            if (!toursArr.length && typeof guide.tours === 'string') {
                try { toursArr = JSON.parse(guide.tours); } catch(e) { toursArr = []; }
            }
            return (toursArr || []).some(tour => {
                let highlightsArr = Array.isArray(tour.highlights) ? tour.highlights : [];
                const tourTitle = String(tour[`title_${i18n.language}`] || tour.title_ru || tour.title || "").toLowerCase();
                return highlightsArr.some(h => keywords.some(k => k.length > 3 && String(h).toLowerCase().includes(k))) || tourTitle.includes(name);
            });
        });

        const guidesToShow = filteredGuidesById.length > 0 ? filteredGuidesById : relatedGuides;
        return { hotels: filteredHots, restaurants: filteredRestos, guides: guidesToShow };
    }, [item, hots, restos, guides, i18n.language]);


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
                        <div style={{ marginTop: '20px', display: 'block' }}>
                             <div className="cp-sub-h">
                                 {t('restos_page.sec_location')}
                             </div>
                             <div className="cp-map-placeholder">
                                 <div className="cp-map-view">
                                     <LeafletMapWidget 
                                        lat={parseFloat(item.lat || item.latitude || (item.coordinates && item.coordinates.lat) || 43.3013)} 
                                        lng={parseFloat(item.lng || item.longitude || (item.coordinates && item.coordinates.lng) || 68.2704)} 
                                        title={item.name || item.title} 
                                     />
                                 </div>
                                 <ExternalMapLinks 
                                    lat={parseFloat(item.lat || item.latitude || (item.coordinates && item.coordinates.lat) || 43.3013)} 
                                    lng={parseFloat(item.lng || item.longitude || (item.coordinates && item.coordinates.lng) || 68.2704)} 
                                 />
                                 <div className="cp-map-address">
                                     <Icons.Pin style={{ width: 14, color: '#c8a84b' }} />
                                     <span>{item.city || t('category.default_region')}, {item[`location_${i18n.language}`] || item.location_ru || item.location}</span>
                                 </div>
                             </div>
                        </div>
                    <div className="cp-modal-rich-sections">
                        {nearbyData.hotels.length > 0 && (
                            <div className="cp-modal-sub-section">
                                <h4 className="cp-sub-h">{t('category.nearby_hotels')}</h4>
                                <div className="cp-mini-grid">
                                    {nearbyData.hotels.map(h => (
                                        <div key={h.id} className="cp-mini-card clickable" onClick={() => onNavigate && onNavigate(h)}>
                                            <img src={h.image || h.img} alt="" />
                                            <div>
                                                <h6>{h[`name_${i18n.language}`] || h.name_ru || h.name || h.title}</h6>
                                                <div style={{ display: 'flex' }}><Stars count={h.stars} /></div>
                                            </div>
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
                                            <div>
                                                <h6>{r[`name_${i18n.language}`] || r.name_ru || r.name || r.title}</h6>
                                                <span>{t(`restos_page.cuisines.${r.cuisine}`).includes('restos_page.cuisines.') ? (r[`cuisine_${i18n.language}`] || r.cuisine) : t(`restos_page.cuisines.${r.cuisine}`)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {nearbyData.guides.length > 0 && (
                            <div className="cp-modal-sub-section">
                                <h4 className="cp-sub-h">{t('guides_page.hero_title')}</h4>
                                <div className="cp-mini-grid">
                                    {nearbyData.guides.map(g => (
                                        <div key={g.id} className="cp-mini-card clickable" onClick={() => onNavigate && onNavigate(g)}>
                                            <img src={g.photo || g.image || g.img} alt="" />
                                            <div>
                                                <h6>{g[`name_${i18n.language}`] || g.name_ru || g.name || g.title}</h6>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>{g.specialty || t('guides_page.all_specialties')}</span>
                                            </div>
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
            try {
                // Загружаем данные по очереди, чтобы не злить Google параллельными запросами
                const allHots = await fetchSheetData('hotels');
                const allRestos = await fetchSheetData('restaurants');
                const allGuides = await fetchSheetData('guides');
                const allAtts = await fetchSheetData('attractions');
                
                const filteredData = (allAtts || []).filter(a => a.category_tag === catId || a.type === catId);
                setData(filteredData);
                setHots(allHots || []);
                setRestos(allRestos || []);
                setGuides(allGuides || []);

                if (queryId) {
                    const item = (filteredData || []).find(i => String(i.id).trim() === String(queryId).trim());
                    if (item) setSelected(item);
                }
            } catch (err) {
                console.error("Load error:", err);
            } finally {
                setLoading(false);
            }
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
                    ) : ('cuisine' in selected || 'menu' in selected || 'delivery' in selected) ? (
                        <EditorialModal 
                            res={selected} 
                            hots={hots} 
                            atts={data} 
                            onClose={() => setSelected(null)} 
                            onOpenOther={(type, item) => setSelected(item)}
                        />
                    ) : 'specialty' in selected ? (
                        <GuideModal guide={selected} onClose={() => setSelected(null)} />
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
