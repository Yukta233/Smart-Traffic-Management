import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';

const TrafficMap = () => {
  useEffect(() => {
    const map = L.map('traffic-map').setView([28.6139, 77.2090], 12); // Delhi center

    // Replace with your actual MapmyIndia API key
    const apiKey = '0bc6977840143e9057a91de2e6b42e47';

    // Base Map
    L.tileLayer(`https://apis.mapmyindia.com/advancedmaps/v1/${apiKey}/map/{z}/{x}/{y}.png`, {
      maxZoom: 18,
      attribution: '&copy; MapmyIndia'
    }).addTo(map);

    // Traffic Overlay
    L.tileLayer(`https://apis.mapmyindia.com/advancedmaps/v1/${apiKey}/traffic_tile/{z}/{x}/{y}.png`, {
      maxZoom: 18,
      opacity: 0.6
    }).addTo(map);

    return () => map.remove();
  }, []);

  return <div id="traffic-map" style={{ height: '600px', width: '100%' }}></div>;
};

export default TrafficMap;
