// src/services/BudgetaryOfferService.ts
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import { S3Service } from './S3Service';
import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import { getZoneById } from '../../domain/entities/constants/railway';

export interface WorkItem {
  description: string;
  quantity: number;
  unitOfMeasurement: string;
  baseRate: number;
  taxRate: number;
}

export interface BudgetaryOfferData {
  id: string;
  offerId: string;
  offerDate: Date;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  termsConditions: string;
  status: string;
  railwayZone: string;
  createdBy: {
    name: string;
    department?: string;
    role: string;
  };
  tags: string[];
}

export class PDFService {
  private templatePath: string;

  constructor(private s3Service: S3Service) {
    this.templatePath = path.join(__dirname, '../templates/budgetary-offer.hbs');
    this.registerHandlebarsHelpers();
  }

  private registerHandlebarsHelpers() {
    handlebars.registerHelper('formatDate', (date: Date) => {
      return this.formatDate(date);
    });

    handlebars.registerHelper('formatCurrency', (amount: number) => {
      return this.formatCurrency(amount);
    });

    handlebars.registerHelper('formatNumber', (num: number) => {
      return this.formatIndianNumber(num);
    });

    handlebars.registerHelper('calculateGST', (baseRate: number, taxRate: number) => {
      return this.formatCurrency((baseRate * taxRate) / 100);
    });

    handlebars.registerHelper('calculateTotal', (baseRate: number, taxRate: number) => {
      const gst = (baseRate * taxRate) / 100;
      return this.formatCurrency(baseRate + gst);
    });

    handlebars.registerHelper('parseHTML', (htmlContent: string) => {
      return new handlebars.SafeString(htmlContent);
    });
  }

  private formatDate(date: Date | string): string {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-IN', { month: 'long' });
    const year = dateObj.getFullYear();
    return `${day}[${this.getOrdinal(day)}] ${month} ${year}`;
  }

  private getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  private formatIndianNumber(num: number): string {
    if (num === null || num === undefined) return '0.00';
    try {
      const parts = num.toFixed(2).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    } catch (error) {
      console.error('Error formatting number:', error);
      return '0.00';
    }
  }

  private formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return 'Rs. 0.00';
    try {
      return `Rs. ${this.formatIndianNumber(amount)}`;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return 'Rs. 0.00';
    }
  }

  private processTemplateData(data: BudgetaryOfferData) {
    const workItems = data.workItems.map(item => ({
      ...item,
      formattedBaseRate: this.formatCurrency(item.baseRate),
      formattedGST: this.formatCurrency((item.baseRate * item.taxRate) / 100),
      formattedTotal: this.formatCurrency(item.baseRate + (item.baseRate * item.taxRate) / 100)
    }));

    const zoneDetails = getZoneById(data.railwayZone);

    return {  
      ...data,
      workItems,
      formattedDate: this.formatDate(data.offerDate),
      railwayZoneDetails: zoneDetails
    };
  }

  private async generateHTML(data: BudgetaryOfferData): Promise<string> {
    try {
      const templateContent = await fs.readFile(this.templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      const processedData = this.processTemplateData(data);
      return template(processedData);
    } catch (error) {
      console.error('HTML Generation Error:', error);
      throw new Error('Failed to generate HTML template');
    }
  }

  private async generatePDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      const pdfArray = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '12mm',
          right: '12mm',
          bottom: '12mm',
          left: '12mm'
        },
        preferCSSPageSize: true
      });

      return Buffer.from(pdfArray);
    } finally {
      await browser.close();
    }
  }

  public async generateBudgetaryOfferPDF(data: BudgetaryOfferData): Promise<Buffer> {
    try {
      const html = await this.generateHTML(data);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }

  public async generateAndUploadBudgetaryOffer(data: BudgetaryOfferData): Promise<{ url: string; hash: string }> {
    try {
      const pdfBuffer = await this.generateBudgetaryOfferPDF(data);
      const hash = createHash('sha256').update(pdfBuffer).digest('hex');
      const fileName = `budgetary-offers/${data.id}/${data.offerId}.pdf`;
      const url = await this.s3Service.uploadFile(fileName, pdfBuffer, 'application/pdf');
      return { url, hash };
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate and upload budgetary offer PDF');
    }
  }
}