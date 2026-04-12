import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../services/api';
import './GuidesPage.css';
import heroTextImgRU from '../assets/hero-text.png';
import heroTextImgKZ from '../assets/hero-textkz.png';
import heroTextImgEN from '../assets/hero-texten.png';
import heroTextImgZH from '../assets/hero-textzh.png';

const SPECIALTY_ICONS = {
    'История': '🏛️',
    'Природа': '🏔️',
    'Кулинария': '🍽️',
    'Архитектура': '🕌',
    'Приключения': '🧭',
    'Культура': '🎨',
};

const CATEGORY_COLORS = {
    'история': '#8b6914',
    'природа': '#2d6a4f',
    'кулинария': '#8b3a1a',
    'архитектура': '#1a3a5f',
    'приключения': '#4a1a5f',
    'культура': '#5f1a3a',
};

const Stars = ({ rating }) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <div className="gp-stars">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={`gp-star ${i < full ? 'full' : i === full && half ? 'half' : ''}`}>★</span>
            ))}
            <span className="gp-rating-num">{rating}</span>
        </div>
    );
};

/* ── GUIDE MODAL ── */
const GuideModal = ({ guide, onClose }) => {
    const { t, i18n } = useTranslation();
    const [activeTour, setActiveTour] = useState(guide.tours && guide.tours.length > 0 ? guide.tours[0] : null);
    
    return (
        <div className="gp-modal-overlay" onClick={onClose}>
            <div className="gp-modal" onClick={e => e.stopPropagation()}>
                <button className="gp-modal-close" onClick={onClose}>✕</button>

                {/* LEFT: Guide Profile */}
                <div className="gp-modal-left">
                    <div className="gp-modal-avatar-wrap">
                        <div className="gp-compass-outer" />
                        <div className="gp-compass-middle" />
                        <img src={guide.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=60"} alt={guide[`name_${i18n.language}`] || guide.name_ru || guide.name} className="gp-avatar" />
                        <div className="gp-compass-needle" />
                    </div>
                    <h2 className="gp-modal-name">{guide[`name_${i18n.language}`] || guide.name_ru || guide.name}</h2>
                    <div className="gp-modal-specialty">
                        <span>{SPECIALTY_ICONS[guide.specialty]}</span> {t(`guides_page.specialties.${guide.specialty}`)}
                    </div>
                    <Stars rating={guide.rating} />
                    <p className="gp-modal-reviews">({t('guides_page.reviews_label', { count: guide.reviewCount })})</p>

                    <div className="gp-modal-stats">
                        <div className="gp-stat">
                            <span className="gp-stat-val">{guide.experience}</span>
                            <span className="gp-stat-lbl">{t('guides_page.exp_label', { count: guide.experience }).split(' ')[1]} {t('guides_page.exp_label', { count: guide.experience }).split(' ')[2]}</span>
                        </div>
                        <div className="gp-stat">
                            <span className="gp-stat-val">{guide.tours?.length || 0}</span>
                            <span className="gp-stat-lbl">{t('guides_page.routes_label', { count: guide.tours?.length }).split(' ')[1]}</span>
                        </div>
                        <div className="gp-stat">
                            <span className="gp-stat-val">{guide.languages?.length || 0}</span>
                            <span className="gp-stat-lbl">{t('guides_page.langs_label', { count: guide.languages?.length }).split(' ')[1]}</span>
                        </div>
                    </div>

                    <p className="gp-modal-desc">{guide[`description_${i18n.language}`] || guide.description_ru || guide.description}</p>

                    <div className="gp-modal-langs">
                        {guide.languages?.map(l => <span key={l} className="gp-lang-chip">{l}</span>)}
                    </div>

                    {/* Tour picker */}
                    <div className="gp-tour-picker">
                        {guide.tours?.map(t => {
                            const tourTitle = t[`title_${i18n.language}`] || t.title_ru || t.title;
                            const tourPrice = t[`price_${i18n.language}`] || t.price_ru || t.price;
                            return (
                                <button
                                    key={t.id}
                                    className={`gp-tour-pick-btn ${activeTour?.id === t.id ? 'active' : ''}`}
                                    onClick={() => setActiveTour(t)}
                                >
                                    {tourTitle}
                                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.7 }}>{tourPrice}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Tour Detail */}
                <div className="gp-modal-right">
                    {activeTour ? (
                        <div className="gp-tour-detail">
                            <div className="gp-tour-header">
                                <h3 className="gp-tour-title">{activeTour[`title_${i18n.language}`] || activeTour.title_ru || activeTour.title}</h3>
                                <div className="gp-tour-meta">
                                    <span className="gp-tour-duration">⏱ {activeTour[`duration_${i18n.language}`] || activeTour.duration_ru || activeTour.duration}</span>
                                    <span className="gp-tour-price">{activeTour[`price_${i18n.language}`] || activeTour.price_ru || activeTour.price}</span>
                                </div>
                            </div>
                            <p className="gp-tour-desc">{activeTour[`description_${i18n.language}`] || activeTour.description_ru || activeTour.description}</p>
                            <h4 className="gp-highlights-title">{t('guides_page.route_program')}</h4>
                            <div className="gp-highlights">
                                {activeTour[`highlights_${i18n.language}`]?.split(',').map((h, i) => (
                                    <div key={i} className="gp-highlight-item">
                                        <div className="gp-hl-dot">{i + 1}</div>
                                        <span>{h.trim()}</span>
                                    </div>
                                )) || (Array.isArray(activeTour.highlights) ? activeTour.highlights : (activeTour.highlights_ru || activeTour.highlights || '').split(',')).map((h, i) => (
                                    <div key={i} className="gp-highlight-item">
                                        <div className="gp-hl-dot">{i + 1}</div>
                                        <span>{String(h).trim()}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="gp-book-btn">{t('guides_page.btn_book')}</button>
                        </div>
                    ) : (
                        <div className="gp-no-tour">{t('guides_page.no_tour')}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── GUIDE CARD ── */
const GuideCard = ({ guide, onClick }) => {
    const { t, i18n } = useTranslation();
    const localizedName = guide[`name_${i18n.language}`] || guide.name_ru || guide.name;
    const localizedDesc = guide[`description_${i18n.language}`] || guide.description_ru || guide.description;

    return (
        <div className="gp-card" onClick={onClick}>
            <div className="gp-card-avatar-section">
                <div className="gp-compass-wrap">
                    <div className="gp-compass-outer" />
                    <div className="gp-compass-middle" />
                    <img src={guide.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=60"} alt={localizedName} className="gp-avatar" />
                    <div className="gp-compass-needle" />
                </div>
                <div className="gp-specialty-badge">
                    {SPECIALTY_ICONS[guide.specialty]} {t(`guides_page.specialties.${guide.specialty}`)}
                </div>
            </div>

            <div className="gp-card-body">
                <h3 className="gp-card-name">{localizedName}</h3>
                <Stars rating={guide.rating} />
                <p className="gp-card-desc">{localizedDesc?.substring(0, 110)}…</p>

                <div className="gp-card-langs">
                    {guide.languages?.slice(0, 3).map(l => (
                        <span key={l} className="gp-lang-tag">{l}</span>
                    ))}
                </div>

                <div className="gp-tour-list">
                    {guide.tours?.slice(0, 3).map(tour => {
                        const tourTitle = tour[`title_${i18n.language}`] || tour.title_ru || tour.title;
                        const tourDur = tour[`duration_${i18n.language}`] || tour.duration_ru || tour.duration;
                        const tourPrice = tour[`price_${i18n.language}`] || tour.price_ru || tour.price;
                        return (
                            <div key={tour.id} className="gp-tour-row">
                                <div className="gp-tour-dot" style={{ background: CATEGORY_COLORS[tour.category] || '#8b6914' }} />
                                <div className="gp-tour-info">
                                    <span className="gp-tour-name">{tourTitle}</span>
                                    <span className="gp-tour-meta-sm">{tourDur} · {tourPrice}</span>
                                </div>
                                <span className="gp-tour-arrow">→</span>
                            </div>
                        );
                    })}
                </div>

                <div className="gp-card-footer">
                    <span className="gp-exp">{t('guides_page.exp_label', { count: guide.experience })}</span>
                    <button className="gp-details-btn">{t('guides_page.btn_details')}</button>
                </div>
            </div>
        </div>
    );
};

/* ── PAGE ── */
const Horizon = () => (
    <div className="gp-horizon" aria-hidden="true">
        <svg className="gp-skyline-svg" viewBox="0 0 1440 420" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d0a14" stopOpacity="0"/>
                    <stop offset="100%" stopColor="#0d0a14" stopOpacity="1"/>
                </linearGradient>
                <linearGradient id="sunGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0"/>
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0.3"/>
                </linearGradient>
            </defs>

            {/* === SUN GLOW === */}
            <rect x="0" y="0" width="1440" height="420" fill="url(#sunGlow)"/>

            {/* === FAR MOUNTAINS (Karatau) === */}
            {/* Lighter color for atmospheric depth */}
            <path fill="rgba(80, 50, 30, 0.25)" d="M0,290 Q50,260 120,270 T280,240 T450,280 T580,230 T750,260 T900,210 T1100,250 T1280,210 T1440,260 L1440,420 L0,420Z"/>
            
            {/* === MID MOUNTAINS === */}
            <path fill="rgba(50, 25, 10, 0.4)" d="M0,320 Q80,290 180,310 T350,280 T550,330 T780,290 T980,330 T1200,300 T1440,340 L1440,420 L0,420Z"/>
            
            {/* === NEAR HILLS & GROUND === */}
            <path fill="rgba(25, 10, 5, 0.7)" d="M0,350 Q100,330 220,360 T450,340 T700,370 T950,350 T1250,380 T1440,360 L1440,420 L0,420Z"/>

            {/* === KHOJA AHMED YASAWI MAUSOLEUM === */}
            <g transform="translate(620, 230) scale(1)">
                {/* Main Body */}
                <rect fill="#160803" x="20" y="60" width="180" height="90"/>
                
                {/* Big Ribbed Dome (Kazandyk) */}
                {/* Drum */}
                <rect fill="#1c0b05" x="70" y="35" width="80" height="25"/>
                {/* Dome */}
                <path fill="#261005" d="M70,35 C70,-15 150,-15 150,35 Z"/>
                {/* Rib Details */}
                <path fill="none" stroke="#160803" strokeWidth="2" d="M85,35 Q110,0 135,35"/>
                <path fill="none" stroke="#160803" strokeWidth="2" d="M100,35 Q110,5 120,35"/>
                <path fill="none" stroke="#160803" strokeWidth="2" d="M110,35 L110,12"/>
                
                {/* Main Pishtaq (Front Portal) */}
                <rect fill="#0a0301" x="90" y="75" width="65" height="100"/>
                <path fill="#0a0301" d="M90,75 Q122.5,45 155,75Z"/>
                {/* Pishtaq Pillars */}
                <rect fill="#180903" x="80" y="70" width="10" height="105"/>
                <rect fill="#180903" x="155" y="70" width="10" height="105"/>
                
                {/* Corner Towers / Minarets */}
                <rect fill="#140702" x="15" y="45" width="12" height="110"/>
                <polygon fill="#1c0b05" points="15,45 27,45 21,30"/>
                <rect fill="#140702" x="193" y="45" width="12" height="110"/>
                <polygon fill="#1c0b05" points="193,45 205,45 199,30"/>
                
                {/* Small Side Domes */}
                <path fill="#1a0c04" d="M30,60 C30,40 60,40 60,60Z"/>
                <path fill="#1a0c04" d="M160,60 C160,40 190,40 190,60Z"/>
            </g>

            {/* === ARYSTAN BAB MAUSOLEUM === */}
            <g transform="translate(180, 300) scale(0.8)">
                <rect fill="#120602" x="0" y="40" width="160" height="50"/>
                {/* Two distinct small domes */}
                <rect fill="#160803" x="25" y="25" width="30" height="15"/>
                <path fill="#180903" d="M25,25 C25,5 55,5 55,25Z"/>
                <rect fill="#160803" x="105" y="25" width="30" height="15"/>
                <path fill="#180903" d="M105,25 C105,5 135,5 135,25Z"/>
                {/* Small central portal */}
                <rect fill="#0a0301" x="65" y="35" width="30" height="60"/>
                <path fill="#0a0301" d="M65,35 Q80,20 95,35Z"/>
                {/* Corner pillars */}
                <rect fill="#140702" x="-5" y="30" width="10" height="65"/>
                <polygon fill="#180903" points="-5,30 5,30 0,20"/>
                <rect fill="#140702" x="155" y="30" width="10" height="65"/>
                <polygon fill="#180903" points="155,30 165,30 160,20"/>
            </g>

            {/* === FREE-STANDING TALL MINARET (Left) === */}
            <rect fill="#120602" x="520" y="240" width="14" height="140"/>
            <polygon fill="#180903" points="520,240 534,240 527,215"/>
            <rect fill="#0a0301" x="516" y="280" width="22" height="4"/>
            <rect fill="#0a0301" x="516" y="320" width="22" height="4"/>

            {/* === SMALLER MINARET / TOWER (Right) === */}
            <rect fill="#120602" x="900" y="270" width="12" height="110"/>
            <polygon fill="#180903" points="900,270 912,270 906,250"/>
            <rect fill="#0a0301" x="898" y="310" width="16" height="3"/>

            {/* === SAURAN/OTRAR RUINS === */}
            <g transform="translate(1080, 310) scale(0.9)">
                <path fill="#160803" d="M0,70 L15,35 L40,45 L60,25 L90,55 L130,20 L160,65 L190,70 Z"/>
                <rect fill="#0a0301" x="70" y="45" width="25" height="30"/>
                <path fill="#0a0301" d="M70,45 Q82.5,30 95,45Z"/>
            </g>

            {/* === SAXAUL TREES (Steppe detail) === */}
            <g transform="translate(320, 340)">
                <path fill="#0f0502" d="M0,40 Q-5,25 -20,15 Q-10,25 0,30 Q5,20 15,10 Q10,20 5,30 Q20,20 30,35 Q15,35 5,40 L0,40Z"/>
            </g>
            <g transform="translate(420, 350) scale(0.8)">
                <path fill="#0f0502" d="M0,40 Q-5,25 -20,15 Q-10,25 0,30 Q5,20 15,10 Q10,20 5,30 Q20,20 30,35 Q15,35 5,40 L0,40Z"/>
            </g>
            <g transform="translate(1000, 355) scale(0.9)">
                <path fill="#0f0502" d="M0,40 Q-5,25 -20,15 Q-10,25 0,30 Q5,20 15,10 Q10,20 5,30 Q20,20 30,35 Q15,35 5,40 L0,40Z"/>
            </g>

            {/* === CAMEL CARAVAN === */}
            <g transform="translate(850, 360) scale(0.6)">
                {/* Camel 1 */}
                {/* Body */}
                <ellipse fill="#080301" cx="0" cy="0" rx="20" ry="12"/>
                {/* Humps */}
                <ellipse fill="#080301" cx="-8" cy="-10" rx="8" ry="10"/>
                <ellipse fill="#080301" cx="8" cy="-10" rx="8" ry="10"/>
                {/* Neck & Head */}
                <path fill="#080301" d="M15,0 Q30,-15 25,-25 Q20,-30 28,-30 Q35,-30 35,-22 Q35,-10 20,5 Z"/>
                {/* Legs */}
                <rect fill="#080301" x="-15" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="-5" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="5" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="15" y="5" width="4" height="25" rx="2"/>
            </g>
            
            <g transform="translate(910, 365) scale(0.55)">
                {/* Camel 2 */}
                <ellipse fill="#080301" cx="0" cy="0" rx="20" ry="12"/>
                <ellipse fill="#080301" cx="-8" cy="-10" rx="8" ry="10"/>
                <ellipse fill="#080301" cx="8" cy="-10" rx="8" ry="10"/>
                <path fill="#080301" d="M15,0 Q30,-15 25,-25 Q20,-30 28,-30 Q35,-30 35,-22 Q35,-10 20,5 Z"/>
                <rect fill="#080301" x="-15" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="-5" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="5" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="15" y="5" width="4" height="25" rx="2"/>
            </g>

            <g transform="translate(965, 370) scale(0.5)">
                {/* Camel 3 */}
                <ellipse fill="#080301" cx="0" cy="0" rx="20" ry="12"/>
                <ellipse fill="#080301" cx="-8" cy="-10" rx="8" ry="10"/>
                <ellipse fill="#080301" cx="8" cy="-10" rx="8" ry="10"/>
                <path fill="#080301" d="M15,0 Q30,-15 25,-25 Q20,-30 28,-30 Q35,-30 35,-22 Q35,-10 20,5 Z"/>
                <rect fill="#080301" x="-15" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="-5" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="5" y="5" width="4" height="25" rx="2"/>
                <rect fill="#080301" x="15" y="5" width="4" height="25" rx="2"/>
            </g>

            {/* === GROUND BASE === */}
            <rect fill="#0a0503" x="0" y="380" width="1440" height="40"/>
            
            {/* === LOWER FOG OVERLAY === */}
            <rect x="0" y="300" width="1440" height="120" fill="url(#fogGrad)"/>
            
        </svg>
    </div>
);




const GuidesPage = () => {
    const { t, i18n } = useTranslation();
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [filter, setFilter] = useState('All');

    const SPECIALTIES = ['All', 'История', 'Природа', 'Архитектура', 'Культура', 'Кулинария', 'Приключения'];

    useEffect(() => {
        const loadGuides = async () => {
            const data = await fetchSheetData('guides');
            const processed = data.map(g => {
                let toursData = [];
                try {
                    toursData = Array.isArray(g.tours) ? g.tours : (g.tours ? JSON.parse(g.tours) : []);
                } catch (e) { console.error("Error parsing tours", e); }

                return {
                    ...g,
                    languages: Array.isArray(g.languages) ? g.languages : (g.languages?.split(',').map(s => s.trim()) || []),
                    tours: toursData
                };
            });
            setGuides(processed);
            setLoading(false);
        };
        loadGuides();
    }, []);

    if (loading) return <div className="loading-state">{t('guides_page.loading')}</div>;

    const filtered = filter === 'All' ? guides : guides.filter(g => g.specialty === filter);

    const heroImages = {
        ru: heroTextImgRU,
        kz: heroTextImgKZ,
        en: heroTextImgEN,
        zh: heroTextImgZH
    };
    const currentHeroImg = heroImages[i18n.language] || heroTextImgRU;

    return (
        <div className="gp-root">
            <div className="gp-stars-bg" />
            <div className="gp-glow" />
            <Horizon />

            <div className="gp-header-wrap">
                <div className="gp-topbar">
                    <Link to="/" className="gp-back">{t('ui.back')}</Link>
                    <div className="gp-logo-box">
                        <img src={currentHeroImg} alt="Turkistan" className="gp-header-logo" />
                    </div>
                </div>
                <div className="gp-filter-bar">
                    <div className="gp-filter-group">
                        {SPECIALTIES.map(s => (
                            <button
                                key={s}
                                className={`gp-f-btn ${filter === s ? 'active' : ''}`}
                                onClick={() => setFilter(s)}
                            >
                                {s === 'All' ? t('guides_page.all_specialties') : t(`guides_page.specialties.${s}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="gp-hero">
                <h1 className="gp-hero-title">{t('guides_page.hero_title')}</h1>
            </div>

            <div className="gp-grid-container">
                <div className="gp-grid">
                    {filtered.map(guide => (
                        <GuideCard key={guide.id} guide={guide} onClick={() => setSelectedGuide(guide)} />
                    ))}
                </div>
            </div>

            {selectedGuide && (
                <GuideModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
            )}
        </div>
    );
};

export default GuidesPage;
