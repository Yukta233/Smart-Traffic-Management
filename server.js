const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 5000;
const apiKey = 'YOUR_API_KEY';

app.get('/traffic', async (req, res) => {
  try {
    const response = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=28.6139,77.2090&key=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch traffic data' });
  }
});

app.listen(PORT, () => console.log(`🚦 Backend server running on http://localhost:${PORT}`));
