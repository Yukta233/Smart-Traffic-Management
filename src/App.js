// File: App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { Bar } from 'react-chartjs-2';
import TrafficBackground from './TrafficBackground';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Queue class
class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(element) {
    this.items.push(element);
  }
  dequeue() {
    return this.items.shift();
  }
  front() {
    return this.items[0];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  size() {
    return this.items.length;
  }
}

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

function App() {
  const [traffic, setTraffic] = useState({ north: new Queue(), south: new Queue(), east: new Queue(), west: new Queue() });
  const [green, setGreen] = useState('north');
  const [cleared, setCleared] = useState({ north: 0, south: 0, east: 0, west: 0 });
  const [tick, setTick] = useState(0);
  const [signalChanges, setSignalChanges] = useState(0);
  const [shortestPath, setShortestPath] = useState([]);
  const [startDir, setStartDir] = useState('north');
  const [endDir, setEndDir] = useState('south');
  const [showPath, setShowPath] = useState(false);

  // Populate initial traffic queues
  useEffect(() => {
    const initTraffic = { north: new Queue(), south: new Queue(), east: new Queue(), west: new Queue() };
    Object.keys(initTraffic).forEach(dir => {
      for (let i = 0; i < Math.floor(Math.random() * 5 + 2); i++) {
        initTraffic[dir].enqueue(`car-${dir}-${i}`);
      }
    });
    setTraffic(initTraffic);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic(prev => {
        const maxQueue = Object.entries(prev).reduce((max, [dir, queue]) =>
          queue.size() > max.size ? { dir, size: queue.size() } : max,
        { dir: null, size: -1 });

        const updated = { ...prev };
        const updatedCleared = { ...cleared };

        if (maxQueue.dir) {
          setGreen(maxQueue.dir);
          setSignalChanges(prevSignal => prevSignal + 1);

          // Remove two cars if available
          for (let i = 0; i < 2; i++) {
            if (!updated[maxQueue.dir].isEmpty()) {
              updated[maxQueue.dir].dequeue();
              updatedCleared[maxQueue.dir]++;
            }
          }

          // Add one car to other queues
          Object.keys(prev).forEach(dir => {
            if (dir !== maxQueue.dir) {
              updated[dir].enqueue(`car-${dir}-${Date.now()}`);
            }
          });

          setCleared(updatedCleared);
          setTick(prevTick => prevTick + 1);
        }
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [cleared]);

  useEffect(() => {
    setShortestPath(dijkstra(roadGraph, startDir, endDir));
  }, [traffic, startDir, endDir]);

  const chartData = {
    labels: Object.keys(traffic).map(dir => dir.toUpperCase()),
    datasets: [
      {
        label: 'Number of Cars',
        data: Object.values(traffic).map(q => q.size()),
        backgroundColor: Object.keys(traffic).map(dir =>
          green === dir ? 'rgba(0, 200, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="app-container">
      <TrafficBackground />
      <div className="content-container">
        <h1 style={{ textAlign: 'center', marginTop: '20px', color: 'black' }}>Smart Traffic Management</h1>
        <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
          Real-time traffic simulation and algorithm-based signal control
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.entries(traffic).map(([dir, queue]) => (
              <div
                key={dir}
                className={`road ${green === dir ? 'green' : 'red'}`}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  backgroundColor: green === dir ? 'rgba(0, 150, 0, 0.3)' : 'rgba(150, 0, 0, 0.3)',
                  backdropFilter: 'blur(5px)',
                  border: `1px solid ${green === dir ? '#0f0' : '#f00'}`,
                  color: '#fff'
                }}
              >
                <h2>{dir.toUpperCase()}</h2>
                <p>Cars: {queue.size()}</p>
                <p>{green === dir ? 'GO' : 'WAIT'}</p>
              </div>
            ))}
          </div>
          <div>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={() => setShowPath(!showPath)}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #ff4d4d)',
              color: 'white',
              padding: '14px 28px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            🚦 Shortest Path Finder
          </button>
          {showPath && (
            <div style={{ marginTop: '20px', color: 'black' }}>
              <select value={startDir} onChange={e => setStartDir(e.target.value)}>
                {Object.keys(traffic).map(dir => <option key={dir}>{dir}</option>)}
              </select>
              <select value={endDir} onChange={e => setEndDir(e.target.value)}>
                {Object.keys(traffic).map(dir => <option key={dir}>{dir}</option>)}
              </select>
              <p><strong>Path:</strong> {shortestPath.join(' → ')}</p>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h2 style={{ color: 'black' }}>Performance Metrics</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {Object.entries(cleared).map(([dir, count]) => (
              <div
                key={dir}
                className="metric-box"
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${green === dir ? '#0f0' : '#f00'}`,
                  borderRadius: '8px',
                  minWidth: '120px',
                  background: 'rgba(30, 30, 40, 0.7)',
                  backdropFilter: 'blur(5px)',
                  color: '#fff'
                }}
              >
                <h3>{dir.toUpperCase()}</h3>
                <p><strong>Cleared Cars:</strong> {count}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'black' }}>
            Total Simulation Time: {tick * 3} sec | Signal Changes: {signalChanges}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
