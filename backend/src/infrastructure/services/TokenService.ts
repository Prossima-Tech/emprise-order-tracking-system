import { error } from "console";
import { sign, verify } from "jsonwebtoken";

// infrastructure/services/TokenService.ts
interface ApprovalTokenPayload {
  poId: string;
  userId: string;
  userRole: string;  // Add role
  userEmail: string; // Add email
  action: 'approve' | 'reject';
  expiresIn: number;
}

export class TokenService {
  constructor(private secretKey: string) { }

  generateApprovalToken(
    poId: string,
    userId: string,
    userRole: string,
    userEmail: string,
    action: 'approve' | 'reject'
  ): string {
    const expiresIn = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const payload: ApprovalTokenPayload = {
      poId,
      userId,
      userRole,
      userEmail,
      action,
      expiresIn
    };

    return sign(payload, this.secretKey);
  }

  verifyApprovalToken(token: string): ApprovalTokenPayload | null {
    try {
      console.log('Starting token verification for token:', token);

      if (!token) {
        console.log('Token is undefined or empty');
        return null;
      }

      const payload = verify(token, this.secretKey) as ApprovalTokenPayload;
      console.log('Decoded token payload:', payload);

      if (Date.now() > payload.expiresIn) {
        console.log('Token has expired. Current time:', Date.now(), 'Expiry:', payload.expiresIn);
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }
}