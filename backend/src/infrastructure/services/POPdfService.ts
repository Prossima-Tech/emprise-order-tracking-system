// infrastructure/services/POPdfService.ts
import PDFDocument from 'pdfkit';
import { S3Service } from './S3Service';
import { createHash } from 'crypto';
import { JSDOM } from 'jsdom';

interface Column {
  width: number;
  align: 'left' | 'center' | 'right';
}

export interface PDFItemData {
  item: {
    name: string;
    description?: string;
  };
  quantity: number;
  unitPrice: number;
  // taxRates: {
  //   igst: number;
  //   sgst: number;
  //   ugst: number;
  // };
  // taxAmounts: {
  //   igst: number;
  //   sgst: number;
  //   ugst: number;
  // };
  // baseAmount: number;
  // totalAmount: number;
}

export interface PDFGenerationData {
  id: string;
  poNumber: string;
  createdAt: Date;
  loa: {
    loaNumber: string;
    loaValue: number;
  };
  vendor: {
    name: string;
    email: string;
  };
  items: PDFItemData[];
  requirementDesc: string;
  termsConditions: string;
  shipToAddress: string;
  notes?: string;
  status: string;
  createdBy: {
    name: string;
    department: string;
    role: string;
  };
  tags: string[];
}

export class POPDFService {
  private doc!: PDFKit.PDFDocument;
  private readonly margin = 35; // Reduced margin
  private currentY = this.margin;
  private readonly pageHeight = 792;
  private readonly tableWidth = 525; // Increased width to use more space
  private readonly columnWidth = 175; // Adjusted column width

  constructor(private s3Service: S3Service) {}

  private drawTableRow(cells: string[], columns: Column[], isHeader = false): number {
    let x = this.margin;
    let maxHeight = 0;

    cells.forEach((cell, i) => {
      const cellWidth = columns[i].width;
      const cellHeight = this.doc.heightOfString(cell, {
        width: cellWidth - 8, // Reduced padding
        align: columns[i].align
      });
      maxHeight = Math.max(maxHeight, cellHeight);
    });

    maxHeight += 12; // Increased padding for more space below upper line

    cells.forEach((cell, i) => {
      const column = columns[i];
      this.doc.text(cell, x + 4, this.currentY + 6, { // Added more top padding
        width: column.width - 8,
        align: column.align
      });

      if (i < cells.length - 1) {
        this.doc.moveTo(x + column.width, this.currentY)
          .lineTo(x + column.width, this.currentY + maxHeight)
          .stroke();
      }

      x += column.width;
    });

    this.currentY += maxHeight;
    return maxHeight;
  }

  public async generatePurchaseOrderPDF(data: PDFGenerationData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.doc = new PDFDocument({ margin: this.margin, size: 'A4', bufferPages: true });
      const chunks: Buffer[] = [];

      this.doc.on('data', chunks.push.bind(chunks));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);

