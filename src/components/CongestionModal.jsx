// CongestionModal.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { generateCongestionForecast } from './congestionPrediction';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const CongestionModal = ({ show, onClose, liveData }) => {
  if (!show || !liveData) return null;

  const forecast = generateCongestionForecast(liveData);

  const data = {
    labels: forecast.map((d) => d.time),
    datasets: ['north', 'south', 'east', 'west'].map((dir, idx) => ({
      label: dir.toUpperCase(),
      data: forecast.map((d) => d[dir]),
      borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][idx],
      backgroundColor: 'transparent',
      tension: 0.3,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Next 30 Minute Forecast',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Vehicle Count',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time (5-min intervals)',
        },
      },
    },
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Predicted Congestion Forecast</h2>
        <Line data={data} options={options} />

        <div className="modal-section">
          <h3 className="modal-subtitle">Most Congested Direction Every 5 Minutes:</h3>
          <ul className="modal-list">
            {forecast.map((entry, index) => (
              <li key={index}>
                At <strong>{entry.time}</strong>:
                <span className="highlighted-direction"> {entry.maxCongestionDirection.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CongestionModal;
