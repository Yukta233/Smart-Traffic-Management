import React, { useState, useEffect } from 'react';
import './App.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Max Heap for traffic prioritization
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
      let leftIndex = 2 * index + 1;
      let rightIndex = 2 * index + 2;
      let swap = null;

      if (leftIndex < length && this.heap[leftIndex].value > element.value) {
        swap = leftIndex;
      }
      if (
        rightIndex < length &&
        this.heap[rightIndex].value >
          (swap === null ? element.value : this.heap[leftIndex].value)
      ) {
        swap = rightIndex;
      }

      if (swap === null) break;

      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
}

function App() {
  const [traffic, setTraffic] = useState({
    north: 2,
    south: 5,
    east: 1,
    west: 3,
  });

  const [green, setGreen] = useState('north');
  const [cleared, setCleared] = useState({
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  });

  const [tick, setTick] = useState(0); // Simulation time counter

  useEffect(() => {
    const interval = setInterval(() => {
      const heap = new MaxHeap();
      Object.entries(traffic).forEach(([dir, val]) => heap.insert(dir, val));
      const maxDir = heap.extractMax();

      setGreen(maxDir);
      setTraffic((prev) => {
        const updated = { ...prev };
        const updatedCleared = { ...cleared };

        // Cars moved in green direction
        const clearedCars = Math.min(2, prev[maxDir]);
        updated[maxDir] = Math.max(prev[maxDir] - 2, 0);
        updatedCleared[maxDir] += clearedCars;

        // Cars accumulate in other directions
        Object.keys(prev).forEach((dir) => {
          if (dir !== maxDir) updated[dir] += 1;
        });

        setCleared(updatedCleared);
        return updated;
      });

      setTick((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [traffic,cleared]);

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
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="container">
      <h1>Smart Traffic Management</h1>
      <p
        style={{
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        This system uses a smart algorithm to manage traffic flow at intersections by prioritizing the direction with the highest number of vehicles.
        It simulates real-time traffic updates and dynamically changes signals to reduce congestion. The visualization shows which direction is allowed to move (green) and how vehicle counts change over time.
      </p>

      {/* Grid layout for chart + table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Traffic Table in 2x2 Grid */}
        <div
          className="intersection"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            height: '100%',
          }}
        >
          {Object.entries(traffic).map(([dir, cars]) => (
            <div
              className={`road ${green === dir ? 'green' : 'red'}`}
              key={dir}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <h2>{dir.toUpperCase()}</h2>
              <p>Cars: {cars}</p>
              <p>{green === dir ? 'GO' : 'WAIT'}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="chart-container" style={{ height: '100%' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <h2>Performance Metrics</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginTop: '10px',
          }}
        >
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
              <h3 style={{ margin: '5px 0' }}>{dir.toUpperCase()}</h3>
              <p>
                <strong>Cleared Cars:</strong> {count}
              </p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
          Total Simulation Time: {tick * 3} seconds
        </p>
      </div>
    </div>
  );
}

export default App;
