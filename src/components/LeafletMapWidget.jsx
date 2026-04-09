import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    React.useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 14);
            // Многократный пересчет для надежности в модалках и при медленном рендере
            const timer1 = setTimeout(() => map.invalidateSize(), 100);
            const timer2 = setTimeout(() => map.invalidateSize(), 500);
            const timer3 = setTimeout(() => map.invalidateSize(), 1500);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [lat, lng, map]);
    return null;
};

const LeafletMapWidget = ({ lat, lng, title }) => {
    // Если координаты явно битые, ставим центр Туркестана
    const validLat = !isNaN(parseFloat(lat)) && lat !== 0 ? parseFloat(lat) : 43.3013;
    const validLng = !isNaN(parseFloat(lng)) && lng !== 0 ? parseFloat(lng) : 68.2704;
    const position = [validLat, validLng];

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: '180px' }}>
            <MapContainer 
                key={`${validLat}-${validLng}`} // Форсируем пересоздание карты при смене места
                center={position} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
                <RecenterMap lat={validLat} lng={validLng} />
            </MapContainer>
        </div>
    );
};

export default LeafletMapWidget;
