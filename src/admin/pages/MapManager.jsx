import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchSheetData, updateSheetData, updateAllGistData } from '../../services/api';
import { uploadImage } from '../../services/cloudinaryService';
import { Icons } from '../AdminIcons';
import 'leaflet/dist/leaflet.css';

// Фикс иконок для Leaflet в React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Мини-компонент загрузки иконок
const IconUpload = ({ value, onChange }) => {
    const [loading, setLoading] = useState(false);
    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            const url = await uploadImage(file);
            onChange(url);
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
    };
    return (
        <div className="icon-upload-wrap">
            <div className="icon-preview" onClick={() => document.getElementById('map-icon-input').click()}>
                {value ? <img src={value} alt="icon" /> : <Icons.Upload />}
                {loading && <div className="loader-mini">...</div>}
            </div>
            <input type="file" id="map-icon-input" style={{ display: 'none' }} onChange={handleFile} accept="image/png" />
            <small>Нажми, чтобы загрузить PNG</small>
        </div>
    );
};

const MapResizeManager = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }, [map]);
    return null;
};

// СТАБИЛЬНЫЕ ИКОНКИ ДЛЯ АДМИНКИ (чтобы не было ошибки createIcon)
const adminIconCache = {
    sight: L.divIcon({ html: '<div style="background:#c59d5f;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [12, 12] }),
    nature: L.divIcon({ html: '<div style="background:#27ae60;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [12, 12] }),
    hotel: L.divIcon({ html: '<div style="background:#2980b9;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [12, 12] }),
};

const getAdminMarkerIcon = (type, customIconUrl) => {
    if (customIconUrl) {
        if (!adminIconCache[customIconUrl]) {
            adminIconCache[customIconUrl] = L.icon({
                iconUrl: customIconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
        }
        return adminIconCache[customIconUrl];
    }
    return adminIconCache[type] || adminIconCache.sight;
};

// Алгоритм Дугласа-Пекера для упрощения кривой (чтобы не ломать БД)
const simplifyPolyline = (points, tolerance) => {
    if (points.length <= 2) return points;
    
    const sqTolerance = tolerance * tolerance;
    
    const getSqDist = (p1, p2) => {
        const dx = p1[0] - p2[0], dy = p1[1] - p2[1];
        return dx * dx + dy * dy;
    };
    
    const getSqSegDist = (p, p1, p2) => {
        let x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y;
        if (dx !== 0 || dy !== 0) {
            let t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) { x = p2[0]; y = p2[1]; }
            else if (t > 0) { x += dx * t; y += dy * t; }
        }
        dx = p[0] - x; dy = p[1] - y;
        return dx * dx + dy * dy;
    };

    const simplifyStep = (points, first, last, sqTolerance, simplified) => {
        let maxSqDist = sqTolerance, index;
        for (let i = first + 1; i < last; i++) {
            let sqDist = getSqSegDist(points[i], points[first], points[last]);
            if (sqDist > maxSqDist) { index = i; maxSqDist = sqDist; }
        }
        if (maxSqDist > sqTolerance) {
            if (index - first > 1) simplifyStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1) simplifyStep(points, index, last, sqTolerance, simplified);
        }
    };

    let simplified = [points[0]];
    simplifyStep(points, 0, points.length - 1, sqTolerance, simplified);
    simplified.push(points[points.length - 1]);
    return simplified;
};

const MapManager = () => {
    const [points, setPoints] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [attractions, setAttractions] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('points');
    const [editingItem, setEditingItem] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newRouteNodes, setNewRouteNodes] = useState([]);
    const [snapToRoads, setSnapToRoads] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [dragMode, setDragMode] = useState(false);


    const loadData = async () => {
        setLoading(true);
        try {
            const [pData, rData, aData, hData, resData] = await Promise.all([
                fetchSheetData('map_points'),
                fetchSheetData('map_routes'),
                fetchSheetData('attractions'),
                fetchSheetData('hotels'),
                fetchSheetData('restaurants')
            ]);
            
            setAttractions((aData || []).map(attr => ({
                ...attr,
                coordinates: {
                    lat: parseFloat(attr.lat) || 0,
                    lng: parseFloat(attr.lng) || 0
                }
            })));

            setHotels((hData || []).map(h => ({
                ...h,
                coordinates: {
                    lat: parseFloat(h.lat) || 0,
                    lng: parseFloat(h.lng) || 0
                }
            })));

            setRestaurants((resData || []).map(r => ({
                ...r,
                coordinates: {
                    lat: parseFloat(r.lat) || 0,
                    lng: parseFloat(r.lng) || 0
                }
            })));
            
            setPoints((pData && Array.isArray(pData)) ? pData.map(p => ({
                ...p,
                pos: typeof p.pos === 'string' ? p.pos.split(',').map(Number) : p.pos,
                icon: p.icon || ''
            })) : []);
            
            setRoutes((rData && Array.isArray(rData)) ? rData.map(r => ({
                ...r,
                nodes: typeof r.nodes === 'string' ? r.nodes.split(';').map(n => n.split(',').map(Number)) : r.nodes
            })) : []);
            
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Синхронизация объекта с картой
    const syncObjectToMap = async (item, type) => {
        const lat = item.coordinates?.lat || item.lat;
        const lng = item.coordinates?.lng || item.lng;
        
        if (!lat || !lng) {
            alert('У объекта не указаны координаты! Сначала добавь их в карточке редактирования объекта.');
            return;
        }

        // Удаляем все спецсимволы и пробелы для надежного сравнения ("Каньон Аксу" -> "каньонаксу")
        const cleanItemName = (item.name_ru || item.name || '').replace(/[^\w\а-яА-ЯёЁ]/g, '').trim().toLowerCase();
        
        const isAlreadyOnMap = points.some(p => {
            const pidMatch = (type === 'sight' && String(p.attractionId) === String(item.id)) ||
                           (type === 'hotel' && String(p.hotelId) === String(item.id)) ||
                           (type === 'restaurant' && String(p.restaurantId) === String(item.id));
            
            const cleanPTitle = (p.title_ru || p.title || '').replace(/[^\w\а-яА-ЯёЁ]/g, '').trim().toLowerCase();
            const nameMatch = cleanPTitle === cleanItemName && cleanPTitle.length > 0;

            return pidMatch || nameMatch;
        });

        if (isAlreadyOnMap) {
            alert('Этот объект уже есть на карте!');
            return;
        }

        const newPoint = {
            attractionId: type === 'sight' ? item.id : '',
            hotelId: type === 'hotel' ? item.id : '',
            restaurantId: type === 'restaurant' ? item.id : '',
            title_ru: item.name_ru || item.name || '',
            title_kz: item.name_kz || '',
            title_en: item.name_en || '',
            desc_ru: item.description_ru || item.description || '',
            desc_kz: item.description_kz || '',
            desc_en: item.description_en || '',
            pos: [parseFloat(lat), parseFloat(lng)].join(','),
            icon: '',
            type: type
        };

        
        const success = await updateSheetData('map_points', 'add', newPoint);
        if (success) {
            alert(`"${item.name}" добавлен на карту!`);
            loadData();
        }
    };

    const fetchRoute = async (start, end) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (data.routes && data.routes[0]) {
                return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            }
        } catch (e) {
            console.error('OSRM Error:', e);
        }
        return [end];
    };

    const MapEvents = () => {
        useMapEvents({
            async click(e) {
                const newPos = [e.latlng.lat, e.latlng.lng];
                if (isDrawing && !snapToRoads) {
                    setNewRouteNodes(prev => [...prev, newPos]);
                } else if (activeTab === 'points' && !editingItem) {
                    setEditingItem({
                        title: 'Новая точка',
                        desc: '',
                        type: 'sight',
                        icon: '',
                        pos: newPos
                    });
                }
            },
        });
        return null;
    };

    const handlePointClickForRoute = async (point) => {
        if (!isDrawing) return;
        
        const newPos = point.pos;
        if (snapToRoads && newRouteNodes.length > 0) {
            const lastPos = newRouteNodes[newRouteNodes.length - 1];
            const roadNodes = await fetchRoute(lastPos, newPos);
            // Упрощаем полученный кусок дороги перед добавлением
            const simplified = simplifyPolyline(roadNodes, 0.00005);
            setNewRouteNodes(prev => [...prev, ...simplified]);
        } else {
            setNewRouteNodes(prev => [...prev, newPos]);
        }
    };

    const handleSaveAllPoints = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            // Форматируем позиции обратно в строки перед сохранением
            const dataToSave = points.map(p => ({
                ...p,
                pos: Array.isArray(p.pos) ? p.pos.join(',') : p.pos
            }));
            
            const success = await updateAllGistData('map_points', dataToSave);
            if (success) {
                alert('Все изменения на карте сохранены!');
                setHasUnsavedChanges(false);
                loadData();
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка при массовом сохранении');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePoint = async () => {
        if (!editingItem || isSaving) return;
        setIsSaving(true);
        
        try {
            const action = editingItem.id ? 'update' : 'add';
            let posStr = '';
            if (Array.isArray(editingItem.pos)) {
                posStr = editingItem.pos.join(',');
            } else if (typeof editingItem.pos === 'string') {
                posStr = editingItem.pos;
            }

            const payload = {
                ...editingItem,
                pos: posStr,
                icon: editingItem.icon || '',
                title_ru: editingItem.title_ru || editingItem.title || '',
                title_kz: editingItem.title_kz || '',
                title_en: editingItem.title_en || '',
                desc_ru: editingItem.desc_ru || editingItem.desc || '',
                desc_kz: editingItem.desc_kz || '',
                desc_en: editingItem.desc_en || ''
            };
            
            const success = await updateSheetData('map_points', action, payload);
            if (success) {
                console.log('Маркер сохранен');
                await loadData();
                setEditingItem(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };


    const handleSaveRoute = async () => {
        const title = editingItem?.id ? editingItem.title : prompt('Название маршрута:', 'Новый маршрут');
        if (!title) return;
        
        let payload = {};
        if (editingItem?.id) {
            // Редактирование существующего
            payload = { ...editingItem, title };
        } else {
            // Создание нового
            const solidRoute = simplifyPolyline(newRouteNodes, 0.00002);
            const nodesStr = solidRoute.map(n => [n[0].toFixed(6), n[1].toFixed(6)].join(',')).join(';');
            if (nodesStr.length > 45000) {
                alert('Маршрут все еще слишком длинный!');
                return;
            }
            payload = { title, nodes: nodesStr, color: '#00e5ff' };
        }
        
        const action = editingItem?.id ? 'update' : 'add';
        const success = await updateSheetData('map_routes', action, payload);
        if (success) {
            alert('Маршрут сохранен');
            loadData();
            setIsDrawing(false);
            setNewRouteNodes([]);
            setEditingItem(null);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('Удалить этот элемент навсегда?')) return;
        
        // Находим элемент для удаления по ID или по заголовку (если ID нет)
        const itemToDelete = type === 'point' 
            ? points.find(p => p.id === id || (!p.id && p.title === id))
            : routes.find(r => r.id === id || (!r.id && r.title === id));

        const identifier = itemToDelete?.id || itemToDelete?.title;

        // ОПТИМИЗАЦИЯ: Мгновенно убираем из списка на экране
        if (type === 'point') {
            setPoints(prev => prev.filter(p => (p.id && p.id !== identifier) || (p.title !== identifier)));
        } else {
            setRoutes(prev => prev.filter(r => (r.id && r.id !== identifier) || (r.title !== identifier)));
        }

        const sheet = type === 'point' ? 'map_points' : 'map_routes';
        const success = await updateSheetData(sheet, 'delete', itemToDelete);
        
        if (success) {
            console.log('Удаление на сервере успешно');
            setTimeout(() => loadData(), 1000);
            setEditingItem(null);
        } else {
            alert('Ошибка при удалении на сервере.');
            loadData();
        }
    };

    if (loading) return <div className="admin-loading">Загрузка данных карты...</div>;

    return (
        <div className="map-manager-refined">
            <div className="map-toolbar">
                <div className="tabs">
                    <button className={activeTab === 'points' ? 'active' : ''} onClick={() => { setActiveTab('points'); setEditingItem(null); setIsDrawing(false); }}>Точки</button>
                    <button className={activeTab === 'attractions' ? 'active' : ''} onClick={() => { setActiveTab('attractions'); setEditingItem(null); setIsDrawing(false); }}>Достопримечательности</button>
                    <button className={activeTab === 'hotels' ? 'active' : ''} onClick={() => { setActiveTab('hotels'); setEditingItem(null); setIsDrawing(false); }}>Отели</button>
                    <button className={activeTab === 'restaurants' ? 'active' : ''} onClick={() => { setActiveTab('restaurants'); setEditingItem(null); setIsDrawing(false); }}>Рестораны</button>
                    <button className={activeTab === 'routes' ? 'active' : ''} onClick={() => { setActiveTab('routes'); setEditingItem(null); }}>Маршруты</button>
                </div>
                
                <div className="actions">
                    {activeTab === 'routes' && !isDrawing && (
                        <button className="btn-draw" onClick={() => { setIsDrawing(true); setNewRouteNodes([]); }}>Нарисовать маршрут</button>
                    )}
                    {isDrawing && (
                        <div className="drawing-tools">
                            <button className={`btn-snap ${snapToRoads ? 'on' : ''}`} onClick={() => setSnapToRoads(!snapToRoads)}>
                                {snapToRoads ? 'Магнит ВКЛ' : 'Магнит ВЫКЛ'}
                            </button>
                            <button className="btn-save-route" onClick={handleSaveRoute}>Сохранить ({newRouteNodes.length})</button>
                            <button className="btn-cancel-route" onClick={() => setIsDrawing(false)}>Отмена</button>
                        </div>
                    )}
                    
                    {activeTab === 'points' && (
                        <div className="point-actions" style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                className={`btn-drag-mode ${dragMode ? 'on' : ''}`} 
                                onClick={() => setDragMode(!dragMode)}
                                style={{ 
                                    background: dragMode ? '#c59d5f' : '#f5f5f5', 
                                    color: dragMode ? '#fff' : '#666', 
                                    border: '1px solid #ddd', 
                                    padding: '10px 15px', 
                                    borderRadius: '8px', 
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                {dragMode ? '🔒 Режим текста' : '🖐 Режим Двигания'}
                            </button>

                            {hasUnsavedChanges && (
                                <button 
                                    className="btn-save-all" 
                                    onClick={handleSaveAllPoints}
                                    style={{ 
                                        background: '#27ae60', 
                                        color: '#fff', 
                                        border: 'none', 
                                        padding: '10px 20px', 
                                        borderRadius: '8px', 
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)'
                                    }}
                                >
                                    {isSaving ? 'Сохранение...' : 'СОХРАНИТЬ ВСЁ'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="map-editor-layout">
                <div className="admin-map-container">
                    <MapContainer center={[43.301918, 68.270459]} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapEvents />
                        <MapResizeManager />
                        
                        {!loading && points.filter(p => p.pos && !isNaN(p.pos[0]) && !isNaN(p.pos[1])).map((p, idx) => {
                            const isEditing = activeTab === 'points' && editingItem && (editingItem.id === p.id || editingItem.title === p.title);
                            // В режиме двигания — все перетаскиваемые. В обычном — только тот, что редактируем.
                            const canDrag = activeTab === 'points' && (dragMode || isEditing);
                            
                            return (
                                <Marker 
                                    key={`point-${p.id || p.title || idx}`} 
                                    position={p.pos}
                                    draggable={canDrag} 
                                    icon={getAdminMarkerIcon(p.type, p.icon)}
                                    eventHandlers={{ 
                                        click: (e) => { 
                                            if (isDrawing) {
                                                handlePointClickForRoute(p);
                                            } else {
                                                setEditingItem(p); 
                                                setActiveTab('points'); 
                                            }
                                        },
                                        dragend: (e) => {
                                            const marker = e.target;
                                            const newPos = marker.getLatLng();
                                            const newPosArr = [newPos.lat, newPos.lng];
                                            
                                            // Если мы двигаем именно тот, что в форме — обновляем и форму
                                            if (isEditing) {
                                                setEditingItem(prev => ({...prev, pos: newPosArr}));
                                            }
                                            
                                            // Обновляем позицию в глобальном списке для всех двигаемых объектов
                                            setPoints(prevPoints => prevPoints.map(point => {
                                                if (point.id === p.id && point.title === p.title) {
                                                    return { ...point, pos: newPosArr };
                                                }
                                                return point;
                                            }));
                                            
                                            setHasUnsavedChanges(true);
                                        }
                                    }}
                                />
                            );
                        })}

                        {!loading && routes.filter(r => r.nodes && r.nodes.length > 0).map(r => (
                            <Polyline 
                                key={`route-${r.id || r.title}`} 
                                positions={r.nodes} 
                                color={editingItem?.id === r.id ? '#ff3d00' : (r.color || '#00e5ff')} 
                                weight={editingItem?.id === r.id ? 8 : 5} 
                                opacity={0.7} 
                                eventHandlers={{ click: () => { setEditingItem(r); setActiveTab('routes'); } }}
                            />
                        ))}
                        {isDrawing && <Polyline positions={newRouteNodes} color="#ff3d00" weight={4} dashArray="5, 10" />}
                        {isDrawing && <div className="drawing-mode-hint">Режим маршрута: Кликай по иконкам на карте для связи</div>}
                    </MapContainer>
                </div>

                <div className="map-sidebar-refined">
                    <div className="sidebar-header-box">
                        <h3>{['attractions', 'hotels', 'restaurants'].includes(activeTab) ? 'Синхронизация' : 'Управление'}</h3>
                        <p className="dim-text">{['attractions', 'hotels', 'restaurants'].includes(activeTab) ? 'Добавление объектов с сайта' : 'Список элементов на карте'}</p>
                    </div>

                    <div className="sidebar-body-scroll">
                        {activeTab === 'attractions' && (
                            <div className="articles-map-list">
                                {attractions.map(attr => {
                                    const cleanAttrName = (attr.name_ru || attr.name || '').replace(/[^\w\а-яА-ЯёЁ]/g, '').trim().toLowerCase();
                                    const isOnMap = points.some(p => {
                                        const idMatch = String(p.attractionId) === String(attr.id);
                                        const cleanPTitle = (p.title_ru || p.title || '').replace(/[^\w\а-яА-ЯёЁ]/g, '').trim().toLowerCase();
                                        return idMatch || (cleanPTitle === cleanAttrName && cleanPTitle.length > 0);
                                    });
                                    const hasCoords = attr.coordinates?.lat && attr.coordinates?.lng;
                                    return (
                                        <div key={attr.id} className={`art-map-item ${isOnMap ? 'on-map' : (hasCoords ? 'ready' : 'disabled')}`}>
                                            <div className="art-img-wrap">
                                                <img src={attr.image || ''} alt="" />
                                                {isOnMap && <div className="on-map-badge">✓</div>}
                                            </div>
                                            <div className="art-info">
                                                <span className="art-title-text">{attr.name}</span>
                                                <small className={hasCoords ? "art-coords-text" : "error-text"}>{hasCoords ? `${parseFloat(attr.coordinates.lat).toFixed(4)}, ${parseFloat(attr.coordinates.lng).toFixed(4)}` : 'Координаты не заданы'}</small>
                                            </div>
                                            {!isOnMap && hasCoords && (
                                                <button className="btn-sync-action" title="Добавить на карту" onClick={() => syncObjectToMap(attr, attr.category === 'nature' ? 'nature' : 'sight')}>
                                                    <Icons.Plus />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'hotels' && (
                            <div className="articles-map-list">
                                {hotels.map(hotel => {
                                    const isOnMap = points.some(p => String(p.hotelId) === String(hotel.id));
                                    const hasCoords = hotel.lat && hotel.lng;
                                    return (
                                        <div key={hotel.id} className={`art-map-item ${isOnMap ? 'on-map' : (hasCoords ? 'ready' : 'disabled')}`}>
                                            <div className="art-img-wrap">
                                                <img src={hotel.image || ''} alt="" />
                                                {isOnMap && <div className="on-map-badge">✓</div>}
                                            </div>
                                            <div className="art-info">
                                                <span className="art-title-text">{hotel.name}</span>
                                                <small className={hasCoords ? "art-coords-text" : "error-text"}>{hasCoords ? `${parseFloat(hotel.lat).toFixed(4)}, ${parseFloat(hotel.lng).toFixed(4)}` : 'Координаты не заданы'}</small>
                                            </div>
                                            {!isOnMap && hasCoords && (
                                                <button className="btn-sync-action" title="Добавить на карту" onClick={() => syncObjectToMap(hotel, 'hotel')}>
                                                    <Icons.Plus />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {activeTab === 'restaurants' && (
                            <div className="articles-map-list">
                                {restaurants.map(resto => {
                                    const isOnMap = points.some(p => String(p.restaurantId) === String(resto.id));
                                    const hasCoords = resto.lat && resto.lng;
                                    return (
                                        <div key={resto.id} className={`art-map-item ${isOnMap ? 'on-map' : (hasCoords ? 'ready' : 'disabled')}`}>
                                            <div className="art-img-wrap">
                                                <img src={resto.image || ''} alt="" />
                                                {isOnMap && <div className="on-map-badge">✓</div>}
                                            </div>
                                            <div className="art-info">
                                                <span className="art-title-text">{resto.name}</span>
                                                <small className={hasCoords ? "art-coords-text" : "error-text"}>{hasCoords ? `${parseFloat(resto.lat).toFixed(4)}, ${parseFloat(resto.lng).toFixed(4)}` : 'Координаты не заданы'}</small>
                                            </div>
                                            {!isOnMap && hasCoords && (
                                                <button className="btn-sync-action" title="Добавить на карту" onClick={() => syncObjectToMap(resto, 'restaurant')}>
                                                    <Icons.Plus />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'routes' && !isDrawing && !editingItem && (
                            <div className="points-list-view">
                                <div className="art-group-label">Список маршрутов:</div>
                                {routes.map(r => (
                                    <div key={r.id} className="art-map-item ready clickable" onClick={() => setEditingItem(r)}>
                                        <div className="art-img-wrap" style={{ background: r.color || '#00e5ff', opacity: 0.5 }}>
                                            <div className="placeholder-icon">🛤️</div>
                                        </div>
                                        <div className="art-info">
                                            <span className="art-title-text">{r.title}</span>
                                            <small className="dim-text">{r.nodes?.length} точек</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'routes' && editingItem && (
                            <div className="item-edit-panel">
                                <div className="art-group-label">Редактирование маршрута</div>
                                <div className="form-group">
                                    <label className="label-mini-gold">Название</label>
                                    <input 
                                        value={editingItem.title || ''} 
                                        onChange={e => setEditingItem({...editingItem, title: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label-mini-gold">Цвет маршрута</label>
                                    <div className="color-picker-grid">
                                        {['#00e5ff', '#ffeb3b', '#ff5722', '#4caf50', '#e91e63', '#9c27b0', '#ffffff'].map(c => (
                                            <div 
                                                key={c} 
                                                className={`color-swatch ${editingItem.color === c ? 'active' : ''}`}
                                                style={{ background: c }}
                                                onClick={() => setEditingItem({...editingItem, color: c})}
                                            />
                                        ))}
                                    </div>
                                    <input 
                                        type="text" 
                                        value={editingItem.color || ''} 
                                        onChange={e => setEditingItem({...editingItem, color: e.target.value})}
                                        placeholder="#hex color"
                                        style={{ marginTop: '10px' }}
                                    />
                                </div>
                                <div className="edit-actions">
                                    <button className="admin-save-btn" onClick={handleSaveRoute}>Сохранить</button>
                                    <button className="admin-cancel-btn" onClick={() => setEditingItem(null)}>Отмена</button>
                                </div>
                                <button className="btn-delete-full" onClick={() => handleDelete('route', editingItem.id)}>Удалить маршрут</button>
                            </div>
                        )}

                        {activeTab === 'points' && !editingItem && (
                            <div className="points-list-view">
                                <div className="art-group-label">Точки на карте:</div>
                                {points.map(p => (
                                    <div key={p.id} className="art-map-item ready clickable" onClick={() => setEditingItem(p)}>
                                        <div className="art-img-wrap">
                                            {p.icon ? <img src={p.icon} alt="" /> : <div className="placeholder-icon"><Icons.Pin /></div>}
                                        </div>
                                        <div className="art-info">
                                            <span className="art-title-text">{p.title_ru || p.title}</span>
                                            <small className="dim-text">{p.type}</small>
                                        </div>
                                        <button 
                                            className="btn-quick-delete" 
                                            onClick={(e) => { e.stopPropagation(); handleDelete('point', p.id); }}
                                            title="Удалить с карты"
                                        >
                                            <Icons.Trash />
                                        </button>

                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'points' && editingItem && (
                            <div className="item-edit-panel">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="art-group-label">Редактирование маркера</div>
                                    <button onClick={() => setEditingItem(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                                </div>
                                
                                <div className="form-row-multi">
                                    <div className="form-group">
                                        <label className="label-mini-gold">Заголовок (RU)</label>
                                        <input 
                                            value={editingItem.title_ru || editingItem.title || ''} 
                                            onChange={e => setEditingItem({...editingItem, title_ru: e.target.value})} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label-mini-gold">Заголовок (KZ)</label>
                                        <input 
                                            value={editingItem.title_kz || ''} 
                                            onChange={e => setEditingItem({...editingItem, title_kz: e.target.value})} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label-mini-gold">Заголовок (EN)</label>
                                        <input 
                                            value={editingItem.title_en || ''} 
                                            onChange={e => setEditingItem({...editingItem, title_en: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label-mini-gold">Описание (RU)</label>
                                    <textarea 
                                        value={editingItem.desc_ru || editingItem.desc || ''} 
                                        onChange={e => setEditingItem({...editingItem, desc_ru: e.target.value})} 
                                        rows="2"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label-mini-gold">Описание (KZ)</label>
                                    <textarea 
                                        value={editingItem.desc_kz || ''} 
                                        onChange={e => setEditingItem({...editingItem, desc_kz: e.target.value})} 
                                        rows="2"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label-mini-gold">Описание (EN)</label>
                                    <textarea 
                                        value={editingItem.desc_en || ''} 
                                        onChange={e => setEditingItem({...editingItem, desc_en: e.target.value})} 
                                        rows="2"
                                    />
                                </div>


                                <div className="form-group">
                                    <label className="label-mini-gold">Иконка (PNG)</label>
                                    <IconUpload 
                                        value={editingItem.icon} 
                                        onChange={(url) => setEditingItem({...editingItem, icon: url})} 
                                    />
                                    
                                    {/* БИБЛИОТЕКА СУЩЕСТВУЮЩИХ ИКОНОК */}
                                    {points.some(p => p.icon) && (
                                        <div className="existing-icons-gallery">
                                            <p className="dim-text-small">Выбрать из уже загруженных:</p>
                                            <div className="icons-grid-mini">
                                                {[...new Set(points.map(p => p.icon).filter(Boolean))].map((url, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`mini-icon-item ${editingItem.icon === url ? 'active' : ''}`}
                                                        onClick={() => setEditingItem({...editingItem, icon: url})}
                                                    >
                                                        <img src={url} alt="icon" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="label-mini-gold">Тип</label>
                                    <select value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})}>
                                        <option value="sight">История</option>
                                        <option value="nature">Природа</option>
                                        <option value="hotel">Отель</option>
                                        <option value="restaurant">Ресторан</option>
                                        <option value="city">Город</option>
                                    </select>
                                </div>

                                {(editingItem.type === 'hotel' || editingItem.type === 'restaurant') && (
                                    <div className="form-group">
                                        <label className="label-mini-gold">Привязать к объекту</label>
                                        <select 
                                            value={editingItem.type === 'hotel' ? editingItem.hotelId : editingItem.restaurantId}
                                            onChange={e => {
                                                const field = editingItem.type === 'hotel' ? 'hotelId' : 'restaurantId';
                                                setEditingItem({...editingItem, [field]: e.target.value});
                                            }}
                                        >
                                            <option value="">-- Выбери объект --</option>
                                            {(editingItem.type === 'hotel' ? hotels : restaurants).map(obj => (
                                                <option key={obj.id} value={obj.id}>{obj.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="edit-actions">
                                    <button className="admin-save-btn" onClick={handleSavePoint} disabled={isSaving}>
                                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                    <button className="admin-cancel-btn" onClick={() => setEditingItem(null)} disabled={isSaving}>Отмена</button>
                                </div>


                                {editingItem.id && (
                                    <button className="btn-delete-full" onClick={() => handleDelete('point', editingItem.id)}>
                                        Удалить с карты
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .map-manager-refined { padding: 20px; background: #fff; min-height: 100vh; font-family: 'Inter', sans-serif; }
                .map-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: #fdfaf5; padding: 12px 20px; border-radius: 12px; border: 1px solid #f0e6d6; }
                .tabs { display: flex; gap: 8px; }
                .tabs button { padding: 10px 20px; border: none; background: transparent; color: #998c7d; font-weight: 700; cursor: pointer; border-radius: 8px; transition: 0.2s; }
                .tabs button.active { background: #c59d5f; color: #fff; }
                
                .map-editor-layout { display: flex; gap: 24px; height: calc(100vh - 200px); min-height: 600px; }
                .admin-map-container { flex: 1; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.1); border: 1px solid #eee; }
                
                .map-sidebar-refined { width: 380px; background: #fff; border: 1px solid #eee; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; }
                .sidebar-header-box { padding: 20px; background: #fdfaf5; border-bottom: 1px solid #f0e6d6; }
                .sidebar-body-scroll { flex: 1; overflow-y: auto; padding: 20px; }
                
                .art-group-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c59d5f; font-weight: 800; margin-bottom: 15px; }
                .art-map-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; border: 1px solid #f0f0f0; margin-bottom: 10px; transition: 0.2s; }
                .art-map-item.clickable { cursor: pointer; }
                .art-map-item.clickable:hover { border-color: #c59d5f; background: #fdfaf5; }
                
                .art-img-wrap { width: 45px; height: 45px; border-radius: 8px; overflow: hidden; background: #f5f5f5; flex-shrink: 0; position: relative; }
                .art-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
                
                .on-map-badge { position: absolute; top: -2px; right: -2px; width: 16px; height: 16px; background: #27ae60; color: white; border-radius: 50%; font-size: 8px; display: flex; align-items: center; justify-content: center; }
                
                .form-group { margin-bottom: 20px; }
                .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; margin-top: 5px; }
                .label-mini-gold { color: #c59d5f; font-weight: 800; font-size: 0.65rem; text-transform: uppercase; }
                
                .edit-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
                .admin-save-btn { background: #c59d5f; color: #fff; border: none; padding: 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
                .admin-cancel-btn { background: #f5f5f5; color: #666; border: none; padding: 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
                .btn-delete-full { width: 100%; margin-top: 30px; background: #ff4d4d; color: #fff; border: none; padding: 16px; border-radius: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3); }
                .btn-delete-full:hover { background: #ff1a1a; box-shadow: 0 6px 20px rgba(255, 77, 77, 0.5); }
                
                .btn-quick-delete { margin-left: auto; background: transparent; border: none; color: #ffbfbf; cursor: pointer; padding: 8px; transition: 0.2s; }
                .btn-quick-delete:hover { color: #ff4d4d; scale: 1.2; }

                .drawing-mode-hint { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); background: #c59d5f; color: white; padding: 10px 20px; border-radius: 30px; font-size: 0.8rem; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.2); pointer-events: none; }
                
                .sub-tab-nav { display: flex; gap: 4px; margin-top: 10px; background: #eee; padding: 2px; border-radius: 6px; }
                .sub-tab-nav button { flex: 1; padding: 6px; border: none; background: transparent; font-size: 0.7rem; font-weight: 700; color: #666; cursor: pointer; border-radius: 4px; }
                .sub-tab-nav button.active { background: #fff; color: #c59d5f; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                
                .color-picker-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-top: 5px; }
                .color-swatch { aspect-ratio: 1; border-radius: 4px; cursor: pointer; border: 2px solid #ddd; transition: 0.2s; }
                .color-swatch:hover { scale: 1.1; }
                .color-swatch.active { border-color: #c59d5f; scale: 1.1; box-shadow: 0 0 10px rgba(197, 157, 95, 0.4); }

                .existing-icons-gallery { margin-top: 12px; padding: 10px; background: #f9f9f9; border-radius: 8px; border: 1px dashed #ddd; }
                .dim-text-small { font-size: 0.65rem; color: #999; margin-bottom: 8px; }
                .icons-grid-mini { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
                .mini-icon-item { aspect-ratio: 1; border: 2px solid transparent; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; background: #fff; transition: 0.2s; padding: 4px; }
                .mini-icon-item img { width: 100%; height: 100%; object-fit: contain; }
                .mini-icon-item:hover { border-color: #c59d5f; background: #fdfaf5; }
                .mini-icon-item.active { border-color: #c59d5f; box-shadow: 0 0 8px rgba(197, 157, 95, 0.3); }

                .form-row-multi { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
            `}</style>

        </div>
    );
};

export default MapManager;
