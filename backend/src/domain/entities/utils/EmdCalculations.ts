export class EmdCalculations {
  
  static isExpired(maturityDate: Date): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return maturityDate < now;
  }

  static getDaysUntilExpiry(maturityDate: Date): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = maturityDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getDaysRemaining(submissionDate: Date, maturityDate: Date): number {
    const diffTime = maturityDate.getTime() - submissionDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}