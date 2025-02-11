// src/features/purchase-orders/components/PODetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  FileText,
  Building,
  FileCheck,
  Package,
  Truck,
  AlertTriangle,
  Loader2,
  Edit,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
import { useToast } from "../../../hooks/use-toast-app";
import { usePurchaseOrders } from "../hooks/use-purchase-orders";
import type { PurchaseOrder } from "../types/purchase-order";
import { StatusBadge } from "../../../components/data-display/StatusBadge";

export function PODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { submitForApproval, markAsCompleted, getPurchaseOrder } = usePurchaseOrders();

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error("No order ID provided");
        }
        const orderData = await getPurchaseOrder(id);
        setOrder(orderData);
      } catch (error) {
        showError("Failed to fetch order details");
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Purchase order not found</AlertDescription>
      </Alert>
    );
  }

  // Calculate totals for all items
  const calculateTotals = (order: PurchaseOrder) => {
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.quantity * item.unitPrice);
    }, 0);

    return {
      subtotal,
      taxAmount: order.taxAmount,
      total: subtotal + order.taxAmount
    };
  };

  const totals = calculateTotals(order);

  // Handle status changes
  const handleStatusChange = async (action: "submit" | "complete") => {
    try {
      if (!id) throw new Error("No order ID provided");
      
      setSubmitting(true);
      
      if (action === "submit") {
        await submitForApproval(id);
        showSuccess("Purchase order submitted for approval successfully");
      } else {
        await markAsCompleted(id);
        showSuccess("Purchase order marked as completed");
      }

      // Refresh order details
      const updatedOrder = await getPurchaseOrder(id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error(`Failed to ${action} order:`, error);
      showError(`Failed to ${action} purchase order`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/purchase-orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
          <StatusBadge status={order?.status || 'DRAFT'} />
        </div>
        <div className="flex space-x-4">
          {order?.status === "DRAFT" && (
            <>
              <Button 
                variant="outline"
                onClick={() => navigate(`/purchase-orders/${id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Button>
              <Button 
                onClick={() => handleStatusChange("submit")}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </>
                )}
              </Button>
            </>
          )}
          {order?.status === "APPROVED" && (
            <Button 
              onClick={() => handleStatusChange("complete")}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Completed
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Status warnings for specific states */}
      {order.status === "PENDING_APPROVAL" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This order is awaiting approval. You will be notified once it has been reviewed.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendor Information
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{order.vendor.name}</div>
            <p className="text-xs text-muted-foreground">{order.vendor.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              LOA Reference
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{order.loa.loaNumber}</div>
            <button 
              className="text-xs text-primary hover:underline"
              onClick={() => navigate(`/loas/${order.loa.id}`)}
            >
              View LOA Details
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Order Total
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totals.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              Including {order.items.length} items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                List of items included in this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="font-medium">{item.item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.item.description}
                          </p>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Quantity
                            </div>
                            <div>
                              {item.quantity} {item.item.uom}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Unit Price
                            </div>
                            <div>₹{item.unitPrice.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Total
                            </div>
                            <div>
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(item.quantity * item.unitPrice)}
                            </div>
                          </div>
                          {/* <div>
                            <div className="text-sm text-muted-foreground">
                              Tax Rates
                            </div>
                            <div className="text-sm">
                              {item.item.taxRates.igst > 0 && (
                                <div>IGST: {item.item.taxRates.igst}%</div>
                              )}
                              {item.item.taxRates.sgst > 0 && (
                                <div>SGST: {item.item.taxRates.sgst}%</div>
                              )}
                              {item.item.taxRates.ugst > 0 && (
                                <div>UGST: {item.item.taxRates.ugst}%</div>
                              )}
                            </div>
                          </div> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Order Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax Amount</span>
                      <span>₹{totals.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>₹{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Additional information and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Requirement Description
                </h3>
                <p className="mt-1 whitespace-pre-wrap">{order.requirementDesc}</p>
              </div>

              {order.termsConditions && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Terms and Conditions
                  </h3>
                  <div 
                    className="mt-1 prose prose-sm max-w-none [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mt-2"
                    dangerouslySetInnerHTML={{ 
                      __html: order.termsConditions
                    }}
                  />
                </div>
              )}

              {order.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Notes
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}

              {/* Creation and Update Information */}
              <div className="border-t pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Created
                    </h3>
                    <p className="mt-1">
                      {format(new Date(order.createdAt), "PPP")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </h3>
                    <p className="mt-1">
                      {format(new Date(order.updatedAt), "PPP")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>
                Delivery details and shipping address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <Truck className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <h3 className="font-medium">Shipping Address</h3>
                  <p className="mt-1 whitespace-pre-wrap">
                    {order.shipToAddress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
              <CardDescription>
                Access order documentation and related files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Purchase Order Document */}
                {order.documentUrl ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Purchase Order Document</div>
                        <div className="text-sm text-muted-foreground">
                          Generated on {format(new Date(order.updatedAt), "PPP")}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => order.documentUrl && window.open(order.documentUrl, '_blank')}
                    >
                      View Document
                    </Button>
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Purchase order document will be generated after submission for approval.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Associated LOA Document */}
                {order.loa.documentUrl && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileCheck className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Associated LOA</div>
                        <div className="text-sm text-muted-foreground">
                          LOA Number: {order.loa.loaNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => order.loa.documentUrl && window.open(order.loa.documentUrl, '_blank')}
                      >
                        View LOA
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/loas/${order.loa.id}`)}
                      >
                        LOA Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}