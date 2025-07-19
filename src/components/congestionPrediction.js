// congestionPrediction.js
import PriorityQueue from 'priorityqueuejs';

// Mock historical traffic data (past patterns)
const historicalData = {
  north: [8, 10, 12, 14, 15, 16],
  south: [6, 9, 11, 13, 14, 15],
  east: [4, 5, 7, 8, 9, 10],
  west: [3, 4, 6, 7, 8, 9],
};

// Generate congestion predictions for the next 30 minutes (5-min intervals)
export const generateCongestionForecast = (liveData) => {
  const predictions = [];

  for (let min = 5; min <= 30; min += 5) {
    const maxHeap = new PriorityQueue((a, b) => b.value - a.value);
    const prediction = {};

    for (const dir of ['north', 'south', 'east', 'west']) {
      const realTimeVal = liveData[dir] || 0;
      const histVal = historicalData[dir][Math.floor((min - 5) / 5)] || 0;
      const noise = Math.floor(Math.random() * 3); // Simulate real-world fluctuation
      const predicted = Math.floor(realTimeVal * 0.6 + histVal * 0.4 + noise);

      prediction[dir] = predicted;
      maxHeap.enq({ direction: dir, value: predicted });
    }

    const max = maxHeap.peek(); // Direction with highest predicted congestion

    predictions.push({
      time: `${min}m`,
      ...prediction,
      maxCongestionDirection: max.direction
    });
  }

  return predictions;
};
