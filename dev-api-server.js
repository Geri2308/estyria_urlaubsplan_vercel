#!/usr/bin/env node
/**
 * Development API Server for Vercel Functions
 * This server simulates the Vercel serverless functions locally
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set environment variables for development
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
process.env.DB_NAME = process.env.DB_NAME || 'urlaubsplaner';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Helper function to load and execute Vercel functions
const loadVercelFunction = (functionPath) => {
  try {
    delete require.cache[require.resolve(functionPath)];
    return require(functionPath);
  } catch (error) {
    console.error(`Error loading function ${functionPath}:`, error);
    return null;
  }
};

// Route handler for Vercel functions
const handleVercelFunction = (functionPath) => {
  return async (req, res) => {
    try {
      const handler = loadVercelFunction(functionPath);
      if (handler) {
        await handler(req, res);
      } else {
        res.status(500).json({ error: 'Function not found' });
      }
    } catch (error) {
      console.error(`Error executing function ${functionPath}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// API Routes
app.get('/api/health', handleVercelFunction(path.join(__dirname, 'api/health.js')));
app.post('/api/auth/login', handleVercelFunction(path.join(__dirname, 'api/auth/login.js')));

app.get('/api/employees', handleVercelFunction(path.join(__dirname, 'api/employees/index.js')));
app.post('/api/employees', handleVercelFunction(path.join(__dirname, 'api/employees/index.js')));
app.get('/api/employees/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  handleVercelFunction(path.join(__dirname, 'api/employees/[id].js'))(req, res);
});
app.put('/api/employees/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  handleVercelFunction(path.join(__dirname, 'api/employees/[id].js'))(req, res);
});
app.delete('/api/employees/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  handleVercelFunction(path.join(__dirname, 'api/employees/[id].js'))(req, res);
});

app.get('/api/settings', handleVercelFunction(path.join(__dirname, 'api/settings/index.js')));

app.get('/api/vacation-entries', handleVercelFunction(path.join(__dirname, 'api/vacation-entries/index.js')));
app.post('/api/vacation-entries', handleVercelFunction(path.join(__dirname, 'api/vacation-entries/index.js')));
app.get('/api/vacation-entries/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  handleVercelFunction(path.join(__dirname, 'api/vacation-entries/[id].js'))(req, res);
});
app.put('/api/vacation-entries/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  handleVercelFunction(path.join(__dirname, 'api/vacation-entries/[id].js'))(req, res);
});
app.delete('/api/vacation-entries/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  handleVercelFunction(path.join(__dirname, 'api/vacation-entries/[id].js'))(req, res);
});

// Catch-all for undefined routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/employees`);
  console.log(`   POST /api/employees`);
  console.log(`   GET  /api/employees/:id`);
  console.log(`   PUT  /api/employees/:id`);
  console.log(`   DELETE /api/employees/:id`);
  console.log(`   GET  /api/settings`);
  console.log(`   GET  /api/vacation-entries`);
  console.log(`   POST /api/vacation-entries`);
});

module.exports = app;