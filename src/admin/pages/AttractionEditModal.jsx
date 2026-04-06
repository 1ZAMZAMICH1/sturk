// src/admin/pages/AttractionEditModal.jsx
import React, { useState } from 'react';
import { Icons } from '../AdminIcons';
import { uploadImage } from '../../services/cloudinaryService';

const LANGUAGES_CONFIG = [
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
            {label && <label className="label-mini-gold">{label}</label>}
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
            {options.map(opt => (
                <div
                    key={opt.id}
                    className={`visual-option-mini ${selectedIds.includes(opt.id) ? 'selected' : ''}`}
                    onClick={() => toggle(opt.id)}
                    title={opt.name_ru || opt.name}
                >
                    {opt.image && <img src={opt.image} alt="" />}
                    <span>{opt.name_ru || opt.name}</span>
                </div>
            ))}
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
                {LANGUAGES_CONFIG.map(lang => (
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

const AttractionEditModal = ({ attraction, hotels, restaurants, onSave, onClose }) => {
    const [formData, setFormData] = useState({ ...attraction });
    const [activeTab, setActiveTab] = useState('general');
    const [isAddingCity, setIsAddingCity] = useState(false);
    const [newCityName, setNewCityName] = useState('');

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
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
        handleChange('city', newCityName.trim());
        setIsAddingCity(false);
        setNewCityName('');
    };

    // Extract unique cities
    const cities = Array.from(new Set([
        ...hotels.map(h => h.city),
        ...restaurants.map(r => r.city),
        ...['Туркестан', 'Отрар', 'Сауран', 'Кентау'],
        formData.city
    ])).filter(Boolean);

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-container tall refined-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">Локализация объекта</span>
                        <h2>{formData.name_ru || 'Новый объект'}</h2>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><Icons.Close /></button>
                </div>

                <div className="admin-modal-tabs">
                    <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>Инфо</button>
                    <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Галерея</button>
                    <button className={activeTab === 'relations' ? 'active' : ''} onClick={() => setActiveTab('relations')}>Связи</button>
                </div>

                <div className="admin-modal-body no-emoji">
                    {activeTab === 'general' && (
                        <div className="admin-form-grid compact-gap">
                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Название"
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
                                <label className="label-mini-gold">Категория (ID)</label>
                                <select name="category" value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
                                    <option value="city">City (Город)</option>
                                    <option value="spirit">Spirit (Духовное)</option>
                                    <option value="nature">Nature (Природа)</option>
                                </select>
                            </div>

                            <ImageUpload
                                label="Главное фото"
                                value={formData.image}
                                onChange={(url) => handleChange('image', url)}
                            />

                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Краткое описание"
                                    fieldName="description"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Полное описание"
                                    fieldName="fullDescription"
                                    formData={formData}
                                    onChange={handleChange}
                                    isTextarea={true}
                                />
                            </div>

                            <div className="admin-form-group">
                                <MultilangGroup 
                                    label="Время работы"
                                    fieldName="hours"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="admin-form-group">
                                <MultilangGroup 
                                    label="Адрес"
                                    fieldName="location"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>
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
                                                title="Удалить"
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
                            <div className="admin-form-group">
                                <label>Координаты (Lat)</label>
                                <input type="number" step="0.001" value={formData.coordinates?.lat || ''} onChange={(e) => handleChange('coordinates', { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Координаты (Lng)</label>
                                <input type="number" step="0.001" value={formData.coordinates?.lng || ''} onChange={(e) => handleChange('coordinates', { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 })} />
                            </div>

                            <div className="admin-form-group full">
                                <label>Ближайшие отели</label>
                                <VisualSelect
                                    options={hotels}
                                    selectedIds={formData.nearbyHotels || []}
                                    onChange={(ids) => handleChange('nearbyHotels', ids)}
                                />
                            </div>

                            <div className="admin-form-group full">
                                <label>Ближайшие рестораны</label>
                                <VisualSelect
                                    options={restaurants}
                                    selectedIds={formData.nearbyRestaurants || []}
                                    onChange={(ids) => handleChange('nearbyRestaurants', ids)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="admin-modal-footer refined-footer">
                    <button className="btn-cancel" onClick={onClose}>Отмена</button>
                    <button className="btn-save" onClick={() => onSave(formData)}>Сохранить</button>
                </div>
            </div>
        </div>
    );
};

export default AttractionEditModal;
