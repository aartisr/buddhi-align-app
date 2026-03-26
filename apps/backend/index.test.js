const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('./index');

test('GET / returns service banner', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(res.body.timestamp);
});

test('CRUD flow for karma module works', async () => {
  const createRes = await request(app)
    .post('/api/karma')
    .send({ title: 'Serve without attachment' })
    .set('Content-Type', 'application/json');

  assert.equal(createRes.status, 201);
  assert.ok(createRes.body.id);
  assert.equal(createRes.body.title, 'Serve without attachment');

  const listRes = await request(app).get('/api/karma');
  assert.equal(listRes.status, 200);
  assert.ok(Array.isArray(listRes.body));
  assert.ok(listRes.body.length > 0);

  const entryId = createRes.body.id;
  const updateRes = await request(app)
    .put(`/api/karma/${entryId}`)
    .send({ title: 'Serve with clarity' })
    .set('Content-Type', 'application/json');

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.title, 'Serve with clarity');

  const deleteRes = await request(app).delete(`/api/karma/${entryId}`);
  assert.equal(deleteRes.status, 204);

  const missingRes = await request(app).put('/api/karma/missing-id').send({ title: 'x' });
  assert.equal(missingRes.status, 404);
});

test('POST with array body is rejected', async () => {
  const res = await request(app)
    .post('/api/bhakti')
    .send([])
    .set('Content-Type', 'application/json');

  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST with empty object succeeds', async () => {
  const res = await request(app)
    .post('/api/jnana')
    .send({})
    .set('Content-Type', 'application/json');

  assert.equal(res.status, 201);
});

test('PUT with invalid/empty ID is rejected', async () => {
  const res = await request(app)
    .put('/api/dharma/')
    .send({ title: 'x' })
    .set('Content-Type', 'application/json');

  assert.ok([400, 404].includes(res.status));
});

test('DELETE on missing entry returns 404', async () => {
  const res = await request(app).delete('/api/vasana/nonexistent');
  assert.equal(res.status, 404);
});

test('All modules are accessible', async () => {
  const modules = ['karma', 'bhakti', 'jnana', 'dhyana', 'vasana', 'dharma'];
  
  for (const mod of modules) {
    const res = await request(app).get(`/api/${mod}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  }
});
