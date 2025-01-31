// infrastructure/services/DocumentVerifierService.ts
import { createHash } from 'crypto';
import { S3Service } from './S3Service';

export class DocumentVerifierService {
  constructor(private s3Service: S3Service) {}

  async verifyDocument(documentUrl: string, storedHash: string): Promise<{
    isValid: boolean;
    currentHash?: string;
    error?: string;
  }> {
    try {
      // Download the document from S3
      const documentBuffer = await this.downloadDocument(documentUrl);
      
      // Generate hash from current document
      const currentHash = this.generateHash(documentBuffer);
      
      // Compare hashes
      const isValid = currentHash === storedHash;

      return {
        isValid,
        currentHash,
        error: isValid ? undefined : 'Document hash mismatch - document may have been modified'
      };
    } catch (error) {
      console.error('Document verification error:', error);
      return {
        isValid: false,
        error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private generateHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private async downloadDocument(url: string): Promise<Buffer> {
    try {
      // Extract filename from URL
      const urlParts = new URL(url);
      const fileName = urlParts.pathname.split('/').pop();
      if (!fileName) {
        throw new Error('Invalid document URL');
      }

      // Use S3 service to get the document
      // You might need to implement this method in your S3Service
      const buffer = await this.s3Service.getFile(fileName);
      return buffer;
    } catch (error) {
      throw new Error(`Failed to download document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}