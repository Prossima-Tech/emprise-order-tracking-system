// infrastructure/services/TextractService.ts
import { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';
import * as fs from 'fs';

export class TextractService {
  private client: TextractClient;

  constructor() {
    this.client = new TextractClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Extract text from document (PDF or image) using AWS Textract
   * Returns raw text extracted from the document
   */
  async extractText(filePath: string): Promise<string> {
    try {
      console.log('Using AWS Textract for document text extraction...');

      // Read file as buffer
      const documentBuffer = fs.readFileSync(filePath);

      // Use DetectDocumentText for simple text extraction
      // This is more cost-effective than AnalyzeDocument
      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: documentBuffer,
        },
      });

      const response = await this.client.send(command);

      if (!response.Blocks || response.Blocks.length === 0) {
        throw new Error('No text detected in document');
      }

      // Extract text from LINE blocks (maintains document structure better than WORD blocks)
      const lines: string[] = [];
      for (const block of response.Blocks) {
        if (block.BlockType === 'LINE' && block.Text) {
          lines.push(block.Text);
        }
      }

      const extractedText = lines.join('\n');
      console.log('Textract extraction successful. Text length:', extractedText.length);
      console.log('Sample text:', extractedText.substring(0, 300));

      return extractedText;
    } catch (error) {
      console.error('AWS Textract error:', error);
      if (error instanceof Error) {
        throw new Error(`Textract extraction failed: ${error.message}`);
      }
      throw new Error('Textract extraction failed');
    }
  }

  /**
   * Extract text with key-value pairs and tables using AnalyzeDocument
   * More expensive but provides structured data extraction
   */
  async analyzeDocument(filePath: string): Promise<{
    text: string;
    keyValues: Map<string, string>;
    tables: any[];
  }> {
    try {
      console.log('Using AWS Textract AnalyzeDocument for advanced extraction...');

      const documentBuffer = fs.readFileSync(filePath);

      const command = new AnalyzeDocumentCommand({
        Document: {
          Bytes: documentBuffer,
        },
        FeatureTypes: ['FORMS', 'TABLES'], // Extract forms and tables
      });

      const response = await this.client.send(command);

      if (!response.Blocks || response.Blocks.length === 0) {
        throw new Error('No content detected in document');
      }

      // Extract text
      const lines: string[] = [];
      const keyValues = new Map<string, string>();
      const tables: any[] = [];

      for (const block of response.Blocks) {
        if (block.BlockType === 'LINE' && block.Text) {
          lines.push(block.Text);
        }

        // Extract key-value pairs
        if (block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes?.includes('KEY')) {
          // Implementation for key-value extraction would go here
          // This is more complex and requires relationship traversal
        }
      }

      const text = lines.join('\n');

      return {
        text,
        keyValues,
        tables,
      };
    } catch (error) {
      console.error('AWS Textract AnalyzeDocument error:', error);
      throw new Error('Textract document analysis failed');
    }
  }
}
