// src/admin/pages/GuideEditModal.jsx
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

const GuideEditModal = ({ guide, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        ...guide,
        languages: guide.languages || [],
        tours: guide.tours || []
    });
    const [activeTab, setActiveTab] = useState('profile');

    const SPECIALTIES = ['История', 'Природа', 'Архитектура', 'Культура', 'Кулинария', 'Приключения'];
    const SPOKEN_LANGUAGES = ['Казахский', 'Русский', 'Английский', 'Турецкий', 'Китайский'];

    const handleChange = (name, value) => {
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
            title_ru: '', title_kz: '', title_en: '', title_zh: '',
            duration_ru: '4 часа', 
            price_ru: '10 000 ₸',
            category: 'культура',
            highlights_ru: '', highlights_kz: '', highlights_en: '', highlights_zh: '',
            description_ru: '', description_kz: '', description_en: '', description_zh: ''
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

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-container tall refined-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">Гид / Локализация</span>
                        <h2>{formData.name_ru || 'Новый гид'}</h2>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><Icons.Close /></button>
                </div>

                <div className="admin-modal-tabs">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Профиль</button>
                    <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>Описание</button>
                    <button className={activeTab === 'tours' ? 'active' : ''} onClick={() => setActiveTab('tours')}>Маршруты ({formData.tours.length})</button>
                </div>

                <div className="admin-modal-body no-emoji">
                    {activeTab === 'profile' && (
                        <div className="admin-form-grid">
                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="ФИО Гида"
                                    fieldName="name"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="admin-form-group full" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                                <ImageUpload 
                                    label="Фото" 
                                    value={formData.photo} 
                                    onChange={(url) => handleChange('photo', url)} 
                                    compact={true}
                                />
                                <div style={{ flex: 1 }}>
                                    <div className="admin-form-row">
                                        <div className="admin-form-group">
                                            <label className="label-mini-gold">Специализация (ID)</label>
                                            <select name="specialty" value={formData.specialty} onChange={(e) => handleChange('specialty', e.target.value)}>
                                                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="label-mini-gold">Опыт (лет)</label>
                                            <input type="number" name="experience" value={formData.experience || 0} onChange={(e) => handleChange('experience', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="admin-form-row" style={{ marginTop: '10px' }}>
                                        <div className="admin-form-group">
                                            <label className="label-mini-gold">Рейтинг</label>
                                            <input type="number" step="0.1" name="rating" value={formData.rating || 0} onChange={(e) => handleChange('rating', e.target.value)} />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="label-mini-gold">Отзывы</label>
                                            <input type="number" name="reviewCount" value={formData.reviewCount || 0} onChange={(e) => handleChange('reviewCount', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="admin-form-group full">
                                <label className="label-mini-gold">Владение языками (для фильтрации)</label>
                                <div className="admin-tags-picker">
                                    {SPOKEN_LANGUAGES.map(l => (
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
                                <MultilangGroup 
                                    label="Полная биография / О себе"
                                    fieldName="description"
                                    formData={formData}
                                    onChange={handleChange}
                                    isTextarea={true}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'tours' && (
                        <div className="admin-tours-editor">
                            {formData.tours.map((t, idx) => (
                                <div key={t.id} className="admin-tour-row-editor multilang-room-row">
                                    <div className="room-header-row">
                                        <ImageUpload 
                                            label="" 
                                            value={t.image} 
                                            onChange={(url) => updateTour(t.id, 'image', url)} 
                                            compact={true}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div className="admin-form-row">
                                                <input placeholder="Длительность (RU)" value={t.duration_ru || ''} onChange={(e) => updateTour(t.id, 'duration_ru', e.target.value)} />
                                                <input placeholder="Цена (RU)" value={t.price_ru || ''} onChange={(e) => updateTour(t.id, 'price_ru', e.target.value)} />
                                                <select value={t.category} onChange={(e) => updateTour(t.id, 'category', e.target.value)}>
                                                    {SPECIALTIES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <button className="btn-row-delete" onClick={() => removeTour(t.id)}><Icons.Trash /></button>
                                    </div>
                                    
                                    <div className="lang-inputs-grid mini">
                                        {LANGUAGES_CONFIG.map(lang => (
                                            <div key={lang.code} className="lang-input-item">
                                                <span className="lang-badge-mini">{lang.code.toUpperCase()}</span>
                                                <input 
                                                    style={{ marginBottom: '4px' }}
                                                    placeholder={`Заголовок тура (${lang.code})`}
                                                    value={t[`title_${lang.code}`] || ''} 
                                                    onChange={(e) => updateTour(t.id, `title_${lang.code}`, e.target.value)} 
                                                />
                                                <textarea
                                                    placeholder={`Описание тура (${lang.code})`}
                                                    value={t[`description_${lang.code}`] || ''}
                                                    onChange={(e) => updateTour(t.id, `description_${lang.code}`, e.target.value)}
                                                    rows="2"
                                                />
                                                <input 
                                                    placeholder={`Программа (через запятую) (${lang.code})`}
                                                    value={t[`highlights_${lang.code}`] || ''} 
                                                    onChange={(e) => updateTour(t.id, `highlights_${lang.code}`, e.target.value)} 
                                                />
                                            </div>
                                        ))}
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
