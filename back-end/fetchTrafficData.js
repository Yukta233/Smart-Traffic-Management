// File: fetchTrafficData.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/api/traffic', async (req, res) => {
  try {
    const url = `m5dUR31lLK6e1DHIQ4liBVaekCjj66hY`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching traffic data:', error.message);
    res.status(500).json({ error: 'Failed to fetch traffic data' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Traffic backend running at http://localhost:${PORT}/api/traffic`);
});
