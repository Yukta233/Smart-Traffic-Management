// File: src/components/SpeedGauge.jsx
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const SpeedGauge = ({ speed = 0, freeFlowSpeed = 100 }) => {
  // Calculate percentage of congestion (optional: color code)
  const percent = (speed / freeFlowSpeed) * 100;
  let color = '#00c853'; // green by default
  if (percent < 40) color = '#ff1744'; // red for high congestion
  else if (percent < 70) color = '#ff9100'; // orange for moderate congestion

  return (
    <div style={{ width: 200, margin: '20px auto' }}>
      <h3 style={{ textAlign: 'center', color: 'black' }}>Current Speed</h3>
      <CircularProgressbar
        value={speed}
        maxValue={freeFlowSpeed}
        text={`${speed} km/h`}
        styles={buildStyles({
          textColor: 'black',
          pathColor: color,
          trailColor: '#eee',
        })}
      />
    </div>
  );
};

export default SpeedGauge;
