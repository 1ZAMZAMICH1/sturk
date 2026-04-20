import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
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
    const validLat = !isNaN(parseFloat(lat)) && lat !== 0 ? parseFloat(lat) : 43.3013;
    const validLng = !isNaN(parseFloat(lng)) && lng !== 0 ? parseFloat(lng) : 68.2704;
    const position = [validLat, validLng];

    return (
        <div className="map-widget-container" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <MapContainer 
                key={`${validLat}-${validLng}`} 
                center={position} 
                zoom={14} 
                style={{ 
                    height: '100%', 
                    width: '100%',
                    filter: 'sepia(0.3) brightness(0.9) contrast(1.1) saturate(1.2)'
                }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                />
                <Marker position={position} />
                <RecenterMap lat={validLat} lng={validLng} />
            </MapContainer>
            
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(200, 168, 75, 0.05), rgba(0, 0, 0, 0.2))',
                pointerEvents: 'none',
                zIndex: 400
            }} />
            
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                zIndex: 401
            }} />
        </div>
    );
};

export const ExternalMapLinks = ({ lat, lng }) => {
    const { t } = useTranslation();
    const validLat = parseFloat(lat) || 43.3013;
    const validLng = parseFloat(lng) || 68.2704;

    const mapLinks = [
        { name: t('maps.google'), url: `https://www.google.com/maps/search/?api=1&query=${validLat},${validLng}` },
        { name: t('maps.yandex'), url: `https://yandex.ru/maps/?pt=${validLng},${validLat}&z=16&l=map` },
        { name: t('maps.2gis'), url: `https://2gis.kz/search/${validLat},${validLng}` }
    ];

    return (
        <div className="map-external-links" style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            marginTop: '12px' 
        }}>
            {mapLinks.map(link => (
                <a 
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        flex: '1',
                        minWidth: '90px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 8px',
                        background: 'rgba(200, 168, 75, 0.1)',
                        border: '1px solid rgba(200, 168, 75, 0.3)',
                        borderRadius: '8px',
                        color: '#c8a84b',
                        fontSize: '0.7rem',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(200, 168, 75, 0.2)';
                        e.currentTarget.style.borderColor = '#c8a84b';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(200, 168, 75, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(200, 168, 75, 0.3)';
                    }}
                >
                    {link.name}
                </a>
            ))}
        </div>
    );
};

export default LeafletMapWidget;
