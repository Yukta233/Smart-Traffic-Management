import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Filler, Legend);

const TrafficChart = () => {
  const [chartData, setChartData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('All');
  const chartRef = useRef();
  const days = ['All', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    axios.get('http://localhost:5000/traffic-data')
      .then(res => {
        const raw = res.data;

        const hourlyMap = {};
        raw.forEach(item => {
          const hour = item.timestamp.split(' ')[1].slice(0, 5); // "HH:MM"
          const congestion = parseInt(item.value.replace('%', ''));
          const day = item.day;

          if (selectedDay !== 'All' && day !== selectedDay) return;

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
              label: `Avg Congestion ${selectedDay !== 'All' ? 'on ' + selectedDay : ''}`,
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
  }, [selectedDay]);

  return (
    <div style={{ width: '95%', margin: 'auto', marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', fontSize: '1.8rem' }}>
        🚦 Live Traffic Congestion Trends
      </h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label style={{ fontSize: '1rem', marginRight: '10px' }}>Filter by Day:</label>
        <select
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          style={{ padding: '6px 12px', fontSize: '1rem' }}
        >
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

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
