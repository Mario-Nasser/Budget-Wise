import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server';
import User from '../models/UserModel';

jest.mock('uuid', () => ({ v4: () => 'mocked-uuid' }));
jest.mock('../models/UserModel');

describe('Auth Controller', () => {
  it('should register a new user', async () => {
    (User.findOne as any).mockResolvedValue(null);
    (User.create as any).mockResolvedValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      toObject: () => ({ name: 'Test User', email: 'test@example.com' })
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Register successful');
  });

  it('should fail registration if passwords do not match', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password456'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Passwords do not match');
  });

  it('should login an existing user', async () => {
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const mockedUser = {
      _id: 'user-id',
      email: 'test@example.com',
      password: 'hashedPassword',
      toObject: () => ({ name: 'Test User', email: 'test@example.com' })
    };

    (User.findOne as any).mockResolvedValue(mockedUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    jest.spyOn(jwt, 'sign').mockReturnValue('mocked-token');

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.token).toBe('mocked-token');
  });
});