import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './HotelsPage.css';
import { Icons } from '../admin/AdminIcons';
import { AttractionModal } from './CategoryPage';
import { EditorialModal } from './RestaurantsPage';
import { fetchSheetData } from '../services/api';
import heroTextImg from '../assets/hero-text.png';

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
            
            const filteredAtts = (hotel.nearbyAttractions || []).map(id => atts.find(a => a.id === id)).filter(Boolean);
            const filteredRestos = (hotel.nearbyRestaurants || []).map(id => restos.find(r => r.id === id)).filter(Boolean);
            
            setNearbyData({ attractions: filteredAtts, restaurants: filteredRestos });
        };
        loadNearby();
    }, [hotel]);

    return (
        <div className="hp-modal-overlay" onClick={onClose}>
            <div className="hp-modal-royal" onClick={e => e.stopPropagation()}>
                <div className="hp-royal-frame">
                    <button className="hp-modal-close" onClick={onClose}><Icons.Close /></button>
                    <div className="hp-royal-left">
                        <img src={mainImage} alt={hotel[`name_${i18n.language}`] || hotel.name_ru || hotel.name} className="hp-royal-img" />
                        <div className="hp-royal-img-gradient" />
                        <div className="hp-royal-distance-tag"><Icons.Pin /> {hotel.distance}</div>
                        <div className="hp-royal-gallery">
                            <div className="hp-gallery-scroll-mini">
                                {(hotel.gallery && hotel.gallery.length > 0 ? hotel.gallery : [hotel.image]).map((img, i) => (
                                    <img key={i} src={img} alt="" className={`hp-gal-thumb ${mainImage === img ? 'active' : ''}`} onClick={() => setMainImage(img)} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hp-royal-right">
                        <div className="hp-royal-header">
                            <div className="hp-royal-eyebrow">{t(`hotels_page.types.${hotel.type}`)} · {hotel.city}</div>
                            <h2 className="hp-royal-name">{hotel[`name_${i18n.language}`] || hotel.name_ru || hotel.name}</h2>
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
                                    <p className="hp-description">{hotel[`description_${i18n.language}`] || hotel.description_ru || hotel.description}</p>
                                    <div className="hp-royal-section">
                                        <h4 className="hp-sec-title">{t('hotels_page.amenities_title')}</h4>
                                        <div className="hp-amenities-refined">
                                            {hotel.amenities?.map(a => {
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
                                        <h4 className="hp-sec-title">{t('hotels_page.address_title')}</h4>
                                        <p style={{ color: 'var(--hp-ink)' }}>{hotel[`location_${i18n.language}`] || hotel.location_ru || hotel.location}</p>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'rooms' && (
                                <div className="slide-in">
                                    <div className="hp-rooms-list-refined">
                                        {hotel.rooms?.map(room => {
                                            const RoomIcon = Icons[room.icon] || Icons.Bed;
                                            const roomName = room[`name_${i18n.language}`] || room.name_ru || room.name;
                                            return (
                                                <div key={room.name + roomName} className="hp-room-card-royal">
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
        </div>
    );
};

const HotelCard = ({ hotel, onClick }) => {
    const { i18n } = useTranslation();
    const localizedName = hotel[`name_${i18n.language}`] || hotel.name_ru || hotel.name;
    const localizedDesc = hotel[`description_${i18n.language}`] || hotel.description_ru || hotel.description;

    return (
        <div className="hp-iwan-card" onClick={onClick}>
            <div className="hp-iwan-portal">
                <div className="hp-iwan-top">
                    <div className="hp-iwan-arch">
                        <img src={hotel.image} alt={localizedName} className="hp-iwan-img" loading="lazy" />
                        <div className="hp-iwan-overlay" />
                        <div className="hp-iwan-city-badge">{hotel.city}</div>
                    </div>
                </div>
                <div className="hp-iwan-body">
                    <div>
                        <Stars count={hotel.stars} />
                        <h3 className="hp-iwan-name">{localizedName}</h3>
                        <p className="hp-iwan-desc-preview">{localizedDesc}</p>
                    </div>
                    <div className="hp-iwan-footer">
                        <span className="hp-iwan-type">{hotel.type}</span>
                        <span className="hp-iwan-price">{hotel.priceTag}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HotelsPage = () => {
    const { t } = useTranslation();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [atts, setAtts] = useState([]);
    const [restos, setRestos] = useState([]);
    const [guides, setGuides] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedOther, setSelectedOther] = useState(null);
    const [filter, setFilter] = useState('All');
    const [city, setCity] = useState('All');

    const CITIES = ['All', 'Туркестан', 'Отрар', 'Сауран'];
    const TYPES = ['All', 'Resort', 'Boutique', 'Hotel', 'Hostel', 'Eco'];

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
        if (filter !== 'All' && h.type !== filter) return false;
        if (city !== 'All' && h.city !== city) return false;
        return true;
    });

    if (loading) return <div className="loading-state">{t('hotels_page.loading')}</div>;

    return (
        <div className="hp-root">
            <div className="hp-bg-star-layer" />
            <div className="hp-header-wrap">
                <div className="hp-topbar">
                    <Link to="/" className="hp-back">{t('ui.back')}</Link>
                    <div className="hp-logo-box"><img src={heroTextImg} alt="Turkistan" className="hp-header-logo" /></div>
                    <div className="hp-count-badge">{t('hotels_page.objects_label', { count: filtered.length })}</div>
                </div>
                <div className="hp-filter-bar">
                    <div className="hp-filter-box">
                        <div className="hp-filter-group">
                            {CITIES.map(c => <button key={c} className={`hp-f-btn ${city === c ? 'active' : ''}`} onClick={() => setCity(c)}>{c === 'All' ? t('hotels_page.all_cities') : c}</button>)}
                        </div>
                        <div className="hp-filter-group">
                            {TYPES.map(type => <button key={type} className={`hp-f-btn ${filter === type ? 'active' : ''}`} onClick={() => setFilter(type)}>{type === 'All' ? t('hotels_page.all_types') : t(`hotels_page.types.${type}`)}</button>)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="hp-hero">
                <h1 className="hp-hero-h"><span className="hp-h-main">{t('hotels_page.hero_title')}</span></h1>
            </div>

            <div className="hp-grid-container">
                <div className="hp-grid">
                    {filtered.map(hotel => <HotelCard key={hotel.id} hotel={hotel} onClick={() => setSelectedHotel(hotel)} />)}
                </div>
            </div>

            {selectedHotel && <HotelModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} onOpenOther={(item, type) => setSelectedOther({ item, type })} />}
            {selectedOther?.type === 'attraction' && (
                <AttractionModal 
                    item={selectedOther.item} 
                    hots={hotels} 
                    restos={restos} 
                    guides={guides}
                    onClose={() => setSelectedOther(null)} 
                    onNavigate={(newItem) => setSelectedOther({ item: newItem, type: 'attraction' })} 
                />
            )}
            {selectedOther?.type === 'restaurant' && (
                <EditorialModal 
                    res={selectedOther.item} 
                    onClose={() => setSelectedOther(null)} 
                />
            )}
        </div>
    );
};

export default HotelsPage;
