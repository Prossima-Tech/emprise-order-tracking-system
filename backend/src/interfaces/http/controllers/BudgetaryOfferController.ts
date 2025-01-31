// interfaces/http/controllers/BudgetaryOfferController.ts
import { Request, Response } from 'express';
import { BudgetaryOfferService } from '../../../application/services/BudgetaryOfferService';
import { EmailStatus } from '../../../domain/entities/EmailLog';

export class BudgetaryOfferController {
  constructor(private service: BudgetaryOfferService) { }

  createOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // console.log(req.body);
      const result = await this.service.createOffer(req.body, userId);

      // console.log(result);

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(201).json(result.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: 'Internal server error', message: errorMessage });
    }
  };

  updateOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const offerId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const result = await this.service.updateOffer(offerId, req.body, userId);

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const offerId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const result = await this.service.deleteOffer(offerId, userId);

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const offerId = req.params.id;
      const result = await this.service.getOffer(offerId);

      if (!result.isSuccess) {
        res.status(404).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getOffers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, status, createdById, approverId } = req.query;

      const result = await this.service.getOffers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string,
        createdById: createdById as string,
        approverId: approverId as string
      });

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  generatePDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const offerId = req.params.id;
      const result = await this.service.generatePDF(offerId);

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  verifyDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const offerId = req.params.id;
      const result = await this.service.verifyDocument(offerId);

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  sendEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const offerId = req.params.id;
      const { to, cc, bcc, subject, content } = req.body;

      // Validate email parameters
      if (!to || !Array.isArray(to) || to.length === 0) {
        res.status(400).json({ error: 'At least one recipient is required' });
        return;
      }

      if (!subject || !content) {
        res.status(400).json({ error: 'Subject and content are required' });
        return;
      }

      const result = await this.service.sendOfferByEmail({
        offerId,
        to,
        cc,
        bcc,
        subject,
        content
      });

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getEmailLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const offerId = req.params.id;
      const {
        page,
        limit,
        startDate,
        endDate,
        status
      } = req.query;

      const result = await this.service.getEmailLogs(offerId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as EmailStatus
      });

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  submitForApproval = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const offerId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // await this.service.generatePDF(offerId);

      const result = await this.service.submitForApproval(offerId, userId);

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  approveOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const offerId = req.params.id;
      const { comments } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const result = await this.service.approveOffer(offerId, userId, comments);

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  rejectOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const offerId = req.params.id;
      const { comments } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const result = await this.service.rejectOffer(offerId, userId, comments);

      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // interfaces/http/controllers/BudgetaryOfferController.ts

  handleEmailApproval = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { comments } = req.query;

      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
      );

      // If no comments provided, show the approval form
      if (!comments) {
        res.send(`
        <html>
        <head>
          <style>
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .submit-button {
              position: relative;
              padding: 12px 24px;
              background-color: #28a745;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              min-width: 180px;
              transition: all 0.3s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }

            .submit-button:hover {
              background-color: #218838;
            }

            .submit-button:disabled {
              background-color: #6c757d;
              cursor: not-allowed;
              opacity: 0.7;
            }

            .spinner {
              display: none;
              width: 20px;
              height: 20px;
              border: 3px solid #ffffff;
              border-radius: 50%;
              border-top-color: transparent;
              animation: spin 1s linear infinite;
            }

            @keyframes spin {
              to { transform: rotate(360deg); }
            }

            .textarea-container {
              margin: 20px 0;
            }

            textarea {
              width: 100%;
              padding: 12px;
              border: 1px solid #ddd;
              border-radius: 4px;
              resize: vertical;
              min-height: 100px;
              margin-top: 8px;
            }
          </style>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
          <div class="container">
            <h2 style="color: #333; margin-bottom: 30px;">Approve Budgetary Offer</h2>
            
            <form id="approvalForm">
              <div class="textarea-container">
                <label for="comments" style="display: block; text-align: left; margin-bottom: 8px;">
                  Approval Comments:
                </label>
                <textarea 
                  name="comments" 
                  id="comments"
                  placeholder="Enter any comments for this approval..."></textarea>
              </div>
              
              <button type="button" id="submitBtn" class="submit-button">
                <span id="buttonText">Confirm Approval</span>
                <div id="spinner" class="spinner"></div>
              </button>
            </form>
          </div>

          <script>
            document.getElementById('submitBtn').addEventListener('click', async function(e) {
              e.preventDefault();
              
              const button = document.getElementById('submitBtn');
              const buttonText = document.getElementById('buttonText');
              const spinner = document.getElementById('spinner');
              const comments = document.getElementById('comments').value;
              
              // Disable button and show spinner
              button.disabled = true;
              buttonText.textContent = 'Processing...';
              spinner.style.display = 'block';

              // Redirect with comments
              window.location.href = '/api/budgetary-offers/email-approve/${token}?comments=' + encodeURIComponent(comments);
            });
          </script>
        </body>
        </html>
      `);
        return;
      }

      const result = await this.service.handleEmailApproval(token, comments as string);

      if (!result.isSuccess) {
        res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
            <h2 style="color: #dc3545;">Error</h2>
            <p>${result.error}</p>
          </body>
        </html>
      `);
        return;
      }

      res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
          <h2 style="color: #28a745;">Budgetary Offer Approved</h2>
          <p>The budgetary offer ${result.data?.offerId ?? 'Unknown'} has been successfully approved.</p>
          <p style="color: #666;">Comments: ${comments || 'No comments provided'}</p>
        </body>
      </html>
    `);
    } catch (error) {
      console.error('Email approval error:', error);
      res.status(500).send('An error occurred');
    }
  };

  handleEmailRejection = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { reason } = req.query;

      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
      );

      if (!reason) {
        res.send(`
        <html>
        <head>
          <style>
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .submit-button {
              position: relative;
              padding: 12px 24px;
              background-color: #dc3545;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              min-width: 180px;
              transition: all 0.3s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }

            .submit-button:hover {
              background-color: #c82333;
            }

            .submit-button:disabled {
              background-color: #6c757d;
              cursor: not-allowed;
              opacity: 0.7;
            }

            .spinner {
              display: none;
              width: 20px;
              height: 20px;
              border: 3px solid #ffffff;
              border-radius: 50%;
              border-top-color: transparent;
              animation: spin 1s linear infinite;
            }

            @keyframes spin {
              to { transform: rotate(360deg); }
            }

            .textarea-container {
              margin: 20px 0;
            }

            textarea {
              width: 100%;
              padding: 12px;
              border: 1px solid #ddd;
              border-radius: 4px;
              resize: vertical;
              min-height: 100px;
              margin-top: 8px;
            }
          </style>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
          <div class="container">
            <h2 style="color: #333; margin-bottom: 30px;">Reject Budgetary Offer</h2>
            
            <form id="rejectionForm">
              <div class="textarea-container">
                <label for="reason" style="display: block; text-align: left; margin-bottom: 8px;">
                  Rejection Reason:
                </label>
                <textarea 
                  name="reason" 
                  id="reason"
                  placeholder="Enter reason for rejection..."
                  required></textarea>
              </div>
              
              <button type="button" id="submitBtn" class="submit-button">
                <span id="buttonText">Confirm Rejection</span>
                <div id="spinner" class="spinner"></div>
              </button>
            </form>
          </div>

          <script>
            document.getElementById('submitBtn').addEventListener('click', async function(e) {
              e.preventDefault();
              
              const button = document.getElementById('submitBtn');
              const buttonText = document.getElementById('buttonText');
              const spinner = document.getElementById('spinner');
              const reason = document.getElementById('reason').value;
              
              if (!reason.trim()) {
                alert('Please provide a rejection reason');
                return;
              }
              
              // Disable button and show spinner
              button.disabled = true;
              buttonText.textContent = 'Processing...';
              spinner.style.display = 'block';

              // Redirect with reason
              window.location.href = '/api/budgetary-offers/email-reject/${token}?reason=' + encodeURIComponent(reason);
            });
          </script>
        </body>
        </html>
      `);
        return;
      }

      const result = await this.service.handleEmailRejection(token, reason as string);

      if (!result.isSuccess) {
        res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
            <h2 style="color: #dc3545;">Error</h2>
            <p>${result.error}</p>
          </body>
        </html>
      `);
        return;
      }

      res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
          <h2 style="color: #dc3545;">Budgetary Offer Rejected</h2>
          <p>The budgetary offer ${result.data?.offerId ?? 'Unknown'} has been rejected.</p>
          <p style="color: #666;">Reason: ${reason || 'No reason provided'}</p>
        </body>
      </html>
    `);
    } catch (error) {
      console.error('Email rejection error:', error);
      res.status(500).send('An error occurred');
    }
  };
}