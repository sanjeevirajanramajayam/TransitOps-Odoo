import request from 'supertest'
import { app } from '../index'

describe('Authentication API', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@transitops.com',
          password: 'password123'
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('token')
      expect(res.body.data.user.role).toBe('Fleet Manager')
    })

    it('should fail validation with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })

      expect(res.status).toBe(422)
      expect(res.body.success).toBe(false)
      expect(res.body.data.errors[0].field).toBe('email')
    })
  })

  describe('POST /api/v1/auth/register', () => {
    it('should register successfully with valid details', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@transitops.com',
          password: 'password123',
          name: 'Jane Doe',
          role: 'Driver'
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.email).toBe('newuser@transitops.com')
    })
  })
})
