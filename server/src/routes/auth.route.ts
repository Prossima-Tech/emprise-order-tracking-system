// // src/routes/auth.routes.ts
// import express from 'express';
// import { AuthController } from '../controllers/authController';
// import { validateRequest } from '../middlewares/validate';
// import { loginSchema, registerSchema, resetPasswordSchema, changePasswordSchema } from '../middlewares/validations/auth.validation';
// import { authenticate } from '../middlewares/auth';

// const router = express.Router();
// const authController = new AuthController();

// // Public routes
// router.post('/register', validateRequest(registerSchema), AuthController.register);
// router.post('/login', validateRequest(loginSchema), AuthController.login);
// router.post('/refresh-token', AuthController.refreshToken);
// router.post('/forgot-password', AuthController.forgotPassword);
// router.post('/reset-password', validateRequest(resetPasswordSchema), AuthController.resetPassword);

// // Protected routes
// router.use(authenticate);
// router.post('/logout', AuthController.logout);
// router.post('/change-password', validateRequest(changePasswordSchema), AuthController.changePassword);
// router.get('/me', AuthController.getCurrentUser);
// router.post('/update-profile', AuthController.updateProfile);

// export default router;