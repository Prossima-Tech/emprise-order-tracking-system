// test-s3.ts
import dotenv from 'dotenv';
import path from 'path';
import { S3Service } from './infrastructure/services/S3Service';

// Load environment variables from .env file
// Make sure to specify the correct path to your .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Function to validate required environment variables
function validateEnvVariables() {
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    region: process.env.AWS_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    bucket: process.env.AWS_S3_BUCKET!
  };
}

async function testS3Connection() {
  try {
    // Validate and get environment variables
    const config = validateEnvVariables();
    
    console.log('Initializing S3 service with config:', {
      region: config.region,
      bucket: config.bucket,
      // Not logging credentials for security
    });

    // Initialize S3 service
    const s3Service = new S3Service({
      region: config.region,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      bucket: config.bucket
    });

    // Test file upload
    const testBuffer = Buffer.from('Hello, this is a test file');
    const fileName = `test-${Date.now()}.txt`;

    console.log('Attempting to upload test file...');
    const url = await s3Service.uploadFile(fileName, testBuffer, 'text/plain');
    
    console.log('Test file uploaded successfully!');
    console.log('File URL:', url);

    // Test getting signed URL
    console.log('Testing getSignedUrl...');
    const signedUrl = await s3Service.getSignedUrl(fileName);
    console.log('Signed URL generated successfully:', signedUrl);

    return true;
  } catch (error) {
    console.error('Error in S3 test:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Run the test
testS3Connection()
  .then(() => {
    console.log('S3 test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('S3 test failed:', error);
    process.exit(1);
  });