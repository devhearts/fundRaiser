// Comprehensive API tests for Event CRUD operations
const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('API Tests - Event CRUD Operations', () => {
  let testEventId;
  let testContributionId;
  let isDatabaseConnected = false;

  beforeAll(async () => {
    try {
      // Try to initialize the database connection
      if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        await db.connectDatabase();
        isDatabaseConnected = true;
        console.log('✅ Database connected for tests');
      } else {
        console.log('⚠️  Database credentials not found. Skipping database operations.');
        console.log('Run tests with DB by setting GOOGLE_SHEETS_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY');
        isDatabaseConnected = false;
      }
    } catch (error) {
      console.log('⚠️  Database connection failed. Skipping database operations.', error.message);
      isDatabaseConnected = false;
    }
  });

  describe('Health Check', () => {
    test('GET /api/health - should return OK status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Event CRUD Operations', () => {
    test('POST /api/events - Create event with valid data', async () => {
      const eventData = {
        title: 'Help Build a School in Africa',
        description: 'We are raising funds to build a primary school in rural Uganda that will serve 500 children.',
        goalAmount: 25000,
        organizerName: 'Jane Smith',
        organizerEmail: 'jane@example.com',
        location: 'Kampala, Uganda',
        isPublic: true,
        coverImage: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(eventData.title);
      expect(response.body.description).toBe(eventData.description);
      expect(response.body.goalAmount).toBe(eventData.goalAmount);
      expect(response.body.currentAmount).toBe(0);
      expect(response.body.organizerName).toBe(eventData.organizerName);
      expect(response.body.organizerEmail).toBe(eventData.organizerEmail);
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();

      testEventId = response.body.id;
    });

    test('POST /api/events - Validation error with short title', async () => {
      const eventData = {
        title: 'Hi',
        description: 'This is a test description that is long enough',
        goalAmount: 1000,
        organizerName: 'John Doe',
        organizerEmail: 'john@example.com'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('POST /api/events - Validation error with short description', async () => {
      const eventData = {
        title: 'Valid Title Here',
        description: 'Short',
        goalAmount: 1000,
        organizerName: 'John Doe',
        organizerEmail: 'john@example.com'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('GET /api/events - Get all public events', async () => {
      const response = await request(app).get('/api/events');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // All returned events should be public
      response.body.forEach(event => {
        expect(event.isPublic).toBe(true);
      });
    });

    test('GET /api/events/:id - Get specific event', async () => {
      const response = await request(app).get(`/api/events/${testEventId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testEventId);
      expect(response.body.title).toBeDefined();
    });

    test('GET /api/events/:id - Get non-existent event', async () => {
      const response = await request(app).get('/api/events/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found');
    });

    test('PUT /api/events/:id - Update event', async () => {
      const updateData = {
        title: 'Updated Event Title',
        description: 'This is an updated description that is long enough for validation',
        goalAmount: 30000
      };

      const response = await request(app)
        .put(`/api/events/${testEventId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.goalAmount).toBe(updateData.goalAmount);
    });

    test('PUT /api/events/:id - Update event with partial data', async () => {
      const updateData = {
        goalAmount: 35000
      };

      const response = await request(app)
        .put(`/api/events/${testEventId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.goalAmount).toBe(updateData.goalAmount);
    });

    test('PUT /api/events/:id - Update non-existent event', async () => {
      const updateData = {
        title: 'Should not work'
      };

      const response = await request(app)
        .put('/api/events/non-existent-id')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found');
    });
  });

  describe('Contribution Operations', () => {
    test('POST /api/events/:eventId/contributions - Create contribution', async () => {
      const contributionData = {
        donorName: 'Alice Johnson',
        donorEmail: 'alice@example.com',
        amount: 150,
        message: 'Great cause! Happy to support!'
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/contributions`)
        .send(contributionData);

      expect(response.status).toBe(201);
      expect(response.body.amount).toBe(contributionData.amount);
      expect(response.body.donorName).toBe(contributionData.donorName);
      expect(response.body.id).toBeDefined();

      testContributionId = response.body.id;
    });

    test('GET /api/events/:eventId/contributions - Get contributions for event', async () => {
      const response = await request(app).get(`/api/events/${testEventId}/contributions`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('PUT /api/contributions/:id - Update contribution status', async () => {
      const response = await request(app)
        .put(`/api/contributions/${testContributionId}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('confirmed');
    });
  });

  describe('Event Deletion', () => {
    test('DELETE /api/events/:id - Delete event', async () => {
      const response = await request(app).delete(`/api/events/${testEventId}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event deleted successfully');
    });

    test('DELETE /api/events/:id - Delete non-existent event', async () => {
      const response = await request(app).delete('/api/events/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found');
    });
  });
});
