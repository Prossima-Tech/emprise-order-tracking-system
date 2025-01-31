// src/features/emds/components/EMDDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { FileText, ArrowLeft, AlertTriangle, FileImage, Trash2, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { useToast } from "../../../hooks/use-toast-app";
import { useEMDs } from "../hooks/use-emds";
import type { EMD } from "../types/emd";
import { cn } from "../../../lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";

export function EMDDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [emd, setEMD] = useState<EMD | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { getEMDById, updateEMDStatus, deleteEMD } = useEMDs();

  const fetchEMDDetails = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const data = await getEMDById(id);
      setEMD(data);
    } catch (error) {
      showError("Failed to fetch EMD details");
      console.error("Error fetching EMD:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEMDDetails();
  }, [id]);

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, "PPP");
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleDelete = async () => {
    try {
      if (!id) return;
      setIsDeleting(true);
      await deleteEMD(id);
      navigate('/emds');
    } catch (error) {
      console.error('Error deleting EMD:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (status: EMD['status']) => {
    try {
      if (!id) return;
      setIsUpdatingStatus(true);
      await updateEMDStatus(id, status);
      // Refresh EMD data after status update
      await fetchEMDDetails();
    } catch (error) {
      console.error('Error updating EMD status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!emd) {
    return (
      <Alert variant="destructive">
        <AlertDescription>EMD not found</AlertDescription>
      </Alert>
    );
  }

  const daysUntilMaturity = differenceInDays(new Date(emd.maturityDate), new Date());

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/emds")} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowLeft className="h-4 w-4 mr-2" />
            )}
            Back to EMDs
          </Button>
        </div>
        <div className="flex space-x-4">
          {emd.status === 'ACTIVE' && (
            <>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate('EXPIRED')}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Mark as Expired
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('RELEASED')}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Mark as Returned
              </Button>
            </>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete EMD
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the EMD
                  and remove all associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Maturity Warning */}
      {emd.status === 'ACTIVE' && daysUntilMaturity <= 30 && daysUntilMaturity > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This EMD will mature in {daysUntilMaturity} days. Please take necessary action.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{emd.bankName}</CardTitle>
              <CardDescription>
                Created on {formatDate(emd.createdAt)}
              </CardDescription>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                {
                  "bg-green-100 text-green-800": emd.status === "ACTIVE",
                  "bg-red-100 text-red-800": emd.status === "EXPIRED",
                  "bg-gray-100 text-gray-800": emd.status === "RELEASED",
                }
              )}
            >
              {emd.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Amount
              </h3>
              <p className="mt-1">{formatCurrency(emd.amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Payment Mode
              </h3>
              <p className="mt-1">{emd.paymentMode}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Submission Date
              </h3>
              <p className="mt-1">{formatDate(emd.submissionDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Maturity Date
              </h3>
              <p className="mt-1">{formatDate(emd.maturityDate)}</p>
            </div>
          </div>

          {/* Associated Offer */}
          {emd.offer && (
            <div>
              <h3 className="text-lg font-medium mb-2">Associated Offer</h3>
              <Button
                variant="outline"
                onClick={() => navigate(`/budgetary-offers/${emd.offer?.id}`)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {emd.offer?.subject} ({emd.offer?.offerId})
              </Button>
            </div>
          )}

          {/* Document Preview */}
          {emd.documentUrl && (
            <div>
              <h3 className="text-lg font-medium mb-2">EMD Document</h3>
              <Button
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <a
                  href={emd.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <FileImage className="h-4 w-4" />
                  View Document
                </a>
              </Button>
            </div>
          )}

          {/* Extracted Data */}
          {/* {emd.extractedData && (
            <div>
              <h3 className="text-lg font-medium mb-2">Extracted Information</h3>
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Extracted Bank Name
                    </h4>
                    <p className="mt-1">{emd.extractedData.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Extracted Amount
                    </h4>
                    <p className="mt-1">
                      {emd.extractedData.amount ? formatCurrency(emd.extractedData.amount) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Tags */}
          {emd.tags && emd.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {emd.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}