import { differenceInDays } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { FDR } from '../types/fdr';

interface ExpiryNotificationProps {
  fdrs: FDR[];
}

export function ExpiryNotification({ fdrs }: ExpiryNotificationProps) {
  const expiringFDRs = fdrs.filter((fdr) => {
    if (!fdr.maturityDate) return false;
    const daysUntilMaturity = differenceInDays(new Date(fdr.maturityDate), new Date());
    return daysUntilMaturity <= 30 && daysUntilMaturity > 0;
  });

  if (expiringFDRs.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>FDRs Expiring Soon</AlertTitle>
      <AlertDescription>
        You have {expiringFDRs.length} FDR(s) expiring within the next 30 days.
        Please review and take necessary action.
      </AlertDescription>
    </Alert>
  );
}
