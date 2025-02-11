// setup.ts
import { PrismaClient } from '@prisma/client';
import { S3Service } from './infrastructure/services/S3Service';
import { PDFService } from './infrastructure/services/PDFService';
import { BudgetaryOfferService } from './application/services/BudgetaryOfferService';
import { PrismaBudgetaryOfferRepository } from './infrastructure/persistence/repositories/PrismaBudgetaryOfferRepository';
import { BudgetaryOfferValidator } from './application/validators/budgetaryOffer.validator';
import { config } from './config';
import { EmailService } from './infrastructure/services/EmailService';
import { DocumentVerifierService } from './infrastructure/services/DocumentVerificationService';
import { POPDFService } from './infrastructure/services/POPdfService';
import { TokenService } from './infrastructure/services/TokenService';
export function setupServices() {
  const prisma = new PrismaClient();
  
  // Initialize S3 service with config
  if (!config.aws.accessKeyId || !config.aws.secretAccessKey || !config.aws.region || !config.aws.s3.bucket) {
    throw new Error('AWS configuration is missing required values');
  }

  const s3Service = new S3Service({
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    bucket: config.aws.s3.bucket
  });
  
  const pdfService = new PDFService(s3Service);
  const budgetaryOfferRepository = new PrismaBudgetaryOfferRepository(prisma);
  const budgetaryOfferValidator = new BudgetaryOfferValidator();
  const poPdfService = new POPDFService(s3Service);
  const documentVerifier = new DocumentVerifierService(s3Service);
  const tokenService = new TokenService(config.jwt.secret);

  const emailService = new EmailService({
    user: config.email.user,
    from: config.email.from,
    oauth2: {
      clientId: config.email.oauth2.clientId,
      clientSecret: config.email.oauth2.clientSecret,
      refreshToken: config.email.oauth2.refreshToken,
      // tenantId: config.email.oauth2.tenantId
    },
    
  }, pdfService, poPdfService);

  const budgetaryOfferService = new BudgetaryOfferService(
    budgetaryOfferRepository, 
    budgetaryOfferValidator,
    pdfService,
    documentVerifier,
    emailService,
    tokenService
  );

  return {
    prisma,
    s3Service,
    pdfService,
    budgetaryOfferService,
  };
}