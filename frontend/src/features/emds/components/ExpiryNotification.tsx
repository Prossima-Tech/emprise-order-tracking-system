import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { EMD } from '../types/emd';
import { format } from 'date-fns';

interface ExpiryNotificationProps {
  emds: EMD[];
}

export function ExpiryNotification({ emds }: ExpiryNotificationProps) {
  const expiringEMDs = useMemo(() => {
    if (!Array.isArray(emds)) return [];
    
    return emds.filter((emd) => {
      if (emd.status !== 'ACTIVE') return false;
      const daysUntilMaturity = differenceInDays(
        new Date(emd.maturityDate),
        new Date()
      );
      return daysUntilMaturity <= 30 && daysUntilMaturity > 0;
    });
  }, [emds]);

  if (expiringEMDs.length === 0) return null;

  return (
    <Alert variant="default">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>EMDs Expiring Soon</AlertTitle>
      <AlertDescription>
        {expiringEMDs.length} EMD{expiringEMDs.length > 1 ? 's' : ''} will expire
        in the next 30 days. Please review them and take necessary action.
        <div className="mt-2">
          {expiringEMDs.map((emd) => (
            <div key={emd.id} className="text-sm">
              • {emd.bankName} - ₹{emd.amount.toLocaleString()} (Expires:{' '}
              {format(new Date(emd.maturityDate), 'PP')})
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
