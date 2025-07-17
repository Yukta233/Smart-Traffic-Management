// File: src/components/TrafficMap.jsx
import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';

let mapInstance = null; // ⛔ Avoid multiple initializations

const TrafficMap = ({ geoRoute = [], setSource, setDestination }) => {
  useEffect(() => {
    if (!mapInstance) {
      mapInstance = L.map('traffic-map').setView([28.6139, 77.2090], 12);

      const tomtomApiKey = 'D0V2Oifz5N4w2lDaXlrDjYVhVRKP9gJP';

      L.tileLayer(`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${tomtomApiKey}`, {
        maxZoom: 18,
        attribution: '&copy; TomTom'
      }).addTo(mapInstance);

      L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${tomtomApiKey}`, {
        maxZoom: 18,
        opacity: 1
      }).addTo(mapInstance);

      let clickCount = 0;
      mapInstance.on('click', (e) => {
        const coord = [e.latlng.lat, e.latlng.lng];

        if (clickCount % 2 === 0) {
          setSource(coord);
          L.marker(coord, { title: "Source" }).addTo(mapInstance);
        } else {
          setDestination(coord);
          L.marker(coord, { title: "Destination" }).addTo(mapInstance);
        }

        clickCount++;
      });
    }
  }, []);

  // Draw polyline route when geoRoute updates
  useEffect(() => {
    if (mapInstance && geoRoute.length > 1) {
      L.polyline(geoRoute, { color: 'blue', weight: 5 }).addTo(mapInstance);
      mapInstance.fitBounds(geoRoute);
    }
  }, [geoRoute]);

  return (
    <div id="traffic-map" style={{ height: '600px', width: '100%' }}></div>
  );
};

export default TrafficMap;
