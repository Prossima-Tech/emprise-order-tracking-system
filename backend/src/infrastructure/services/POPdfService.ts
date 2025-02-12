import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { S3Service } from './S3Service';
import { createHash } from 'crypto';
import { JSDOM } from 'jsdom';

export interface PDFItemData {
  item: {
    name: string;
    description?: string;
  };
  quantity: number;
  unitPrice: number;
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
  private readonly PAGE_MARGIN = 20;
  private readonly CONTENT_MARGIN = 5;

  constructor(private s3Service: S3Service) {}
  private formatCurrency(amount: number): string {
    // Convert to string and split on decimal point
    const [integerPart, decimalPart = '00'] = amount.toFixed(2).split('.');
    
    // Add commas for thousands separator according to Indian numbering system
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Ensure decimal part is exactly 2 digits
    // const paddedDecimal = decimalPart.padEnd(2, '0');
    
    // Combine with currency symbol and proper spacing
    return `₹${formattedInteger}.${decimalPart}`; // Removed extra space after ₹
  }

  private formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  private parseHTML(htmlString: string): string {
    const dom = new JSDOM(htmlString);
    return dom.window.document.body.textContent || '';
  }

  private drawBorderedSection(doc: jsPDF, x: number, y: number, width: number, height: number) {
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(x, y, width, height);
  }

  public async generatePurchaseOrderPDF(data: PDFGenerationData): Promise<Buffer> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (2 * this.PAGE_MARGIN);
    
    // Page border with rounded corners
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.roundedRect(
      this.PAGE_MARGIN - 5, 
      this.PAGE_MARGIN - 5, 
      pageWidth - 2 * (this.PAGE_MARGIN - 5), 
      doc.internal.pageSize.height - 2 * (this.PAGE_MARGIN - 5), 
      3, 
      3
    );

    // Header section
    const headerY = this.PAGE_MARGIN;
    this.drawBorderedSection(
      doc, 
      this.PAGE_MARGIN, 
      headerY, 
      contentWidth, 
      35
    );
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPRISE MARKETING', pageWidth / 2, headerY + 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('B-1/31, Sector H, Aliganj, Lucknow - 226024 (India)', pageWidth / 2, headerY + 18, { align: 'center' });
    doc.text('Tel: (0522) 4017682 | Email: emprisemarketing@hotmail.com', pageWidth / 2, headerY + 24, { align: 'center' });
    doc.text('GSTIN: 09AABCE1234F1Z5', pageWidth / 2, headerY + 30, { align: 'center' });

    // Details section with three columns
    const detailsY = headerY + 40;
    const columnWidth = (contentWidth - 2 * this.CONTENT_MARGIN) / 3;
    
    // Draw three columns
    this.drawBorderedSection(doc, this.PAGE_MARGIN, detailsY, columnWidth, 30);
    this.drawBorderedSection(doc, this.PAGE_MARGIN + columnWidth + this.CONTENT_MARGIN, detailsY, columnWidth, 30);
    this.drawBorderedSection(doc, this.PAGE_MARGIN + 2 * (columnWidth + this.CONTENT_MARGIN), detailsY, columnWidth, 30);

    // Column contents
    doc.setFontSize(10);
    
