// ✅ Updated App.js with Geolocation-Based Route, Dynamic Emergency Detection, and Full UI
import React, { useState, useEffect } from 'react';
import './App.css';
import { Bar } from 'react-chartjs-2';
import TrafficBackground from './TrafficBackground';
import TrafficChart from './components/TrafficChart';
import SpeedGauge from './components/SpeedGauge';
import TrafficMap from './components/TrafficMap';
import CongestionModal from './components/CongestionModal';
import { generateCongestionForecast } from './components/congestionPrediction';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const roadGraph = {
  north: [{ node: 'east', weight: 2 }, { node: 'west', weight: 3 }],
  south: [{ node: 'west', weight: 1 }, { node: 'east', weight: 4 }],
  east: [{ node: 'north', weight: 2 }],
  west: [{ node: 'south', weight: 3 }],
};

function dijkstra(graph, start, end) {
  const distances = {};
  const previous = {};
  const queue = new Set(Object.keys(graph));

  for (const node of queue) {
    distances[node] = node === start ? 0 : Infinity;
    previous[node] = null;
  }

  while (queue.size > 0) {
    const current = [...queue].reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );
    queue.delete(current);
    if (current === end) break;
    for (const neighbor of graph[current]) {
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = current;
      }
    }
  }

  const path = [];
  let u = end;
  while (previous[u]) {
    path.unshift(u);
    u = previous[u];
  }
  if (distances[end] !== Infinity) path.unshift(start);
  return path;
}

