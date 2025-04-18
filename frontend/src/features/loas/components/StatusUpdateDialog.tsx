import { LOA } from "../types/loa";
import { LOAStatusForm } from "./LOAStatusForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface StatusUpdateDialogProps {
  loa: LOA;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: () => void;
}

export function StatusUpdateDialog({
  loa,
  open,
  onOpenChange,
  onStatusUpdate,
}: StatusUpdateDialogProps) {
  const handleSuccess = () => {
    onStatusUpdate();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update LOA Status</DialogTitle>
          <DialogDescription>
            Change the status of LOA: {loa.loaNumber}
          </DialogDescription>
        </DialogHeader>
        <LOAStatusForm loa={loa} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
} 