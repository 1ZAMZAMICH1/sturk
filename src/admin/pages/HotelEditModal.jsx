// src/admin/pages/HotelEditModal.jsx
import React, { useState } from 'react';
import { Icons } from '../AdminIcons';
import { uploadImage } from '../../services/cloudinaryService';
import { fetchSheetData } from '../../services/api';
import { useEffect } from 'react';

const AMENITIES = [
    { id: 'Wi-Fi', name: 'Wi-Fi', icon: 'WiFi' },
    { id: 'Завтрак', name: 'Завтрак', icon: 'Coffee' },
    { id: 'Бассейн', name: 'Бассейн', icon: 'Pool' },
    { id: 'SPA', name: 'SPA', icon: 'SPA' },
    { id: 'Фитнес', name: 'Фитнес', icon: 'Gym' },
    { id: 'Кондиционер', name: 'Кондиционер', icon: 'AC' },
    { id: 'Парковка', name: 'Парковка', icon: 'Pin' },
    { id: 'Ресторан', name: 'Ресторан', icon: 'Restaurants' },
    { id: 'Вид на мавзолей', name: 'Вид на мавзолей', icon: 'Eye' },
    { id: 'Традиции', name: 'Традиции', icon: 'Users' }
];

const ROOM_ICONS = [
    { id: 'Bed', icon: 'Bed' },
    { id: 'Couch', icon: 'Couch' },
    { id: 'Crown', icon: 'Crown' },
    { id: 'Tent', icon: 'Tent' },
    { id: 'Users', icon: 'Users' },
    { id: 'Key', icon: 'Key' },
    { id: 'Leaf', icon: 'Leaf' }
];

const LANGUAGES = [
    { code: 'ru', label: 'Русский' },
    { code: 'kz', label: 'Қазақша' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' }
];

const ImageUpload = ({ value, onChange, label, compact = false }) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const url = await uploadImage(file);
            onChange(url);
        } catch (err) {
            alert('Ошибка загрузки: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`admin-form-group ${compact ? 'compact-upload' : ''}`}>
            <label className="label-mini-gold">{label}</label>
            <div
                className={`premium-image-container ${compact ? 'small-box' : ''}`}
                onClick={() => fileInputRef.current?.click()}
            >
                {value ? <img src={value} alt="Превью" /> : (
                    <div className="upload-placeholder">
                        <Icons.Upload />
                        {!compact && <span>Загрузить фото</span>}
                    </div>
                )}
                {loading && <div className="upload-loading-overlay">...</div>}
                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept="image/*"
                />
            </div>
        </div>
    );
};

