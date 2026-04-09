import React, { useState, useEffect } from 'react';
import { fetchSheetData, updateSheetData } from '../../services/api';
import HotelEditModal from './HotelEditModal';

const HotelsManager = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHotel, setSelectedHotel] = useState(null);

    useEffect(() => {
        const loadHotels = async () => {
            const data = await fetchSheetData('hotels');
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

            setHotels((data || []).map(h => ({
                ...h,
                rooms: parseSafe(h.rooms),
                gallery: parseSafe(h.gallery),
                amenities: parseSafe(h.amenities),
                nearbyAttractions: parseSafe(h.nearbyAttractions),
                nearbyRestaurants: parseSafe(h.nearbyRestaurants)
            })));
            setLoading(false);
        };
        loadHotels();
    }, []);

    const handleSave = async (updatedHotel) => {
        const payload = {
            ...updatedHotel,
            rooms: JSON.stringify(updatedHotel.rooms || []),
            amenities: JSON.stringify(updatedHotel.amenities || []),
            gallery: JSON.stringify(updatedHotel.gallery || []),
            nearbyAttractions: JSON.stringify(updatedHotel.nearbyAttractions || []),
            nearbyRestaurants: JSON.stringify(updatedHotel.nearbyRestaurants || [])
        };

        const success = await updateSheetData('hotels', 'update', payload);
        if (success) {
            setHotels(prev => prev.map(h => h.id === updatedHotel.id ? updatedHotel : h));
            setSelectedHotel(null);
            const savedName = updatedHotel.name_ru || updatedHotel.name || 'Отель';
            alert(`Отель "${savedName}" сохранен в Google Таблице`);
        } else {
            alert('Ошибка при сохранении в Google Таблицу');
        }
    };

    if (loading) return <div className="admin-loading">Загрузка данных из Google Sheets...</div>;

    return (
        <div className="admin-manager">
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>Список отелей ({hotels.length})</h3>
                    <button className="admin-add-btn" onClick={() => setSelectedHotel({ name: '', type: 'Hotel', stars: 5, priceTag: '', city: 'Туркестан', image: '' })}>
                        + Добавить отель
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Фото</th>
                            <th>Название</th>
                            <th>Тип / Город</th>
                            <th>Рейтинг</th>
                            <th>Цена</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotels.map(h => (
                            <tr key={h.id}>
                                <td><img src={h.image} alt="" className="admin-table-img" /></td>
                                <td><strong>{h.name_ru || h.name}</strong></td>
                                <td>
                                    <div className="type-badge">{h.type}</div>
                                    <br />
                                    <small>{h.city}</small>
                                </td>
                                <td>{h.stars} ★</td>
                                <td>{h.priceTag}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => setSelectedHotel(h)}>Изменить</button>
                                    <button className="btn-delete">Удалить</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedHotel && (
                <HotelEditModal
                    hotel={selectedHotel}
                    onSave={handleSave}
                    onClose={() => setSelectedHotel(null)}
                />
            )}
        </div>
    );
};

export default HotelsManager;
