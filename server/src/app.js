const express = require('express');
const cors = require('cors');

const ltcRoutes = require('./routes/ltcRoutes');
const taRoutes = require('./routes/taRoutes');
const claimStatusRoutes = require('./routes/claimStatusRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/ltc', ltcRoutes);
app.use('/api/ta', taRoutes);
app.use('/api/claims', claimStatusRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = app;