const geocodeLocation = async (placeName) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`);
  const data = await response.json();
  if (data && data.length > 0) {
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  } else {
    throw new Error("Location not found: " + placeName);
  }
};

function App() {
  const [signalStatus, setSignalStatus] = useState({});
  const [shortestPath, setShortestPath] = useState([]);
  const [startDir, setStartDir] = useState('north');
  const [endDir, setEndDir] = useState('south');
  const [showPath, setShowPath] = useState(false);
  const [speed, setSpeed] = useState(24);
  const [congestionLevel, setCongestionLevel] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [geoRoute, setGeoRoute] = useState([]);
  const [currentGreen, setCurrentGreen] = useState('North');
  const [countdown, setCountdown] = useState(30);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [emergencyDirection, setEmergencyDirection] = useState(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [trafficData, setTrafficData] = useState({
    North: 5,
    South: 3,
    East: 2,
    West: 4,
  });
  const [signalState, setSignalState] = useState({
    North: 'red',
    South: 'red',
    East: 'red',
    West: 'red',
  });

  const handleGetRoute = async () => {
    try {
      const srcCoords = await geocodeLocation(source);
      const destCoords = await geocodeLocation(destination);
      setGeoRoute([srcCoords, destCoords]);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleEmergencyMode = async () => {
    const newMode = !emergencyMode;
    setEmergencyMode(newMode);

    if (newMode) {
      const directions = ['North', 'South', 'East', 'West'];
      const selectedDirection = directions[Math.floor(Math.random() * directions.length)];
      setEmergencyDirection(selectedDirection);

      const response = await fetch('http://localhost:5000/api/optimize-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traffic: trafficData,
          emergency_dirs: [selectedDirection],
        }),
      });

      const data = await response.json();
      const green = data.green_signal;

      const newSignalState = {};
      ['North', 'South', 'East', 'West'].forEach(dir => {
        newSignalState[dir] = dir === green ? 'green' : 'red';
      });

      setSignalState(newSignalState);
      setCurrentGreen(green);
      alert(`🚨 Emergency vehicle detected in ${selectedDirection}. Priority green signal granted.`);
    } else {
      setEmergencyDirection(null);
    }
  };

  useEffect(() => {
    const fetchSpeed = () => {
      fetch("http://localhost:5000/api/traffic-speed")
        .then(res => res.json())
        .then(data => {
          if (data?.currentSpeed) setSpeed(data.currentSpeed);
        })
        .catch(err => console.error("Failed to fetch speed", err));
    };

    fetchSpeed();
    const interval = setInterval(fetchSpeed, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSignalStatus = () => {
      fetch("http://localhost:5000/api/signal-status")
        .then(res => res.json())
        .then(data => {
          setSignalStatus(data);
          const maxDir = Object.entries(data).reduce((a, b) => a[1].vehicles > b[1].vehicles ? a : b)[0];

          const newState = {};
          ['North', 'South', 'East', 'West'].forEach(dir => {
            newState[dir] = dir === maxDir ? 'green' : 'red';
          });

          setSignalState(newState);
          setCurrentGreen(maxDir);
        })
        .catch(err => console.error("Failed to fetch signal status", err));
    };

    fetchSignalStatus();
    const interval = setInterval(fetchSignalStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const path = dijkstra(roadGraph, startDir, endDir);
    setShortestPath(path);
    const totalVehicles = path.reduce((sum, node) => sum + (signalStatus[node]?.vehicles || 0), 0);
    if (totalVehicles < 60) setCongestionLevel('Low');
    else if (totalVehicles < 120) setCongestionLevel('Medium');
    else setCongestionLevel('High');
  }, [signalStatus, startDir, endDir]);
   //Queue 
   
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) return prev - 1;
        setSignalState(prevState => {
          const updated = { ...prevState };
          if (updated[currentGreen] === 'green') {
            updated[currentGreen] = 'yellow';
            setCountdown(5);
          } else if (updated[currentGreen] === 'yellow') {
            updated[currentGreen] = 'red';
            const dirs = ['North', 'South', 'East', 'West'];
            const currentIdx = dirs.indexOf(currentGreen);
            const nextGreen = dirs[(currentIdx + 1) % dirs.length];
            updated[nextGreen] = 'green';
            setCurrentGreen(nextGreen);
            setCountdown(30);
          }
          return updated;
        });
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentGreen]);

  const chartData = {
    labels: Object.keys(signalStatus).map(dir => dir.toUpperCase()),
    datasets: [{
      label: 'Number of Cars',
      data: Object.values(signalStatus).map(q => q.vehicles),
      backgroundColor: Object.keys(signalStatus).map(dir => {
        const signal = signalState[dir];
        return signal === 'green' ? 'rgba(0, 200, 0, 0.6)' :
               signal === 'yellow' ? 'rgba(255, 200, 0, 0.6)' :
               'rgba(255, 0, 0, 0.6)';
      }),
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  return (
  <div className="app-container">
    <TrafficBackground />
    <div className="content-container">
      <h1 style={{ textAlign: 'center', marginTop: '20px', color: 'black' }}>Smart Traffic Management</h1>
      <p style={{ textAlign: 'center', color: '#555', margin: '10px 0', fontSize: '16px' }}>
        Our system optimizes traffic flow by dynamically adjusting signals based on real-time data. 
        Experience reduced congestion and improved travel times with our intelligent traffic solutions.
      </p>

      <h2 style={{color: 'black'}}>Delhi Real-Time Traffic Map</h2>
      <TrafficMap geoRoute={geoRoute} setSource={setSource} setDestination={setDestination} />

      <div style={{ margin: '30px auto', maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{color: 'crimson'}}>📍 Route Finder</h2>
        <p style={{color: '	#3c3c3c'}}>The Route Finder intelligently calculates the fastest and least congested path between two points in the city. </p>
        <input type="text" placeholder="Enter Source (e.g., Connaught Place)" value={source} onChange={(e) => setSource(e.target.value)} style={{ padding: '10px', width: '80%', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <br />
        <input type="text" placeholder="Enter Destination (e.g., AIIMS Delhi)" value={destination} onChange={(e) => setDestination(e.target.value)} style={{ padding: '10px', width: '80%', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <br />
        <button onClick={handleGetRoute} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Get Shortest Route</button>
        <p><strong>Route Congestion:</strong> {congestionLevel}</p>
      </div>

      <TrafficChart />

      {/* Enhanced Prediction Container Box */}
      <div style={{
        background: 'linear-gradient(to right, #e0eafc, #cfdef3)',
        borderRadius: '12px',
        padding: '20px',
        margin: '20px auto',
        maxWidth: '600px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
          A future prediction model in traffic management uses a combination of historical data, real-time inputs, and algorithms (like Max Heap or time-series analysis) to estimate how congestion will evolve in the next few minutes or hours.
          <p>Click here to see it</p>
        </p>
        <button className="prediction-btn" onClick={() => setShowForecastModal(true)} style={{
          background: 'linear-gradient(to right, #6a11cb, #2575fc)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
          transition: '0.3s ease'
        }}>
          🔮 Show Future Prediction
        </button>
      </div>

      <SpeedGauge speed={speed} />

      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
        <button onClick={toggleEmergencyMode} style={{
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 28px',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: '0.3s ease'
        }}>
          <span style={{ marginRight: '10px' }}>🚨</span>
          {emergencyMode ? 'Emergency Mode ON' : 'Enable Emergency Mode'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {['North', 'South', 'East', 'West'].map((dir) => (
            <div key={dir} className={`road ${signalState[dir]}`} style={{
              padding: '10px',
              borderRadius: '10px',
              textAlign: 'center',
              backgroundColor: signalState[dir] === 'green' ? 'rgba(0, 150, 0, 0.3)' :
                signalState[dir] === 'yellow' ? 'rgba(200, 150, 0, 0.3)' : 'rgba(150, 0, 0, 0.3)',
              border: `2px solid ${signalState[dir] === 'green' ? 'green' : signalState[dir] === 'yellow' ? 'orange' : 'red'}`,
              color: '#fff'
            }}>
              <h2>{dir.toUpperCase()}</h2>
              <p>Signal: <strong>{signalState[dir]?.toUpperCase()}</strong></p>
              <p>Vehicles: {signalStatus[dir]?.vehicles ?? 0}</p>
              {currentGreen === dir && signalState[dir] === 'green' && (
                <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#00ffcc' }}>
                  ⏱ Green → {countdown}s
                </p>
              )}
              {currentGreen === dir && signalState[dir] === 'yellow' && (
                <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'orange' }}>
                  ⏳ Yellow Signal Active
                </p>
              )}
            </div>
          ))}
        </div>

        <div>
          <Bar data={chartData} options={chartOptions} />

          {/* Forecast Modal Component */}
          <CongestionModal
            show={showForecastModal}
            onClose={() => setShowForecastModal(false)}
            liveData={signalStatus}
          />
        </div>
      </div>
    </div>
  </div>
);
}

export default App;
