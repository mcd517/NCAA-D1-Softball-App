const request = require('supertest');
const express = require('express');
const routes = require('../routes/softballRoutes');

const app = express();
app.use(express.json());
app.use('/api/softball', routes);

describe('Softball API', () => {
  it('GET /api/softball/rankings should return rankings data', async () => {
    const res = await request(app).get('/api/softball/rankings');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});