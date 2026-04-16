const request = require('supertest');
const app = require('../server');

describe('Auth API — /api/auth', () => {
  const testEmail = `test_${Date.now()}@devcodex.test`;
  const testPassword = 'TestPass123!';

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: testEmail, password: testPassword })
        .expect('Content-Type', /json/)
        .expect(201);

      console.log(`[TEST] Register response: token=${!!res.body.token}, email=${res.body.user?.email}`);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: testEmail, password: testPassword })
        .expect(409);

      console.log('[TEST] Duplicate register correctly rejected:', res.body.message);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Bad', email: 'bad@test.com', password: 'weak' })
        .expect(422);

      console.log('[TEST] Weak password rejected:', res.body.errors?.[0]?.message);
      expect(res.body).toHaveProperty('errors');
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'nope@test.com' })
        .expect(422);

      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      console.log(`[TEST] Login successful: token=${!!res.body.token}`);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testEmail);
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'WrongPass999!' })
        .expect(401);

      console.log('[TEST] Wrong password rejected:', res.body.message);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@devcodex.test', password: 'SomePass123!' })
        .expect(401);

      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should reject malformed email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'SomePass123!' })
        .expect(422);

      expect(res.body).toHaveProperty('errors');
    });
  });
});
