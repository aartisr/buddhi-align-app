const express = require('express');
const cors = require('cors');
const { validateRequestBody, validateId, ValidationError, errorHandler } = require('./validation');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory storage for all modules
const db = {
  karma: [],
  bhakti: [],
  jnana: [],
  dhyana: [],
  vasana: [],
  dharma: [],
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Buddhi Align App Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Generic CRUD endpoints for each module
const modules = [
  'karma', 'bhakti', 'jnana', 'dhyana', 'vasana', 'dharma'
];

modules.forEach((mod) => {
  // List all entries
  app.get(`/api/${mod}`, (req, res) => {
    try {
      res.json(db[mod] || []);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  // Add entry
  app.post(`/api/${mod}`, (req, res) => {
    try {
      validateRequestBody(req.body);
      const entry = { ...req.body, id: Date.now().toString() };
      db[mod].push(entry);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        errorHandler(err, req, res);
      }
    }
  });

  // Update entry
  app.put(`/api/${mod}/:id`, (req, res) => {
    try {
      validateId(req.params.id);
      validateRequestBody(req.body);
      const idx = db[mod].findIndex(e => e.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      db[mod][idx] = { ...db[mod][idx], ...req.body, id: req.params.id };
      res.json(db[mod][idx]);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        errorHandler(err, req, res);
      }
    }
  });

  // Delete entry
  app.delete(`/api/${mod}/:id`, (req, res) => {
    try {
      validateId(req.params.id);
      const idx = db[mod].findIndex(e => e.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      db[mod].splice(idx, 1);
      res.status(204).end();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        errorHandler(err, req, res);
      }
    }
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend API listening at http://localhost:${port}`);
  });
}

module.exports = app;
