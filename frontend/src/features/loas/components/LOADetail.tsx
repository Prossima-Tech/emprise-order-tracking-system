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
  Pencil, // Added Pencil icon for edit
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
    case 'NOT_STARTED':
      return 'bg-gray-100 text-gray-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'SUPPLY_WORK_COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CHASE_PAYMENT':
      return 'bg-amber-100 text-amber-800';
    case 'CLOSED':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper to display readable status text
const getStatusDisplayText = (status: LOA['status']) => {
  switch (status) {
    case 'NOT_STARTED':
      return '1. Not Started';
    case 'IN_PROGRESS':
      return '2. In Progress';
    case 'SUPPLY_WORK_COMPLETED':
      return '4. Supply/Work Completed';
    case 'CHASE_PAYMENT':
      return '7. Chase Payment';
    case 'CLOSED':
      return '9. Closed';
    default:
      return status;
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
        data.status = 'NOT_STARTED';
      }

      setLOA(data);
    } catch (error) {
      console.error("Error fetching LOA:", error);
      // Redirect to LOA list if LOA not found
      navigate("/loas");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
            variant="outline"
            onClick={() => navigate(`/loas/${id}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit LOA
          </Button>
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
                  {getStatusDisplayText(loa.status)}
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
          <TabsTrigger value="billing">
            Billing {loa.invoices && loa.invoices.length > 0 && `(${loa.invoices.length})`}
          </TabsTrigger>
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

              {/* Due Date */}
              <div>
                <h3 className="text-lg font-medium mb-2">Due Date</h3>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {loa.dueDate ? format(new Date(loa.dueDate), "PPP") : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Received Date */}
              <div>
                <h3 className="text-lg font-medium mb-2">Order Received Date</h3>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {loa.orderReceivedDate ? format(new Date(loa.orderReceivedDate), "PPP") : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty Period */}
              <div>
                <h3 className="text-lg font-medium mb-2">Warranty Period</h3>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  {/* Warranty Duration */}
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Duration</div>
                    <div className="text-sm">
                      {loa.warrantyPeriodYears || loa.warrantyPeriodMonths ? (
                        <>
                          {loa.warrantyPeriodYears && loa.warrantyPeriodYears > 0 && (
                            <span>{loa.warrantyPeriodYears} {loa.warrantyPeriodYears === 1 ? 'year' : 'years'}</span>
                          )}
                          {loa.warrantyPeriodYears && loa.warrantyPeriodYears > 0 && loa.warrantyPeriodMonths && loa.warrantyPeriodMonths > 0 && (
                            <span> and </span>
                          )}
                          {loa.warrantyPeriodMonths && loa.warrantyPeriodMonths > 0 && (
                            <span>{loa.warrantyPeriodMonths} {loa.warrantyPeriodMonths === 1 ? 'month' : 'months'}</span>
                          )}
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>

                  {/* Warranty Dates */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Start Date</div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {loa.warrantyStartDate ? format(new Date(loa.warrantyStartDate), "PPP") : "-"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">End Date</div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {loa.warrantyEndDate ? format(new Date(loa.warrantyEndDate), "PPP") : "-"}
                        </span>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${loa.hasEmd ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {loa.hasEmd ? 'Required' : 'Not Required'}
                        </span>
                        <span className="font-medium">Amount: {formatCurrency(loa.emdAmount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Deposit Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Security Deposit</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${loa.hasSecurityDeposit ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {loa.hasSecurityDeposit ? 'Required' : 'Not Required'}
                        </span>
                        <span className="font-medium">Amount: {formatCurrency(loa.securityDepositAmount || 0)}</span>
                      </div>
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
                </div>
              </div>

              {/* Performance Guarantee Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Performance Guarantee</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${loa.hasPerformanceGuarantee ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {loa.hasPerformanceGuarantee ? 'Required' : 'Not Required'}
                        </span>
                        <span className="font-medium">Amount: {formatCurrency(loa.performanceGuaranteeAmount || 0)}</span>
                      </div>
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
                </div>
              </div>

              {/* Additional Remarks (Remarks2) */}
              {loa.remarks2 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Additional Remarks (Remarks2)</h3>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {loa.remarks2}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Invoice Information</CardTitle>
              <CardDescription>
                Track all billing, invoices, and payment information for this LOA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Show invoice if exists, otherwise show empty state with all fields */}
                {loa.invoices && loa.invoices.length > 0 ? (
                  loa.invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg overflow-hidden">
                      {/* Invoice Header */}
                      <div className="bg-muted px-4 py-3 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {invoice.invoiceNumber || '-'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Last updated: {format(new Date(invoice.updatedAt), "PPP")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Details */}
                      <div className="p-4 space-y-6">
                        {/* Financial Summary Grid - ALWAYS SHOW ALL FIELDS */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          {/* Last Invoice Amount */}
                          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Last Invoice Amount
                            </h4>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              {formatCurrency(invoice.invoiceAmount || 0)}
                            </p>
                          </div>

                          {/* Total Receivables */}
                          <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Total Receivables
                            </h4>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                              {formatCurrency(invoice.totalReceivables || 0)}
                            </p>
                          </div>

                          {/* Actual Amount Received */}
                          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Actual Amount Received
                            </h4>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {formatCurrency(invoice.actualAmountReceived || 0)}
                            </p>
                          </div>

                          {/* Amount Pending */}
                          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Amount Pending
                            </h4>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                              {formatCurrency(invoice.amountPending || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Deduction Information - ALWAYS SHOW */}
                        <div className={`border-l-4 p-4 rounded-lg ${invoice.amountDeducted && invoice.amountDeducted > 0 ? 'bg-red-50 dark:bg-red-950 border-red-500' : 'bg-gray-50 dark:bg-gray-950 border-gray-500'}`}>
                          <h4 className={`text-sm font-semibold mb-2 ${invoice.amountDeducted && invoice.amountDeducted > 0 ? 'text-red-800 dark:text-red-300' : 'text-gray-800 dark:text-gray-300'}`}>
                            Deduction Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Amount Deducted</span>
                              <span className={`text-lg font-bold ${invoice.amountDeducted && invoice.amountDeducted > 0 ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                {formatCurrency(invoice.amountDeducted || 0)}
                              </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                              <h5 className="text-sm font-medium text-muted-foreground mb-1">
                                Reason for Deduction
                              </h5>
                              <p className="text-sm">{invoice.deductionReason || "-"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Remarks - ALWAYS SHOW */}
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Remarks
                          </h4>
                          <p className="text-sm whitespace-pre-wrap">{invoice.remarks || "-"}</p>
                        </div>

                        {/* Bill Links - ALWAYS SHOW */}
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Bill Links
                          </h4>
                          <div className="flex items-center gap-2">
                            {invoice.billLinks ? (
                              <a
                                href={invoice.billLinks}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                View Bill Document
                              </a>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Empty state showing all fields with ₹0 or "-" */
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-3 border-b">
                      <h3 className="font-semibold text-lg">No Invoice Data</h3>
                      <p className="text-sm text-muted-foreground">All fields are displayed below</p>
                    </div>
                    <div className="p-4 space-y-6">
                      {/* Financial Summary Grid */}
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Invoice Amount</h4>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(0)}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Receivables</h4>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{formatCurrency(0)}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Actual Amount Received</h4>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(0)}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Amount Pending</h4>
                          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{formatCurrency(0)}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-950 border-l-4 border-gray-500 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">Deduction Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Amount Deducted</span>
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{formatCurrency(0)}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                            <h5 className="text-sm font-medium text-muted-foreground mb-1">Reason for Deduction</h5>
                            <p className="text-sm">-</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Remarks</h4>
                        <p className="text-sm">-</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Bill Links</h4>
                        <span className="text-sm text-muted-foreground">-</span>
                      </div>
                    </div>
                  </div>
                )}
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