    // To (Vendor)
    doc.setFont('helvetica', 'bold');
    doc.text('To:', this.PAGE_MARGIN + 3, detailsY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text([
      data.vendor.name,
      data.vendor.email
    ], this.PAGE_MARGIN + 3, detailsY + 14);

    // Bill To
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', this.PAGE_MARGIN + columnWidth + this.CONTENT_MARGIN + 3, detailsY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text([
      'Emprise Marketing',
      'B-1/31, Sector H, Aliganj',
      'Lucknow - 226024, India'
    ], this.PAGE_MARGIN + columnWidth + this.CONTENT_MARGIN + 3, detailsY + 14);

    // PO Details
    const poDetailsX = this.PAGE_MARGIN + 2 * (columnWidth + this.CONTENT_MARGIN) + 3;
    doc.setFont('helvetica', 'bold');
    doc.text([
      'P.O. Number:',
      'Date:',
      'LOA Number:'
    ], poDetailsX, detailsY + 7);
    
    doc.setFont('helvetica', 'normal');
    const detailsAlignX = poDetailsX + columnWidth - 5;
    doc.text([
      data.poNumber,
      this.formatDate(data.createdAt),
      data.loa.loaNumber
    ], detailsAlignX, detailsY + 7, { align: 'right' });

    // Requirement Description
    const reqY = detailsY + 35;
    this.drawBorderedSection(doc, this.PAGE_MARGIN, reqY, contentWidth, 30);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Requirement Description:', this.PAGE_MARGIN + 3, reqY + 7);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(data.requirementDesc, contentWidth - 10);
    doc.text(splitDesc, this.PAGE_MARGIN + 3, reqY + 14);

    // Items Table
    const tableY = reqY + 35;
    const tableHeaders = [['Sr.', 'Particulars', 'Qty', 'Unit Rate', 'Amount']];
    const tableBody = data.items.map((item, index) => [
      (index + 1).toString(),
      {
        content: item.item.name + (item.item.description ? `\n${item.item.description}` : ''),
        styles: { cellWidth: 'wrap' }
      },
      this.formatNumber(item.quantity),
      this.formatCurrency(item.unitPrice),
      this.formatCurrency(item.quantity * item.unitPrice)
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableBody as any,
      startY: tableY,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        lineWidth: 0.1,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 85 },
        2: { cellWidth: 30, halign: 'right' }, // Increased width
        3: { cellWidth: 30, halign: 'right' }, // Increased width
        4: { cellWidth: 30, halign: 'right' }  // Increased width
      },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });

    // Calculate totals
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const gstAmount = totalAmount * 0.18;
    const grandTotal = totalAmount + gstAmount;

    // Totals section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsWidth = 95; // Increased width
    const totalsX = pageWidth - this.PAGE_MARGIN - totalsWidth;
    
    this.drawBorderedSection(doc, totalsX, finalY, totalsWidth, 25);
    
    const amountLabels = ['Base Amount:', 'GST (18%):', 'Total Amount:'];
    const amountValues = [
      this.formatCurrency(totalAmount),
      this.formatCurrency(gstAmount),
      this.formatCurrency(grandTotal)
    ];

    doc.setFontSize(9);
    amountLabels.forEach((label, index) => {
      doc.setFont('helvetica', index === 2 ? 'bold' : 'normal');
      doc.text(label, totalsX + 2, finalY + 7 + (index * 7));
      doc.text(amountValues[index], totalsX + totalsWidth - 2, finalY + 7 + (index * 7), { align: 'right' });
    });

    // Terms and Conditions
    const termsY = finalY + 35;
    this.drawBorderedSection(doc, this.PAGE_MARGIN, termsY, contentWidth, 40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', this.PAGE_MARGIN + 3, termsY + 7);
    doc.setFont('helvetica', 'normal');
    const parsedTerms = this.parseHTML(data.termsConditions);
    const terms = doc.splitTextToSize(parsedTerms, contentWidth - 10);
    doc.text(terms, this.PAGE_MARGIN + 3, termsY + 14);

    // Signature and Ship To sections
    const bottomY = termsY + 45;
    const halfWidth = (contentWidth - this.CONTENT_MARGIN) / 2;

    // Signature section
    this.drawBorderedSection(doc, this.PAGE_MARGIN, bottomY, halfWidth, 35);
    doc.setFont('helvetica', 'bold');
    doc.text('FOR EMPRISE MARKETING', this.PAGE_MARGIN + 3, bottomY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(data.createdBy.name, this.PAGE_MARGIN + 3, bottomY + 20);
    doc.text('Authorised Signatory', this.PAGE_MARGIN + 3, bottomY + 27);

    // Ship To section
    this.drawBorderedSection(
      doc, 
      this.PAGE_MARGIN + halfWidth + this.CONTENT_MARGIN, 
      bottomY, 
      halfWidth, 
      35
    );
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To:', this.PAGE_MARGIN + halfWidth + this.CONTENT_MARGIN + 3, bottomY + 7);
    doc.setFont('helvetica', 'normal');
    const shipTo = doc.splitTextToSize(data.shipToAddress, halfWidth - 10);
    doc.text(shipTo, this.PAGE_MARGIN + halfWidth + this.CONTENT_MARGIN + 3, bottomY + 14);

    // Page number
    doc.setFontSize(8);
    doc.text(
      `Page 1 of 1`,
      pageWidth - this.PAGE_MARGIN,
      doc.internal.pageSize.height - this.PAGE_MARGIN,
      { align: 'right' }
    );

    return Buffer.from(doc.output('arraybuffer'));
  }

  public async generateAndUploadPurchaseOrder(data: PDFGenerationData): Promise<{ url: string; hash: string }> {
    try {
      const pdfBuffer = await this.generatePurchaseOrderPDF(data);
      const hash = createHash('sha256').update(pdfBuffer).digest('hex');
      const fileName = `purchase-orders/${data.poNumber}_${Date.now()}.pdf`;
      const url = await this.s3Service.uploadFile(fileName, pdfBuffer, 'application/pdf');
      return { url, hash };
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate and upload purchase order PDF');
    }
  }
}