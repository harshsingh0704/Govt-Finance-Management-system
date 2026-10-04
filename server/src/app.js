const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const ltcRoutes = require('./routes/ltcRoutes');
const taRoutes = require('./routes/taRoutes');
const claimStatusRoutes = require('./routes/claimStatusRoutes');

// Mount API Endpoints
app.use('/api/ltc', ltcRoutes);
app.use('/api/ta', taRoutes);
app.use('/api/claims', claimStatusRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FMS Backend Operational' });
});

module.exports = app;
