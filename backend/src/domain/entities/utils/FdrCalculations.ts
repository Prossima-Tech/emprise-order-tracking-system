export class FdrCalculations {

  static isExpired(maturityDate?: Date): boolean {
    if (!maturityDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return maturityDate < now;
  }

  static getDaysUntilMaturity(maturityDate?: Date): number {
    if (!maturityDate) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = maturityDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getDaysRemaining(dateOfDeposit: Date, maturityDate?: Date): number {
    if (!maturityDate) return 0;
    const diffTime = maturityDate.getTime() - dateOfDeposit.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
