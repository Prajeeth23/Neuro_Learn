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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Import and use routes
// Diagnostic routes (No auth for health, basic auth for profile)
app.get('/api/health', async (req, res) => {
  const status = {
    env: {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_KEY,
      groqKey: !!process.env.GROQ_API_KEY
    },
    db: 'unknown'
  };
  try {
    const { data, error } = await supabase.from('courses').select('id').limit(1);
    if (error) {
      status.db = `error: ${error.message}`;
    } else {
      status.db = 'connected';
    }
  } catch (err) {
    status.db = `crash: ${err.message}`;
  }
  res.json(status);
});

app.get('/api/debug-me', authMiddleware, async (req, res) => {
  try {
    const { data: profile } = await req.supabaseClient.from('users').select('*').eq('id', req.user.id).single();
    res.json({
      auth_user_id: req.user.id,
      auth_user_email: req.user.email,
      db_profile: profile || 'NOT FOUND in users table'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/personalized', require('./routes/personalized'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// The "catchall" handler: for any request that doesn't 
// match one above, send back React's index.html file.
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
  next();
});

// 404 handler for API routes
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', method: req.method, path: req.url });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const errorMessage = err.message || (typeof err === 'string' ? err : JSON.stringify(err));
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: errorMessage,
    path: req.path,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export the app for Vercel Serverless Functions
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
