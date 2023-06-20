const express = require('express');
const request = require('supertest');
const carRouter = require('../routes/carsRouter');

const app = express();

app.use(express.json());
app.use('/api/v1/cars', carRouter);

describe('Integration tests for car_warehouse', () => {
  it('GET /api/v1/cars - Success - get all cars', async () => {
    const { body, statusCode } = await request(app).get('/api/v1/cars');
    expect(statusCode).toBe(200);
    expect(body.status).toBe('success');
    expect(body.length).toBeGreaterThanOrEqual(0);
    expect(body.cars).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          model: expect.any(String),
          color: expect.any(String),
          quantity: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ])
    );
  });
});
