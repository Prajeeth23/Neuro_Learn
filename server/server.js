const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const supabase = require('./db/supabaseClient');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Import and use routes
// Diagnostic routes (No auth for health, basic auth for profile)
// Diagnostic object to track loaded features
const loadedFeatures = {};

// Load individual routes with explicit literal requires so Vercel's bundler can "see" them
try {
  app.use('/api/auth', require('./routes/auth'));
  loadedFeatures['/api/auth'] = '✅ Loaded';
} catch (err) {
  loadedFeatures['/api/auth'] = `❌ FAILED: ${err.message}`;
  console.error('🔥 FAILED to load /api/auth:', err.message);
}

try {
  app.use('/api/courses', require('./routes/courses'));
  loadedFeatures['/api/courses'] = '✅ Loaded';
} catch (err) {
  loadedFeatures['/api/courses'] = `❌ FAILED: ${err.message}`;
  console.error('🔥 FAILED to load /api/courses:', err.message);
}

try {
  app.use('/api/assessments', require('./routes/assessments'));
  loadedFeatures['/api/assessments'] = '✅ Loaded';
} catch (err) {
  loadedFeatures['/api/assessments'] = `❌ FAILED: ${err.message}`;
  console.error('🔥 FAILED to load /api/assessments:', err.message);
}

try {
  app.use('/api/progress', require('./routes/progress'));
  loadedFeatures['/api/progress'] = '✅ Loaded';
} catch (err) {
  loadedFeatures['/api/progress'] = `❌ FAILED: ${err.message}`;
  console.error('🔥 FAILED to load /api/progress:', err.message);
}

try {
  app.use('/api/personalized', require('./routes/personalized'));
  loadedFeatures['/api/personalized'] = '✅ Loaded';
} catch (err) {
  loadedFeatures['/api/personalized'] = `❌ FAILED: ${err.message}`;
  console.error('🔥 FAILED to load /api/personalized:', err.message);
}

try {
  app.use('/api/ai', require('./routes/ai'));
  loadedFeatures['/api/ai'] = '✅ Loaded';
} catch (err) {
  loadedFeatures['/api/ai'] = `❌ FAILED: ${err.message}`;
  console.error('🔥 FAILED to load /api/ai:', err.message);
}

try {
  app.use('/api/admin', require('./routes/admin'));
  loadedFeatures['/api/admin'] = '✅ Loaded';
} catch (err) {
  loadedFeatures['/api/admin'] = `❌ FAILED: ${err.message}`;
  console.error('🔥 FAILED to load /api/admin:', err.message);
}

try {
  app.use('/api/upload', require('./routes/upload'));
  loadedFeatures['/api/upload'] = '✅ Loaded';
} catch (err) {
  loadedFeatures['/api/upload'] = `❌ FAILED: ${err.message}`;
  console.error('🔥 FAILED to load /api/upload:', err.stack);
}

// Update health check to include loaded features
app.get('/api/health', async (req, res) => {
  const status = {
    env: {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_KEY,
      groqKey: !!process.env.GROQ_API_KEY
    },
    features: loadedFeatures,
    db: 'unknown'
  };
  try {
    const { error } = await supabase.from('courses').select('id').limit(1);
    status.db = error ? `error: ${error.message}` : 'connected';
  } catch (err) {
    status.db = `crash: ${err.message}`;
  }
  res.json(status);
});

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
