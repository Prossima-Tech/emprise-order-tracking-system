// src/config/index.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  database: {
    url: process.env.DATABASE_URL
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucket: process.env.AWS_S3_BUCKET
    }
  },
  email: {
    user: process.env.EMAIL_USER!,
    from: process.env.EMAIL_FROM!,
    oauth2: {
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      refreshToken: process.env.EMAIL_REFRESH_TOKEN!,
      // tenantId: process.env.AZURE_TENANT_ID!
    }
  },
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  environment: process.env.NODE_ENV || 'development'
};

export default config;