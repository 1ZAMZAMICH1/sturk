import React, { useState, useEffect } from 'react';
import { fetchSheetData, updateSheetData } from '../../services/api';
import { Icons } from '../AdminIcons';
import ArticleEditModal from './ArticleEditModal';

const ArticlesManager = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArt, setSelectedArt] = useState(null);

    useEffect(() => {
        const loadArticles = async () => {
            const data = await fetchSheetData('articles');
            setArticles(data);
            setLoading(false);
        };
        loadArticles();
    }, []);

    const handleSave = async (updated) => {
        const isNew = !updated.id;
        if (isNew) {
            updated.id = Date.now().toString();
        }

        const action = isNew ? 'add' : 'update';
        const success = await updateSheetData('articles', action, updated);
        
        if (success) {
            setArticles(prev => {
                if (isNew) {
                    return [updated, ...prev];
                }
                return prev.map(a => a.id === updated.id ? updated : a);
            });
            setSelectedArt(null);
            alert(`Статья "${updated.title_ru || updated.title}" успешно сохранена!`);
        } else {
            alert('Ошибка при сохранении в Таблицу. Проверь консоль.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить эту статью навсегда?')) {
            const success = await updateSheetData('articles', 'delete', { id });
            if (success) {
                setArticles(prev => prev.filter(a => a.id !== id));
            } else {
                alert('Ошибка при удалении');
            }
        }
    };

    if (loading) return <div className="admin-loading">Загружаем свитки из библиотеки...</div>;

    return (
        <div className="admin-manager">
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="modal-title-wrap">
                        <span className="type-badge">Шежіре</span>
                        <h3>Список статей ({articles.length})</h3>
                    </div>
                    <button 
                        className="admin-add-btn" 
                        onClick={() => setSelectedArt({ 
                            title: '', 
                            author: 'Admin', 
                            date: new Date().toLocaleDateString('ru-RU'),
                            category: 'История',
                            content: '',
                            image: ''
                        })}
                    >
                        <Icons.Plus /> Написать статью
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Превью</th>
                            <th>Заголовок / Автор</th>
                            <th>Дата / Категория</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map(a => (
                            <tr key={a.id}>
                                <td><img src={a.image} alt="" className="admin-table-img" /></td>
                                <td>
                                    <strong>{a.title}</strong>
                                    <br />
                                    <small style={{ color: 'var(--adm-text-dim)' }}>{a.author}</small>
                                </td>
                                <td>
                                    <div className="type-badge">{a.category}</div>
                                    <br />
                                    <small>{a.date}</small>
                                </td>
                                <td>
                                    <div className="admin-table-actions">
                                        <button className="btn-edit" onClick={() => setSelectedArt(a)}>Изменить</button>
                                        <button className="btn-delete" onClick={() => handleDelete(a.id)}>Удалить</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedArt && (
                <ArticleEditModal
                    article={selectedArt}
                    onSave={handleSave}
                    onClose={() => setSelectedArt(null)}
                />
            )}
        </div>
    );
};

export default ArticlesManager;
