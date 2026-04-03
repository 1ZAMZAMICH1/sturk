import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchSheetData, updateSheetData } from '../../services/api';
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
        return L.icon({
            iconUrl: customIconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    }
    return adminIconCache[type] || adminIconCache.sight;
};

const MapManager = () => {
    const [points, setPoints] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('points');
    const [editingItem, setEditingItem] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newRouteNodes, setNewRouteNodes] = useState([]);
    const [snapToRoads, setSnapToRoads] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pData, rData, aData] = await Promise.all([
                fetchSheetData('map_points'),
                fetchSheetData('map_routes'),
                fetchSheetData('attractions')
            ]);
            
            // Мапим данные, чтобы координаты были объектом
            setAttractions((aData || []).map(attr => ({
                ...attr,
                coordinates: {
                    lat: parseFloat(attr.lat) || 0,
                    lng: parseFloat(attr.lng) || 0
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

    // Синхронизация достопримечательности с картой
    const syncAttractionToMap = async (attr) => {
        const lat = attr.coordinates?.lat;
        const lng = attr.coordinates?.lng;
        if (!lat || !lng) {
            alert('У достопримечательности не указаны координаты! Добавь их во вкладке "Связи & Карта".');
            return;
        }
        
        const newPoint = {
            attractionId: attr.id,
            title: attr.name,
            desc: attr.description || '',
            pos: [parseFloat(lat), parseFloat(lng)].join(','),
            icon: '',
            type: attr.category === 'nature' ? 'nature' : 'sight'
        };
        
        const success = await updateSheetData('map_points', 'add', newPoint);
        if (success) {
            alert(`"${attr.name}" добавлена на карту!`);
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
                if (isDrawing) {
                    if (snapToRoads && newRouteNodes.length > 0) {
                        const lastPos = newRouteNodes[newRouteNodes.length - 1];
                        const roadNodes = await fetchRoute(lastPos, newPos);
                        setNewRouteNodes(prev => [...prev, ...roadNodes]);
                    } else {
                        setNewRouteNodes(prev => [...prev, newPos]);
                    }
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

    const handleSavePoint = async () => {
        if (!editingItem) return;
        
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
            title: editingItem.title || '',
            desc: editingItem.desc || ''
        };
        
        const success = await updateSheetData('map_points', action, payload);
        if (success) {
            alert('Изменения сохранены на карте');
            loadData();
            setEditingItem(null);
        } else {
            alert('Ошибка при сохранении. Проверь консоль.');
        }
    };

    const handleSaveRoute = async () => {
        const title = prompt('Название маршрута:', 'Новый маршрут');
        if (!title) return;
        
        const routeData = {
            title: title,
            nodes: newRouteNodes.map(n => n.join(',')).join(';'),
            color: '#00e5ff'
        };
        
        const success = await updateSheetData('map_routes', 'add', routeData);
        if (success) {
            alert('Маршрут сохранен');
            loadData();
            setIsDrawing(false);
            setNewRouteNodes([]);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('Удалить этот элемент?')) return;
        const sheet = type === 'point' ? 'map_points' : 'map_routes';
        const success = await updateSheetData(sheet, 'delete', { id });
        if (success) {
            alert('Удалено');
            loadData();
            setEditingItem(null);
        }
    };

    if (loading) return <div className="admin-loading">Загрузка данных карты...</div>;

    return (
        <div className="map-manager-refined">
            <div className="map-toolbar">
                <div className="tabs">
                    <button className={activeTab === 'points' ? 'active' : ''} onClick={() => { setActiveTab('points'); setEditingItem(null); setIsDrawing(false); }}>Точки</button>
                    <button className={activeTab === 'attractions' ? 'active' : ''} onClick={() => { setActiveTab('attractions'); setEditingItem(null); setIsDrawing(false); }}>Достопримечательности</button>
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
                </div>
            </div>

            <div className="map-editor-layout">
                <div className="admin-map-container">
                    <MapContainer center={[43.301918, 68.270459]} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapEvents />
                        <MapResizeManager />
                        
                        {!loading && points.filter(p => p.pos && !isNaN(p.pos[0]) && !isNaN(p.pos[1])).map(p => (
                            <Marker 
                                key={`point-${p.id || p.articleId || p.title}`} 
                                position={p.pos} 
                                icon={getAdminMarkerIcon(p.type, p.icon)}
                                eventHandlers={{ click: () => { setEditingItem(p); setActiveTab('points'); } }}
                            />
                        ))}

                        {!loading && routes.filter(r => r.nodes && r.nodes.length > 0).map(r => (
                            <Polyline key={`route-${r.id || r.title}`} positions={r.nodes} color={r.color} weight={5} opacity={0.7} />
                        ))}
                        {isDrawing && <Polyline positions={newRouteNodes} color="#ff3d00" weight={4} dashArray="5, 10" />}
                    </MapContainer>
                </div>

                <div className="map-sidebar-refined">
                    <div className="sidebar-header-box">
                        <h3>{activeTab === 'attractions' ? 'Синхронизация' : 'Управление'}</h3>
                        <p className="dim-text">{activeTab === 'attractions' ? 'Добавление объектов с сайта' : 'Список элементов на карте'}</p>
                    </div>

                    <div className="sidebar-body-scroll">
                        {activeTab === 'attractions' && (
                            <div className="articles-map-list">
                                {attractions.filter(a => a.coordinates?.lat && a.coordinates?.lng).map(attr => {
                                    const isOnMap = points.some(p => String(p.attractionId || p.articleId) === String(attr.id));
                                    return (
                                        <div key={attr.id} className={`art-map-item ${isOnMap ? 'on-map' : 'ready'}`}>
                                            <div className="art-img-wrap">
                                                <img src={attr.image || ''} alt="" />
                                                {isOnMap && <div className="on-map-badge">✓</div>}
                                            </div>
                                            <div className="art-info">
                                                <span className="art-title-text">{attr.name}</span>
                                                <small className="art-coords-text">{parseFloat(attr.coordinates.lat).toFixed(4)}, {parseFloat(attr.coordinates.lng).toFixed(4)}</small>
                                            </div>
                                            {!isOnMap && (
                                                <button className="btn-sync-action" title="Добавить на карту" onClick={() => syncAttractionToMap(attr)}>
                                                    <Icons.Plus />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="art-group-label warning">Без координат (добавь на листе Category):</div>
                                {attractions.filter(a => !a.coordinates?.lat || !a.coordinates?.lng).map(attr => (
                                    <div key={attr.id} className="art-map-item disabled">
                                        <div className="art-img-wrap grayscale">
                                            <img src={attr.image || ''} alt="" />
                                        </div>
                                        <div className="art-info">
                                            <span className="art-title-text">{attr.name}</span>
                                            <small className="error-text">Координаты не заданы</small>
                                        </div>
                                    </div>
                                ))}
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
                                            <span className="art-title-text">{p.title}</span>
                                            <small className="dim-text">{p.type}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {editingItem && (
                            <div className="item-edit-panel">
                                <div className="art-group-label">Редактирование маркера</div>
                                
                                <div className="form-group">
                                    <label className="label-mini-gold">Заголовок</label>
                                    <input 
                                        value={editingItem.title || ''} 
                                        onChange={e => setEditingItem({...editingItem, title: e.target.value})} 
                                        placeholder="Название..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label-mini-gold">Описание</label>
                                    <textarea 
                                        value={editingItem.desc || ''} 
                                        onChange={e => setEditingItem({...editingItem, desc: e.target.value})} 
                                        rows="4"
                                        placeholder="Инфо для туриста..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label-mini-gold">Иконка (PNG)</label>
                                    <IconUpload 
                                        value={editingItem.icon} 
                                        onChange={(url) => setEditingItem({...editingItem, icon: url})} 
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label-mini-gold">Тип</label>
                                    <select value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})}>
                                        <option value="sight">История</option>
                                        <option value="nature">Природа</option>
                                        <option value="hotel">Отель</option>
                                        <option value="city">Город</option>
                                    </select>
                                </div>

                                <div className="edit-actions">
                                    <button className="admin-save-btn" onClick={handleSavePoint}>Сохранить</button>
                                    <button className="admin-cancel-btn" onClick={() => setEditingItem(null)}>Отмена</button>
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
                .btn-delete-full { width: 100%; margin-top: 15px; background: #fff5f5; color: #e74c3c; border: 1px solid #ffeded; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default MapManager;
