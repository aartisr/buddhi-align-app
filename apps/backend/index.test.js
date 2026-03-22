const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('./index');

test('GET / returns service banner', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.text, 'Buddhi Align App Backend API');
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
  assert.equal(listRes.body.length > 0, true);

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
