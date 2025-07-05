import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Bar } from 'react-chartjs-2';
import * as THREE from 'three';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// MaxHeap class for priority signal
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

// Graph for shortest path
const roadGraph = {
  north: [{ node: 'east', weight: 2 }, { node: 'west', weight: 3 }],
  south: [{ node: 'west', weight: 1 }, { node: 'east', weight: 4 }],
  east: [{ node: 'north', weight: 2 }],
  west: [{ node: 'south', weight: 3 }]
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
  const bgRef = useRef(null);
  const [traffic, setTraffic] = useState({ north: 2, south: 5, east: 1, west: 3 });
  const [green, setGreen] = useState('north');
  const [cleared, setCleared] = useState({ north: 0, south: 0, east: 0, west: 0 });
  const [tick, setTick] = useState(0);
  const [signalChanges, setSignalChanges] = useState(0);

  const [shortestPath, setShortestPath] = useState([]);
  const [startDir, setStartDir] = useState('north');
  const [endDir, setEndDir] = useState('south');
  const [showPath, setShowPath] = useState(false);


  // Robust Three.js Animated Background
useEffect(() => {
  // Variables we'll need for cleanup
  let scene, camera, renderer, particles, frameId;

  // Initialize Three.js
  const initThreeJS = () => {
    // Get the container
    const container = bgRef.current;
    if (!container) return;

    // Clear any existing canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // 1. Create scene
    scene = new THREE.Scene();

    // 2. Create camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    // 3. Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // 4. Create particles
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Positions
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Colors
      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation loop
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Rotate particles
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;
      
      // Update positions for wave-like motion
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      }
      geometry.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  };

  // Start the animation
  const cleanup = initThreeJS();

  // Return cleanup function
  return () => {
    if (cleanup) cleanup();
  };
}, []);

  // Traffic logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic((prev) => {
        const heap = new MaxHeap();
        Object.entries(prev).forEach(([dir, val]) => heap.insert(dir, val));
        const maxDir = heap.extractMax();
        setGreen(maxDir);
        setSignalChanges((prevSignal) => prevSignal + 1);

        const updated = { ...prev };
        const updatedCleared = { ...cleared };
        const clearedCars = Math.min(2, prev[maxDir]);
        updated[maxDir] = Math.max(prev[maxDir] - 2, 0);
        updatedCleared[maxDir] += clearedCars;

        Object.keys(prev).forEach((dir) => {
          if (dir !== maxDir) updated[dir] += 1;
        });

        setCleared(updatedCleared);
        setTick((prevTick) => prevTick + 1);
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
    // Only run once on mount
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setShortestPath(dijkstra(roadGraph, startDir, endDir));
  }, [traffic, startDir, endDir]);

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
    <div>
      <div
        ref={bgRef}
        style={{
          position: 'fixed',
          zIndex: -1,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      ></div>
      <div className="container">
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Smart Traffic Management</h1>
        <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Real-time traffic simulation and algorithm-based signal control
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            {Object.entries(traffic).map(([dir, cars]) => (
              <div
                key={dir}
                className={`road ${green === dir ? 'green' : 'red'}`}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  backgroundColor: green === dir ? '#c8facc' : '#fdb8b8',
                }}
              >
                <h2>{dir.toUpperCase()}</h2>
                <p>Cars: {cars}</p>
                <p>{green === dir ? 'GO' : 'WAIT'}</p>
              </div>
            ))}
          </div>
          <div>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Path finder */}
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
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.4s ease-in-out',
            }}
            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.target.style.transform = 'scale(1)'}
          >
            🚦 Shortest Path Finder
          </button>

          {showPath && (
            <div style={{ marginTop: '20px' }}>
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

        {/* Performance */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h2>Performance Metrics</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {Object.entries(cleared).map(([dir, count]) => (
              <div
                key={dir}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #888',
                  borderRadius: '8px',
                  minWidth: '120px',
                  backgroundColor: '#f2f2f2',
                }}
              >
                <h3>{dir.toUpperCase()}</h3>
                <p><strong>Cleared Cars:</strong> {count}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
            Total Simulation Time: {tick * 3} sec | Signal Changes: {signalChanges}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
