// src/admin/pages/AttractionEditModal.jsx
import React, { useState } from 'react';
import { Icons } from '../AdminIcons';
import { uploadImage } from '../../services/cloudinaryService';

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
                    title={opt.name}
                >
                    {opt.image && <img src={opt.image} alt="" />}
                    <span>{opt.name}</span>
                </div>
            ))}
        </div>
    );
};

const AttractionEditModal = ({ attraction, hotels, restaurants, onSave, onClose }) => {
    const [formData, setFormData] = useState({ ...attraction });
    const [activeTab, setActiveTab] = useState('general');
    const [isAddingCity, setIsAddingCity] = useState(false);
    const [newCityName, setNewCityName] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
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
        setFormData(prev => ({ ...prev, city: newCityName.trim() }));
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
                        <span className="type-badge">{formData.category === 'spirit' ? 'Духовное' : formData.category === 'nature' ? 'Природа' : 'Город'}</span>
                        <h2>{formData.name || 'Название объекта'}</h2>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><Icons.Close /></button>
                </div>

                <div className="admin-modal-tabs">
                    <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>Инфо</button>
                    <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Галерея</button>
                    <button className={activeTab === 'relations' ? 'active' : ''} onClick={() => setActiveTab('relations')}>Связи & Карта</button>
                </div>

                <div className="admin-modal-body no-emoji">
                    {activeTab === 'general' && (
                        <div className="admin-form-grid compact-gap">
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Название</label>
                                <input name="name" value={formData.name} onChange={handleChange} />
                            </div>

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Город</label>
                                {!isAddingCity ? (
                                    <div className="inline-selector">
                                        <select name="city" value={formData.city} onChange={handleChange}>
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

                            <ImageUpload
                                label="Главное фото"
                                value={formData.image}
                                onChange={(url) => setFormData(p => ({ ...p, image: url }))}
                            />

                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Краткое описание</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" />
                            </div>
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Полное описание (в модалке)</label>
                                <textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange} rows="4" />
                            </div>
                            <div className="admin-form-group">
                                <label className="label-mini-gold">Время работы</label>
                                <input name="hours" value={formData.hours || ''} onChange={handleChange} placeholder="09:00 - 18:00" />
                            </div>
                            <div className="admin-form-group">
                                <label className="label-mini-gold">Адрес</label>
                                <input name="location" value={formData.location || ''} onChange={handleChange} />
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
                                <input type="number" step="0.001" value={formData.coordinates?.lat || ''} onChange={(e) => setFormData(p => ({ ...p, coordinates: { ...p.coordinates, lat: parseFloat(e.target.value) || 0 } }))} />
                            </div>
                            <div className="admin-form-group">
                                <label>Координаты (Lng)</label>
                                <input type="number" step="0.001" value={formData.coordinates?.lng || ''} onChange={(e) => setFormData(p => ({ ...p, coordinates: { ...p.coordinates, lng: parseFloat(e.target.value) || 0 } }))} />
                            </div>

                            <div className="admin-form-group full">
                                <label>Ближайшие отели</label>
                                <VisualSelect
                                    options={hotels}
                                    selectedIds={formData.nearbyHotels || []}
                                    onChange={(ids) => setFormData(p => ({ ...p, nearbyHotels: ids }))}
                                />
                            </div>

                            <div className="admin-form-group full">
                                <label>Ближайшие рестораны</label>
                                <VisualSelect
                                    options={restaurants}
                                    selectedIds={formData.nearbyRestaurants || []}
                                    onChange={(ids) => setFormData(p => ({ ...p, nearbyRestaurants: ids }))}
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
