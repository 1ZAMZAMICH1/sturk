// src/admin/pages/ArticleEditModal.jsx
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
const MultilangGroup = ({ label, fieldName, formData, onChange, isTextarea = false, rows = "2" }) => {
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
                                rows={rows}
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

const ArticleEditModal = ({ article, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        ...article,
        gallery: article.gallery || [],
        date: article.date || new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    });
    const [activeTab, setActiveTab] = useState('main');

    const handleChange = (name, value) => {
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleGalleryAdd = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const url = await uploadImage(file);
                    setFormData(p => ({ ...p, gallery: [...p.gallery, url] }));
                } catch(e) { alert(e.message); }
            }
        };
        input.click();
    };

    const removeGalleryItem = (idx) => {
        setFormData(p => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-container tall refined-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">Шежіре / Локализация</span>
                        <h2>{formData.title_ru || 'Новая статья'}</h2>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><Icons.Close /></button>
                </div>

                <div className="admin-modal-tabs">
                    <button className={activeTab === 'main' ? 'active' : ''} onClick={() => setActiveTab('main')}>Основное</button>
                    <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>Текст статьи</button>
                    <button className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>Медиа</button>
                </div>

                <div className="admin-modal-body no-emoji">
                    {activeTab === 'main' && (
                        <div className="admin-form-grid">
                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Заголовок статьи"
                                    fieldName="title"
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="label-mini-gold">Автор</label>
                                <input name="author" value={formData.author || ''} onChange={(e) => handleChange('author', e.target.value)} />
                            </div>
                            <div className="admin-form-group">
                                <label className="label-mini-gold">Категория (ID)</label>
                                <select name="category" value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
                                    <option value="История">История</option>
                                    <option value="Культура">Культура</option>
                                    <option value="Туризм">Туризм</option>
                                    <option value="Археология">Археология</option>
                                </select>
                            </div>
                            <div className="admin-form-group full">
                                <MultilangGroup 
                                    label="Краткий анонс ( excerpt )"
                                    fieldName="excerpt"
                                    formData={formData}
                                    onChange={handleChange}
                                    isTextarea={true}
                                    rows="2"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="admin-form-group full">
                            <MultilangGroup 
                                label="Основное содержание статьи"
                                fieldName="content"
                                formData={formData}
                                onChange={handleChange}
                                isTextarea={true}
                                rows="15"
                            />
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="admin-gallery-editor">
                            <ImageUpload 
                                label="Превью (Главное фото)" 
                                value={formData.image} 
                                onChange={(url) => handleChange('image', url)} 
                            />
                            
                            <label className="label-mini-gold" style={{ marginTop: '20px', display: 'block' }}>Галерея в тексте</label>
                            <div className="gallery-grid-refined">
                                {formData.gallery.map((url, idx) => (
                                    <div key={idx} className="gallery-item-card">
                                        <img src={url} alt="" />
                                        <div className="gallery-item-actions">
                                            <button className="btn-icon-delete" onClick={() => removeGalleryItem(idx)}>
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button className="admin-add-btn compact gallery-add-card" onClick={handleGalleryAdd}>
                                    <Icons.Plus /> <span>Добавить</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="admin-modal-footer refined-footer">
                    <button className="admin-add-btn" onClick={() => onSave(formData)}>Опубликовать на 4 языках</button>
                </div>
            </div>
        </div>
    );
};

export default ArticleEditModal;
