import React, { useState, useEffect } from 'react';
import { fetchSheetData, updateSheetData } from '../../services/api';
import AttractionEditModal from './AttractionEditModal';
import { Icons } from '../AdminIcons';

const CategoriesManager = () => {
    const [activeTab, setActiveTab] = useState('city');
    const [selectedItem, setSelectedItem] = useState(null);
    const [attractions, setAttractions] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [categoryArches, setCategoryArches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [archForm, setArchForm] = useState({});

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [atts, hots, restos, arches] = await Promise.all([
                fetchSheetData('attractions'),
                fetchSheetData('hotels'),
                fetchSheetData('restaurants'),
                fetchSheetData('categories')
            ]);
            setAttractions(atts || []);
            setHotels(hots || []);
            setRestaurants(restos || []);
            setCategoryArches(arches || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleArchChange = (tag, field, value) => {
        setArchForm(prev => ({
            ...prev,
            [tag]: { ...(prev[tag] || {}), [field]: value }
        }));
    };

    const handleSave = async (updatedItem) => {
        if (!updatedItem.id) {
            updatedItem.id = Date.now().toString();
        }
        if (!updatedItem.category_tag) {
            updatedItem.category_tag = activeTab;
        }

        const success = await updateSheetData('attractions', 'update', updatedItem);
        if (success) {
            loadAllData();
            setSelectedItem(null);
            alert(`Объект "${updatedItem.name}" сохранен`);
        } else {
            alert('Ошибка при сохранении');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить этот объект?')) {
            const success = await updateSheetData('attractions', 'delete', { id });
            if (success) {
                loadAllData();
            }
        }
    };

    const handleSaveArch = async (arch) => {
        console.log('Sending to Sheets:', arch);
        const action = arch.id ? 'update' : 'add';
        const success = await updateSheetData('categories', action, arch);
        if (success) {
            alert(`Арка "${arch.title || arch.tag}" успешно сохранена!`);
            loadAllData();
        } else {
            alert('Ошибка при сохранении в Google Sheets. Проверь консоль (F12) или наличие листа "categories".');
        }
    };

    const filteredAttractions = attractions.filter(a => a.category_tag === activeTab || a.type === activeTab);

    if (loading) return <div className="admin-loading">Загружаем данные категорий...</div>;

    return (
        <div className="admin-manager">
            {/* Настройка Основных Арок */}
            <div className="admin-section arch-settings-container">
                <div className="admin-table-header">
                    <h3>Настройка входных арок (Главная страница)</h3>
                </div>
                <div className="arch-grid">
                    {['city', 'spirit', 'nature'].map(tag => {
                        const arch = categoryArches.find(a => a.tag === tag) || { tag, title: '', url: '', color: '#ffd700' };
                        const currentForm = archForm[tag] || {};
                        
                        return (
                            <div key={tag} className="arch-card">
                                <div className="arch-card-header">
                                    <span className="tag-badge">{tag.toUpperCase()}</span>
                                    <h4>{tag === 'city' ? 'Город' : tag === 'spirit' ? 'История' : 'Природа'}</h4>
                                </div>
                                <div className="form-group">
                                    <label>Заголовок арки</label>
                                    <input 
                                        value={currentForm.title !== undefined ? currentForm.title : (arch.title || '')} 
                                        onChange={(e) => handleArchChange(tag, 'title', e.target.value)}
                                        placeholder="Напр: Врата Города"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>URL Медиа (Фото или Видео)</label>
                                    <input 
                                        value={currentForm.url !== undefined ? currentForm.url : (arch.url || arch.image || '')} 
                                        onChange={(e) => handleArchChange(tag, 'url', e.target.value)}
                                        placeholder="https://...mp4 или .jpg"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Цвет подсветки</label>
                                    <input 
                                        type="color" 
                                        value={currentForm.color !== undefined ? currentForm.color : (arch.color || '#ffd700')} 
                                        onChange={(e) => handleArchChange(tag, 'color', e.target.value)}
                                    />
                                </div>
                                <button className="admin-save-btn" style={{width: '100%', marginTop: '10px'}} onClick={() => {
                                    console.log('Save Clicked for:', tag);
                                    const finalArch = { 
                                        ...arch, 
                                        title: currentForm.title !== undefined ? currentForm.title : (arch.title || ''), 
                                        url: currentForm.url !== undefined ? currentForm.url : (arch.url || arch.image || ''), 
                                        color: currentForm.color !== undefined ? currentForm.color : (arch.color || '#ffd700') 
                                    };
                                    handleSaveArch(finalArch);
                                }}>
                                    Сохранить настройки
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <hr className="admin-divider" />

            <div className="admin-section-header">
                <h3>Управление объектами (внутренние страницы)</h3>
            </div>

            {/* Category Sub-tabs */}
            <div className="admin-sub-tabs">
                <button className={activeTab === 'city' ? 'active' : ''} onClick={() => setActiveTab('city')}>Город</button>
                <button className={activeTab === 'spirit' ? 'active' : ''} onClick={() => setActiveTab('spirit')}>Дух</button>
                <button className={activeTab === 'nature' ? 'active' : ''} onClick={() => setActiveTab('nature')}>Природа</button>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="modal-title-wrap">
                        <h4>Объектов в {activeTab.toUpperCase()}: {filteredAttractions.length}</h4>
                    </div>
                    <button 
                        className="admin-add-btn" 
                        onClick={() => setSelectedItem({ 
                            name: '', 
                            city: 'Туркестан', 
                            category_tag: activeTab,
                            image: '',
                            description: '',
                            gallery: [],
                            nearbyHotels: [],
                            nearbyRestaurants: []
                        })}
                    >
                        <Icons.Plus /> Добавить объект
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Фото</th>
                            <th>Название</th>
                            <th>Город</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAttractions.map(item => (
                            <tr key={item.id}>
                                <td><img src={item.image} alt="" className="admin-table-img" /></td>
                                <td><strong>{item.name}</strong></td>
                                <td>{item.city}</td>
                                <td>
                                    <div className="admin-table-actions">
                                        <button className="btn-edit" onClick={() => setSelectedItem(item)}>Изменить</button>
                                        <button className="btn-delete" onClick={() => handleDelete(item.id)}>Удалить</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedItem && (
                <AttractionEditModal
                    attraction={selectedItem}
                    hotels={hotels}
                    restaurants={restaurants}
                    onSave={handleSave}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            <style>{`
                .arch-settings-container { background: #fdfdfd; padding: 20px; border-radius: 12px; border: 1px solid #eee; margin-bottom: 20px; }
                .arch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 15px; }
                .arch-card { background: #fff; padding: 20px; border-radius: 10px; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .arch-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
                .tag-badge { font-size: 10px; background: #c5a059; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
                .arch-card h4 { margin: 0; color: #333; }
                .admin-divider { border: 0; height: 1px; background: #eee; margin: 40px 0; }
                .admin-section-header { margin-bottom: 20px; }
                .form-group { margin-bottom: 12px; }
                .form-group label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
                .form-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
                .form-group input:focus { border-color: #c5a059; outline: none; }
                .admin-save-btn { background: #c5a059; color: #fff; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
                .admin-save-btn:hover { background: #a8874a; }
            `}</style>
        </div>
    );
};

export default CategoriesManager;
