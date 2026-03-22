const express = require('express');
const cors = require('cors');
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

app.get('/', (req, res) => {
  res.send('Buddhi Align App Backend API');
});

// Generic CRUD endpoints for each module
const modules = [
  'karma', 'bhakti', 'jnana', 'dhyana', 'vasana', 'dharma'
];

modules.forEach((mod) => {
  // List all entries
  app.get(`/api/${mod}`, (req, res) => {
    res.json(db[mod]);
  });
  // Add entry
  app.post(`/api/${mod}`, (req, res) => {
    const entry = { ...req.body, id: Date.now().toString() };
    db[mod].push(entry);
    res.status(201).json(entry);
  });
  // Update entry
  app.put(`/api/${mod}/:id`, (req, res) => {
    const idx = db[mod].findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db[mod][idx] = { ...db[mod][idx], ...req.body };
    res.json(db[mod][idx]);
  });
  // Delete entry
  app.delete(`/api/${mod}/:id`, (req, res) => {
    const idx = db[mod].findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db[mod].splice(idx, 1);
    res.status(204).end();
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend API listening at http://localhost:${port}`);
  });
}

module.exports = app;
