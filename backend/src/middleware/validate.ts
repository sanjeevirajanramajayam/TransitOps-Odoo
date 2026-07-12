import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { sendResponse } from '../index'

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        sendResponse(res, 422, false, 'Validation failed', {
          errors: err.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        })
        return
      }
      next(err)
    }
  }
}
