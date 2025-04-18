// src/features/loas/components/LOADetail.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
// import { format, isAfter, differenceInDays } from "date-fns";
import {
  FileText,
  ArrowLeft,
  Plus,
  Calendar,
  Trash2, // Added Trash2 icon
  RefreshCw, // Added RefreshCw icon for status update
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useLOAs } from "../hooks/use-loas";
import type { LOA} from "../types/loa";
import { cn } from "../../../lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
// import { LOAForm } from "./LOAForm";
import { Badge } from "../../../components/ui/badge";
import { StatusUpdateDialog } from "./StatusUpdateDialog"; // Import the new dialog

// Add formatCurrency helper function
const formatCurrency = (value: number): string => {
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Add function to get status badge color
const getStatusBadgeStyle = (status: LOA['status']) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'CANCELLED': 
      return 'bg-red-100 text-red-800';
    case 'DELAYED':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function LOADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, getLOAById, deleteLOA, deleteAmendment } = useLOAs();
  const [loa, setLOA] = useState<LOA | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAmendmentDialogOpen, setDeleteAmendmentDialogOpen] = useState(false);
  const [amendmentToDelete, setAmendmentToDelete] = useState<{ id: string; number: string } | null>(null);
  // Add state for status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const fetchLOA = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getLOAById(id);
      
      // Ensure the LOA has a status value
      if (data && !data.status) {
        data.status = 'DRAFT';
      }
      
      setLOA(data);
    } catch (error) {
      console.error("Error fetching LOA:", error);
    }
  }, [id, getLOAById]);

  useEffect(() => {
    fetchLOA();
  }, [fetchLOA]);

  if (loading && !loa) {
    return <LoadingSpinner />;
  }

  if (!loa) {
    return (
      <Alert variant="destructive">
        <AlertDescription>LOA not found</AlertDescription>
      </Alert>
    );
  }

  // // Calculate delivery period progress
  // const totalDays = differenceInDays(
  //   new Date(loa.deliveryPeriod.end),
  //   new Date(loa.deliveryPeriod.start)
  // );
  // const daysElapsed = differenceInDays(
  //   new Date(),
  //   new Date(loa.deliveryPeriod.start)
  // );
  // const progressPercentage = Math.min(
  //   Math.max((daysElapsed / totalDays) * 100, 0),
  //   100
  // );

  // // Check if LOA is overdue
  // const isOverdue = isAfter(new Date(), new Date(loa.deliveryPeriod.end));

  // Calculate total value including amendments
  // const totalValue = loa.amendments.reduce(
  //   (sum, amendment) => sum + (amendment.valueChange || 0),
  //   loa.loaValue
  // );

  // const handleEdit = async (data: LOAFormData) => {
  //   if (!id) return;
  //   try {
  //     await updateLOA(id, data);
  //     // Refresh LOA details
  //     const updatedLOA = await getLOAById(id);
  //     setLOA(updatedLOA);
  //   } catch (error) {
  //     console.error('Error updating LOA:', error);
  //   }
  // };

  const handleDeleteAmendment = async () => {
    if (!amendmentToDelete) return;
    
    try {
      await deleteAmendment(amendmentToDelete.id);
      // Refresh LOA details after deletion
      fetchLOA();
      setDeleteAmendmentDialogOpen(false);
      setAmendmentToDelete(null);
    } catch (error) {
      console.error('Error deleting amendment:', error);
    }
  };

  // Add function to handle status refresh
  const handleStatusUpdate = async () => {
    fetchLOA();
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/loas")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LOAs
          </Button>
          <h1 className="text-2xl font-bold">LOA Details: {loa.loaNumber}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="default"
            onClick={() => navigate(`/loas/${id}/amendments/new`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Amendment
          </Button>
          {/* Add status update button */}
          <Button
            variant="outline"
            onClick={() => setStatusDialogOpen(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </div>
      </div>

      {/* Add Status Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Status
              </div>
              <div className="mt-2">
                <Badge className={cn("px-2 py-1", getStatusBadgeStyle(loa.status))}>
                  {loa.status || 'DRAFT'}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                LOA Value
              </div>
              <div className="mt-2 text-2xl font-bold">
                {formatCurrency(loa.loaValue)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Delivery Period
              </div>
              <div className="mt-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {format(new Date(loa.deliveryPeriod.start), "PP")} - {format(new Date(loa.deliveryPeriod.end), "PP")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="amendments">
            Amendments ({loa.amendments.length})
          </TabsTrigger>
          <TabsTrigger value="purchaseOrders">
            Purchase Orders ({loa.purchaseOrders.length})
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{loa.loaNumber}</CardTitle>
                  <CardDescription>
                    Created on {format(new Date(loa.createdAt), "PPP")}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold">
                    {formatCurrency(loa.loaValue)}
                  </span>
                  <span className="text-sm text-muted-foreground">Total Value</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LOA Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    LOA Number
                  </h3>
                  <p className="mt-1">{loa.loaNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Creation Date
                  </h3>
                  <p className="mt-1">
                    {format(new Date(loa.createdAt), "PPP")}
                  </p>
                </div>
              </div>

              {/* Delivery Period */}
              <div>
                <h3 className="text-lg font-medium mb-2">Delivery Period</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Start Date</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(loa.deliveryPeriod.start), "PPP")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">End Date</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(loa.deliveryPeriod.end), "PPP")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Description */}
              <div>
                <h3 className="text-lg font-medium mb-2">Work Description</h3>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {loa.workDescription}
                </div>
              </div>

              {/* Tags */}
              {loa.tags && loa.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {loa.tags.map((tag, index) => (
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

              {/* EMD Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Earnest Money Deposit (EMD)</h3>
                <div className="bg-muted p-4 rounded-lg">
                  {loa.hasEmd ? (
                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">Required</span>
                        <span className="font-medium">Amount: {formatCurrency(loa.emdAmount || 0)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No EMD required for this LOA</p>
                  )}
                </div>
              </div>

              {/* Security Deposit Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Security Deposit</h3>
                <div className="bg-muted p-4 rounded-lg">
                  {loa.hasSecurityDeposit ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">Required</span>
                        <span className="font-medium">Amount: {formatCurrency(loa.securityDepositAmount || 0)}</span>
                      </div>
                      {loa.securityDepositDocumentUrl && (
                        <div className="mt-2">
                          <a
                            href={loa.securityDepositDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Security Deposit Document
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-2">
                      No security deposit required for this LOA
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Guarantee Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Performance Guarantee</h3>
                <div className="bg-muted p-4 rounded-lg">
                  {loa.hasPerformanceGuarantee ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">Required</span>
                        <span className="font-medium">Amount: {formatCurrency(loa.performanceGuaranteeAmount || 0)}</span>
                      </div>
                      {loa.performanceGuaranteeDocumentUrl && (
                        <div className="mt-2">
                          <a
                            href={loa.performanceGuaranteeDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Performance Guarantee Document
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-2">
                      No performance guarantee required for this LOA
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amendments">
          <Card>
            <CardHeader>
              <CardTitle>Amendments History</CardTitle>
              <CardDescription>
                Track all modifications made to the original LOA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loa.amendments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No amendments have been made to this LOA
                </div>
              ) : (
                <div className="space-y-6">
                  {loa.amendments.map((amendment, index) => (
                    <div
                      key={amendment.id}
                      className={cn(
                        "border-l-2 pl-4 pb-6",
                        index === loa.amendments.length - 1 ? "" : "border-b"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">
                            {amendment.amendmentNumber}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Created on {format(new Date(amendment.createdAt), "PPP")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAmendmentToDelete({
                              id: amendment.id,
                              number: amendment.amendmentNumber
                            });
                            setDeleteAmendmentDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {amendment.tags && amendment.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {amendment.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {amendment.documentUrl && (
                        <a
                          href={amendment.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchaseOrders">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                View all purchase orders associated with this LOA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loa.purchaseOrders || loa.purchaseOrders.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No purchase orders have been created for this LOA
                </div>
              ) : (
                <div className="space-y-4">
                  {loa.purchaseOrders.map((po) => (
                    <div
                      key={po.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{po.poNumber}</h4>
                          <Badge variant={
                            po.status === 'COMPLETED' ? 'default' :
                            po.status === 'IN_PROGRESS' ? 'destructive' :
                            'secondary'
                          }>
                            {po.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created on {format(new Date(po.createdAt), "PPP")}
                        </div>
                        {typeof po.value === 'number' && (
                          <div className="text-sm font-medium">
                            Value: ₹{po.value.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {po.documentUrl && (
                          <a
                            href={po.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View PO document
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Access all documents associated with this LOA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Original LOA Document */}
                {loa.documentUrl && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Original LOA Document</div>
                        <div className="text-sm text-muted-foreground">
                          Uploaded on {format(new Date(loa.createdAt), "PPP")}
                        </div>
                      </div>
                    </div>
                    <a
                      href={loa.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}

                {/* Security Deposit Document */}
                {loa.hasSecurityDeposit && loa.securityDepositDocumentUrl && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Security Deposit Document</div>
                        <div className="text-sm text-muted-foreground">
                          Amount: {formatCurrency(loa.securityDepositAmount || 0)}
                        </div>
                      </div>
                    </div>
                    <a
                      href={loa.securityDepositDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}

                {/* Performance Guarantee Document */}
                {loa.hasPerformanceGuarantee && loa.performanceGuaranteeDocumentUrl && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Performance Guarantee Document</div>
                        <div className="text-sm text-muted-foreground">
                          Amount: {formatCurrency(loa.performanceGuaranteeAmount || 0)}
                        </div>
                      </div>
                    </div>
                    <a
                      href={loa.performanceGuaranteeDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}

                {/* Amendment Documents */}
                {loa.amendments.map((amendment) => (
                  amendment.documentUrl && (
                    <div key={amendment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            Amendment {amendment.amendmentNumber} Document
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Uploaded on {format(new Date(amendment.createdAt), "PPP")}
                          </div>
                        </div>
                      </div>
                      <a
                        href={amendment.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  )
                ))}

                {/* Show message if no documents are available */}
                {!loa.documentUrl && 
                  !loa.securityDepositDocumentUrl && 
                  !loa.performanceGuaranteeDocumentUrl && 
                  loa.amendments.every(a => !a.documentUrl) && (
                  <div className="text-center text-muted-foreground py-8">
                    No documents have been uploaded for this LOA
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete LOA</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete LOA {loa.loaNumber}? This action cannot be undone.
              <p className="mt-2 text-red-500">Warning: All amendments associated with this LOA will also be permanently deleted.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteLOA(loa.id);
                  navigate('/loas');
                } catch (error) {
                  console.error('Error deleting LOA:', error);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={deleteAmendmentDialogOpen} 
        onOpenChange={setDeleteAmendmentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Amendment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Amendment {amendmentToDelete?.number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteAmendmentDialogOpen(false);
                setAmendmentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAmendment}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Status Update Dialog */}
      {loa && (
        <StatusUpdateDialog
          loa={loa}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
