import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KmlElement } from '../utils/KmlParser';

interface MapViewProps {
  kmlElements: KmlElement[];
}

const MapView = ({ kmlElements }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }
    
    mapInstanceRef.current.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.TileLayer) return;
      layer.remove();
    });
    
    if (kmlElements.length === 0) return;
    
    const bounds = L.latLngBounds([]);
    
    kmlElements.forEach((element) => {
      const { type, coordinates } = element;
      
      const latLngs = coordinates.map(([lon, lat]) => L.latLng(lat, lon));
      
      latLngs.forEach(latLng => bounds.extend(latLng));
      
      let layer: L.Layer;
      
      switch (type) {
        case 'Point':
          layer = L.marker(latLngs[0]);
          break;
        
        case 'LineString':
        case 'MultiLineString':
          layer = L.polyline(latLngs, { color: 'blue' });
          break;
        
        case 'Polygon':
          layer = L.polygon(latLngs, { color: 'green' });
          break;
        
        default:
          return;
      }
      
      const popupContent = `
        <div>
          <h3>${element.name || type}</h3>
          ${element.description ? `<p>${element.description}</p>` : ''}
          ${element.length ? `<p>Length: ${element.length.toFixed(2)} km</p>` : ''}
        </div>
      `;
      
      layer.bindPopup(popupContent);
      layer.addTo(mapInstanceRef.current!);
    });
    
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [kmlElements]);
  
  return (
    <div className="map-container">
      <div ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
};

export default MapView;