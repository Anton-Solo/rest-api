import request from 'supertest';
import { createServer } from '../server.js';
import { db } from '../db/database.js';
import type { Server } from 'http';

describe('CRUD API Tests', () => {
  let server: Server;

  beforeAll(() => {
    server = createServer();
  });

  beforeEach(() => {
    db.clear();
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

  describe('Scenario 1: Complete CRUD flow', () => {
    it('should complete full CRUD cycle', async () => {
      let response = await request(server).get('/api/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);

      const newUser = {
        username: 'John Doe',
        age: 30,
        hobbies: ['reading', 'gaming'],
      };

      response = await request(server)
        .post('/api/users')
        .send(newUser)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(newUser.username);
      expect(response.body.age).toBe(newUser.age);
      expect(response.body.hobbies).toEqual(newUser.hobbies);

      const createdUserId = response.body.id;

      response = await request(server).get(`/api/users/${createdUserId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdUserId);
      expect(response.body.username).toBe('John Doe');

      const updatedUser = {
        username: 'Jane Doe',
        age: 25,
        hobbies: ['painting', 'music'],
      };

      response = await request(server)
        .put(`/api/users/${createdUserId}`)
        .send(updatedUser)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdUserId);
      expect(response.body.username).toBe(updatedUser.username);
      expect(response.body.age).toBe(updatedUser.age);
      expect(response.body.hobbies).toEqual(updatedUser.hobbies);

      response = await request(server).delete(`/api/users/${createdUserId}`);
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      response = await request(server).get(`/api/users/${createdUserId}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Scenario 2: Validation tests', () => {
    it('should return 400 for invalid UUID', async () => {
      const response = await request(server).get('/api/users/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid userId');
    });

    it('should return 400 when creating user without required fields', async () => {
      const invalidUser = {
        username: 'Test User',
      };

      const response = await request(server)
        .post('/api/users')
        .send(invalidUser)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when age is not a number', async () => {
      const invalidUser = {
        username: 'Test User',
        age: 'thirty',
        hobbies: [],
      };

      const response = await request(server)
        .post('/api/users')
        .send(invalidUser)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when hobbies is not an array', async () => {
      const invalidUser = {
        username: 'Test User',
        age: 30,
        hobbies: 'reading',
      };

      const response = await request(server)
        .post('/api/users')
        .send(invalidUser)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Scenario 3: Non-existing resources', () => {
    it('should return 404 for non-existing user', async () => {
      const nonExistingId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(server).get(`/api/users/${nonExistingId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });

    it('should return 404 when updating non-existing user', async () => {
      const nonExistingId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(server)
        .put(`/api/users/${nonExistingId}`)
        .send({ username: 'Test', age: 25, hobbies: [] })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 when deleting non-existing user', async () => {
      const nonExistingId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(server).delete(`/api/users/${nonExistingId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existing endpoint', async () => {
      const response = await request(server).get('/api/non-existing-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Endpoint not found');
    });
  });

  describe('Scenario 4: Multiple users management', () => {
    it('should manage multiple users', async () => {
      const userIds: string[] = [];
      const users = [
        { username: 'Alice', age: 25, hobbies: ['reading'] },
        { username: 'Bob', age: 30, hobbies: ['gaming', 'coding'] },
        { username: 'Charlie', age: 35, hobbies: [] },
      ];

      for (const user of users) {
        const response = await request(server)
          .post('/api/users')
          .send(user)
          .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);
        userIds.push(response.body.id);
      }

      let response = await request(server).get('/api/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      for (const userId of userIds) {
        response = await request(server).delete(`/api/users/${userId}`);
        expect(response.status).toBe(204);
      }

      response = await request(server).get('/api/users');
      expect(response.body).toEqual([]);
    });
  });
});

