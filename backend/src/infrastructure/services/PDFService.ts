// infrastructure/services/PDFService.ts
import PDFDocument from 'pdfkit';
import { createHash } from 'crypto';
import { S3Service } from './S3Service';
import { JSDOM } from 'jsdom';

export interface WorkItem {
  description: string;
  baseRate: number;
  taxRate: number;
  quantity: number;
}

export interface DocumentData {
  id: string;
  documentId: string;
  offerDate: Date;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  termsConditions: string;
  status: string;
  createdBy: {
    name: string;
    department?: string;
    role: string;
  };
  tags: string[];
}

export class PDFService {
  constructor(private s3Service: S3Service) {}

  public async generatePDF(data: DocumentData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      
      doc.on('data', chunks.push.bind(chunks));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Document Structure
      this.addHeader(doc);
      this.addDocumentReference(doc, data);
      this.addRecipientDetails(doc, data);
      this.addSubjectSection(doc, data);
      this.addWorkItemsTable(doc, data.workItems);
      this.addTermsSection(doc, data.termsConditions);
      this.addSignatureSection(doc, data.createdBy);

      doc.end();
    });
  }

  private addHeader(doc: PDFKit.PDFDocument): void {
    doc.fontSize(16).font('Helvetica-Bold')
       .text('EMPRISE MARKETING', { align: 'center' })
       .moveDown(0.3);
       
    doc.fontSize(10).font('Helvetica')
       .text('B-1/31, Sector H, Aliganj', { align: 'center' })
       .text('Lucknow - 226024 (India)', { align: 'center' })
       .text('Tele Fax: (0522) 4017682 | E-mail: emprisemarketing@hotmail.com', { align: 'center' })
       .moveDown(2);
  }

  private addDocumentReference(doc: PDFKit.PDFDocument, data: DocumentData): void {
    const formattedDate = this.formatDate(data.offerDate);
    const startX = 50;
    const rightAlignX = doc.page.width - 200;
    
    doc.fontSize(10)
       .text(`Ref: ${data.documentId}`, startX, 150)
       .text(`Date: ${formattedDate}`, rightAlignX, 150)
       .moveDown(2);
  }

  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('en-IN', { month: 'long' });
    const year = date.getFullYear();
    return `${day}[${this.getOrdinal(day)}] ${month} ${year}`;
  }

  private getOrdinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    return suffixes[(n - 20) % 10] || suffixes[n] || suffixes[0];
  }

  private addRecipientDetails(doc: PDFKit.PDFDocument, data: DocumentData): void {
    doc.fontSize(11)
       .text('To,', 50)
       .text(data.toAuthority.split('\n').join('\n'), 50)
       .moveDown(2);
  }

  private addSubjectSection(doc: PDFKit.PDFDocument, data: DocumentData): void {
    doc.fontSize(11)
       .text(`Subject: ${data.subject}`, 50, undefined, { underline: true })
       .moveDown()
       .text('Dear Sir/Madam,')
       .text('Please find below our budgetary offer for your requirement:')
       .moveDown();
  }

  private addWorkItemsTable(doc: PDFKit.PDFDocument, workItems: WorkItem[]): void {
    const startX = 50;
    const colWidths = [45, 340, 130]; // Sr.No, Description, Amount
    const lineHeight = 20;
    const tableWidth = sum(colWidths);

    // Draw main table border
    const initialY = doc.y;
    doc.rect(startX, initialY, tableWidth, lineHeight * (workItems.length * 3 + 1)).stroke();

    // Table Headers
    this.drawTableRow(doc, startX, initialY, colWidths, ['Sr.No', 'Description of Work', 'Basic Rate/Coach'], true);

    let currentY = initialY + lineHeight;
    
    workItems.forEach((item, index) => {
      // Main Item Row
      this.drawTableRow(doc, startX, currentY, colWidths, [
        (index + 1).toString(),
        item.description,
        `₹${item.baseRate.toLocaleString('en-IN')}`
      ]);
      currentY += lineHeight;

      // GST Row
      const gst = item.baseRate * (item.taxRate / 100);
      this.drawTableRow(doc, startX, currentY, colWidths, [
        '',
        `GST@${item.taxRate}%`,
        `₹${gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
      ]);
      currentY += lineHeight;

      // Total Row
      const total = item.baseRate + gst;
      this.drawTableRow(doc, startX, currentY, colWidths, [
        '',
        `Total GST@${item.taxRate}% Inclusive Cost`,
        `₹${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
      ]);
      currentY += lineHeight;
    });

    doc.y = currentY + 20;
  }

  private drawTableRow(
    doc: PDFKit.PDFDocument,
    startX: number,
    y: number,
    colWidths: number[],
    cells: string[],
    isHeader = false
  ): void {
    const lineHeight = 20;
    const textY = y + (lineHeight - (isHeader ? 12 : 10)) / 2;
    
    cells.forEach((text, i) => {
      const cellX = startX + sum(colWidths.slice(0, i));
      const align = i === 0 ? 'center' : i === 2 ? 'center' : 'left'; // Changed 'right' to 'center' for the last column
      const padding = 5;

      // Draw vertical lines
      if (i > 0) doc.moveTo(cellX, y).lineTo(cellX, y + lineHeight).stroke();

      doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(isHeader ? 12 : 10)
         .text(text, cellX + padding, textY, {
           width: colWidths[i] - padding * 2,
           align,
           indent: 0 // Removed indent since we're using center alignment
         });
    });

    // Draw horizontal line
    doc.moveTo(startX, y + lineHeight).lineTo(startX + sum(colWidths), y + lineHeight).stroke();
  }

  private addTermsSection(doc: PDFKit.PDFDocument, terms: string): void {
    doc.font('Helvetica-Bold')
       .text('Terms & Conditions:', 50, doc.y + 20, { underline: true })
       .font('Helvetica');

    const dom = new JSDOM(terms);
    dom.window.document.querySelectorAll('li').forEach((item, index) => {
      doc.font('Helvetica-Oblique')
         .text(`• ${item.textContent?.trim()}`, 60, doc.y + 5)
         .font('Helvetica')
         .moveDown(0.5);
    });
  }

  private addSignatureSection(doc: PDFKit.PDFDocument, createdBy: DocumentData['createdBy']): void {
    doc.moveDown(2)
       .text('For EMPRISE MARKETING', 50)
       .moveDown(2)
       .font('Helvetica-Bold')
       .text(createdBy.name, 50)
       .font('Helvetica')
       .text(`${createdBy.department} - ${createdBy.role}`, 50);
  }

  async generateAndUploadBudgetaryOffer(data: DocumentData): Promise<{ url: string; hash: string }> {
    const pdfBuffer = await this.generatePDF(data);
    const hash = createHash('sha256').update(pdfBuffer).digest('hex');
    const fileName = `budgetary-offers/${data.id}/${data.documentId}.pdf`;
    const url = await this.s3Service.uploadFile(fileName, pdfBuffer, 'application/pdf');
    return { url, hash };
  }
}

// Helper function
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}