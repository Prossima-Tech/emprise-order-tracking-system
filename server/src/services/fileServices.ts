// src/services/fileService.ts
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  private static readonly UPLOAD_DIR = path.join(__dirname, '../../uploads');

  static async uploadDocument(file: Express.Multer.File, prefix: string): Promise<string> {
    try {
      // Create uploads directory if it doesn't exist
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });

      const fileName = `${prefix}-${uuidv4()}${path.extname(file.originalname)}`;
      const filePath = path.join(this.UPLOAD_DIR, fileName);

      await fs.writeFile(filePath, file.buffer);
      return fileName;
    } catch (error) {
      throw new Error('File upload failed');
    }
  }

  static async getDocument(fileName: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.UPLOAD_DIR, fileName);
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error('File not found');
    }
  }
}