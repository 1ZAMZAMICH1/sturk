import React, { useState, useEffect } from 'react';
import { fetchSheetData, updateSheetData } from '../../services/api';
import GuideEditModal from './GuideEditModal';

const GuidesManager = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGuide, setSelectedGuide] = useState(null);

    useEffect(() => {
        const loadGuides = async () => {
            const data = await fetchSheetData('guides');
            const processed = data.map(g => ({
                ...g,
                languages: Array.isArray(g.languages) ? g.languages : (g.languages?.split(',').map(s => s.trim()) || []),
                tours: Array.isArray(g.tours) ? g.tours : (JSON.parse(g.tours || '[]'))
            }));
            setGuides(processed);
            setLoading(false);
        };
        loadGuides();
    }, []);

    const handleCreate = () => {
        setSelectedGuide({
            id: 'new',
            name: '',
            specialty: 'История',
            experience: 1,
            rating: 5,
            reviewCount: 0,
            photo: '',
            description: '',
            languages: ['Русский'],
            tours: []
        });
    };

    const handleSave = async (updatedGuide) => {
        const isNew = !updatedGuide.id || updatedGuide.id === 'new';
        const action = isNew ? 'add' : 'update';
        
        const payload = {
            ...updatedGuide,
            id: isNew ? 'g_' + Date.now() : updatedGuide.id,
            languages: Array.isArray(updatedGuide.languages) ? updatedGuide.languages.join(',') : updatedGuide.languages,
            tours: typeof updatedGuide.tours === 'string' ? updatedGuide.tours : JSON.stringify(updatedGuide.tours)
        };

        const success = await updateSheetData('guides', action, payload);
        if (success) {
            if (isNew) {
                setGuides(prev => [...prev, payload]);
            } else {
                setGuides(prev => prev.map(g => g.id === payload.id ? {
                    ...payload,
                    languages: updatedGuide.languages,
                    tours: updatedGuide.tours
                } : g));
            }
            setSelectedGuide(null);
            alert(`Гид ${payload.name} успешно ${isNew ? 'создан' : 'обновлен'}`);
        }
    };

    if (loading) return <div className="admin-loading">Загрузка гидов...</div>;

    return (
        <div className="admin-manager">
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>Список гидов ({guides.length})</h3>
                    <button className="admin-add-btn" onClick={handleCreate}>+ Создать гида</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Фото</th>
                            <th>Имя</th>
                            <th>Специализация</th>
                            <th>Опыт</th>
                            <th>Рейтинг</th>
                            <th>Маршрутов</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guides.map(g => (
                            <tr key={g.id}>
                                <td><img src={g.photo} alt="" className="admin-table-img" /></td>
                                <td><strong>{g.name}</strong></td>
                                <td>{g.specialty}</td>
                                <td>{g.experience} лет</td>
                                <td>{g.rating} ★</td>
                                <td>{g.tours?.length || 0}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => setSelectedGuide(g)}>Редактировать</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedGuide && (
                <GuideEditModal
                    guide={selectedGuide}
                    onSave={handleSave}
                    onClose={() => setSelectedGuide(null)}
                />
            )}
        </div>
    );
};

export default GuidesManager;
