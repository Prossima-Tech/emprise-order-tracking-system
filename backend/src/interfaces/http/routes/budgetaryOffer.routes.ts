// interfaces/http/routes/budgetaryOffer.routes.ts
import { Router } from 'express';
import { BudgetaryOfferController } from '../controllers/BudgetaryOfferController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';
/**
 * @swagger
 * 
 * /budgetary-offers:
 *   post:
 *     tags: [Budgetary Offers]
 *     summary: Create new offer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetaryOfferDto'
 *           example:
 *             tags: ["urgent", "new"]
 *             offerDate: "2024-01-23"
 *             toAuthority: "Central Procurement"
 *             subject: "Supply of Equipment"
 *             workItems: [
 *               {
 *                 description: "Industrial Generator",
 *                 quantity: 2,
 *                 unitOfMeasurement: "units",
 *                 baseRate: 50000,
 *                 taxRate: 18
 *               }
 *             ]
 *             termsConditions: "Delivery within 30 days"
 *             approverId: "auth123"
 *     responses:
 *       201:
 *         description: Offer created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BudgetaryOffer'
 * 
 *   get:
 *     tags: [Budgetary Offers]
 *     summary: Get all offers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/paginationOffset'
 *     responses:
 *       200:
 *         description: List of offers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BudgetaryOffer'
 * 
 * /budgetary-offers/{id}:
 *   get:
 *     tags: [Budgetary Offers]
 *     summary: Get single offer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer details
 * 
 *   put:
 *     tags: [Budgetary Offers]
 *     summary: Update offer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBudgetaryOfferDto'
 *     responses:
 *       200:
 *         description: Offer updated
 * 
 *   delete:
 *     tags: [Budgetary Offers]
 *     summary: Delete offer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Offer deleted
 * 
 * /budgetary-offers/{id}/generate-pdf:
 *   post:
 *     tags: [Budgetary Offers]
 *     summary: Generate PDF for offer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generated
 * 
 * /budgetary-offers/{id}/verify:
 *   get:
 *     tags: [Budgetary Offers]
 *     summary: Verify offer document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document verification result
 * 
 * /budgetary-offers/{id}/send-email:
 *   post:
 *     tags: [Budgetary Offers]
 *     summary: Send email for offer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email sent
 * 
 * /budgetary-offers/{id}/email-logs:
 *   get:
 *     tags: [Budgetary Offers]
 *     summary: Get email logs for offer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email logs retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmailLog'
 * 
 * /budgetary-offers/{id}/submit:
 *   post:
 *     tags: [Budgetary Offers]
 *     summary: Submit offer for approval
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer submitted for approval
 * /budgetary-offers/email-approve/{token}:
 *   get:
 *     tags: [Budgetary Offers]
 *     summary: Handle email approval
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer approved via email
 * 
 * /budgetary-offers/email-reject/{token}:
 *   get:
 *     tags: [Budgetary Offers]
 *     summary: Handle email rejection
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer rejected via email
 */

export function budgetaryOfferRoutes(controller: BudgetaryOfferController) {
  const router = Router();

  router.get('/email-approve/:token', controller.handleEmailApproval);

  router.get('/email-reject/:token', controller.handleEmailRejection);

  // Create new offer
  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.createOffer
  );

  // Update offer
  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.updateOffer
  );

  // Delete offer
  router.delete('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.deleteOffer
  );

  // Get single offer
  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getOffer
  );

  // Get all offers with pagination and filters
  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getOffers
  );

  router.post('/:id/generate-pdf',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.generatePDF
  );

  router.get('/:id/verify',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.verifyDocument
  );

  router.post('/:id/send-email',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.sendEmail
  );

  router.get('/:id/email-logs',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getEmailLogs
  );

  // Submit for approval
  router.post('/:id/submit',
    authMiddleware([UserRole.STAFF, UserRole.ADMIN]),
    controller.submitForApproval
  );

  // Approve offer
  // router.post('/:id/approve',
  //   authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
  //   controller.approveOffer
  // );

  // // Reject offer
  // router.post('/:id/reject',
  //   authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
  //   controller.rejectOffer
  // );

  return router;
}