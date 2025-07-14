// File: src/components/SpeedGauge.jsx
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const SpeedGauge = ({ speed = 24 }) => {
  return (
    <div style={{ width: 200, margin: '20px auto' }}>
      <h3 style={{ textAlign: 'center', color: 'black' }}>Current Speed</h3>
      <CircularProgressbar
        value={speed}
        maxValue={100}
        text={`${speed} km/h`}
        styles={buildStyles({
          textColor: 'black',
          pathColor: '#00c853',
          trailColor: '#ddd',
        })}
      />
    </div>
  );
};

export default SpeedGauge;
