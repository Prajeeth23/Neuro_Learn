const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const supabase = require('./db/supabaseClient');
const authMiddleware = require('./middleware/auth');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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

function safeLoad(routePath, relativeFile) {
  try {
    // Resolve the absolute path to ensure Vercel can find the module
    const absolutePath = path.join(__dirname, relativeFile);
    app.use(routePath, require(absolutePath));
    loadedFeatures[routePath] = '✅ Loaded';
    console.log(`✅ Success: Loaded ${routePath} from ${absolutePath}`);
  } catch (err) {
    loadedFeatures[routePath] = `❌ FAILED: ${err.message}`;
    console.error(`🔥 CRITICAL ERROR: Failed to load ${routePath} from ${relativeFile}!`, err.message);
  }
}

// Load individual routes with safety nets (paths relative to __dirname)
safeLoad('/api/auth', './routes/auth');
safeLoad('/api/courses', './routes/courses');
safeLoad('/api/assessments', './routes/assessments');
safeLoad('/api/progress', './routes/progress');
safeLoad('/api/personalized', './routes/personalized');
safeLoad('/api/ai', './routes/ai');
safeLoad('/api/admin', './routes/admin');
safeLoad('/api/upload', './routes/upload');

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
