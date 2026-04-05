// src/mobile/RestaurantsPageMobile.jsx — МОБИЛЬНАЯ ВЕРСИЯ «НОМАДИЧЕСКАЯ ЭЛЕГАНТНОСТЬ» 
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './RestaurantsPageMobile.css';
import { Icons } from '../admin/AdminIcons';
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
    const { t } = useTranslation();
    const [mainImg, setMainImg] = useState(res.image);

    const nearbyAtts = (res.nearbyAttractions || []).map(id => atts.find(a => a.id === id)).filter(Boolean);
    const nearbyHots = (res.nearbyHotels || []).map(id => hots.find(h => h.id === id)).filter(Boolean);

    return (
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
                            <h2 className="rp-mob-m-title">{res.name}</h2>
                            <div className="rp-mob-m-meta">
                                <span>{res.cuisine}</span>
                                <span>·</span>
                                <span>{res.priceTag}</span>
                                <span>·</span>
                                <span>{res.city || t('category.default_region')}</span>
                            </div>
                            {res.signature && (
                                <div className="rp-mob-m-signature-inline">
                                    <Icons.Crown style={{ width: 14, color: 'var(--rp-sand)' }} />
                                    <span>{t('restaurants.modal.recommend')}: {res.signature}</span>
                                </div>
                            )}
                        </div>

                        <div className="rp-mob-m-sec">
                            <div className="rp-mob-m-sec-title">{t('restaurants.modal.history_title')}</div>
                            <p className="rp-mob-m-desc">{res.description}</p>
                        </div>

                        {res.menu && (
                            <div className="rp-mob-m-sec">
                                <div className="rp-mob-m-sec-title">{t('restaurants.modal.gastronomy')}</div>
                                <div className="rp-mob-m-menu">
                                    {res.menu.map(m => (
                                        <div key={m.item} className="rp-mob-menu-row">
                                            <span className="rp-mob-menu-name">{m.item}</span>
                                            <span className="rp-mob-menu-dots" />
                                            <span className="rp-mob-menu-price">{m.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {nearbyAtts.length > 0 && (
                            <div className="rp-mob-m-sec">
                                <div className="rp-mob-m-sec-title">{t('category.nearby_hotels_title')}</div>
                                <div className="rp-mob-nearby-modern-grid">
                                    {nearbyAtts.map(att => (
                                        <div key={att.id} className="rp-mob-nearby-card" onClick={() => onOpenOther && onOpenOther('attraction', att)}>
                                            <img src={att.image} alt="" />
                                            <div className="rp-mob-nearby-info">
                                                <strong>{att.name}</strong>
                                                <span>{t('category.meta.history')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {nearbyHots.length > 0 && (
                            <div className="rp-mob-m-sec">
                                <div className="rp-mob-m-sec-title">{t('category.nearby_hotels')}</div>
                                <div className="rp-mob-nearby-modern-grid">
                                    {nearbyHots.map(hot => (
                                        <div key={hot.id} className="rp-mob-nearby-card" onClick={() => onOpenOther && onOpenOther('hotel', hot)}>
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
                            <div className="rp-mob-m-sec-title">{t('hotels.modal.address')}</div>
                            <div className="rp-mob-map-placeholder">
                                <div className="rp-mob-map-view">
                                    <div className="rp-mob-map-pin-pulse">
                                        <Icons.Pin />
                                    </div>
                                </div>
                                <div className="rp-mob-map-address">
                                    <Icons.Pin style={{ width: 14 }} />
                                    <span>{res.city}, {res.location}</span>
                                </div>
                            </div>
                        </div>

                        {res.specialty && (
                            <div className="rp-mob-m-sec">
                                <div className="rp-mob-m-sec-title">{t('restaurants.modal.secret_title')}</div>
                                <div className="rp-mob-m-special">
                                    "{res.specialty}"
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rp-mob-modal-action">
                        <button className="rp-mob-action-btn full-width">{t('restaurants.modal.book_table')}</button>
                    </div>
                </div>
            </div>
        </div>
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

    const handleOpenOther = (type, data) => {
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
                        {t('category.back')}
                    </Link>
                    <div className="rp-mob-logo-box">
                        <img src={currentLogo} alt="Turkistan" className="rp-mob-header-logo" />
                    </div>
                    <div className="rp-mob-count">
                        {finalFiltered.length} {t('category.objects_count')}
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
                <h1 className="rp-mob-h-main">{t('restaurants.page_title')}</h1>
                <div className="rp-mob-h-sub">{t('restaurants.page_subtitle')}</div>
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
                    attraction={otherModal.data}
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
