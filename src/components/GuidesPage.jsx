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
    const { t } = useTranslation();
    const [activeTour, setActiveTour] = useState(guide.tours && guide.tours.length > 0 ? guide.tours[0] : null);
    
    return (
        <div className="gp-modal-overlay" onClick={onClose}>
            <div className="gp-modal" onClick={e => e.stopPropagation()}>
                <button className="gp-modal-close" onClick={onClose}>✕</button>

                {/* LEFT: Guide Profile */}
                <div className="gp-modal-left">
                    <div className="gp-modal-avatar-wrap">
                        <img src={guide.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=60"} alt={guide.name} className="gp-modal-avatar" />
                        <div className="gp-modal-compass-ring" />
                    </div>
                    <h2 className="gp-modal-name">{guide.name}</h2>
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

                    <p className="gp-modal-desc">{guide.description}</p>

                    <div className="gp-modal-langs">
                        {guide.languages?.map(l => <span key={l} className="gp-lang-chip">{l}</span>)}
                    </div>

                    {/* Tour picker */}
                    <div className="gp-tour-picker">
                        {guide.tours?.map(t => (
                            <button
                                key={t.id}
                                className={`gp-tour-pick-btn ${activeTour?.id === t.id ? 'active' : ''}`}
                                onClick={() => setActiveTour(t)}
                            >
                                {t.title}
                                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.7 }}>{t.price}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Tour Detail */}
                <div className="gp-modal-right">
                    {activeTour ? (
                        <div className="gp-tour-detail">
                            <div className="gp-tour-header">
                                <h3 className="gp-tour-title">{activeTour.title}</h3>
                                <div className="gp-tour-meta">
                                    <span className="gp-tour-duration">⏱ {activeTour.duration}</span>
                                    <span className="gp-tour-price">{activeTour.price}</span>
                                </div>
                            </div>
                            <p className="gp-tour-desc">{activeTour.description}</p>
                            <h4 className="gp-highlights-title">{t('guides_page.route_program')}</h4>
                            <div className="gp-highlights">
                                {activeTour.highlights?.map((h, i) => (
                                    <div key={i} className="gp-highlight-item">
                                        <div className="gp-hl-dot">{i + 1}</div>
                                        <span>{h}</span>
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
    const { t } = useTranslation();
    return (
        <div className="gp-card" onClick={onClick}>
            <div className="gp-card-avatar-section">
                <div className="gp-compass-wrap">
                    <div className="gp-compass-outer" />
                    <div className="gp-compass-middle" />
                    <img src={guide.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=60"} alt={guide.name} className="gp-avatar" />
                    <div className="gp-compass-needle" />
                </div>
                <div className="gp-specialty-badge">
                    {SPECIALTY_ICONS[guide.specialty]} {t(`guides_page.specialties.${guide.specialty}`)}
                </div>
            </div>

            <div className="gp-card-body">
                <h3 className="gp-card-name">{guide.name}</h3>
                <Stars rating={guide.rating} />
                <p className="gp-card-desc">{guide.description?.substring(0, 110)}…</p>

                <div className="gp-card-langs">
                    {guide.languages?.slice(0, 3).map(l => (
                        <span key={l} className="gp-lang-tag">{l}</span>
                    ))}
                </div>

                <div className="gp-tour-list">
                    {guide.tours?.slice(0, 3).map(t => (
                        <div key={t.id} className="gp-tour-row">
                            <div className="gp-tour-dot" style={{ background: CATEGORY_COLORS[t.category] || '#8b6914' }} />
                            <div className="gp-tour-info">
                                <span className="gp-tour-name">{t.title}</span>
                                <span className="gp-tour-meta-sm">{t.duration} · {t.price}</span>
                            </div>
                            <span className="gp-tour-arrow">→</span>
                        </div>
                    ))}
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
            {/* === СЛОЙ 1: ДАЛЁКИЕ ГОРЫ === */}
            <path className="gp-mountain-far" d="M0 300 L60 240 L120 270 L180 210 L260 250 L340 190 L420 230 L500 170 L580 220 L660 160 L740 210 L820 175 L900 220 L980 180 L1060 235 L1140 195 L1220 255 L1300 205 L1380 260 L1440 230 L1440 420 L0 420Z"/>
            {/* === СЛОЙ 2: БЛИЖНИЕ ГОРЫ === */}
            <path className="gp-mountain-mid" d="M0 340 L80 290 L160 320 L240 275 L330 310 L420 265 L510 300 L600 258 L690 298 L780 260 L870 300 L960 268 L1050 308 L1140 275 L1230 315 L1320 280 L1440 310 L1440 420 L0 420Z"/>

            {/* === СЛОЙ 3: АРХИТЕКТУРА — МАВЗОЛЕЙ ХОДЖА АХМАДА ЯССАУИ === */}
            {/* Основание мавзолея */}
            <rect className="gp-bld" x="560" y="295" width="200" height="90"/>
            {/* Центральный купол */}
            <ellipse className="gp-bld" cx="660" cy="295" rx="60" ry="40"/>
            <ellipse className="gp-bld-dark" cx="660" cy="293" rx="50" ry="30"/>
            {/* Барабан купола */}
            <rect className="gp-bld" x="620" y="275" width="80" height="25"/>
            {/* Боковые вспомогательные купола */}
            <ellipse className="gp-bld" cx="600" cy="300" rx="28" ry="20"/>
            <ellipse className="gp-bld" cx="720" cy="300" rx="28" ry="20"/>
            {/* Портал (пиштак) */}
            <rect className="gp-bld-dark" x="640" y="325" width="40" height="60"/>
            <path className="gp-bld-dark" d="M640 325 Q660 305 680 325Z"/>
            {/* Угловые башни мавзолея */}
            <rect className="gp-minaret" x="558" y="310" width="14" height="75"/>
            <ellipse className="gp-minaret" cx="565" cy="310" rx="7" ry="5"/>
            <rect className="gp-minaret" x="748" y="310" width="14" height="75"/>
            <ellipse className="gp-minaret" cx="755" cy="310" rx="7" ry="5"/>

            {/* === МИНАРЕТ ВЫСОКИЙ (слева от мавзолея) === */}
            <rect className="gp-minaret" x="520" y="250" width="18" height="135"/>
            <polygon className="gp-minaret" points="520,250 538,250 529,228"/>
            {/* Балкончик минарета */}
            <rect className="gp-minaret" x="516" y="298" width="26" height="5"/>

            {/* === МИНАРЕТ СРЕДНИЙ (справа) === */}
            <rect className="gp-minaret" x="900" y="268" width="14" height="117"/>
            <polygon className="gp-minaret" points="900,268 914,268 907,250"/>
            <rect className="gp-minaret" x="897" y="305" width="20" height="4"/>

            {/* === ЗДАНИЯ ВДОЛЬ ГОРИЗОНТА === */}
            {/* Левый квартал */}
            <rect className="gp-bld-dark" x="0" y="350" width="80" height="70"/>
            <rect className="gp-bld-dark" x="85" y="358" width="55" height="62"/>
            <rect className="gp-bld-dark" x="145" y="342" width="65" height="78"/>
            <rect className="gp-bld-dark" x="215" y="360" width="45" height="60"/>
            <ellipse className="gp-bld" cx="172" cy="342" rx="22" ry="16"/>
            {/* Правый квартал */}
            <rect className="gp-bld-dark" x="980" y="345" width="70" height="75"/>
            <rect className="gp-bld-dark" x="1055" y="355" width="50" height="65"/>
            <rect className="gp-bld-dark" x="1110" y="340" width="75" height="80"/>
            <ellipse className="gp-bld" cx="1148" cy="340" rx="24" ry="17"/>
            <rect className="gp-bld-dark" x="1190" y="350" width="55" height="70"/>
            <rect className="gp-bld-dark" x="1250" y="345" width="90" height="75"/>
            <rect className="gp-bld-dark" x="1345" y="355" width="95" height="65"/>

            {/* === ВЕРБЛЮДЫ НА ГОРИЗОНТЕ === */}
            <g className="gp-bld-dark" transform="translate(380,368) scale(0.9)">
                <ellipse cx="20" cy="0" rx="22" ry="12"/>
                <rect x="8" y="-5" width="8" height="22"/>
                <rect x="26" y="-5" width="8" height="22"/>
                <ellipse cx="40" cy="-14" rx="12" ry="9"/>
                <rect x="38" y="-12" width="6" height="12"/>
                <ellipse cx="20" cy="-18" rx="8" ry="10"/>
            </g>
            <g className="gp-bld-dark" transform="translate(440,372) scale(0.7)">
                <ellipse cx="20" cy="0" rx="22" ry="12"/>
                <rect x="8" y="-5" width="8" height="22"/>
                <rect x="26" y="-5" width="8" height="22"/>
                <ellipse cx="20" cy="-18" rx="8" ry="10"/>
            </g>

            {/* === ПАЛЬМЫ === */}
            <line x1="820" y1="385" x2="820" y2="335" stroke="#130a02" strokeWidth="4"/>
            <ellipse className="gp-bld-dark" cx="820" cy="332" rx="18" ry="10"/>
            <ellipse className="gp-bld-dark" cx="807" cy="338" rx="14" ry="7" transform="rotate(-20,807,338)"/>
            <ellipse className="gp-bld-dark" cx="833" cy="338" rx="14" ry="7" transform="rotate(20,833,338)"/>

            <line x1="855" y1="388" x2="855" y2="342" stroke="#130a02" strokeWidth="3"/>
            <ellipse className="gp-bld-dark" cx="855" cy="339" rx="14" ry="8"/>
            <ellipse className="gp-bld-dark" cx="844" cy="344" rx="11" ry="6" transform="rotate(-20,844,344)"/>
            <ellipse className="gp-bld-dark" cx="866" cy="344" rx="11" ry="6" transform="rotate(20,866,344)"/>

            {/* === ТУМАН У ОСНОВАНИЯ === */}
            <defs>
                <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="100%" stopColor="#c06a20" stopOpacity="0.25"/>
                </linearGradient>
            </defs>
            <rect x="0" y="380" width="1440" height="40" fill="url(#fogGrad)"/>

            {/* === ЗЕМЛЯ === */}
            <rect className="gp-bld-dark" x="0" y="400" width="1440" height="20"/>
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
