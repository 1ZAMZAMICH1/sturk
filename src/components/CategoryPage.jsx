import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './CategoryPage.css';
import { fetchSheetData } from '../services/api';
import { HotelModal } from './HotelsPage';
import { EditorialModal } from './RestaurantsPage';
import { Icons } from '../admin/AdminIcons';
import heroTextImgRU from '../assets/hero-text.png';
import heroTextImgKZ from '../assets/hero-textkz.png';
import heroTextImgEN from '../assets/hero-texten.png';
import heroTextImgZH from '../assets/hero-textzh.png';
import { Stars } from './HotelsPage';
import LeafletMapWidget, { ExternalMapLinks } from './LeafletMapWidget';
import { GuideModal } from './GuidesPage';

export const AttractionModal = ({ item, onClose, onNavigate, hots = [], restos = [], guides = [] }) => {
    const { t, i18n } = useTranslation();
    const [activeImg, setActiveImg] = useState(item.image);
    const all = useMemo(() => {
        const parseGallery = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try { return JSON.parse(val); } catch (e) { return []; }
        };
        const gallery = parseGallery(item.gallery);
        return [item.image, ...gallery].filter(Boolean);
    }, [item.image, item.gallery]);

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
        const filteredGuidesById = (guideIds || []).map(id => guides.find(g => String(g.id) === String(id))).filter(Boolean);
        
        const name = (item.name || "").toLowerCase();
        const keywords = name.replace(/мавзолей|ходжи|ахмеда|центр|визит|парк|озеро|река|пещера|комплекс|азрет|султан/g, '').trim().split(/\s+/);
        
        const relatedGuides = guides.filter(guide => {
            // Гарантируем, что туры — это массив
            let toursArr = [];
            if (Array.isArray(guide.tours)) toursArr = guide.tours;
            else if (typeof guide.tours === 'string') {
                try { toursArr = JSON.parse(guide.tours); } catch(e) { toursArr = []; }
            }

            return (toursArr || []).some(tour => {
                // Проверяем хайлайты (они тоже могут быть строкой или массивом)
                let highlightsArr = [];
                if (Array.isArray(tour.highlights)) highlightsArr = tour.highlights;
                else if (typeof tour.highlights === 'string') {
                    try { highlightsArr = JSON.parse(tour.highlights); } 
                    catch(e) { highlightsArr = tour.highlights.split(',').map(s => s.trim()); }
                }

                const hasMatchInHighlights = highlightsArr.some(h => 
                    keywords.some(k => k.length > 3 && String(h).toLowerCase().includes(k))
                );
                const hasMatchInTitle = String(tour[`title_${i18n.language}`] || tour.title_ru || tour.title || "").toLowerCase().includes(name);
                
                return hasMatchInHighlights || hasMatchInTitle;
            });
        });
        // Если по ID ничего не нашли, пробуем старый поиск по словам
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
            <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button className="cp-modal-close" onClick={onClose}><Icons.Close /></button>
                <div className="cp-modal-left">
                    <img src={activeImg} alt={item[`name_${i18n.language}`] || item.name_ru || item.name} className="cp-modal-main-img" />
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
                    <h2 className="cp-modal-title">{item[`name_${i18n.language}`] || item.name_ru || item.name}</h2>
                    <p className="cp-modal-desc">{item[`fullDescription_${i18n.language}`] || item[`description_${i18n.language}`] || item.fullDescription_ru || item.description_ru || item.fullDescription || item.description}</p>
                    <div className="cp-modal-facts">
                         <div className="cp-modal-sub-section" style={{ marginTop: '0' }}>
                            <div className="cp-sub-h">{t('restos_page.sec_location')}</div>
                            <div className="cp-map-placeholder">
                                <div className="cp-map-view">
                                    <LeafletMapWidget 
                                        lat={item.coordinates?.lat || item.lat || item.latitude || 0} 
                                        lng={item.coordinates?.lng || item.lng || item.longitude || 0} 
                                        title={item[`name_${i18n.language}`] || item.name_ru || item.name} 
                                    />
                                </div>
                                <ExternalMapLinks 
                                    lat={item.coordinates?.lat || item.lat || item.latitude || 0} 
                                    lng={item.coordinates?.lng || item.lng || item.longitude || 0} 
                                />
                                <div className="cp-map-address">
                                    <Icons.Pin style={{ width: 14 }} />
                                    <span>{item.city || t('category.default_region')}, {item[`location_${i18n.language}`] || item.location_ru || item.location}</span>
                                </div>
                            </div>
                        </div>

                        { (item[`hours_${i18n.language}`] || item.hours_ru || item.hours) && (
                            <div className="cp-fact" style={{ marginTop: '20px' }}>
                                <span className="cp-fact-label">{t('category.hours_label')}</span>
                                <span className="cp-fact-val">{item[`hours_${i18n.language}`] || item.hours_ru || item.hours}</span>
                            </div>
                        )}
                    </div>
                    <div className="cp-modal-rich-sections">
                        {nearbyData.hotels.length > 0 && (
                            <div className="cp-modal-sub-section">
                                <h4 className="cp-sub-h">{t('category.nearby_hotels')}</h4>
                                <div className="cp-mini-grid">
                                    {nearbyData.hotels.map(h => (
                                        <div key={h.id} className="cp-mini-card clickable" onClick={() => onNavigate(h)}>
                                            <img src={h.image} alt="" />
                                            <div>
                                                <h6>{h[`name_${i18n.language}`] || h.name_ru || h.name}</h6>
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
                                        <div key={r.id} className="cp-mini-card clickable" onClick={() => onNavigate(r)}>
                                            <img src={r.image} alt="" />
                                            <div>
                                                <h6>{r[`name_${i18n.language}`] || r.name_ru || r.name}</h6>
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
                                        <div key={g.id} className="cp-mini-card clickable" onClick={() => onNavigate(g)}>
                                            <img src={g.photo || g.image} alt="" />
                                            <div>
                                                <h6>{g[`name_${i18n.language}`] || g.name_ru || g.name}</h6>
                                                <span style={{ fontSize: '0.7rem', color: '#d4af37' }}>{g.specialty || t('guides_page.all_specialties')}</span>
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
    const { t, i18n } = useTranslation();
    const { id: catId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hots, setHots] = useState([]);
    const [restos, setRestos] = useState([]);
    const [guides, setGuides] = useState([]);
    const [activeCity, setActiveCity] = useState(t('category.all_cities'));
    const [selected, setSelected] = useState(null);
    const queryId = useMemo(() => new URLSearchParams(window.location.search).get('id'), [window.location.search]);

    useEffect(() => {
        const loadAll = async () => {
            const [allAtts, allHots, allRestos, allGuides] = await Promise.all([
                fetchSheetData('attractions'),
                fetchSheetData('hotels'),
                fetchSheetData('restaurants'),
                fetchSheetData('guides')
            ]);
            
            const filteredData = allAtts.filter(a => a.category_tag === catId || a.type === catId);
            setData(filteredData);
            setHots(allHots);
            setRestos(allRestos);
            setGuides(allGuides);

            // Auto-open logic
            if (queryId) {
                const item = filteredData.find(i => String(i.id) === String(queryId));
                if (item) setSelected(item);
            }

            setLoading(false);
        };
        loadAll();
    }, [catId, queryId]);

    const cities = useMemo(() => {
        const set = new Set(data.map(i => i.city).filter(Boolean));
        return [t('category.all_cities'), ...set];
    }, [data, t]);

    const filtered = useMemo(() =>
        activeCity === t('category.all_cities') ? data : data.filter(i => i.city === activeCity),
        [data, activeCity, t]
    );

    if (loading) return <div className="loading-state">{t('category.loading')}</div>;

    const meta = {
        city: { title: t('category.meta.city'), sub: t('category.meta.sub') },
        spirit: { title: t('category.meta.spirit'), sub: t('category.meta.sub') },
        nature: { title: t('category.meta.nature'), sub: t('category.meta.sub') },
    }[catId] || { title: 'Heritage', sub: 'Turkistan' };

    const heroImages = {
        ru: heroTextImgRU,
        kz: heroTextImgKZ,
        en: heroTextImgEN,
        zh: heroTextImgZH
    };
    const currentHeroImg = heroImages[i18n.language] || heroTextImgRU;

    return (
        <div className="cp-root">
            <div className="cp-header-wrap">
                <div className="cp-topbar">
                    <Link to="/" className="cp-back">{t('ui.back')}</Link>
                    <div className="cp-logo-container"><img src={currentHeroImg} alt="Turkistan" className="cp-header-logo" /></div>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '2px', opacity: .5 }}>{t('category.objects_count', { count: filtered.length })}</span>
                </div>
                <div className="cp-loc-row">
                    <span className="cp-loc-label">{t('category.location_label')}</span>
                    {cities.map(city => (
                        <button key={city} className={`cp-loc-btn ${activeCity === city ? 'active' : ''}`} onClick={() => setActiveCity(city)}>
                            <span className="cp-loc-btn-inner">{city}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="cp-hero">
                <h1 className="cp-hero-h"><span>{meta.title} {meta.sub}</span></h1>
            </div>

            <main className="cp-mosaic-container">
                <div className="cp-mosaic-grid">
                    {filtered.map((item) => {
                        const localizedName = item[`name_${i18n.language}`] || item.name_ru || item.name;
                        const localizedDesc = item[`description_${i18n.language}`] || item.description_ru || item.description;
                        return (
                            <div key={item.id} className="cp-card-wrapper" onClick={() => setSelected(item)}>
                                <article className="cp-double-arch">
                                    <div className="cp-arch-content">
                                        <div className="cp-img-box">
                                            <img src={item.image} alt={localizedName} className="cp-img" loading="lazy" />
                                            <div className="cp-img-blend" />
                                        </div>
                                        <div className="cp-text-box">
                                            <h2 className="cp-tile-name">{localizedName}</h2>
                                            <p className="cp-tile-desc">{localizedDesc}</p>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </div>
            </main>

            {selected && (
                <>
                    {'stars' in selected ? <HotelModal hotel={selected} onClose={() => setSelected(null)} /> :
                     ('cuisine' in selected || 'menu' in selected || 'delivery' in selected) ? <EditorialModal res={selected} onClose={() => setSelected(null)} /> :
                     'specialty' in selected ? <GuideModal guide={selected} onClose={() => setSelected(null)} /> :
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
