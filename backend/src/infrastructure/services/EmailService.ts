// infrastructure/services/EmailService.ts
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { PDFService, DocumentData } from './PDFService';
import { POPDFService } from './POPdfService';
import { PDFGenerationData } from '../../domain/entities/PurchaseOrder';

interface SendBudgetaryOfferEmailParams {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  offerData: DocumentData;
  type: 'SUBMIT' | 'APPROVE' | 'REJECT';
  approveUrl?: string;
  rejectUrl?: string;
  comments?: string;
}

interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export class EmailService {
  private graphClient: Client;

  constructor(
    private config: {
      user: string;
      from: string;
      oauth2: OAuth2Config;
    },
    private pdfService: PDFService,
    private poPdfService: POPDFService
  ) {
    this.graphClient = Client.init({
      authProvider: async (done) => {
        try {
          const accessToken = await this.getAccessToken();
          done(null, accessToken);
        } catch (error) {
          console.error('Auth Provider Error:', error);
          done(error as Error, null);
        }
      }
    });
  }

  private async getAccessToken(): Promise<string> {
    const tokenEndpoint = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';

    // Updated scopes
    const scopes = [
      'offline_access',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/User.Read',
      'openid',
      'profile',
      'email'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.config.oauth2.clientId,
      client_secret: this.config.oauth2.clientSecret,
      refresh_token: this.config.oauth2.refreshToken,
      grant_type: 'refresh_token',
      scope: scopes
    });

    console.log('Requesting token with scopes:', scopes);

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token Error Response:', errorData);
      throw new Error(`Token request failed: ${JSON.stringify(errorData)}`);
    }

    interface TokenResponse {
      access_token: string;
    }
    const data = await response.json() as TokenResponse;
    return data.access_token;
  }

  async sendBudgetaryOfferEmail(params: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html: string;
    offerData: DocumentData;
  }): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const pdfBuffer = await this.pdfService.generatePDF(params.offerData);
      const base64File = pdfBuffer.toString('base64');

      const message = {
        message: {
          subject: params.subject,
          body: {
            contentType: 'HTML',
            content: params.html
          },
          toRecipients: params.to.map(email => ({
            emailAddress: { address: email }
          })),
          ccRecipients: params.cc?.map(email => ({
            emailAddress: { address: email }
          })) || [],
          bccRecipients: params.bcc?.map(email => ({
            emailAddress: { address: email }
          })) || [],
          attachments: [
            {
              '@odata.type': '#microsoft.graph.fileAttachment',
              name: `BudgetaryOffer_${params.offerData.documentId}.pdf`,
              contentType: 'application/pdf',
              contentBytes: base64File
            }
          ]
        },
        saveToSentItems: true
      };

      await this.graphClient
        .api('/me/sendMail')
        .post(message);

      return {
        success: true,
        messageId: new Date().getTime().toString()
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateBOEmailContent(
    offerData: DocumentData,
    type: 'SUBMIT' | 'APPROVE' | 'REJECT',
    approveUrl?: string,
    rejectUrl?: string,
    comments?: string
  ): string {
    const itemsTable = offerData.workItems.map(item => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">₹${item.baseRate.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">₹${(item.baseRate * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

    const totalAmount = offerData.workItems.reduce((sum, item) => sum + (item.baseRate * item.quantity), 0);

    let statusMessage = '';
    let actionMessage = '';
    let actionButtons = '';

    if (type === 'SUBMIT' && approveUrl && rejectUrl) {
      actionButtons = `
      <div style="margin-top: 30px; text-align: center;">
        <a href="${approveUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          margin: 0 10px;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;">
          Approve Offer
        </a>
        
        <a href="${rejectUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          margin: 0 10px;
          background-color: #dc3545;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;">
          Reject Offer
        </a>
      </div>
      <div style="margin-top: 15px; text-align: center; color: #666;">
        These approval links will expire in 24 hours
      </div>
    `;
    }

    switch (type) {
      case 'SUBMIT':
        statusMessage = 'Approval Required';
        actionMessage = `
        <div style="margin-top: 20px; background-color: #e9ecef; padding: 15px; border-radius: 5px;">
          <p>Please review the attached budgetary offer document and take one of the following actions:</p>
          <ul>
            <li>Approve the budgetary offer if all details are correct</li>
            <li>Reject with comments if any changes are required</li>
          </ul>
        </div>
      `;
        break;
      case 'APPROVE':
        statusMessage = 'Approved';
        actionMessage = `
        <div style="margin-top: 20px; background-color: #d4edda; padding: 15px; border-radius: 5px;">
          <p>This budgetary offer has been approved.</p>
          ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
        </div>
      `;
        break;
      case 'REJECT':
        statusMessage = 'Rejected';
        actionMessage = `
        <div style="margin-top: 20px; background-color: #f8d7da; padding: 15px; border-radius: 5px;">
          <p>This budgetary offer has been rejected.</p>
          ${comments ? `<p><strong>Reason:</strong> ${comments}</p>` : ''}
        </div>
      `;
        break;
    }

    return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Budgetary Offer ${statusMessage} - ${offerData.documentId}</h2>
      
      ${actionButtons}
      <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <p><strong>Offer ID:</strong> ${offerData.documentId}</p>
        <p><strong>Date:</strong> ${new Date(offerData.offerDate).toLocaleDateString()}</p>
        <p><strong>To Authority:</strong> ${offerData.toAuthority}</p>
        <p><strong>Subject:</strong> ${offerData.subject}</p>
        <p><strong>Created By:</strong> ${offerData.createdBy.name}</p>
        <p><strong>Department:</strong> ${offerData.createdBy.department}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
      </div>

      <h3>Work Items:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Unit Price</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTable}
        </tbody>
      </table>

      <div style="margin-top: 20px;">
        <p><strong>Terms and Conditions:</strong></p>
        <p>${offerData.termsConditions}</p>
      </div>

      ${actionMessage}

      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  `;
  }

  async sendBudgetaryOfferApproveEmail(params: SendBudgetaryOfferEmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const pdfBuffer = await this.pdfService.generatePDF(params.offerData);
      const base64File = pdfBuffer.toString('base64');

      const message = {
        message: {
          subject: params.subject,
          body: {
            contentType: 'HTML',
            content: this.generateBOEmailContent(
              params.offerData,
              params.type,
              params.approveUrl,
              params.rejectUrl,
              params.comments
            )
          },
          toRecipients: params.to.map(email => ({
            emailAddress: { address: email }
          })),
          ccRecipients: params.cc?.map(email => ({
            emailAddress: { address: email }
          })) || [],
          bccRecipients: params.bcc?.map(email => ({
            emailAddress: { address: email }
          })) || [],
          attachments: [
            {
              '@odata.type': '#microsoft.graph.fileAttachment',
              name: `BudgetaryOffer_${params.offerData.documentId}.pdf`,
              contentType: 'application/pdf',
              contentBytes: base64File
            }
          ]
        },
        saveToSentItems: true
      };

      await this.graphClient
        .api('/me/sendMail')
        .post(message);

      return {
        success: true,
        messageId: new Date().getTime().toString()
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private generatePOEmailContent(
    poData: PDFGenerationData,
    type: 'SUBMIT' | 'APPROVE' | 'REJECT',
    approveUrl?: string,
    rejectUrl?: string,
    comments?: string): string {
    const itemsTable = poData.items.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.item.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">₹${item.unitPrice.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">₹${item.totalAmount.toFixed(2)}</td>
      </tr>
    `).join('');

    const totalAmount = poData.items.reduce((sum, item) => sum + item.totalAmount, 0);

    let statusMessage = '';
    let actionMessage = '';
    let actionButtons = '';

    if (type === 'SUBMIT' && approveUrl && rejectUrl) {
      actionButtons = `
      <div style="margin-top: 30px; text-align: center;">
        <a href="${approveUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          margin: 0 10px;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;">
          Approve PO
        </a>
        
        <a href="${rejectUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          margin: 0 10px;
          background-color: #dc3545;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;">
          Reject PO
        </a>
      </div>
      <div style="margin-top: 15px; text-align: center; color: #666;">
        These approval links will expire in 24 hours
      </div>
    `;
    }

    switch (type) {
      case 'SUBMIT':
        statusMessage = 'Approval Required';
        actionMessage = `
          <div style="margin-top: 20px; background-color: #e9ecef; padding: 15px; border-radius: 5px;">
            <p>Please review the attached purchase order document and take one of the following actions:</p>
            <ul>
              <li>Approve the purchase order if all details are correct</li>
              <li>Reject with comments if any changes are required</li>
            </ul>
          </div>
        `;
        break;
      case 'APPROVE':
        statusMessage = 'Approved';
        actionMessage = `
          <div style="margin-top: 20px; background-color: #d4edda; padding: 15px; border-radius: 5px;">
            <p>This purchase order has been approved.</p>
            ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
          </div>
        `;
        break;
      case 'REJECT':
        statusMessage = 'Rejected';
        actionMessage = `
          <div style="margin-top: 20px; background-color: #f8d7da; padding: 15px; border-radius: 5px;">
            <p>This purchase order has been rejected.</p>
            ${comments ? `<p><strong>Reason:</strong> ${comments}</p>` : ''}
          </div>
        `;
        break;
    }

    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Purchase Order ${statusMessage} - ${poData.poNumber}</h2>
        
        ${actionButtons}
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <p><strong>PO Number:</strong> ${poData.poNumber}</p>
          <p><strong>Vendor:</strong> ${poData.vendor.name}</p>
          <p><strong>Created By:</strong> ${poData.createdBy.name}</p>
          <p><strong>Department:</strong> ${poData.createdBy.department}</p>
          <p><strong>LOA Number:</strong> ${poData.loa.loaNumber}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
        </div>

        <h3>Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Unit Price</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTable}
          </tbody>
        </table>

        <div style="margin-top: 20px;">
          <p><strong>Requirement Description:</strong></p>
          <p>${poData.requirementDesc}</p>
        </div>

        <div style="margin-top: 20px;">
          <p><strong>Shipping Address:</strong></p>
          <p>${poData.shipToAddress}</p>
        </div>

        ${actionMessage}

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated message. Please do not reply directly to this email.
        </p>
      </div>
    `;
  }

  async sendPurchaseOrderApproveEmail(params: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    poData: PDFGenerationData;
    type: 'SUBMIT' | 'APPROVE' | 'REJECT';
    approveUrl?: string;
    rejectUrl?: string;
    comments?: string;
  }): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const pdfBuffer = await this.poPdfService.generatePurchaseOrderPDF(params.poData);
      const base64File = pdfBuffer.toString('base64');

      const subject = `Purchase Order ${params.poData.poNumber} - ${params.type === 'SUBMIT' ? 'Approval Required' :
        params.type === 'APPROVE' ? 'Approved' : 'Rejected'
        }`;

      const message = {
        message: {
          subject,
          body: {
            contentType: 'HTML',
            // Fix the parameter order here:
            content: this.generatePOEmailContent(
              params.poData,
              params.type,
              params.approveUrl,
              params.rejectUrl,
              params.comments
            )
          },
          toRecipients: params.to.map(email => ({
            emailAddress: { address: email }
          })),
          ccRecipients: params.cc?.map(email => ({
            emailAddress: { address: email }
          })) || [],
          bccRecipients: params.bcc?.map(email => ({
            emailAddress: { address: email }
          })) || [],
          attachments: [
            {
              '@odata.type': '#microsoft.graph.fileAttachment',
              name: `PurchaseOrder_${params.poData.poNumber}.pdf`,
              contentType: 'application/pdf',
              contentBytes: base64File
            }
          ]
        },
        saveToSentItems: true
      };

      await this.graphClient
        .api('/me/sendMail')
        .post(message);

      return {
        success: true,
        messageId: new Date().getTime().toString()
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}