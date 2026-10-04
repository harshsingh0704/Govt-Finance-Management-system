const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fms_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully!');
    app.listen(PORT, () => {
      console.log(`FMS Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
  });
