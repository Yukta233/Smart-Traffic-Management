import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';

const TrafficMap = () => {
  useEffect(() => {
    const map = L.map('traffic-map').setView([28.6139, 77.2090], 12); // Delhi

    const tomtomApiKey = 'D0V2Oifz5N4w2lDaXlrDjYVhVRKP9gJP'; // Replace with your real TomTom API key

    // TomTom Map Tile Layer
    L.tileLayer(`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${tomtomApiKey}`, {
      maxZoom: 18,
      attribution: '&copy; TomTom'
    }).addTo(map);

    // TomTom Traffic Layer (LIVE)
    L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${tomtomApiKey}`, {
      maxZoom: 18,
      opacity: 1,
    }).addTo(map);

    return () => map.remove(); // Cleanup
  }, []);

  return (
    <div id="traffic-map" style={{ height: '600px', width: '100%' }}></div>
  );
};

export default TrafficMap;