const VisualSelect = ({ options, selectedIds, onChange, multiple = true }) => {
    const toggle = (id) => {
        if (multiple) {
            const newIds = selectedIds.includes(id)
                ? selectedIds.filter(i => i !== id)
                : [...selectedIds, id];
            onChange(newIds);
        } else {
            onChange([id]);
        }
    };

    return (
        <div className="admin-visual-select compact-grid-list">
            {options.map(opt => {
                const IconComp = opt.icon ? Icons[opt.icon] : null;
                return (
                    <div
                        key={opt.id}
                        className={`visual-option-mini ${selectedIds.includes(opt.id) ? 'selected' : ''}`}
                        onClick={() => toggle(opt.id)}
                        title={opt.name || opt.id}
                    >
                        {opt.image && <img src={opt.image} alt="" />}
                        {IconComp && <IconComp style={{ width: '18px', height: '18px' }} />}
                        {opt.name && <span>{opt.name}</span>}
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Группа полей для ввода на разных языках
 */
const MultilangGroup = ({ label, fieldName, formData, onChange, isTextarea = false }) => {
    return (
        <div className="multilang-edit-group">
            <label className="label-mini-gold main-label">{label}</label>
            <div className="lang-inputs-grid">
                {LANGUAGES.map(lang => (
                    <div key={lang.code} className="lang-input-item">
                        <span className="lang-badge-mini">{lang.code.toUpperCase()}</span>
                        {isTextarea ? (
                            <textarea
                                value={formData[`${fieldName}_${lang.code}`] || ''}
                                onChange={(e) => onChange(`${fieldName}_${lang.code}`, e.target.value)}
                                rows="2"
                                placeholder={`Текст на ${lang.label}...`}
                            />
                        ) : (
                            <input
                                value={formData[`${fieldName}_${lang.code}`] || ''}
                                onChange={(e) => onChange(`${fieldName}_${lang.code}`, e.target.value)}
                                placeholder={`Текст на ${lang.label}...`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const HotelEditModal = ({ hotel, onSave, onClose }) => {
    const parseJSON = (val, fallback = []) => {
        if (!val) return fallback;
        if (typeof val !== 'string') return val;
        try { return JSON.parse(val); } catch(e) { return fallback; }
    };

    const [formData, setFormData] = useState({ 
        ...hotel,
        rooms: parseJSON(hotel.rooms),
        amenities: parseJSON(hotel.amenities),
        gallery: parseJSON(hotel.gallery),
        nearbyAttractions: parseJSON(hotel.nearbyAttractions),
        nearbyRestaurants: parseJSON(hotel.nearbyRestaurants)
    });
    const [activeTab, setActiveTab] = useState('general');
    const [isAddingCity, setIsAddingCity] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const [allAtts, setAllAtts] = useState([]);
    const [allRestos, setAllRestos] = useState([]);

    useEffect(() => {
        const loadAll = async () => {
            const [atts, restos] = await Promise.all([
                fetchSheetData('attractions'),
                fetchSheetData('restaurants')
            ]);
            setAllAtts(atts.map(a => ({ ...a, name: a.name_ru || a.name })));
            setAllRestos(restos.map(r => ({ ...r, name: r.name_ru || r.name })));
        };
        loadAll();
    }, []);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoomChange = (idx, field, value) => {
        const newRooms = [...(formData.rooms || [])];
        newRooms[idx] = { ...newRooms[idx], [field]: value };
        setFormData(prev => ({ ...prev, rooms: newRooms }));
    };

    const addRoom = () => {
        setFormData(prev => ({ 
            ...prev, 
            rooms: [
                ...(prev.rooms || []), 
                { 
                    name_ru: '', name_kz: '', name_en: '', name_zh: '',
                    price: '', 
                    icon: 'Bed' 
                }
            ] 
        }));
    };

    const removeRoom = (idx) => {
        const newRooms = (formData.rooms || []).filter((_, i) => i !== idx);
        setFormData(prev => ({ ...prev, rooms: newRooms }));
    };

    const handleGalleryChange = (idx, value) => {
        const newGallery = [...(formData.gallery || [])];
        newGallery[idx] = value;
        setFormData(prev => ({ ...prev, gallery: newGallery }));
    };

    const addGalleryItem = () => {
        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ''] }));
    };

    const removeGalleryItem = (idx) => {
        const newGallery = (formData.gallery || []).filter((_, i) => i !== idx);
        setFormData(prev => ({ ...prev, gallery: newGallery }));
    };

    const handleAddCity = () => {
        if (!newCityName.trim()) return;
        setFormData(prev => ({ ...prev, city: newCityName.trim() }));
        setIsAddingCity(false);
        setNewCityName('');
    };

    const cities = ['Туркестан', 'Отрар', 'Сауран', 'Кентау'];

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-container tall refined-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">{formData.type} · {formData.stars} ★</span>
                        <h2>{formData.name_ru || 'Новый отель'}</h2>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><Icons.Close /></button>
                </div>

                <div className="admin-modal-tabs">
                    <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>Инфо</button>
                    <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>Номера</button>
                    <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Галерея</button>
                    <button className={activeTab === 'relations' ? 'active' : ''} onClick={() => setActiveTab('relations')}>Связи</button>
                </div>

                <div className="admin-modal-body no-emoji">
                    {activeTab === 'general' && (
                        <div className="admin-form-grid compact-gap">
                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Название отеля"
                                    fieldName="name"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Город</label>
                                {!isAddingCity ? (
                                    <div className="inline-selector">
                                        <select name="city" value={formData.city} onChange={(e) => handleChange('city', e.target.value)}>
                                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <button className="btn-inline-add" onClick={() => setIsAddingCity(true)}>
                                            <Icons.Plus />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="inline-selector">
                                        <input
                                            autoFocus
                                            value={newCityName}
                                            onChange={(e) => setNewCityName(e.target.value)}
                                            placeholder="Новый город..."
                                        />
                                        <button className="btn-inline-confirm" onClick={handleAddCity}><Icons.Plus /></button>
                                        <button className="btn-inline-confirm cancel" onClick={() => setIsAddingCity(false)}><Icons.Close /></button>
                                    </div>
                                )}
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Тип отеля</label>
                                <select name="type" value={formData.type} onChange={(e) => handleChange('type', e.target.value)}>
                                    <option value="Resort">Resort</option>
                                    <option value="Boutique">Boutique</option>
                                    <option value="Hotel">Hotel</option>
                                    <option value="Hostel">Hostel</option>
                                    <option value="Eco">Eco</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Звезды (1-5)</label>
                                <input type="number" name="stars" value={formData.stars} onChange={(e) => handleChange('stars', e.target.value)} min="1" max="5" />
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Ценовая категория ($$$$)</label>
                                <input name="priceTag" value={formData.priceTag} onChange={(e) => handleChange('priceTag', e.target.value)} />
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Широта (Lat)</label>
                                <input type="number" step="any" name="lat" value={formData.lat || ''} onChange={(e) => handleChange('lat', e.target.value)} placeholder="Напр. 43.2974" />
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Долгота (Lng)</label>
                                <input type="number" step="any" name="lng" value={formData.lng || ''} onChange={(e) => handleChange('lng', e.target.value)} placeholder="Напр. 68.2710" />
                            </div>

                            <ImageUpload
                                label="Главное фото"
                                value={formData.image}
                                onChange={(url) => handleChange('image', url)}
                            />

                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Сайт отеля</label>
                                <input name="websiteUrl" value={formData.websiteUrl || ''} onChange={(e) => handleChange('websiteUrl', e.target.value)} placeholder="https://..." />
                            </div>

                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Улица / Адрес"
                                    fieldName="location"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Описание отеля"
                                    fieldName="description"
                                    formData={formData}
                                    onChange={handleChange}
                                    isTextarea={true}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'rooms' && (
                        <div className="admin-rooms-editor">
                            <label className="label-mini-gold">Типы номеров (Локализация)</label>
                            <div className="gallery-rows-container">
                                {(formData.rooms || []).map((room, idx) => (
                                    <div key={idx} className="refined-row multilang-room-row">
                                        <div className="room-header-row">
                                            <div className="room-icon-picker">
                                                {ROOM_ICONS.map(oi => {
                                                    const Icon = Icons[oi.icon];
                                                    return (
                                                        <button
                                                            key={oi.id}
                                                            className={`icon-btn-mini ${room.icon === oi.id ? 'active' : ''}`}
                                                            onClick={() => handleRoomChange(idx, 'icon', oi.id)}
                                                        >
                                                            <Icon />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <input
                                                className="room-price-input"
                                                placeholder="Цена (₸)"
                                                value={room.price}
                                                onChange={(e) => handleRoomChange(idx, 'price', e.target.value)}
                                            />
                                            <button onClick={() => removeRoom(idx)} className="btn-row-delete">
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                        <div className="lang-inputs-grid mini">
                                            {LANGUAGES.map(lang => (
                                                <div key={lang.code} className="lang-input-item">
                                                    <span className="lang-badge-mini">{lang.code.toUpperCase()}</span>
                                                    <input
                                                        placeholder={`Название (${lang.code})`}
                                                        value={room[`name_${lang.code}`] || ''}
                                                        onChange={(e) => handleRoomChange(idx, `name_${lang.code}`, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addRoom} className="admin-add-btn compact">
                                <Icons.Plus /> Добавить номер
                            </button>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="admin-gallery-editor">
                            <label className="label-mini-gold">Фотогалерея</label>
                            <div className="gallery-grid-refined">
                                {(formData.gallery || []).map((url, idx) => (
                                    <div key={idx} className="gallery-item-card">
                                        <div className="gallery-thumb-wrap">
                                            <ImageUpload
                                                compact
                                                label=""
                                                value={url}
                                                onChange={(newUrl) => handleGalleryChange(idx, newUrl)}
                                            />
                                        </div>
                                        <div className="gallery-item-actions">
                                            <input
                                                value={url}
                                                onChange={(e) => handleGalleryChange(idx, e.target.value)}
                                                placeholder="Link..."
                                            />
                                            <button
                                                onClick={() => removeGalleryItem(idx)}
                                                className="btn-row-delete"
                                            >
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addGalleryItem} className="admin-add-btn compact gallery-add-card">
                                    <Icons.Plus />
                                    <span>Добавить фото</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'relations' && (
                        <div className="admin-form-grid compact-gap">
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Преимущества (Amenities)</label>
                                <VisualSelect
                                    options={AMENITIES}
                                    selectedIds={formData.amenities || []}
                                    onChange={(ids) => handleChange('amenities', ids)}
                                />
                            </div>
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Ближайшие достопримечательности</label>
                                <VisualSelect
                                    options={allAtts}
                                    selectedIds={formData.nearbyAttractions || []}
                                    onChange={(ids) => handleChange('nearbyAttractions', ids)}
                                />
                            </div>
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Ближайшие рестораны</label>
                                <VisualSelect
                                    options={allRestos}
                                    selectedIds={formData.nearbyRestaurants || []}
                                    onChange={(ids) => handleChange('nearbyRestaurants', ids)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="admin-modal-footer refined-footer">
                    <button className="admin-add-btn" onClick={() => onSave(formData)}>Сохранить отель</button>
                </div>
            </div>
        </div>
    );
};

export default HotelEditModal;
