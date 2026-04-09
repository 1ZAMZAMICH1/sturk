// src/mobile/RestaurantsPageMobile.jsx — МОБИЛЬНАЯ ВЕРСИЯ «НОМАДИЧЕСКАЯ ЭЛЕГАНТНОСТЬ» 
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './RestaurantsPageMobile.css';
import { Icons } from '../admin/AdminIcons';
import LeafletMapWidget from '../components/LeafletMapWidget';
import { AttractionModal } from '../mobile/CategoryPageMobile';
import { HotelModal } from '../mobile/HotelsPageMobile'; 
import { fetchSheetData } from '../services/api';

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

export const EditorialModal = ({ res, onClose, onOpenOther, hots = [], atts = [] }) => {
    const { t, i18n } = useTranslation();
    const [mainImg, setMainImg] = useState(res.image);

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
            const cleaned = String(val).replace(/[\[\]"]/g, '');
            raw = cleaned.split(',').map(s => s.trim());
        }
        return raw.map(id => String(id).trim()).filter(id => id.length > 0);
    };

    const targetAttIds = parseIds(res.nearbyAttractions || res.nearbyatts || res.nearby_attractions);
    const targetHotIds = parseIds(res.nearbyHotels || res.nearbyhots || res.nearby_hotels);

    const nearbyAtts = (atts || []).filter(a => {
        const aid = getObjId(a);
        return aid && targetAttIds.some(tid => aid === tid || aid.includes(tid) || tid.includes(aid));
    });
    
    const nearbyHots = (hots || []).filter(h => {
        const hid = getObjId(h);
        return hid && targetHotIds.some(tid => hid === tid || hid.includes(tid) || tid.includes(hid));
    });

    return createPortal(
        <div className="rp-mob-modal-overlay" onClick={onClose}>
            <div className="rp-mob-modal-container" onClick={e => e.stopPropagation()}>
                <button className="rp-mob-modal-close" onClick={onClose}>
                    <Icons.Close />
                </button>

                {/* Left Side: Immersive Photo & Gallery */}
                <div className="rp-mob-modal-visual">
                    <img src={mainImg} alt={res.name} className="rp-mob-modal-visual-img" />
                    
                    {res.gallery && res.gallery.length > 0 && (
                        <div className="rp-mob-modal-gallery-thumbs">
                            {[res.image, ...res.gallery].map((url, i) => (
                                <img 
                                    key={i} 
                                    src={url} 
                                    className={`rp-mob-thumb ${mainImg === url ? 'active' : ''}`}
                                    onClick={() => setMainImg(url)}
                                    alt=""
                                />
                            ))}
                        </div>
                    )}

                </div>

                {/* Right Side: Editorial Content */}
                <div className="rp-mob-modal-content">
                    <div className="rp-mob-modal-scroll">
                        <div className="rp-mob-modal-header">
                            <h2 className="rp-mob-m-title">{res[`name_${i18n.language}`] || res.name_ru || res.name}</h2>
                            <div className="rp-mob-m-meta">
                                <span>{t(`restos_page.cuisines.${res.cuisine}`, { defaultValue: res.cuisine })}</span>
                                <span>·</span>
                                <span>{res.priceTag}</span>
                                <span>·</span>
                                <span>{res[`city_${i18n.language}`] || res.city_ru || res.city || t('category.default_region')}</span>
                            </div>
                            {(res[`hours_${i18n.language}`] || res.hours_ru || res.hours) && (
                                <div className="rp-mob-m-meta" style={{ marginTop: '5px', opacity: 0.8 }}>
                                    <Icons.Clock style={{ width: 12, marginRight: 5 }} />
                                    <span>{res[`hours_${i18n.language}`] || res.hours_ru || res.hours}</span>
                                </div>
                            )}
                            {(res[`signature_${i18n.language}`] || res.signature_ru || res.signature) && (
                                <div className="rp-mob-m-signature-inline">
                                    <Icons.Crown style={{ width: 14, color: 'var(--rp-sand)' }} />
                                    <span>{t('restos_page.recommended_label', { name: res[`signature_${i18n.language}`] || res.signature_ru || res.signature })}</span>
                                </div>
                            )}
                        </div>

                        <div className="rp-mob-m-sec">
                            <div className="rp-mob-m-sec-title">{t('restos_page.sec_history')}</div>
                            <p className="rp-mob-m-desc">{res[`description_${i18n.language}`] || res.description_ru || res.description}</p>
                        </div>

                        {res.menu && (
                            <div className="rp-mob-m-sec">
                                <div className="rp-mob-m-sec-title">{t('restos_page.sec_gastronomy')}</div>
                                <div className="rp-mob-m-menu">
                                    {(typeof res.menu === 'string' ? JSON.parse(res.menu) : res.menu).map((m, idx) => {
                                        const itemName = m[`item_${i18n.language}`] || m.item_ru || m.item;
                                        return (
                                            <div key={idx} className="rp-mob-menu-row">
                                                <span className="rp-mob-menu-name">{itemName}</span>
                                                <span className="rp-mob-menu-dots" />
                                                <span className="rp-mob-menu-price">{m.price}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {nearbyAtts.length > 0 && (
                            <div className="rp-mob-m-sec">
                                <div className="rp-mob-m-sec-title">{t('restos_page.sec_nearby_atts')}</div>
                                <div className="rp-mob-nearby-modern-grid">
                                    {nearbyAtts.map(att => (
                                        <div key={att.id} className="rp-mob-nearby-card" onClick={() => onOpenOther && onOpenOther('attraction', att)}>
                                            <img src={att.image} alt="" />
                                            <div className="rp-mob-nearby-info">
                                                <strong>{att.name}</strong>
                                                <span>{t('restos_page.label_attraction')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {nearbyHots.length > 0 && (
                            <div className="rp-mob-m-sec">
                                <div className="rp-mob-m-sec-title">{t('restos_page.sec_nearby_hots')}</div>
                                <div className="rp-mob-nearby-modern-grid">
                                    {nearbyHots.map(hot => (
                                        <div key={hot.id} className="rp-mob-nearby-card" onClick={() => onOpenOther && onOpenOther(hot, 'hotel')}>
                                            <img src={hot.image} alt="" />
                                            <div className="rp-mob-nearby-info">
                                                <strong>{hot.name}</strong>
                                                <span>{hot.type} · {hot.stars}★</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rp-mob-m-sec">
                            <div className="rp-mob-m-sec-title">{t('restos_page.sec_location')}</div>
                            <div className="rp-mob-map-placeholder">
                                <div className="rp-mob-map-view">
                                    <LeafletMapWidget 
                                        lat={res.lat ? parseFloat(res.lat) : 0} 
                                        lng={res.lng ? parseFloat(res.lng) : 0} 
                                        title={res.name} 
                                    />
                                </div>
                                <div className="rp-mob-map-address">
                                    <Icons.Pin style={{ width: 14 }} />
                                    <span>{res.city}, {res.location}</span>
                                </div>
                            </div>
                        </div>

                        {res.specialty && (
                            <div className="rp-mob-m-sec">
                                <div className="rp-mob-m-sec-title">{t('restos_page.sec_secret')}</div>
                                <div className="rp-mob-m-special">
                                    "{res.specialty}"
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rp-mob-modal-action">
                        <button className="rp-mob-action-btn full-width">{t('restos_page.btn_book')}</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const EditorialCard = ({ res, onClick }) => {
    return (
        <div className="rp-mob-card" onClick={onClick}>
            <div className="rp-mob-card-img-wrap">
                <img src={res.image} alt={res.name} className="rp-mob-card-img" />
                <div className="rp-mob-card-overlay" />
                <div className="rp-mob-card-badge">{res.cuisine}</div>

                <div className="rp-mob-card-content-overlay">
                    <h3 className="rp-mob-card-name">{res.name}</h3>
                    <div className="rp-mob-card-meta">
                        <span>{res.city}</span>
                    </div>
                    <div className="rp-mob-card-sig">{res.signature}</div>
                </div>
            </div>
        </div>
    );
};

const RestaurantsPageMobile = () => {
    const { t, i18n } = useTranslation();
    const [restaurants, setRestaurants] = useState([]);
    const [atts, setAtts] = useState([]);
    const [hots, setHots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('Все');
    const [city, setCity] = useState('Все');
    const [otherModal, setOtherModal] = useState(null);

    const currentLogo = heroImages[i18n.language] || heroImages.ru;

    useEffect(() => {
        const load = async () => {
            const [rData, aData, hData] = await Promise.all([
                fetchSheetData('restaurants'),
                fetchSheetData('attractions'),
                fetchSheetData('hotels')
            ]);
            setRestaurants(Array.isArray(rData) ? rData : []);
            setAtts(Array.isArray(aData) ? aData : []);
             setHots(Array.isArray(hData) ? hData : []);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="loading-state">{t('hospitality.loading')}</div>;

    const CITIES = ['Все', 'Туркестан', 'Отрар', 'Сауран'];
    const TYPES = ['Все', 'Казахская', 'Узбекская', 'Восточная', 'Европейская', 'Кофейня'];

    // Исправленная логика фильтрации
    const isFiltered = (r) => {
        const matchesFilter = filter === 'Все' || r.cuisine === filter;
        const matchesCity = city === 'Все' || r.city === city;
        return matchesFilter && matchesCity;
    };

    const finalFiltered = (restaurants || []).filter(isFiltered);

    const handleOpenOther = (rawData, type) => {
        const data = { ...rawData };
        if (data.gallery && typeof data.gallery === 'string') {
            try { data.gallery = JSON.parse(data.gallery); } catch(e) { data.gallery = []; }
        }
        if (data.lat && data.lng) {
            data.coordinates = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
        }
        setOtherModal({ type, data });
    };

    return (
        <div className="rp-mob-root">
            {/* ─── HEADER ─── */}
            <div className="rp-mob-header-wrap">
                <div className="rp-mob-topbar">
                    <Link to="/" className="rp-mob-back">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        {t('ui.back')}
                    </Link>
                    <div className="rp-mob-logo-box">
                        <img src={currentLogo} alt="Turkistan" className="rp-mob-header-logo" />
                    </div>
                    <div className="rp-mob-count">
                        {t('restos_page.objects_label', { count: finalFiltered.length })}
                    </div>
                </div>

                <div className="rp-mob-filter-bar">
                    <div className="rp-mob-filter-group">
                        {CITIES.map(cityItem => (
                            <button key={cityItem} className={`rp-mob-f-btn ${city === cityItem ? 'active' : ''}`} onClick={() => setCity(cityItem)}>
                                {cityItem === 'Все' ? t('filters.all') : cityItem}
                            </button>
                        ))}
                    </div>
                    <div className="rp-mob-filter-group">
                        {TYPES.map(type => (
                            <button key={type} className={`rp-mob-f-btn ${filter === type ? 'active' : ''}`} onClick={() => setFilter(type)}>
                                {type === 'Все' ? t('filters.all') : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── HERO ─── */}
            <div className="rp-mob-hero">
                <h1 className="rp-mob-h-main">{t('restos_page.hero_title')}</h1>
                <div className="rp-mob-h-sub">{t('restos_page.hero_subtitle')}</div>
            </div>

            {/* ─── GRID ─── */}
            <div className="rp-mob-grid-container">
                <div className="rp-mob-grid">
                    {finalFiltered.map(r => (
                        <EditorialCard key={r.id} res={r} onClick={() => setSelected(r)} />
                    ))}
                    {finalFiltered.length === 0 && (
                        <div className="rp-mob-empty">Для данного фильтра пока нет предложений.</div>
                    )}
                </div>
            </div>

            {selected && (
                <EditorialModal 
                    res={selected} 
                    atts={atts}
                    hots={hots}
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

export default RestaurantsPageMobile;
