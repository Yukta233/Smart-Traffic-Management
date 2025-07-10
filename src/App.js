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

class MaxHeap {
  constructor() {
    this.heap = [];
  }

  insert(key, value) {
    this.heap.push({ key, value });
    this.bubbleUp();
  }

  bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let element = this.heap[index];
      let parentIndex = Math.floor((index - 1) / 2);
      let parent = this.heap[parentIndex];
      if (element.value <= parent.value) break;
      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  extractMax() {
    const max = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.sinkDown(0);
    }
    return max.key;
  }

  sinkDown(index) {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let swap = null;

      if (left < length && this.heap[left].value > element.value) swap = left;
      if (
        right < length &&
        this.heap[right].value > (swap === null ? element.value : this.heap[left].value)
      )
        swap = right;

      if (swap === null) break;

      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
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

// Helper to generate a car object (could be extended with more info)
let carIdCounter = 1;
function createCar() {
  return { id: carIdCounter++, arrivedAt: Date.now() };
}

// Initial queues: each direction has an array of car objects
const initialQueues = {
  north: [createCar(), createCar()],
  south: [createCar(), createCar(), createCar(), createCar(), createCar()],
  east: [createCar()],
  west: [createCar(), createCar(), createCar()],
};

function App() {
  const [trafficQueues, setTrafficQueues] = useState(initialQueues);
  const [green, setGreen] = useState('north');
  const [cleared, setCleared] = useState({ north: 0, south: 0, east: 0, west: 0 });
  const [tick, setTick] = useState(0);
  const [signalChanges, setSignalChanges] = useState(0);
  const [shortestPath, setShortestPath] = useState([]);
  const [startDir, setStartDir] = useState('north');
  const [endDir, setEndDir] = useState('south');
  const [showPath, setShowPath] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficQueues((prevQueues) => {
        // Find the direction with the largest queue
        const heap = new MaxHeap();
        Object.entries(prevQueues).forEach(([dir, queue]) => heap.insert(dir, queue.length));
        const maxDir = heap.extractMax();
        setGreen(maxDir);
        setSignalChanges((prevSignal) => prevSignal + 1);

        // Remove up to 2 cars from the green direction (FIFO)
        const updatedQueues = { ...prevQueues };
        const carsToClear = Math.min(2, updatedQueues[maxDir].length);
        updatedQueues[maxDir] = updatedQueues[maxDir].slice(carsToClear);

        // Update cleared count
        setCleared((prevCleared) => ({
          ...prevCleared,
          [maxDir]: prevCleared[maxDir] + carsToClear,
        }));

        // For other directions, add a new car (simulate arrival)
        Object.keys(updatedQueues).forEach((dir) => {
          if (dir !== maxDir) {
            updatedQueues[dir] = [...updatedQueues[dir], createCar()];
          }
        });

        setTick((prevTick) => prevTick + 1);
        return updatedQueues;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShortestPath(dijkstra(roadGraph, startDir, endDir));
  }, [trafficQueues, startDir, endDir]);

  // For chart and UI, get the queue lengths
  const traffic = Object.fromEntries(
    Object.entries(trafficQueues).map(([dir, queue]) => [dir, queue.length])
  );

  const chartData = {
    labels: Object.keys(traffic).map((dir) => dir.toUpperCase()),
    datasets: [
      {
        label: 'Number of Cars',
        data: Object.values(traffic),
        backgroundColor: Object.keys(traffic).map((dir) =>
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
            {Object.entries(traffic).map(([dir, cars]) => (
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
                <p>Cars: {cars}</p>
                <p>{green === dir ? 'GO' : 'WAIT'}</p>
                {/* Optionally, show car IDs for debugging */}
                {/* <div style={{ fontSize: '10px', color: '#ccc' }}>
                  {trafficQueues[dir].map(car => car.id).join(', ')}
                </div> */}
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
              <select
                value={startDir}
                onChange={e => setStartDir(e.target.value)}
                style={{
                  padding: '10px 14px',
                  margin: '0 10px',
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                {Object.keys(traffic).map(dir => <option key={dir}>{dir}</option>)}
              </select>

              <select
                value={endDir}
                onChange={e => setEndDir(e.target.value)}
                style={{
                  padding: '10px 14px',
                  margin: '0 10px',
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
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
