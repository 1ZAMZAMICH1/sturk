// src/components/RestaurantsPage.jsx — «НОМАДИЧЕСКАЯ ЭЛЕГАНТНОСТЬ» concept
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RestaurantsPage.css';
import { Icons } from '../admin/AdminIcons';
import heroTextImg from '../assets/hero-text.png';

// We need access to Attractions & Hotels for cross-modal linking
import { attractionsData, hotelsData } from '../data/attractionsData';
import { AttractionModal } from './CategoryPage';
import { HotelModal } from './HotelsPage';
import { fetchSheetData } from '../services/api';

export const EditorialModal = ({ res, onClose, onOpenOther }) => {
    const [mainImg, setMainImg] = useState(res.image);

    const nearbyAtts = (res.nearbyAttractions || []).map(id => {
        const all = [...attractionsData.city, ...attractionsData.spirit, ...attractionsData.nature];
        return all.find(a => a.id === id);
    }).filter(Boolean);

    const nearbyHots = (res.nearbyHotels || []).map(id => {
        return hotelsData.find(h => h.id === id);
    }).filter(Boolean);

    return (
        <div className="rp-modal-overlay" onClick={onClose}>
            <div className="rp-modal-container" onClick={e => e.stopPropagation()}>
                <button className="rp-modal-close" onClick={onClose}>
                    <Icons.Close />
                </button>

                {/* Left Side: Immersive Photo & Gallery */}
                <div className="rp-modal-visual">
                    <img src={mainImg} alt={res.name} className="rp-modal-visual-img" />
                    
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
                            <h2 className="rp-m-title">{res.name}</h2>
                            <div className="rp-m-meta">
                                <span>{res.cuisine}</span>
                                <span>·</span>
                                <span>{res.priceTag}</span>
                                <span>·</span>
                                <span>{res.city}</span>
                            </div>
                            {res.signature && (
                                <div className="rp-m-signature-inline">
                                    <Icons.Crown style={{ width: 14, color: 'var(--rp-sand)' }} />
                                    <span>Рекомендуем: {res.signature}</span>
                                </div>
                            )}
                        </div>

                        <div className="rp-m-sec">
                            <div className="rp-m-sec-title">История & Атмосфера</div>
                            <p className="rp-m-desc">{res.description}</p>
                        </div>

                        {res.menu && (
                            <div className="rp-m-sec">
                                <div className="rp-m-sec-title">Гастрономия</div>
                                <div className="rp-m-menu">
                                    {res.menu.map(m => (
                                        <div key={m.item} className="rp-menu-row">
                                            <span className="rp-menu-name">{m.item}</span>
                                            <span className="rp-menu-dots" />
                                            <span className="rp-menu-price">{m.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {nearbyAtts.length > 0 && (
                            <div className="rp-m-sec">
                                <div className="rp-m-sec-title">Рекомендуем посетить рядом</div>
                                <div className="rp-nearby-modern-grid">
                                    {nearbyAtts.map(att => (
                                        <div key={att.id} className="rp-nearby-card" onClick={() => onOpenOther('attraction', att)}>
                                            <img src={att.image} alt="" />
                                            <div className="rp-nearby-info">
                                                <strong>{att.name}</strong>
                                                <span>Достопримечательность</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {nearbyHots.length > 0 && (
                            <div className="rp-m-sec">
                                <div className="rp-m-sec-title">Отели поблизости</div>
                                <div className="rp-nearby-modern-grid">
                                    {nearbyHots.map(hot => (
                                        <div key={hot.id} className="rp-nearby-card" onClick={() => onOpenOther('hotel', hot)}>
                                            <img src={hot.image} alt="" />
                                            <div className="rp-nearby-info">
                                                <strong>{hot.name}</strong>
                                                <span>{hot.type} · {hot.stars}★</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rp-m-sec">
                            <div className="rp-m-sec-title">Местоположение</div>
                            <div className="rp-map-placeholder">
                                <div className="rp-map-view">
                                    {/* Mock map visual */}
                                    <div className="rp-map-pin-pulse">
                                        <Icons.Pin />
                                    </div>
                                </div>
                                <div className="rp-map-address">
                                    <Icons.Pin style={{ width: 14 }} />
                                    <span>{res.city}, {res.location}</span>
                                </div>
                            </div>
                        </div>

                        {res.specialty && (
                            <div className="rp-m-sec">
                                <div className="rp-m-sec-title">Кулинарный Секрет</div>
                                <div className="rp-m-special">
                                    "{res.specialty}"
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rp-modal-action">
                        <button className="rp-action-btn full-width">Забронировать столик</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditorialCard = ({ res, onClick }) => {
    return (
        <div className="rp-card" onClick={onClick}>
            <div className="rp-card-img-wrap">
                <img src={res.image} alt={res.name} className="rp-card-img" />
                <div className="rp-card-overlay" />
                <div className="rp-card-badge">{res.cuisine}</div>

                <div className="rp-card-content-overlay">
                    <h3 className="rp-card-name">{res.name}</h3>
                    <div className="rp-card-meta">
                        <span>{res.city}</span>
                    </div>
                    <div className="rp-card-sig">{res.signature}</div>
                </div>
            </div>
        </div>
    );
};

const RestaurantsPage = () => {
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('All');
    const [city, setCity] = useState('All');
    const [otherModal, setOtherModal] = useState(null);

    const CITIES = ['All', 'Туркестан', 'Отрар', 'Сауран'];
    const TYPES = ['All', 'Казахская', 'Узбекская', 'Восточная', 'Европейская', 'Кофейня'];

    const filtered = (restaurants || []).filter(r =>
        (filter === 'All' || r.cuisine === filter) || (filter === 'Все' && r.cuisine) &&
        (city === 'All' || r.city === city) || (city === 'Все' && r.city === city)
    );

    // Добавим поддержку кириллицы в фильтрах "Все"
    const isFiltered = (r) => {
        const matchesFilter = filter === 'All' || filter === 'Все' || r.cuisine === filter;
        const matchesCity = city === 'All' || city === 'Все' || r.city === city;
        return matchesFilter && matchesCity;
    };

    const finalFiltered = (restaurants || []).filter(isFiltered);

    const handleOpenOther = (type, data) => {
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
                        Назад
                    </Link>
                    <div className="rp-logo-box">
                        <img src={heroTextImg} alt="Turkistan" className="rp-header-logo" />
                    </div>
                    <div className="rp-count">
                        {filtered.length} Заведений
                    </div>
                </div>

                <div className="rp-filter-bar">
                    <div className="rp-filter-group">
                        {CITIES.map(c => (
                            <button key={c} className={`rp-f-btn ${city === c ? 'active' : ''}`} onClick={() => setCity(c)}>
                                {c === 'All' ? 'Все Города' : c}
                            </button>
                        ))}
                    </div>
                    <div className="rp-filter-group">
                        {TYPES.map(t => (
                            <button key={t} className={`rp-f-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
                                {t === 'All' ? 'Все Кухни' : t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── HERO ─── */}
            <div className="rp-hero">
                <h1 className="rp-h-main">Рестораны</h1>
                <div className="rp-h-sub">Вкус Великой Степи</div>
            </div>

            {/* ─── GRID ─── */}
            <div className="rp-grid-container">
                <div className="rp-grid">
                    {finalFiltered.map(r => (
                        <EditorialCard key={r.id} res={r} onClick={() => setSelected(r)} />
                    ))}
                    {finalFiltered.length === 0 && (
                        <div className="rp-empty">Для данного фильтра пока нет предложений.</div>
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

export default RestaurantsPage;
