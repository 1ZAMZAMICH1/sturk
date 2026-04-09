// src/admin/pages/RestaurantEditModal.jsx
import React, { useState } from 'react';
import { Icons } from '../AdminIcons';
import { uploadImage } from '../../services/cloudinaryService';
import { attractionsData, hotelsData } from '../../data/attractionsData';

const LANGUAGES = [
    { code: 'ru', label: 'Русский' },
    { code: 'kz', label: 'Қазақша' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' }
];

const ImageUpload = ({ value, onChange, label, compact = false }) => {
    const [loading, setLoading] = useState(false);

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
                onClick={() => document.getElementById(`file-${label}-${compact}`).click()}
            >
                {value ? <img src={value} alt="Превью" /> : (
                    <div className="upload-placeholder">
                        <Icons.Upload />
                        {!compact && <span>Загрузить фото</span>}
                    </div>
                )}
                {loading && <div className="upload-loading-overlay">...</div>}
                <input
                    id={`file-${label}-${compact}`}
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
                        <span>{opt.name_ru || opt.name || opt.title || opt.id}</span>
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

const RestaurantEditModal = ({ restaurant, onSave, onClose, allAttractions = [], allHotels = [] }) => {
    const [formData, setFormData] = useState({ 
        ...restaurant,
        gallery: restaurant.gallery || [],
        menu: restaurant.menu || [],
        nearbyAttractions: restaurant.nearbyAttractions || [],
        nearbyHotels: restaurant.nearbyHotels || []
    });
    const [activeTab, setActiveTab] = useState('general');
    const [isAddingCity, setIsAddingCity] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const [isAddingCuisine, setIsAddingCuisine] = useState(false);
    const [newCuisineName, setNewCuisineName] = useState('');

    const handleChange = (name, value) => {
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleMenuChange = (idx, field, value) => {
        const newMenu = [...formData.menu];
        newMenu[idx] = { ...newMenu[idx], [field]: value };
        setFormData(p => ({ ...p, menu: newMenu }));
    };

    const addMenuItem = () => {
        setFormData(p => ({
            ...p,
            menu: [...p.menu, { 
                item_ru: '', item_kz: '', item_en: '', item_zh: '',
                price: '' 
            }]
        }));
    };

    const removeMenuItem = (idx) => {
        setFormData(p => ({
            ...p,
            menu: p.menu.filter((_, i) => i !== idx)
        }));
    };

    const addGalleryItem = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const url = await uploadImage(file);
                    setFormData(p => ({ ...p, gallery: [...p.gallery, url] }));
                } catch (err) {
                    alert('Ошибка: ' + err.message);
                }
            }
        };
        input.click();
    };

    const removeGalleryItem = (idx) => {
        setFormData(p => ({
            ...p,
            gallery: p.gallery.filter((_, i) => i !== idx)
        }));
    };

    const cities = [...new Set([...allAttractions.map(a => a.city), 'Туркестан', 'Кентау', 'Отрар', 'Сауран', formData.city])].filter(Boolean);
    const cuisines = [...new Set(['Казахская', 'Узбекская', 'Восточная', 'Европейская', formData.cuisine])].filter(Boolean);

    const handleAddCuisine = () => {
        if (newCuisineName.trim()) {
            handleChange('cuisine', newCuisineName.trim());
            setIsAddingCuisine(false);
            setNewCuisineName('');
        }
    };

    const handleAddCity = () => {
        if (newCityName.trim()) {
            handleChange('city', newCityName.trim());
            setIsAddingCity(false);
            setNewCityName('');
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-container tall refined-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">Локализация Ресторана</span>
                        <h2>{formData.name_ru || 'Новый ресторан'}</h2>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><Icons.Close /></button>
                </div>

                <div className="admin-modal-tabs">
                    <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>Инфо</button>
                    <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>Меню</button>
                    <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Галерея</button>
                    <button className={activeTab === 'relations' ? 'active' : ''} onClick={() => setActiveTab('relations')}>Связи</button>
                </div>

                <div className="admin-modal-body no-emoji">
                    {activeTab === 'general' && (
                        <div className="admin-form-grid compact-gap">
                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Название ресторана"
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
                                <label className="label-mini-gold">Цена ($$$$)</label>
                                <input name="priceTag" value={formData.priceTag} onChange={(e) => handleChange('priceTag', e.target.value)} />
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Широта (Lat)</label>
                                <input type="number" step="any" name="lat" value={formData.lat || ''} onChange={(e) => handleChange('lat', e.target.value)} placeholder="Напр. 43.2974" />
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Кухня</label>
                                {!isAddingCuisine ? (
                                    <div className="inline-selector">
                                        <select name="cuisine" value={formData.cuisine} onChange={(e) => handleChange('cuisine', e.target.value)}>
                                            {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <button className="btn-inline-add" onClick={() => setIsAddingCuisine(true)}>
                                            <Icons.Plus />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="inline-selector">
                                        <input
                                            autoFocus
                                            value={newCuisineName}
                                            onChange={(e) => setNewCuisineName(e.target.value)}
                                            placeholder="Новая кухня..."
                                        />
                                        <button className="btn-inline-confirm" onClick={handleAddCuisine}><Icons.Plus /></button>
                                        <button className="btn-inline-confirm cancel" onClick={() => setIsAddingCuisine(false)}><Icons.Close /></button>
                                    </div>
                                )}
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
                                <MultilangGroup 
                                    label="Фирменное блюдо (Signature)"
                                    fieldName="signature"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Специализация (Specialty)"
                                    fieldName="specialty"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Адрес"
                                    fieldName="location"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Часы работы"
                                    fieldName="hours"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Описание"
                                    fieldName="description"
                                    formData={formData}
                                    onChange={handleChange}
                                    isTextarea={true}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'menu' && (
                        <div className="admin-rooms-editor">
                            <label className="label-mini-gold">Меню ресторана (Локализация)</label>
                            <div className="gallery-rows-container">
                                {(formData.menu || []).map((dish, idx) => (
                                    <div key={idx} className="refined-row multilang-room-row">
                                        <div className="room-header-row">
                                            <Icons.Restaurants style={{ opacity: 0.5 }} />
                                            <input
                                                placeholder="Цена"
                                                className="room-price-input"
                                                value={dish.price}
                                                onChange={(e) => handleMenuChange(idx, 'price', e.target.value)}
                                            />
                                            <button className="btn-row-delete" onClick={() => removeMenuItem(idx)}>
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                        <div className="lang-inputs-grid mini">
                                            {LANGUAGES.map(lang => (
                                                <div key={lang.code} className="lang-input-item">
                                                    <span className="lang-badge-mini">{lang.code.toUpperCase()}</span>
                                                    <input
                                                        placeholder={`Название блюда (${lang.code})`}
                                                        value={dish[`item_${lang.code}`] || ''}
                                                        onChange={(e) => handleMenuChange(idx, `item_${lang.code}`, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button className="admin-add-btn compact" onClick={addMenuItem}>
                                    <Icons.Plus /> Добавить позицию
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="admin-gallery-editor">
                            <label className="label-mini-gold">Галерея изображений</label>
                            <div className="gallery-grid-refined">
                                {(formData.gallery || []).map((url, idx) => (
                                    <div key={idx} className="gallery-item-card">
                                        <img src={url} alt="" />
                                        <div className="gallery-item-actions">
                                            <button className="btn-icon-delete" onClick={() => removeGalleryItem(idx)}>
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
                                <label className="label-mini-gold">Ближайшие достопримечательности</label>
                                <VisualSelect
                                    options={allAttractions}
                                    selectedIds={formData.nearbyAttractions || []}
                                    onChange={(ids) => handleChange('nearbyAttractions', ids)}
                                />
                            </div>
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Ближайшие отели</label>
                                <VisualSelect
                                    options={allHotels}
                                    selectedIds={formData.nearbyHotels || []}
                                    onChange={(ids) => handleChange('nearbyHotels', ids)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="admin-modal-footer refined-footer">
                    <button className="admin-add-btn" onClick={() => onSave(formData)}>Сохранить ресторан</button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantEditModal;
