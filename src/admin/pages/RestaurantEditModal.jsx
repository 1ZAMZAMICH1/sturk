// src/admin/pages/RestaurantEditModal.jsx
import React, { useState } from 'react';
import { Icons } from '../AdminIcons';
import { uploadImage } from '../../services/cloudinaryService';
import { attractionsData, hotelsData } from '../../data/attractionsData';

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
                        {opt.name && <span>{opt.name}</span>}
                    </div>
                );
            })}
        </div>
    );
};

const RestaurantEditModal = ({ restaurant, onSave, onClose }) => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
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
            menu: [...p.menu, { item: '', price: '' }]
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

    const allAttractions = [
        ...attractionsData.city,
        ...attractionsData.spirit,
        ...attractionsData.nature
    ];

    const cities = [...new Set([...allAttractions.map(a => a.city), 'Туркестан', 'Кентау', 'Отрар'])];

    const handleAddCity = () => {
        if (newCityName.trim()) {
            setFormData(p => ({ ...p, city: newCityName.trim() }));
            setIsAddingCity(false);
            setNewCityName('');
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-container tall refined-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">Ресторан</span>
                        <h2>{formData.name || 'Новый ресторан'}</h2>
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

                            <div className="admin-form-group">
                                <label className="label-mini-gold">Цена ($$$$)</label>
                                <input name="priceTag" value={formData.priceTag} onChange={handleChange} />
                            </div>

                            <ImageUpload
                                label="Главное фото"
                                value={formData.image}
                                onChange={(url) => setFormData(p => ({ ...p, image: url }))}
                            />

                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Фирменное блюдо</label>
                                <input name="signature" value={formData.signature || ''} onChange={handleChange} />
                            </div>

                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Описание</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
                            </div>

                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Адрес</label>
                                <input name="location" value={formData.location || ''} onChange={handleChange} />
                            </div>

                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Особенность (Specialty)</label>
                                <input name="specialty" value={formData.specialty || ''} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'menu' && (
                        <div className="admin-rooms-editor">
                            <label className="label-mini-gold">Меню ресторана</label>
                            <div className="gallery-rows-container">
                                {(formData.menu || []).map((dish, idx) => (
                                    <div key={idx} className="refined-row">
                                        <input
                                            placeholder="Название блюда"
                                            value={dish.item}
                                            onChange={(e) => handleMenuChange(idx, 'item', e.target.value)}
                                        />
                                        <input
                                            placeholder="Цена"
                                            className="price-input"
                                            value={dish.price}
                                            onChange={(e) => handleMenuChange(idx, 'price', e.target.value)}
                                        />
                                        <button className="btn-icon-delete" onClick={() => removeMenuItem(idx)}>
                                            <Icons.Trash />
                                        </button>
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
                                    onChange={(ids) => setFormData(p => ({ ...p, nearbyAttractions: ids }))}
                                />
                            </div>
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Ближайшие отели</label>
                                <VisualSelect
                                    options={hotelsData}
                                    selectedIds={formData.nearbyHotels || []}
                                    onChange={(ids) => setFormData(p => ({ ...p, nearbyHotels: ids }))}
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
