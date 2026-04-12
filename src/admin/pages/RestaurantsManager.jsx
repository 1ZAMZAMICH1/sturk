import React, { useState, useEffect } from 'react';
import { fetchSheetData, updateSheetData } from '../../services/api';
import { Icons } from '../AdminIcons';
import RestaurantEditModal from './RestaurantEditModal';

const RestaurantsManager = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRes, setSelectedRes] = useState(null);

    const [allHotels, setAllHotels] = useState([]);
    const [allAttractions, setAllAttractions] = useState([]);

    useEffect(() => {
        const loadAll = async () => {
            const [resData, hotData, attData] = await Promise.all([
                fetchSheetData('restaurants'),
                fetchSheetData('hotels'),
                fetchSheetData('attractions')
            ]);
            const parseSafe = (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val;
                try {
                    const parsed = JSON.parse(val);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    return [];
                }
            };

            setRestaurants((resData || []).map(r => ({
                ...r,
                gallery: parseSafe(r.gallery),
                nearbyAttractions: parseSafe(r.nearbyAttractions),
                nearbyHotels: parseSafe(r.nearbyHotels)
            })));
            setAllHotels(hotData);
            setAllAttractions(attData);
            setLoading(false);
        };
        loadAll();
    }, []);

    const handleSave = async (updated) => {
        const action = updated.id ? 'update' : 'add';
        const payload = {
            ...updated,
            gallery: JSON.stringify(updated.gallery || []),
            nearbyAttractions: JSON.stringify(updated.nearbyAttractions || []),
            nearbyHotels: JSON.stringify(updated.nearbyHotels || [])
        };

        if (!payload.id) {
            payload.id = Date.now().toString();
        }

        const success = await updateSheetData('restaurants', action, payload);
        if (success) {
            // Если это было добавление, перезагружаем список, чтобы получить ID от сервера (или просто перезагружаем)
            if (action === 'add') {
                const data = await fetchSheetData('restaurants');
                setRestaurants(data);
            } else {
                setRestaurants(prev => prev.map(r => r.id === updated.id ? updated : r));
            }
            setSelectedRes(null);
            alert(`Заведение "${updated.name_ru || updated.name}" сохранено`);
        } else {
            alert('Ошибка при сохранении');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить этот ресторан из базы?')) {
            const success = await updateSheetData('restaurants', 'delete', { id });
            if (success) {
                setRestaurants(prev => prev.filter(r => r.id !== id));
            }
        }
    };

    if (loading) return <div className="admin-loading">Считываем меню из Google Sheets...</div>;

    return (
        <div className="admin-manager">
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">Гастрономия</span>
                        <h3>Список заведений ({restaurants.length})</h3>
                    </div>
                    <button className="admin-add-btn" onClick={() => setSelectedRes({ name: '', cuisine: 'Казахская', city: 'Туркестан', image: '' })}>
                        <Icons.Plus /> Добавить заведение
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Фото</th>
                            <th>Название</th>
                            <th>Кухня / Город</th>
                            <th>Цена</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.map(r => (
                            <tr key={r.id}>
                                <td><img src={r.image} alt="" className="admin-table-img" /></td>
                                <td><strong>{r.name}</strong></td>
                                <td>
                                    <div className="type-badge">{r.cuisine}</div>
                                    <br />
                                    <small>{r.city}</small>
                                </td>
                                <td>{r.priceTag}</td>
                                <td>
                                    <div className="admin-table-actions">
                                        <button className="btn-edit" onClick={() => setSelectedRes(r)}>Изменить</button>
                                        <button className="btn-delete" onClick={() => handleDelete(r.id)}>Удалить</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedRes && (
                <RestaurantEditModal
                    restaurant={selectedRes}
                    onSave={handleSave}
                    onClose={() => setSelectedRes(null)}
                    allHotels={allHotels}
                    allAttractions={allAttractions}
                />
            )}
        </div>
    );
};

export default RestaurantsManager;
