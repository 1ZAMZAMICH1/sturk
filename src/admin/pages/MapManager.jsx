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
        const [pData, rData, aData] = await Promise.all([
            fetchSheetData('map_points'),
            fetchSheetData('map_routes'),
            fetchSheetData('attractions')
        ]);
        
        setAttractions(aData || []);
        
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

    // Синхронизация достопримечательности с картой
    const syncAttractionToMap = async (attr) => {
        const lat = attr.coordinates?.lat;
        const lng = attr.coordinates?.lng;
        if (!lat || !lng) {
            alert('У достопримечательности не указаны координаты! Добавь их во вкладке "Связи & Карта".');
            return;
        }
        
        const newPoint = {
            articleId: attr.id,
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
                    <button className={activeTab === 'attractions' ? 'active' : ''} onClick={() => { setActiveTab('attractions'); setIsDrawing(false); }}>Достопримечательности</button>
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
                    <MapContainer center={[43.3, 68.3]} zoom={11} style={{ height: '700px', width: '100%' }}>
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                        <MapEvents />
                        <MapResizeManager />
                        
                        {points.map(p => {
                            const markerIcon = p.icon 
                                ? L.icon({ iconUrl: p.icon, iconSize: [45, 45], iconAnchor: [22, 22] }) 
                                : new L.Icon.Default();

                            return (
                                <Marker key={p.id} position={p.pos} icon={markerIcon}>
                                    <Popup>
                                        <div className="map-popup-adm">
                                            <strong>{p.title}</strong>
                                            <p>{p.desc}</p>
                                            <div className="popup-acts">
                                                <button className="btn-edit" onClick={() => setEditingItem(p)}>Изменить</button>
                                                <button className="btn-delete" onClick={() => handleDelete('point', p.id)}>Удалить</button>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {routes.map(r => (
                            <Polyline key={r.id} positions={r.nodes} color={r.color || '#c5a059'} weight={5} opacity={0.7} />
                        ))}

                        {isDrawing && <Polyline positions={newRouteNodes} color="#ff3d00" weight={4} dashArray="5, 10" />}
                    </MapContainer>
                </div>

                <div className="map-sidebar-refined">
                    {activeTab === 'attractions' && (
                        <div className="articles-map-list">
                            <div className="sidebar-header-box">
                                <h3>Достопримечательности</h3>
                                <p className="dim-text">Синхронизация контента сайта с картой</p>
                            </div>
                            <div className="articles-scroll">
                                <div className="art-group-label">С координатами (можно добавить):</div>
                                {attractions.filter(a => a.coordinates?.lat && a.coordinates?.lng).map(attr => {
                                    const isOnMap = points.some(p => p.articleId === attr.id);
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

                                <div className="art-group-label warning">Без координат (добавь во вкладке "Связи & Карта"):</div>
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
                        </div>
                    )}

                    {activeTab === 'points' && !editingItem && (
                        <div className="points-list-view">
                            <h3>Точки на карте ({points.length})</h3>
                            <div className="points-scroll">
                                {points.map(p => (
                                    <div key={p.id} className="point-item-row" onClick={() => setEditingItem(p)}>
                                        <div className="point-icon-mini">
                                            {p.icon ? <img src={p.icon} alt="" /> : <Icons.Pin />}
                                        </div>
                                        <span>{p.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {editingItem && (
                        <div className="item-edit-panel">
                            <h3>Настройка маркера</h3>
                            <div className="form-group">
                                <label className="label-mini-gold">Заголовок</label>
                                <input value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
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
                            
                            <div className="form-group">
                                <label className="label-mini-gold">Координаты</label>
                                <div className="coords-display">{editingItem.pos.join(', ')}</div>
                            </div>
                            
                            <div className="edit-actions">
                                <button className="admin-save-btn" onClick={handleSavePoint}>Сохранить</button>
                                <button className="admin-cancel-btn" onClick={() => setEditingItem(null)}>Отмена</button>
                            </div>
                            {editingItem.id && (
                                <button className="btn-delete-full" onClick={() => handleDelete('point', editingItem.id)}>
                                    Удалить точку
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .admin-map-manager { background: #fff; padding: 24px; border-radius: 20px; color: #1a1a1a; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
                .map-toolbar { display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 2px solid #f8f1e5; padding-bottom: 16px; }
                .tabs button { padding: 12px 24px; border: none; background: transparent; cursor: pointer; font-weight: 700; color: #888; transition: 0.3s; font-size: 0.95rem; }
                .tabs button.active { color: #c59d5f; border-bottom: 4px solid #c59d5f; }
                
                .map-editor-layout { display: flex; gap: 24px; height: 700px; }
                .admin-map-container { flex: 1; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.12); border: 2px solid #fdfaf5; position: relative; }
                
                .map-sidebar-refined { width: 360px; background: #fff; border: 1px solid #eee; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .sidebar-header-box { padding: 20px; background: #fdfaf5; border-bottom: 1px solid #f0e6d6; }
                .sidebar-header-box h3 { margin: 0 0 4px 0; color: #4a3420; font-size: 1.2rem; }
                .dim-text { color: #998c7d; font-size: 0.85rem; }
                
                .articles-scroll { flex: 1; overflow-y: auto; padding: 16px; }
                .art-group-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #c59d5f; font-weight: 800; margin: 15px 0 10px; padding-left: 5px; }
                .art-group-label.warning { color: #d35400; margin-top: 30px; }
                
                .art-map-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 12px; background: #fff; margin-bottom: 12px; border: 1px solid #f0f0f0; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
                .art-map-item:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(197, 157, 95, 0.1); border-color: #c59d5f55; }
                
                .art-img-wrap { width: 50px; height: 50px; position: relative; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid #fff; }
                .art-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
                .art-img-wrap.grayscale { filter: grayscale(1); opacity: 0.7; }
                
                .on-map-badge { position: absolute; top: -2px; right: -2px; width: 18px; height: 18px; background: #27ae60; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid #fff; }
                
                .art-info { flex: 1; min-width: 0; }
                .art-title-text { display: block; font-weight: 700; font-size: 0.9rem; color: #2d1b0d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .art-coords-text { color: #c59d5f; font-weight: 500; font-size: 0.75rem; }
                .error-text { color: #e74c3c; font-size: 0.75rem; font-weight: 600; }
                
                .btn-sync-action { width: 36px; height: 36px; border-radius: 10px; border: none; background: #c59d5f; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 4px 10px rgba(197, 157, 95, 0.3); }
                .btn-sync-action:hover { background: #ad8a53; transform: rotate(90deg); }
                
                .icon-upload-wrap { margin: 20px 0; background: #fdfaf5; padding: 20px; border-radius: 12px; border: 1px dashed #c59d5f; }
                .icon-preview { width: 100px; height: 100px; margin: 0 auto 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .icon-preview img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }
                
                .coords-display { background: #fdfaf5; padding: 12px; border-radius: 10px; font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; color: #4a3420; border: 1px solid #f0e6d6; }
                .label-mini-gold { color: #c59d5f; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px; }
                
                .btn-delete-full { margin-top: auto; background: #fff5f5; color: #e74c3c; border: 1px solid #ffeded; padding: 14px; border-radius: 12px; cursor: pointer; font-weight: 700; transition: 0.3s; }
                .btn-delete-full:hover { background: #e74c3c; color: #fff; }
                
                .admin-save-btn { background: #c59d5f; color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
                .admin-cancel-btn { background: #f5f5f5; color: #666; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default MapManager;
