const request = require('supertest');
const app = require('../server');

describe('Health Check Endpoint', () => {
  it('GET /health should return status ok', async () => {
    const res = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    console.log('[TEST] Health response:', JSON.stringify(res.body));

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('environment');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
  });

  it('GET /metrics should return Prometheus format', async () => {
    const res = await request(app)
      .get('/metrics')
      .expect(200);

    console.log('[TEST] Metrics endpoint responded with content-type:', res.headers['content-type']);
    expect(res.text).toContain('codex_');
  });

  it('GET /unknown-route should return 404', async () => {
    const res = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(res.body).toHaveProperty('message');
  });
});
