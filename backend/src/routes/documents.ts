import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'

const router = Router()

const uploadDocumentSchema = z.object({
  entityType: z.enum(['vehicle', 'driver']),
  entityId: z.number().int().positive(),
  documentType: z.string().min(2),
  fileName: z.string().min(2)
})

router.post('/upload', validateRequest(uploadDocumentSchema), (req: Request, res: Response) => {
  const { entityType, entityId, documentType, fileName } = req.body
  return sendResponse(res, 201, true, 'Document uploaded successfully', {
    id: 101,
    entityType,
    entityId,
    documentType,
    fileName,
    uploadUrl: `https://transitops-storage.s3.amazonaws.com/documents/${Date.now()}_${fileName}`,
    uploadedAt: new Date().toISOString()
  })
})

router.get('/:entityType/:entityId', (req: Request, res: Response) => {
  const { entityType, entityId } = req.params
  return sendResponse(res, 200, true, 'Documents retrieved successfully', [
    { id: 101, entityType, entityId: parseInt(entityId as string), documentType: 'CDL License', fileName: 'cdl_alex.pdf', uploadUrl: 'https://transitops-storage.s3.amazonaws.com/documents/cdl_alex.pdf', uploadedAt: '2026-07-10T12:00:00.000Z' }
  ])
})

export default router
