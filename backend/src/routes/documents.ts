import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import prisma from '../db'
import { sendResponse } from '../utils/response'

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '')
    cb(null, `${base}-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({ storage })

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) {
      return sendResponse(res, 400, false, 'No file was uploaded')
    }

    const { entityType, entityId, documentType } = req.body

    if (!entityType || !entityId || !documentType) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
      return sendResponse(res, 422, false, 'Missing required fields: entityType, entityId, and documentType are required')
    }

    if (entityType !== 'vehicle' && entityType !== 'driver') {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
      return sendResponse(res, 422, false, "entityType must be 'vehicle' or 'driver'")
    }

    const parsedEntityId = parseInt(entityId)
    if (isNaN(parsedEntityId) || parsedEntityId <= 0) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
      return sendResponse(res, 422, false, 'entityId must be a positive integer')
    }

    if (entityType === 'vehicle') {
      const v = await prisma.transitVehicle.findUnique({ where: { id: parsedEntityId } })
      if (!v) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        return sendResponse(res, 404, false, `Vehicle with ID ${parsedEntityId} not found`)
      }
    } else {
      const d = await prisma.transitDriver.findUnique({ where: { id: parsedEntityId } })
      if (!d) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        return sendResponse(res, 404, false, `Driver with ID ${parsedEntityId} not found`)
      }
    }

    const doc = await prisma.transitDocument.create({
      data: {
        entityType,
        entityId: parsedEntityId,
        documentType,
        fileName: file.filename,
        filePath: `/uploads/${file.filename}`
      }
    })

    return sendResponse(res, 201, true, 'Document uploaded successfully', {
      id: doc.id,
      entityType: doc.entityType,
      entityId: doc.entityId,
      documentType: doc.documentType,
      fileName: doc.fileName,
      uploadUrl: `http://localhost:5000/uploads/${doc.fileName}`,
      uploadedAt: doc.uploadedAt
    })
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    return sendResponse(res, 500, false, 'Internal server error during document upload')
  }
})

router.get('/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params

    if (entityType !== 'vehicle' && entityType !== 'driver') {
      return sendResponse(res, 400, false, "entityType must be 'vehicle' or 'driver'")
    }

    const parsedEntityId = parseInt(entityId as string)
    if (isNaN(parsedEntityId) || parsedEntityId <= 0) {
      return sendResponse(res, 400, false, 'entityId must be a positive integer')
    }

    const docs = await prisma.transitDocument.findMany({
      where: {
        entityType,
        entityId: parsedEntityId
      },
      orderBy: { uploadedAt: 'desc' }
    })

    const responseDocs = docs.map(doc => ({
      id: doc.id,
      entityType: doc.entityType,
      entityId: doc.entityId,
      documentType: doc.documentType,
      fileName: doc.fileName,
      uploadUrl: `http://localhost:5000/uploads/${doc.fileName}`,
      uploadedAt: doc.uploadedAt
    }))

    return sendResponse(res, 200, true, 'Documents retrieved successfully', responseDocs)
  } catch (err) {
    return sendResponse(res, 500, false, 'Internal server error during document retrieval')
  }
})

export default router
