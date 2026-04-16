const request = require('supertest');
const app = require('../server');

describe('Notes API — /api/notes', () => {
  let authToken;
  let createdNoteId;

  // Authenticate before tests
  beforeAll(async () => {
    const testEmail = `notes_test_${Date.now()}@devcodex.test`;
    const testPassword = 'NotesTest123!';

    // Register a test user
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Notes Tester', email: testEmail, password: testPassword });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    authToken = loginRes.body.token;
    console.log(`[TEST] Notes test user authenticated: token=${!!authToken}`);
  });

  describe('POST /api/notes (Create)', () => {
    it('should create a note when authenticated', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Note', quillDelta: { ops: [{ insert: 'Hello World\n' }] }, isPrivate: false })
        .expect(201);

      console.log(`[TEST] Note created: id=${res.body._id}, title=${res.body.title}`);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Test Note');
      createdNoteId = res.body._id;
    });

    it('should reject unauthenticated note creation', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ title: 'Unauthorized Note' })
        .expect(401);

      console.log('[TEST] Unauthenticated note creation rejected:', res.body.message);
      expect(res.body.message).toMatch(/no token/i);
    });
  });

  describe('GET /api/notes (List)', () => {
    it('should list notes for authenticated user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      console.log(`[TEST] Notes list: count=${res.body.length}`);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/notes')
        .expect(401);
    });
  });

  describe('GET /api/notes/public/all', () => {
    it('should list public notes without authentication', async () => {
      const res = await request(app)
        .get('/api/notes/public/all')
        .expect(200);

      console.log(`[TEST] Public notes: count=${res.body.length}`);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should retrieve a public note by ID', async () => {
      if (!createdNoteId) return; // Skip if create failed
      const res = await request(app)
        .get(`/api/notes/${createdNoteId}`)
        .expect(200);

      console.log(`[TEST] Note retrieved: title=${res.body.title}`);
      expect(res.body._id).toBe(createdNoteId);
    });

    it('should return 404 for non-existent note ID', async () => {
      await request(app)
        .get('/api/notes/000000000000000000000000')
        .expect(404);
    });
  });
});
