// src/admin/pages/GuideEditModal.jsx
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
        } catch (err) { alert('Ошибка: ' + err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className={`admin-form-group ${compact ? 'compact-upload' : ''}`}>
            {label && <label className="label-mini-gold">{label}</label>}
            <div className={`premium-image-container ${compact ? 'small-box' : ''}`} 
                 onClick={() => document.getElementById(`file-${label}-${compact}`).click()}>
                {value ? <img src={value} alt="" /> : <div className="upload-placeholder"><Icons.Upload /></div>}
                {loading && <div className="upload-loading-overlay">...</div>}
                <input id={`file-${label}-${compact}`} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
        </div>
    );
};

const GuideEditModal = ({ guide, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        ...guide,
        languages: guide.languages || [],
        tours: guide.tours || []
    });
    const [activeTab, setActiveTab] = useState('profile');

    const SPECIALTIES = ['История', 'Природа', 'Архитектура', 'Культура', 'Кулинария', 'Приключения'];
    const LANGUAGES = ['Казахский', 'Русский', 'Английский', 'Турецкий', 'Французский', 'Немецкий', 'Китайский'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const toggleLang = (lang) => {
        setFormData(p => ({
            ...p,
            languages: p.languages.includes(lang) 
                ? p.languages.filter(l => l !== lang) 
                : [...p.languages, lang]
        }));
    };

    // TOUR FUNCTIONS
    const addTour = () => {
        const newTour = {
            id: 't' + Date.now(),
            title: 'Новый маршрут',
            duration: '4 часа',
            price: '10 000 ₸',
            category: 'культура',
            highlights: [],
            description: ''
        };
        setFormData(p => ({ ...p, tours: [...p.tours, newTour] }));
    };

    const updateTour = (id, field, val) => {
        setFormData(p => ({
            ...p,
            tours: p.tours.map(t => t.id === id ? { ...t, [field]: val } : t)
        }));
    };

    const removeTour = (id) => {
        setFormData(p => ({ ...p, tours: p.tours.filter(t => t.id !== id) }));
    };

    const toggleHighlight = (tourId, text) => {
        setFormData(p => ({
            ...p,
            tours: p.tours.map(t => {
                if (t.id === tourId) {
                    const exists = t.highlights.includes(text);
                    return {
                        ...t,
                        highlights: exists ? t.highlights.filter(h => h !== text) : [...t.highlights, text]
                    };
                }
                return t;
            })
        }));
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-container tall refined-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">Гид / Проводник</span>
                        <h2>{formData.name || 'Новый профиль'}</h2>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><Icons.Close /></button>
                </div>

                <div className="admin-modal-tabs">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Профиль</button>
                    <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>О себе</button>
                    <button className={activeTab === 'tours' ? 'active' : ''} onClick={() => setActiveTab('tours')}>Маршруты ({formData.tours.length})</button>
                </div>

                <div className="admin-modal-body no-emoji">
                    {activeTab === 'profile' && (
                        <div className="admin-form-grid">
                            <div className="admin-form-group full" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                                <ImageUpload 
                                    label="Фото гида" 
                                    value={formData.photo} 
                                    onChange={(url) => setFormData(p => ({ ...p, photo: url }))} 
                                    compact={true}
                                />
                                <div style={{ flex: 1 }}>
                                    <label className="label-mini-gold">ФИО</label>
                                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Арасбек Джаксыбеков" />
                                    
                                    <div className="admin-form-row">
                                        <div className="admin-form-group">
                                            <label className="label-mini-gold">Специализация</label>
                                            <select name="specialty" value={formData.specialty} onChange={handleChange}>
                                                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="label-mini-gold">Опыт (лет)</label>
                                            <input type="number" name="experience" value={formData.experience || 0} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Языки (выберите из списка)</label>
                                <div className="admin-tags-picker">
                                    {LANGUAGES.map(l => (
                                        <button 
                                            key={l}
                                            className={`tag-btn ${formData.languages.includes(l) ? 'active' : ''}`}
                                            onClick={() => toggleLang(l)}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="admin-form-grid">
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Биография / Описание</label>
                                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="8" />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="label-mini-gold">Рейтинг</label>
                                    <input type="number" step="0.1" name="rating" value={formData.rating || 0} onChange={handleChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label className="label-mini-gold">Кол-во отзывов</label>
                                    <input type="number" name="reviewCount" value={formData.reviewCount || 0} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tours' && (
                        <div className="admin-tours-editor">
                            {formData.tours.map((t, idx) => (
                                <div key={t.id} className="admin-tour-row-editor">
                                    <ImageUpload 
                                        label="" 
                                        value={t.image} 
                                        onChange={(url) => updateTour(t.id, 'image', url)} 
                                        compact={true}
                                    />
                                    <div className="tour-editor-fields">
                                        <div className="tour-card-header">
                                            <input 
                                                className="tour-title-input" 
                                                value={t.title} 
                                                onChange={(e) => updateTour(t.id, 'title', e.target.value)} 
                                            />
                                            <button className="btn-icon-delete" onClick={() => removeTour(t.id)}><Icons.Trash /></button>
                                        </div>
                                        <div className="admin-form-row">
                                            <input placeholder="Длит-сть" value={t.duration} onChange={(e) => updateTour(t.id, 'duration', e.target.value)} />
                                            <input placeholder="Цена" value={t.price} onChange={(e) => updateTour(t.id, 'price', e.target.value)} />
                                            <select value={t.category} onChange={(e) => updateTour(t.id, 'category', e.target.value)}>
                                                <option value="история">История</option>
                                                <option value="природа">Природа</option>
                                                <option value="кулинария">Кулинария</option>
                                                <option value="архитектура">Архитектура</option>
                                                <option value="приключения">Приключения</option>
                                                <option value="культура">Культура</option>
                                            </select>
                                        </div>
                                        <textarea 
                                            className="tour-desc-input" 
                                            placeholder="Краткое описание маршрута..." 
                                            value={t.description} 
                                            onChange={(e) => updateTour(t.id, 'description', e.target.value)}
                                            rows="3"
                                        />
                                        <div className="admin-form-group">
                                            <label className="label-mini-gold">Программа маршрута (через запятую)</label>
                                            <input 
                                                placeholder="Встреча в отеле, Посещение мавзолея, Обед..." 
                                                value={Array.isArray(t.highlights) ? t.highlights.join(', ') : (t.highlights || '')} 
                                                onChange={(e) => updateTour(t.id, 'highlights', e.target.value.split(',').map(s => s.trim()))} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="admin-add-btn full" onClick={addTour}>
                                <Icons.Plus /> Добавить маршрут
                            </button>
                        </div>
                    )}
                </div>

                <div className="admin-modal-footer refined-footer">
                    <button className="admin-add-btn" onClick={() => onSave(formData)}>Сохранить профиль</button>
                </div>
            </div>
        </div>
    );
};

export default GuideEditModal;
