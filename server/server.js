const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NeuroLens API is running' });
});

// Import and use routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/personalized', require('./routes/personalized'));
app.use('/api/admin', require('./routes/admin'));

// 404 handler
app.use((req, res, next) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', method: req.method, path: req.url });
});

// Error handler
app.use((err, req, res) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
