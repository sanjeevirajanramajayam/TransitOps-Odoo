import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'])
})

router.post('/login', validateRequest(loginSchema), (req: Request, res: Response) => {
  const { email } = req.body
  return sendResponse(res, 200, true, 'Login successful', {
    token: 'mock-jwt-token-xyz123',
    user: {
      id: 1,
      email,
      name: 'Raven K.',
      role: 'Fleet Manager'
    }
  })
})

router.post('/register', validateRequest(registerSchema), (req: Request, res: Response) => {
  const { email, name, role } = req.body
  return sendResponse(res, 201, true, 'User registered successfully', {
    user: {
      id: 2,
      email,
      name,
      role
    }
  })
})

export default router
