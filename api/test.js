// api/test.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Health check simple
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Health check funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
