// src/middleware/fileUpload.ts
import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Configure storage settings for different document types
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine upload directory based on document type
    let uploadDir = 'uploads/';
    if (req.path.includes('/emd')) {
      uploadDir += 'emd/';
    } else if (req.path.includes('/invoices')) {
      uploadDir += 'invoices/';
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to validate uploaded documents
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed mime types
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: PDF, JPEG, PNG, DOC, DOCX'));
  }
};

// Create multer instance with configuration
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Maximum one file per request
  }
});