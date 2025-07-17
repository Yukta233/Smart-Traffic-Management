import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const TrafficChart = () => {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef();

  useEffect(() => {
    axios.get('http://localhost:5000/traffic-data')
      .then(res => {
        const raw = res.data;

        const hourlyMap = {};
        raw.forEach(item => {
          const hour = item.timestamp.split(' ')[1].slice(0, 5); // "HH:MM"
          const congestion = parseInt(item.value.replace('%', ''));
          // Always include all days now
          if (!isNaN(congestion)) {
            if (!hourlyMap[hour]) hourlyMap[hour] = [];
            hourlyMap[hour].push(congestion);
          }
        });

        const labels = Object.keys(hourlyMap).sort();
        const values = labels.map(hour =>
          Math.round(hourlyMap[hour].reduce((a, b) => a + b, 0) / hourlyMap[hour].length)
        );

        const ctx = chartRef.current?.getContext('2d');
        const gradient = ctx
          ? ctx.createLinearGradient(0, 0, 0, 300)
          : null;
        if (gradient) {
          gradient.addColorStop(0, 'rgba(75,192,192,0.4)');
          gradient.addColorStop(1, 'rgba(75,192,192,0.05)');
        }

        setChartData({
          labels,
          datasets: [
            {
              label: 'Avg Congestion',
              data: values,
              fill: true,
              backgroundColor: gradient || 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 6,
            },
          ],
        });
      })
      .catch(err => {
        console.error('Error fetching traffic data:', err);
      });
  }, []);

  return (
    <div style={{ width: '95%', margin: 'auto', marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', fontSize: '1.8rem' }}>
        🚦 Live Traffic Congestion Trends
      </h2>

      {/* Dropdown removed */}

      {chartData ? (
        <Line
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: value => `${value}%`,
                },
              },
            },
          }}
        />
      ) : (
        <p style={{ textAlign: 'center' }}>Loading chart...</p>
      )}
    </div>
  );
};

export default TrafficChart;
