import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Express } from 'express';
import crypto from 'crypto';
import path from 'path';

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private baseFolder: string;

  constructor() {
    // Initialize S3 client with credentials from environment variables
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });

    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.baseFolder = 'emd-documents'; // Base folder for EMD documents
  }

  /**
   * Generates a unique file key for S3
   * Format: emd-documents/YYYY/MM/[unique-hash].[extension]
   */
  private generateFileKey(originalname: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hash = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(originalname);

    return `${this.baseFolder}/${year}/${month}/${hash}${extension}`;
  }

  /**
   * Uploads a file to S3
   * @param file The file to upload
   * @returns The S3 key of the uploaded file
   */
  async uploadFile(file: Express.Multer.File): Promise<{
    key: string;
    fileName: string;
  }> {
    try {
      const key = this.generateFileKey(file.originalname);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalname: file.originalname
        }
      });

      await this.s3Client.send(command);

      return {
        key,
        fileName: file.originalname
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Generates a presigned URL for file download
   * @param key The S3 key of the file
   * @returns Presigned URL valid for 1 hour
   */
  async generatePresignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      // Generate URL valid for 1 hour
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600
      });

      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Deletes a file from S3
   * @param key The S3 key of the file to delete
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Validates file size and type
   * @param file The file to validate
   * @throws Error if validation fails
   */
  validateFile(file: Express.Multer.File): void {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed');
    }
  }

  /**
   * Gets metadata for a file
   * @param key The S3 key of the file
   * @returns Object containing file metadata
   */
  async getFileMetadata(key: string): Promise<{
    contentType: string;
    originalname: string;
    size: number;
  }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.s3Client.send(command);

      return {
        contentType: response.ContentType || '',
        originalname: response.Metadata?.originalname || '',
        size: response.ContentLength || 0
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }
}