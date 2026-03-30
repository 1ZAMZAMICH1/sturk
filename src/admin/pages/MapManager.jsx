import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { fetchSheetData, updateSheetData } from '../../services/api';
import 'leaflet/dist/leaflet.css';

// Фикс иконок для Leaflet в React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapResizeManager = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }, [map]);
    return null;
};

const MapManager = () => {
    const [points, setPoints] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('points');
    const [editingItem, setEditingItem] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newRouteNodes, setNewRouteNodes] = useState([]);
    const [snapToRoads, setSnapToRoads] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const pData = await fetchSheetData('map_points');
        const rData = await fetchSheetData('map_routes');
        
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
    };

    useEffect(() => {
        loadData();
    }, []);

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
        const action = editingItem.id ? 'update' : 'add';
        const payload = {
            ...editingItem,
            pos: editingItem.pos.join(','),
            icon: editingItem.icon || ''
        };
        
        const success = await updateSheetData('map_points', action, payload);
        if (success) {
            alert('Точка сохранена');
            loadData();
            setEditingItem(null);
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
        const success = await updateSheetData(type === 'point' ? 'map_points' : 'map_routes', 'delete', { id });
        if (success) {
            loadData();
        }
    };

    if (loading) return <div className="admin-loading">Загрузка данных из Google Sheets...</div>;

    return (
        <div className="admin-map-manager">
            <div className="map-toolbar">
                <div className="tabs">
                    <button className={activeTab === 'points' ? 'active' : ''} onClick={() => { setActiveTab('points'); setIsDrawing(false); }}>Точки</button>
                    <button className={activeTab === 'routes' ? 'active' : ''} onClick={() => setActiveTab('routes')}>Маршруты</button>
                </div>
                
                {activeTab === 'routes' && (
                    <div className="route-controls">
                        {!isDrawing ? (
                            <button className="admin-add-btn" onClick={() => setIsDrawing(true)}>Начать рисовать</button>
                        ) : (
                            <>
                                <button className="admin-save-btn" onClick={handleSaveRoute}>Сохранить ({newRouteNodes.length} точ.)</button>
                                <button className="admin-cancel-btn" onClick={() => { setIsDrawing(false); setNewRouteNodes([]); }}>Отмена</button>
                                <label className="snap-toggle">
                                    <input type="checkbox" checked={snapToRoads} onChange={e => setSnapToRoads(e.target.checked)} />
                                    По дорогам
                                </label>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="map-editor-layout">
                <div className="admin-map-container">
                    <MapContainer center={[43.3, 68.3]} zoom={11} style={{ height: '600px', width: '100%' }}>
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                        <MapEvents />
                        <MapResizeManager />
                        
                        {points.map(p => {
                            const markerIcon = p.icon 
                                ? L.icon({ iconUrl: p.icon, iconSize: [40, 40], iconAnchor: [20, 20] }) 
                                : new L.Icon.Default();

                            return (
                                <Marker key={p.id} position={p.pos} icon={markerIcon}>
                                    <Popup>
                                        <strong>{p.title}</strong><br/>
                                        {p.desc}<br/>
                                        <button onClick={() => setEditingItem(p)}>Изменить</button>
                                        <button onClick={() => handleDelete('point', p.id)} style={{color:'red', marginLeft: '5px'}}>Удалить</button>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {routes.map(r => (
                            <Polyline key={r.id} positions={r.nodes} color={r.color || '#00e5ff'} weight={5} opacity={0.7} />
                        ))}

                        {isDrawing && <Polyline positions={newRouteNodes} color="#ff3d00" weight={4} dashArray="5, 10" />}
                    </MapContainer>
                    <p className="map-hint">
                        {activeTab === 'points' ? 'Кликни по карте, чтобы добавить маркер' : 'Включи режим рисования и кликай по карте, чтобы строить путь'}
                    </p>
                </div>

                {editingItem && (
                    <div className="map-edit-sidebar">
                        <h3>{editingItem.id ? 'Редактировать точку' : 'Новая точка'}</h3>
                        <div className="form-group">
                            <label>Название</label>
                            <input value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Описание</label>
                            <textarea value={editingItem.desc} onChange={e => setEditingItem({...editingItem, desc: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Ссылка на иконку (URL)</label>
                            <input value={editingItem.icon || ''} placeholder="https://example.com/icon.png" onChange={e => setEditingItem({...editingItem, icon: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Тип</label>
                            <select value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})}>
                                <option value="sight">История</option>
                                <option value="nature">Природа</option>
                                <option value="hotel">Отель</option>
                                <option value="city">Город</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Координаты</label>
                            <input value={editingItem.pos.join(', ')} readOnly />
                        </div>
                        <div className="edit-actions">
                            <button className="admin-save-btn" onClick={handleSavePoint}>Сохранить</button>
                            <button className="admin-cancel-btn" onClick={() => setEditingItem(null)}>Отмена</button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .admin-map-manager { background: #fff; padding: 20px; border-radius: 12px; color: #333; }
                .map-toolbar { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .tabs button { padding: 10px 20px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer; }
                .tabs button.active { background: #c5a059; color: #fff; border-color: #c5a059; }
                .route-controls { display: flex; align-items: center; gap: 15px; }
                .snap-toggle { display: flex; align-items: center; gap: 5px; font-size: 0.9rem; cursor: pointer; }
                .map-editor-layout { display: flex; gap: 20px; }
                .admin-map-container { flex: 1; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
                .map-edit-sidebar { width: 300px; padding: 20px; background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
                .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
                .edit-actions { display: flex; gap: 10px; margin-top: 20px; }
                .map-hint { margin-top: 10px; color: #666; font-style: italic; font-size: 0.9rem; }
            `}</style>
        </div>
    );
};

export default MapManager;
