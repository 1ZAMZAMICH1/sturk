import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './HotelsPageMobile.css';
import { Icons } from '../admin/AdminIcons';
import LeafletMapWidget from '../components/LeafletMapWidget';
import { AttractionModal } from '../mobile/CategoryPageMobile';
import { EditorialModal } from './RestaurantsPageMobile';
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

const AMENITY_MAP = {
    'Wi-Fi': Icons.WiFi,
    'Завтрак': Icons.Coffee,
    'Бассейн': Icons.Pool,
    'SPA': Icons.SPA,
    'Фитнес': Icons.Gym,
    'Кондиционер': Icons.AC,
    'Парковка': Icons.Pin,
    'Ресторан': Icons.Restaurants,
    'Вид на мавзолей': Icons.Eye,
    'Традиции': Icons.Users
};

export const Stars = ({ count }) => (
    <div className="hp-stars">
        {[...Array(5)].map((_, i) => (
            <Icons.Star key={i} fill={i < count ? "var(--hp-gold)" : "none"} />
        ))}
    </div>
);

export const HotelModal = ({ hotel, onClose, onOpenOther }) => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [mainImage, setMainImage] = useState(hotel.image);
    const [nearbyData, setNearbyData] = useState({ attractions: [], restaurants: [] });

    useEffect(() => {
        const loadNearby = async () => {
            const [atts, restos] = await Promise.all([
                fetchSheetData('attractions'),
                fetchSheetData('restaurants')
            ]);
            
            const getObjId = (obj) => {
                const id = obj.id || obj.ID || obj.Id || obj.rowid || '';
                return String(id).trim();
            };

            const parseIds = (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val.map(v => String(v).trim());
                if (typeof val === 'string') {
                    if (val.startsWith('[')) {
                        try { 
                            const parsed = JSON.parse(val);
                            return Array.isArray(parsed) ? parsed.map(v => String(v).trim()) : [];
                        } catch(e) { return []; }
                    }
                    return val.split(',').map(s => String(s).trim()).filter(Boolean);
                }
                return [];
            };

            const targetAttIds = parseIds(hotel.nearbyAttractions);
            const targetRestoIds = parseIds(hotel.nearbyRestaurants);
            
            const filteredAtts = (atts || []).filter(a => {
                const aid = getObjId(a);
                return aid && targetAttIds.some(tid => {
                    const stid = String(tid);
                    return aid === stid || aid.includes(stid) || stid.includes(aid);
                });
            });

            const filteredRestos = (restos || []).filter(r => {
                const rid = getObjId(r);
                return rid && targetRestoIds.some(tid => {
                    const srid = String(tid);
                    return rid === srid || rid.includes(srid) || srid.includes(rid);
                });
            });
            
            setNearbyData({ attractions: filteredAtts, restaurants: filteredRestos });
        };
        loadNearby();
    }, [hotel]);

    // Парсинг JSON-полей отеля
    const parsedGallery = useMemo(() => {
        if (!hotel.gallery) return [hotel.image];
        if (Array.isArray(hotel.gallery)) return hotel.gallery;
        try { return JSON.parse(hotel.gallery); } catch(e) { return [hotel.image]; }
    }, [hotel.gallery, hotel.image]);

    const parsedRooms = useMemo(() => {
        if (!hotel.rooms) return [];
        if (Array.isArray(hotel.rooms)) return hotel.rooms;
        try { return JSON.parse(hotel.rooms); } catch(e) { return []; }
    }, [hotel.rooms]);

    const parsedAmenities = useMemo(() => {
        if (!hotel.amenities) return [];
        if (Array.isArray(hotel.amenities)) return hotel.amenities;
        try { return JSON.parse(hotel.amenities); } catch(e) { return []; }
    }, [hotel.amenities]);


    const localizedName = hotel[`name_${i18n.language}`] || hotel.name_ru || hotel.name;
    const localizedDesc = hotel[`description_${i18n.language}`] || hotel.description_ru || hotel.description;
    const localizedLoc = hotel[`location_${i18n.language}`] || hotel.location_ru || hotel.location;

    return createPortal(
        <div className="hp-modal-overlay" onClick={onClose}>
            <div className="hp-modal-royal" onClick={e => e.stopPropagation()}>
                <div className="hp-royal-frame">
                    <button className="hp-modal-close" onClick={onClose}><Icons.Close /></button>
                    <div className="hp-royal-left">
                        <img src={mainImage} alt={localizedName} className="hp-royal-img" />
                        <div className="hp-royal-img-gradient" />
                        <div className="hp-royal-distance-tag"><Icons.Pin /> {hotel.distance}</div>
                        <div className="hp-royal-gallery">
                            <div className="hp-gallery-scroll-mini">
                                {parsedGallery.map((img, i) => (
                                    <img key={i} src={img} alt="" className={`hp-gal-thumb ${mainImage === img ? 'active' : ''}`} onClick={() => setMainImage(img)} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hp-royal-right">
                        <div className="hp-royal-header">
                            <div className="hp-royal-eyebrow">{hotel.type} · {hotel.city || t('category.default_region')}</div>
                            <h2 className="hp-royal-name">{localizedName}</h2>
                            <div className="hp-royal-meta-row">
                                <Stars count={hotel.stars} />
                                <span className="hp-price-tag">{hotel.priceTag}</span>
                            </div>
                        </div>
                        <nav className="hp-info-tabs">
                            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>{t('hotels_page.tab_overview')}</button>
                            <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>{t('hotels_page.tab_rooms')}</button>
                            <button className={activeTab === 'nearby' ? 'active' : ''} onClick={() => setActiveTab('nearby')}>{t('hotels_page.tab_nearby')}</button>
                        </nav>
                        <div className="hp-royal-scroll">
                            {activeTab === 'overview' && (
                                <div className="slide-in">
                                    <p className="hp-description">{localizedDesc}</p>
                                    <div className="hp-royal-section">
                                        <h4 className="hp-sec-title">{t('hotels_page.amenities_title')}</h4>
                                        <div className="hp-amenities-refined">
                                            {parsedAmenities.map(a => {
                                                const Icon = AMENITY_MAP[a] || Icons.Star;
                                                return (
                                                    <div key={a} className="hp-amenity-pill">
                                                        <Icon style={{ width: '16px', color: 'var(--hp-gold)' }} />
                                                        <span>{t(`hotels_page.amenities.${a}`)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="hp-royal-section">
                                        <h4 className="hp-sec-title">{t('restos_page.sec_location')}</h4>
                                        <div className="hp-mini-map-container" style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '15px' }}>
                                            <LeafletMapWidget 
                                                lat={hotel.lat ? parseFloat(hotel.lat) : 0} 
                                                lng={hotel.lng ? parseFloat(hotel.lng) : 0} 
                                                title={hotel.name} 
                                            />
                                        </div>
                                        <p style={{ color: 'var(--hp-ink)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Icons.Pin style={{ width: '14px' }} />
                                            {localizedLoc}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'rooms' && (
                                <div className="slide-in">
                                    <div className="hp-rooms-list-refined">
                                        {parsedRooms.map((room, idx) => {
                                            const RoomIcon = Icons[room.icon] || Icons.Bed;
                                            const roomName = room[`name_${i18n.language}`] || room.name_ru || room.name;
                                            return (
                                                <div key={idx} className="hp-room-card-royal">
                                                    <div className="room-header-r">
                                                        <RoomIcon style={{ width: '20px', color: 'var(--hp-gold)' }} />
                                                        <span className="room-name">{roomName}</span>
                                                    </div>
                                                    <span className="room-price">{t('hotels_page.from_price', { price: room.price })}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'nearby' && (
                                <div className="slide-in">
                                    <div className="hp-nearby-grid-royal">
                                        {nearbyData.attractions.length > 0 && (
                                            <div className="nearby-group">
                                                <h4 className="hp-sec-title">{t('hotels_page.nearby_attractions')}</h4>
                                                <div className="nearby-list-r">
                                                    {nearbyData.attractions.map(a => (
                                                        <div key={a.id} className="hp-nearby-item-royal clickable" onClick={() => onOpenOther && onOpenOther(a, 'attraction')}>
                                                            <img src={a.image} alt="" />
                                                            <span>{a[`name_${i18n.language}`] || a.name_ru || a.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {nearbyData.restaurants.length > 0 && (
                                            <div className="nearby-group">
                                                <h4 className="hp-sec-title">{t('hotels_page.nearby_restaurants')}</h4>
                                                <div className="nearby-list-r">
                                                    {nearbyData.restaurants.map(r => (
                                                        <div key={r.id} className="hp-nearby-item-royal clickable" onClick={() => onOpenOther && onOpenOther(r, 'restaurant')}>
                                                            <img src={r.image} alt="" />
                                                            <span>{r[`name_${i18n.language}`] || r.name_ru || r.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="hp-royal-footer">
                            <a href={hotel.websiteUrl || "#"} target="_blank" rel="noopener noreferrer" className="hp-book-btn-royal">
                                {t('hotels_page.visit_website')} <Icons.External />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const HotelCard = ({ hotel, onClick }) => (
    <div className="hp-iwan-card" onClick={onClick}>
        <div className="hp-iwan-portal">
            <div className="hp-iwan-top">
                <div className="hp-iwan-arch">
                    <img src={hotel.image} alt={hotel.name} className="hp-iwan-img" loading="lazy" />
                    <div className="hp-iwan-overlay" />
                    <div className="hp-iwan-city-badge">{hotel.city}</div>
                </div>
            </div>
            <div className="hp-iwan-body">
                <div>
                    <Stars count={hotel.stars} />
                    <h3 className="hp-iwan-name">{hotel.name}</h3>
                    <p className="hp-iwan-desc-preview">{hotel.description}</p>
                </div>
                <div className="hp-iwan-footer">
                    <span className="hp-iwan-type">{hotel.type}</span>
                    <span className="hp-iwan-price">{hotel.priceTag}</span>
                </div>
            </div>
        </div>
    </div>
);

const HotelsMobile = () => {
    const { t, i18n } = useTranslation();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [atts, setAtts] = useState([]);
    const [restos, setRestos] = useState([]);
    const [guides, setGuides] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedOther, setSelectedOther] = useState(null);
    const [filter, setFilter] = useState('Все');
    const [city, setCity] = useState('Все');

    const CITIES = ['Все', 'Туркестан', 'Отрар', 'Сауран'];
    const TYPES = ['Все', 'Resort', 'Boutique', 'Hotel', 'Hostel', 'Eco'];

    const currentLogo = heroImages[i18n.language] || heroImages.ru;

    useEffect(() => {
        const loadAll = async () => {
            const [allHots, allAtts, allRestos, allGuides] = await Promise.all([
                fetchSheetData('hotels'),
                fetchSheetData('attractions'),
                fetchSheetData('restaurants'),
                fetchSheetData('guides')
            ]);
            setHotels(allHots);
            setAtts(allAtts);
            setRestos(allRestos);
            setGuides(allGuides);
            setLoading(false);
        };
        loadAll();
    }, []);

    const filtered = hotels.filter(h => {
        const matchesFilter = filter === 'Все' || h.type === filter;
        const matchesCity = city === 'Все' || h.city === city;
        return matchesFilter && matchesCity;
    });

    if (loading) return <div className="loading-state">{t('hotels.loading')}</div>;

    return (
        <div className="hp-root">
            <div className="hp-bg-star-layer" />
            <div className="hp-header-wrap">
                <div className="hp-topbar">
                    <Link to="/" className="hp-back">{t('ui.back')}</Link>
                    <div className="hp-logo-box"><img src={currentLogo} alt="Turkistan" className="hp-header-logo" /></div>
                    <div className="hp-count-badge">{t('hotels_page.objects_label', { count: filtered.length })}</div>
                </div>
                <div className="hp-filter-bar">
                    <div className="hp-filter-box">
                        <div className="hp-filter-group">
                            {CITIES.map(cityItem => <button key={cityItem} className={`hp-f-btn ${city === cityItem ? 'active' : ''}`} onClick={() => setCity(cityItem)}>{cityItem === 'Все' ? t('filters.all') : cityItem}</button>)}
                        </div>
                        <div className="hp-filter-group">
                            {TYPES.map(type => <button key={type} className={`hp-f-btn ${filter === type ? 'active' : ''}`} onClick={() => setFilter(type)}>{type === 'Все' ? t('filters.all') : type}</button>)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="hp-hero">
                <h1 className="hp-hero-h"><span className="hp-h-main">{t('hotels_page.hero_title')}</span></h1>
                <div className="hp-hero-sub">{t('hotels_page.hero_subtitle')}</div>
            </div>

            <div className="hp-grid-container">
                <div className="hp-grid-mobile">
                    {filtered.map(hotel => <HotelCard key={hotel.id} hotel={hotel} onClick={() => setSelectedHotel(hotel)} />)}
                </div>
            </div>

            {selectedHotel && (
                <HotelModal 
                    hotel={selectedHotel} 
                    onClose={() => setSelectedHotel(null)} 
                    onOpenOther={(type, data) => {
                        const parsed = { ...data };
                        if (parsed.gallery && typeof parsed.gallery === 'string') {
                            try { parsed.gallery = JSON.parse(parsed.gallery); } catch(e) { parsed.gallery = []; }
                        }
                        if (parsed.lat && parsed.lng) {
                            parsed.coordinates = { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) };
                        }
                        setSelectedOther({ type, data: parsed });
                    }} 
                />
            )}
            
            {selectedOther?.type === 'attraction' && (
                <AttractionModal 
                    item={selectedOther.data} 
                    hots={hotels} 
                    restos={restos} 
                    guides={guides}
                    onClose={() => setSelectedOther(null)} 
                    onNavigate={(newItem) => {
                        const parsed = { ...newItem };
                        if (parsed.lat && parsed.lng) parsed.coordinates = { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) };
                        setSelectedOther({ data: parsed, type: 'attraction' });
                    }} 
                />
            )}
            {selectedOther?.type === 'restaurant' && (
                <EditorialModal 
                    res={selectedOther.data} 
                    hots={hotels}
                    atts={atts}
                    onClose={() => setSelectedOther(null)} 
                    onOpenOther={(type, data) => {
                        const parsed = { ...data };
                        if (parsed.lat && parsed.lng) parsed.coordinates = { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) };
                        setSelectedOther({ type, data: parsed });
                    }}
                />
            )}
        </div>
    );
};

export default HotelsMobile;