      try {
        this.createMainTableStructure(data);
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private createMainTableStructure(data: PDFGenerationData): void {
    this.doc.rect(this.margin, this.currentY, this.tableWidth, 710).stroke(); // Increased height

    this.addHeaderSection(data);
    this.addHorizontalLine();

    this.addThreeColumnSection(data);
    this.addHorizontalLine();

    this.addRequirementDescription(data);
    this.addHorizontalLine();

    this.addItemsTable(data);
    this.addHorizontalLine();
    this.currentY += 8; // Extra line after items table

    this.addFinancialSummary(data);
    this.addHorizontalLine();

    this.addTermsConditions(data);
    this.addSignature(data);
  }

  private addHeaderSection(data: PDFGenerationData): void {
    this.currentY += 8; // Reduced spacing
    this.doc.fontSize(16).font('Helvetica-Bold')
      .text('EMPRISE MARKETING', this.margin + 10, this.currentY, { width: this.tableWidth - 20, align: 'center' });
    
    this.currentY += 20; // Reduced spacing
    this.doc.fontSize(9)
      .text('B-1/31, Sector H, Aliganj, Lucknow - 226024 (India)', this.margin + 10, this.currentY, { align: 'center' })
      .text('Tel: (0522) 4017682 | Email: emprisemarketing@hotmail.com', this.margin + 10, this.currentY + 10, { align: 'center' })
      .text('GSTIN: 09AABCE1234F1Z5', this.margin + 10, this.currentY + 20, { align: 'center' });
    
    this.currentY += 40; // Reduced spacing
  }

  private addThreeColumnSection(data: PDFGenerationData): void {
    const formattedDate = this.formatDate(data.createdAt);
    const col1X = this.margin;
    const col2X = this.margin + this.columnWidth;
    const col3X = this.margin + (this.columnWidth * 2);
    const sectionHeight = 70; // Reduced height

    this.doc.moveTo(col2X, this.currentY).lineTo(col2X, this.currentY + sectionHeight).stroke();
    this.doc.moveTo(col3X, this.currentY).lineTo(col3X, this.currentY + sectionHeight).stroke();

    this.doc.fontSize(10)
      .text('To:', col1X + 8, this.currentY)
      .text(data.vendor.name, col1X + 25, this.currentY)
      .text(data.vendor.email, col1X + 25, this.currentY + 12);

    this.doc.text('Bill To:', col2X + 8, this.currentY)
      .text('Emprise Marketing', col2X + 25, this.currentY)
      .text('B-1/31, Sector H, Aliganj', col2X + 25, this.currentY + 12)
      .text('Lucknow - 226024, India', col2X + 25, this.currentY + 24);

    this.doc.font('Helvetica-Bold')
      .text('P.O. No:', col3X + 8, this.currentY)
      .text(data.poNumber, col3X + 55, this.currentY)
      .text('P.O. Date:', col3X + 8, this.currentY + 12)
      .text(formattedDate, col3X + 55, this.currentY + 12);

    this.currentY += sectionHeight;
    this.checkPageBreak(180);
  }

  private addRequirementDescription(data: PDFGenerationData): void {
    this.currentY += 8;
    this.doc.fontSize(10).font('Helvetica-Bold')
      .text('Requirement Description:', this.margin + 8, this.currentY);
    
    this.doc.fontSize(9).font('Helvetica')
      .text(data.requirementDesc, this.margin + 8, this.currentY + 16, {
        width: this.tableWidth - 16,
        align: 'left'
      });

    this.currentY += 50; // Reduced spacing
  }

  private addItemsTable(data: PDFGenerationData): void {
    const columns = [
      { width: 30, align: 'center' },
      { width: 290, align: 'left' }, // Increased description width
      { width: 55, align: 'center' },
      { width: 85, align: 'center' },
      { width: 65, align: 'center' }
    ];

    this.currentY += 8;
    this.doc.fontSize(10).font('Helvetica-Bold');
    this.drawTableRow(['Sr.', 'Particulars', 'Qty', 'Unit Rate', 'Value'], columns as Column[], true);

    this.doc.fontSize(9).font('Helvetica');
    data.items.forEach((item, index) => {
      const rowHeight = this.drawTableRow([
        (index + 1).toString(),
        item.item.name + (item.item.description ? `\n${item.item.description}` : ''),
        item.quantity.toLocaleString('en-IN'),
        `₹${item.unitPrice.toLocaleString('en-IN')}`,
        // `₹${item.totalAmount.toLocaleString('en-IN')}`
      ], columns as Column[]);

      this.doc.rect(this.margin, this.currentY - rowHeight, this.tableWidth, rowHeight).stroke();
    });

    this.currentY += 16;
  }

  private addFinancialSummary(data: PDFGenerationData): void {
    this.checkPageBreak(90);
    
    const totals = data.items.reduce((acc, item) => ({
      base: acc.base || 0,
      total: acc.total || 0
    }), { base: 0, total: 0 });

    const summaryX = this.margin + 260;
    const valueX = this.margin + 460;

    this.doc.fontSize(10)
      .font('Helvetica')
      .text('Total (Basic Price):', summaryX, this.currentY + 8)
      // .text(`₹${totals.base.toLocaleString('en-IN')}`, valueX, this.currentY + 8)
      .moveDown(0.4)
      .font('Helvetica-Bold')
      .text('Grand Total (Inclusive of GST@18%):', summaryX, this.currentY + 20)
      // .text(`₹${totals.total.toLocaleString('en-IN')}`, valueX, this.currentY + 20);

    this.currentY += 35;
  }

  private addTermsConditions(data: PDFGenerationData): void {
    this.doc.fontSize(9).font('Helvetica-Bold')
      .text('Terms & Conditions:', this.margin + 8, this.currentY + 8);
    
    const dom = new JSDOM(data.termsConditions);
    let yPos = this.currentY + 20;
    
    dom.window.document.querySelectorAll('li').forEach((item, index) => {
      if(yPos > this.pageHeight - 90) {
        this.doc.addPage();
        yPos = this.margin;
      }
      
      this.doc.font('Helvetica').fontSize(9)
        .text(` ${index + 1}. ${item.textContent?.trim()}`, this.margin + 12, yPos);
      yPos += 12; // Reduced line spacing
    });

    this.currentY = yPos + 16;
  }

  private addSignature(data: PDFGenerationData): void {
    this.checkPageBreak(90);

    const signatureY = this.currentY + 16;
    const signatureMargin = this.margin + 25; // Added left margin for signature section
    
    this.doc.fontSize(10).font('Helvetica-Bold')
      .text('FOR EMPRISE MARKETING', signatureMargin, signatureY)
      .moveDown(1.5)
      .text(data.createdBy.name, signatureMargin, signatureY + 35)
      .font('Helvetica')
      .text('Authorised Signatory', signatureMargin, signatureY + 48);

    const shipToX = this.margin + 310;
    this.doc.fontSize(10).font('Helvetica-Bold')
      .text('Ship To:', shipToX, signatureY)
      .font('Helvetica')
      .text(data.shipToAddress, shipToX + 16, signatureY + 12, {
        width: 180,
        align: 'left'
      });

    this.currentY += 90;
  }

  private addHorizontalLine(): void {
    this.doc.moveTo(this.margin, this.currentY)
      .lineTo(this.margin + this.tableWidth, this.currentY)
      .stroke();
    this.currentY += 8; // Reduced spacing
  }

  private checkPageBreak(requiredHeight: number): void {
    if(this.currentY + requiredHeight > this.pageHeight) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    }).replace(/(\d+)/, (_, d) => `${d}[${this.getOrdinal(parseInt(d))}]`);
  }

  private getOrdinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  }

  private generateDocumentHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  async generateAndUploadPurchaseOrder(data: PDFGenerationData): Promise<{ url: string; hash: string }> {
    try {
      const pdfBuffer = await this.generatePurchaseOrderPDF(data);
      const hash = this.generateDocumentHash(pdfBuffer);
      const fileName = `purchase-orders/${data.poNumber}_${Date.now()}.pdf`;
      const url = await this.s3Service.uploadFile(fileName, pdfBuffer, 'application/pdf');
      return { url, hash };
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate and upload purchase order PDF');
    }
  }
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}