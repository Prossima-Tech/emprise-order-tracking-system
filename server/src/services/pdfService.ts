import PDFDocument from 'pdfkit';
import { BudgetaryOffer, WorkItem, EMDDetails } from '../types/budgetaryOffer';
import { format } from 'date-fns';
import { Readable, PassThrough } from 'stream';

export class PDFService {
  /**
   * Generates a PDF document for a budgetary offer
   * @param offer The budgetary offer data
   * @returns PDF document as a readable stream
   */
  static generateBudgetaryOfferPDF(offer: BudgetaryOffer): Readable {
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Add company letterhead
    this.addLetterhead(doc);

    // Add reference number and date
    doc
      .fontSize(10)
      .text(`Ref: BO/${format(offer.createdAt, 'yyyy')}/${offer.id.slice(0, 8)}`, { align: 'right' })
      .text(`Date: ${format(offer.offerDate, 'dd/MM/yyyy')}`, { align: 'right' })
      .moveDown();

    // Add authorities
    doc
      .fontSize(11)
      .text('From:', { continued: true })
      .text(offer.fromAuthority, { continued: false })
      .moveDown(0.5)
      .text('To:', { continued: true })
      .text(offer.toAuthority, { continued: false })
      .moveDown();

    // Add subject
    doc
      .fontSize(11)
      .text('Subject:', { continued: true, underline: true })
      .text(offer.subject)
      .moveDown();

    // Add work items table
    this.addWorkItemsTable(doc, offer.workItems);

    // Add EMD details
    this.addEMDDetails(doc, offer.emdDetails);

    // Add terms and conditions
    doc
      .moveDown()
      .fontSize(11)
      .text('Terms and Conditions:', { underline: true })
      .fontSize(10)
      .text(offer.termsAndConditions)
      .moveDown();

    // Add approval details if approved
    if (offer.status === 'APPROVED') {
      this.addApprovalDetails(doc, offer);
    }

    // Add footer
    this.addFooter(doc);

    // Create a PassThrough stream
    const stream = new PassThrough();

    // Pipe the PDF document to the stream
    doc.pipe(stream);

    // Finalize the PDF
    doc.end();

    return stream;
  }

  /**
   * Adds company letterhead to the PDF
   */
  private static addLetterhead(doc: PDFKit.PDFDocument): void {
    doc
      .fontSize(16)
      .text('EMPRISE', { align: 'center' })
      .fontSize(12)
      .text('Budgetary Offer', { align: 'center' })
      .moveDown();
  }

  /**
   * Adds work items table to the PDF
   */
  private static addWorkItemsTable(doc: PDFKit.PDFDocument, workItems: WorkItem[]): void {
    const tableTop = doc.y;
    const colWidths = {
      sno: 30,
      desc: 200,
      qty: 50,
      unit: 50,
      rate: 70,
      tax: 50,
      total: 90
    };

    // Add table headers
    doc
      .fontSize(10)
      .text('S.No', doc.x, tableTop)
      .text('Description', doc.x + colWidths.sno, tableTop)
      .text('Qty', doc.x + colWidths.sno + colWidths.desc, tableTop)
      .text('Unit', doc.x + colWidths.sno + colWidths.desc + colWidths.qty, tableTop)
      .text('Rate', doc.x + colWidths.sno + colWidths.desc + colWidths.qty + colWidths.unit, tableTop)
      .text('Tax%', doc.x + colWidths.sno + colWidths.desc + colWidths.qty + colWidths.unit + colWidths.rate, tableTop)
      .text('Total', doc.x + colWidths.sno + colWidths.desc + colWidths.qty + colWidths.unit + colWidths.rate + colWidths.tax, tableTop);

    let y = tableTop + 20;

    // Add table rows
    workItems.forEach((item, index) => {
      const total = item.quantity * item.baseRate * (1 + item.taxRate / 100);

      doc
        .text((index + 1).toString(), doc.x, y)
        .text(item.description, doc.x + colWidths.sno, y)
        .text(item.quantity.toString(), doc.x + colWidths.sno + colWidths.desc, y)
        .text(item.unitOfMeasurement, doc.x + colWidths.sno + colWidths.desc + colWidths.qty, y)
        .text(item.baseRate.toFixed(2), doc.x + colWidths.sno + colWidths.desc + colWidths.qty + colWidths.unit, y)
        .text(item.taxRate.toString() + '%', doc.x + colWidths.sno + colWidths.desc + colWidths.qty + colWidths.unit + colWidths.rate, y)
        .text(total.toFixed(2), doc.x + colWidths.sno + colWidths.desc + colWidths.qty + colWidths.unit + colWidths.rate + colWidths.tax, y);

      y += 20;
    });

    // Add total
    const grandTotal = workItems.reduce((sum, item) => {
      return sum + (item.quantity * item.baseRate * (1 + item.taxRate / 100));
    }, 0);

    doc
      .moveDown()
      .text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, { align: 'right' })
      .moveDown();
  }

  /**
   * Adds EMD details to the PDF
   */
  private static addEMDDetails(doc: PDFKit.PDFDocument, emdDetails: EMDDetails): void {
    doc
      .moveDown()
      .fontSize(11)
      .text('EMD Details:', { underline: true })
      .fontSize(10)
      .text(`Amount: Rs. ${emdDetails.amount.toFixed(2)}`)
      .text(`Payment Mode: ${emdDetails.paymentMode}`)
      .text(`Bank Name: ${emdDetails.bankName}`)
      .text(`Submission Date: ${format(emdDetails.submissionDate, 'dd/MM/yyyy')}`)
      .moveDown();
  }

  /**
   * Adds approval details to the PDF
   */
  private static addApprovalDetails(doc: PDFKit.PDFDocument, offer: BudgetaryOffer): void {
    doc
      .moveDown()
      .fontSize(11)
      .text('Approval Details:', { underline: true })
      .fontSize(10);

    offer.approvalLevels.forEach((level, index) => {
      if (level.status === 'APPROVED') {
        doc.text(`Level ${level.level}: Approved by ${level.user?.name || 'Unknown'}`);
        if (level.remarks) {
          doc.text(`Remarks: ${level.remarks}`);
        }
        if (level.timestamp) {
          doc.text(`Date: ${format(level.timestamp, 'dd/MM/yyyy HH:mm')}`);
        }
        doc.moveDown(0.5);
      }
    });
  }

  /**
   * Adds footer to the PDF
   */
  private static addFooter(doc: PDFKit.PDFDocument): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc
      .fontSize(8)
      .text(
        `Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        50,
        pageHeight - 50,
        { width: pageWidth - 100, align: 'center' }
      );
  }
}