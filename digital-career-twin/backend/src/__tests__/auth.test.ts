import request from 'supertest';
import app from '../index';

// These tests require a running PostgreSQL database
// Set DATABASE_URL in .env before running
// The tests will automatically clean up after themselves

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
  };
  let token = '';

  // Test 1: Register with valid data
  test('POST /auth/register → 201 with token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testUser.email);
    token = res.body.token;
  });

  // Test 2: Register with duplicate email
  test('POST /auth/register with duplicate email → 400', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('already registered');
  });

  // Test 3: Register with missing fields
  test('POST /auth/register with missing fields → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  // Test 4: Login with correct credentials
  test('POST /auth/login with correct credentials → 200 with token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
    token = res.body.token;
  });

  // Test 5: Login with wrong password
  test('POST /auth/login with wrong password → 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // Test 6: GET /users/me with valid token
  test('GET /users/me with valid token → 200 with user (no password)', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('email');
    expect(res.body).not.toHaveProperty('password');
  });

  // Test 7: GET /users/me without token
  test('GET /users/me without token → 401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  afterAll(async () => {
    // Clean up test user
    const { prisma } = await import('../config/prisma');
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });
});
