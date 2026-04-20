import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './RestaurantsPage.css';
import { Icons } from '../admin/AdminIcons';
import LeafletMapWidget, { ExternalMapLinks } from './LeafletMapWidget';
import heroTextImg from '../assets/hero-text.png';

// We need access to Attractions & Hotels for cross-modal linking
import { attractionsData, hotelsData } from '../data/attractionsData';
import { AttractionModal } from './CategoryPage';
import { HotelModal } from './HotelsPage';
import { fetchSheetData } from '../services/api';

export const EditorialModal = ({ res, onClose, onOpenOther }) => {
    const { t, i18n } = useTranslation();
    const [mainImg, setMainImg] = useState(res.image);

    const [nearbyAtts, setNearbyAtts] = useState([]);
    const [nearbyHots, setNearbyHots] = useState([]);

    useEffect(() => {
        const loadNearby = async () => {
            try {
                const [allAt, allHo] = await Promise.all([
                    fetchSheetData('attractions'),
                    fetchSheetData('hotels')
                ]);

                // Вспомогательная функция для получения ID из объекта (проверяет разные регистры)
                const getObjId = (obj) => {
                    const id = obj.id || obj.ID || obj.Id || obj.rowid || '';
                    return String(id).trim();
                };

                const parseIds = (val) => {
                    if (!val) return [];
                    let raw = [];
                    if (Array.isArray(val)) {
                        raw = val;
                    } else {
                        // Чистим строку от скобок и кавычек, если они пришли из базы как текст
                        const cleaned = String(val).replace(/[\[\]"]/g, '');
                        raw = cleaned.split(',').map(s => s.trim());
                    }
                    return raw.map(id => String(id).trim()).filter(id => id.length > 0);
                };

                const targetAttIds = parseIds(res.nearbyAttractions || res.nearbyatts || res.nearby_attractions);
                const targetHotIds = parseIds(res.nearbyHotels || res.nearbyhots || res.nearby_hotels);

                // Собираем результаты
                const finalAtts = (allAt || []).filter(a => {
                    const aid = getObjId(a);
                    return aid && targetAttIds.some(tid => aid === tid || aid.includes(tid) || tid.includes(aid));
                });

                const finalHots = (allHo || []).filter(h => {
                    const hid = getObjId(h);
                    return hid && targetHotIds.some(tid => hid === tid || hid.includes(tid) || tid.includes(hid));
                });

                setNearbyAtts(finalAtts);
                setNearbyHots(finalHots);
            } catch (err) {
                console.error("Debug Relations:", err);
            }
        };
        loadNearby();
    }, [res]);

    return createPortal(
        <div className="rp-modal-overlay" onClick={onClose}>
            <div className="rp-modal-container" onClick={e => e.stopPropagation()}>
                <button className="rp-modal-close" onClick={onClose}>
                    <Icons.Close />
                </button>

                {/* Left Side: Immersive Photo & Gallery */}
                <div className="rp-modal-visual">
                    <img src={mainImg} alt={res[`name_${i18n.language}`] || res.name_ru || res.name} className="rp-modal-visual-img" />
                    
                    {res.gallery && res.gallery.length > 0 && (
                        <div className="rp-modal-gallery-thumbs">
                            {[res.image, ...res.gallery].map((url, i) => (
                                <img 
                                    key={i} 
                                    src={url} 
                                    className={`rp-thumb ${mainImg === url ? 'active' : ''}`}
                                    onClick={() => setMainImg(url)}
                                    alt=""
                                />
                            ))}
                        </div>
                    )}

                </div>

                {/* Right Side: Editorial Content */}
                <div className="rp-modal-content">
                    <div className="rp-modal-scroll">
                        <div className="rp-modal-header">
                            <h2 className="rp-m-title">{res[`name_${i18n.language}`] || res.name_ru || res.name}</h2>
                            <div className="rp-m-meta">
                                <span>{
                                    t(`restos_page.cuisines.${res.cuisine || res.type}`, { 
                                        defaultValue: res.cuisine || res.type || '...' 
                                    })
                                }</span>
                                <span>·</span>
                                <span>{res.priceTag || res.priceLevel}</span>
                                <span>·</span>
                                <span>{res[`city_${i18n.language}`] || res.city_ru || res.city}</span>
                            </div>
                            {(res[`hours_${i18n.language}`] || res.hours_ru || res.hours) && (
                                <div className="rp-m-meta" style={{ marginTop: '5px', opacity: 0.8 }}>
                                    <Icons.Clock style={{ width: 12, marginRight: 5 }} />
                                    <span>{res[`hours_${i18n.language}`] || res.hours_ru || res.hours}</span>
                                </div>
                            )}
                             {res[`signature_${i18n.language}`] || res.signature_ru || res.signature ? (
                                <div className="rp-m-signature-inline">
                                    <Icons.Crown style={{ width: 14, color: 'var(--rp-sand)' }} />
                                    <span>{t('restos_page.recommended_label', { name: res[`signature_${i18n.language}`] || res.signature_ru || res.signature })}</span>
                                </div>
                            ) : null}
                        </div>

                        <div className="rp-m-sec">
                            <div className="rp-m-sec-title">{t('restos_page.sec_history')}</div>
                            <p className="rp-m-desc">{res[`description_${i18n.language}`] || res.description_ru || res.description}</p>
                        </div>

                        {res.menu && (
                            <div className="rp-m-sec">
                                <div className="rp-m-sec-title">{t('restos_page.sec_gastronomy')}</div>
                                 <div className="rp-m-menu">
                                    {(typeof res.menu === 'string' ? JSON.parse(res.menu) : res.menu).map((m, idx) => {
                                        const itemName = m[`item_${i18n.language}`] || m.item_ru || m.item;
                                        return (
                                            <div key={m.item + idx} className="rp-menu-row">
                                                <span className="rp-menu-name">{itemName}</span>
                                                <span className="rp-menu-dots" />
                                                <span className="rp-menu-price">{m.price}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {nearbyAtts.length > 0 && (
                            <div className="rp-m-sec">
                                <div className="rp-m-sec-title">{t('restos_page.sec_nearby_atts')}</div>
                                <div className="rp-nearby-modern-grid">
                                    {nearbyAtts.map(att => (
                                        <div key={att.id} className="rp-nearby-card" onClick={() => onOpenOther('attraction', att)}>
                                            <img src={att.image} alt="" />
                                            <div className="rp-nearby-info">
                                                <strong>{att[`name_${i18n.language}`] || att.name_ru || att.name}</strong>
                                                <span>{t('restos_page.label_attraction')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {nearbyHots.length > 0 && (
                            <div className="rp-m-sec">
                                <div className="rp-m-sec-title">{t('restos_page.sec_nearby_hots')}</div>
                                <div className="rp-nearby-modern-grid">
                                    {nearbyHots.map(hot => (
                                        <div key={hot.id} className="rp-nearby-card" onClick={() => onOpenOther('hotel', hot)}>
                                            <img src={hot.image} alt="" />
                                            <div className="rp-nearby-info">
                                                <strong>{hot[`name_${i18n.language}`] || hot.name_ru || hot.name}</strong>
                                                <span>{t(`hotels_page.types.${hot.type}`)} · {hot.stars}★</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rp-m-sec">
                            <div className="rp-m-sec-title">{t('restos_page.sec_location')}</div>
                            <div className="rp-map-placeholder">
                                <div className="rp-map-view">
                                    <LeafletMapWidget 
                                        lat={res.lat ? parseFloat(res.lat) : 0} 
                                        lng={res.lng ? parseFloat(res.lng) : 0} 
                                        title={res.name} 
                                    />
                                </div>
                                <ExternalMapLinks 
                                    lat={res.lat} 
                                    lng={res.lng} 
                                />
                                <div className="rp-map-address">
                                    <Icons.Pin style={{ width: 14 }} />
                                    <span>{res.city}, {res[`location_${i18n.language}`] || res.location_ru || res.location}</span>
                                </div>
                            </div>
                        </div>

                        {res[`specialty_${i18n.language}`] || res.specialty_ru || res.specialty ? (
                            <div className="rp-m-sec">
                                <div className="rp-m-sec-title">{t('restos_page.sec_secret')}</div>
                                <div className="rp-m-special">
                                    "{res[`specialty_${i18n.language}`] || res.specialty_ru || res.specialty}"
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="rp-modal-action">
                        <button className="rp-action-btn full-width">{t('restos_page.btn_book')}</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const EditorialCard = ({ res, onClick }) => {
    const { i18n } = useTranslation();
    const localizedName = res[`name_${i18n.language}`] || res.name_ru || res.name;
    const localizedSig = res[`signature_${i18n.language}`] || res.signature_ru || res.signature;

    return (
        <div className="rp-card" onClick={onClick}>
            <div className="rp-card-img-wrap">
                <img src={res.image} alt={localizedName} className="rp-card-img" />
                <div className="rp-card-overlay" />
                <div className="rp-card-badge">{res.cuisine || res.type}</div>

                <div className="rp-card-content-overlay">
                    <h3 className="rp-card-name">{localizedName}</h3>
                    <div className="rp-card-meta">
                        <span>{res.city}</span>
                    </div>
                    {localizedSig && <div className="rp-card-sig">{localizedSig}</div>}
                </div>
            </div>
        </div>
    );
};

const RestaurantsPage = () => {
    const { t } = useTranslation();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('All');
    const [city, setCity] = useState('All');
    const [otherModal, setOtherModal] = useState(null);

    useEffect(() => {
        const load = async () => {
            const data = await fetchSheetData('restaurants');
            setRestaurants(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="loading-state">{t('restos_page.loading')}</div>;

    const DEFAULT_CITY = t('restos_page.all_cities');
    const DEFAULT_CUISINE = t('restos_page.all_cuisines');
    const CITIES = ['All', 'Туркестан', 'Отрар', 'Сауран'];
    const TYPES = ['All', 'Казахская', 'Узбекская', 'Восточная', 'Европейская', 'Кофейня'];

    const isFiltered = (r) => {
        const rCuisine = r.cuisine || r.type;
        const matchesFilter = filter === 'All' || rCuisine === filter;
        const matchesCity = city === 'All' || r.city === city;
        return matchesFilter && matchesCity;
    };

    const finalFiltered = (restaurants || []).filter(isFiltered);

    const handleOpenOther = (type, rawData) => {
        // Подготавливаем данные, чтобы модалка не "сломалась" от сырых строк из БД
        const data = { ...rawData };
        
        // Парсим галерею, если это строка
        if (data.gallery && typeof data.gallery === 'string') {
            try { data.gallery = JSON.parse(data.gallery); } catch(e) { data.gallery = []; }
        }
        
        // Создаем объект coordinates для совместимости
        if (data.lat && data.lng) {
            data.coordinates = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
        }

        setOtherModal({ type, data });
    };

    return (
        <div className="rp-root">
            {/* ─── HEADER ─── */}
            <div className="rp-header-wrap">
                <div className="rp-topbar">
                    <Link to="/" className="rp-back">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        {t('ui.back')}
                    </Link>
                    <div className="rp-logo-box">
                        <img src={heroTextImg} alt="Turkistan" className="rp-header-logo" />
                    </div>
                    <div className="rp-count">
                        {t('restos_page.objects_label', { count: finalFiltered.length })}
                    </div>
                </div>

                <div className="rp-filter-bar">
                    <div className="rp-filter-group">
                        {CITIES.map(c => (
                            <button key={c} className={`rp-f-btn ${city === c ? 'active' : ''}`} onClick={() => setCity(c)}>
                                {c === 'All' ? DEFAULT_CITY : c}
                            </button>
                        ))}
                    </div>
                    <div className="rp-filter-group">
                        {TYPES.map(type => (
                            <button key={type} className={`rp-f-btn ${filter === type ? 'active' : ''}`} onClick={() => setFilter(type)}>
                                {type === 'All' ? DEFAULT_CUISINE : t(`restos_page.cuisines.${type}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── HERO ─── */}
            <div className="rp-hero">
                <h1 className="rp-h-main">{t('restos_page.hero_title')}</h1>
                <div className="rp-h-sub">{t('restos_page.hero_subtitle')}</div>
            </div>

            {/* ─── GRID ─── */}
            <div className="rp-grid-container">
                <div className="rp-grid">
                    {finalFiltered.map(r => (
                        <EditorialCard key={r.id} res={r} onClick={() => setSelected(r)} />
                    ))}
                    {finalFiltered.length === 0 && (
                        <div className="rp-empty">{t('restos_page.empty_filter')}</div>
                    )}
                </div>
            </div>

            {selected && (
                <EditorialModal 
                    res={selected} 
                    onClose={() => setSelected(null)} 
                    onOpenOther={handleOpenOther}
                />
            )}

            {otherModal?.type === 'attraction' && (
                <AttractionModal
                    item={otherModal.data}
                    onClose={() => setOtherModal(null)}
                />
            )}

            {otherModal?.type === 'hotel' && (
                <HotelModal
                    hotel={otherModal.data}
                    onClose={() => setOtherModal(null)}
                />
            )}
        </div>
    );
};

export default RestaurantsPage;
