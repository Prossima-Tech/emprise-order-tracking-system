// src/features/loas/components/LOADetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
// import { format, isAfter, differenceInDays } from "date-fns";
import {
  FileText,
  ArrowLeft,
  Plus,
  Calendar,
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

export function LOADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, getLOAById, deleteLOA } = useLOAs();
  const [loa, setLOA] = useState<LOA | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchLOA = async () => {
      if (!id) return;
      try {
        const data = await getLOAById(id);
        setLOA(data);
      } catch (error) {
        console.error("Error fetching LOA:", error);
      }
    };

    fetchLOA();
  }, [id]);

  if (loading) {
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
          <Button
            variant="outline"
            onClick={() => navigate(`/loas/${id}/edit`)}
          >
            Edit LOA
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Progress Section
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Status
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span
                  className={cn("rounded-full px-2 py-1 text-sm font-medium", {
                    "bg-gray-100": loa.status === "DRAFT",
                    "bg-green-100 text-green-800": loa.status === "ACTIVE",
                    "bg-blue-100 text-blue-800": loa.status === "COMPLETED",
                    "bg-red-100 text-red-800": loa.status === "CANCELLED",
                  })}
                >
                  {loa.status}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Delivery Progress
              </div>
              <div className="mt-2">
                <Progress value={progressPercentage} className="h-2" />
                <div className="mt-1 text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}% Complete
                  {isOverdue && (
                    <span className="text-red-500 ml-2">
                      ({Math.abs(differenceInDays(new Date(), new Date(loa.deliveryPeriod.end)))} days overdue)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Total Value
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  ₹{totalValue.toLocaleString()}
                </div>
                {totalValue !== loa.loaValue && (
                  <div className="text-sm text-muted-foreground">
                    Original: ₹{loa.loaValue.toLocaleString()}
                    <span
                      className={cn("ml-2", {
                        "text-green-600": totalValue > loa.loaValue,
                        "text-red-600": totalValue < loa.loaValue,
                      })}
                    >
                      ({((totalValue - loa.loaValue) / loa.loaValue * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}

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
              <CardTitle>LOA Information</CardTitle>
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
                            View PO
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
                {!loa.documentUrl && loa.amendments.every(a => !a.documentUrl) && (
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
    </div>
  );
}
