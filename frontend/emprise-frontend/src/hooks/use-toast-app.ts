import { useToast as useToastOriginal } from "./use-toast";

export function useToast() {
  const { toast } = useToastOriginal();

  const showSuccess = (message: string) => {
    toast({
      variant: "default",
      title: "Success",
      description: message,
    });
  };

  const showError = (message: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  };

  const showWarning = (message: string) => {
    toast({
      variant: "default",
      title: "Warning",
      description: message,
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
  };
}
