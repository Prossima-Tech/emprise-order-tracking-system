// src/features/vendors/components/VendorItemManagement.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { useToast } from "../../../hooks/use-toast-app";
import { DataTable } from "../../../components/data-display/DataTable";
import { ArrowLeft } from "lucide-react";
import { VendorItemAssociation } from "./VendorItemAssociation";
import { useVendors } from "../hooks/use-vendors";
import { Loader2, Trash2 } from "lucide-react";

interface VendorItem {
  id: string;
  itemId: string;
  vendorId: string;
  itemName: string;
  description: string; 
  unitPrice: number;
  lastUpdated: string;
  priceHistory: Array<{
    price: number;
    date: string;
  }>;
}


export function VendorItemManagement() {
  const { id: vendorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { getVendor, updateItemPrice, removeItem } = useVendors();
  const [vendorItems, setVendorItems] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [updatePriceDialogOpen, setUpdatePriceDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VendorItem | null>(null);
  const [newPrice, setNewPrice] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<VendorItem | null>(null);
  const [updatingPrice, setUpdatingPrice] = useState(false);

  const fetchVendorItems = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      const vendorData = await getVendor(vendorId);
      
      // Transform the items data to match our VendorItem interface
      const transformedItems = vendorData.items.map((item: any) => ({
        itemId: item.itemId,
        itemName: item.item.name,
        description: item.item.description,
        unitPrice: item.unitPrice,
        lastUpdated: item.updatedAt,
      }));
      
      setVendorItems(transformedItems);
    } catch (error) {
      console.error("Error fetching vendor items:", error);
      showError("Failed to fetch vendor items");
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor items on component mount
  useEffect(() => {
    fetchVendorItems();
  }, [vendorId]);


  // Handle updating item price
  const handleUpdatePrice = async () => {
    if (!selectedItem || !newPrice || !vendorId) return;

    try {
      setUpdatingPrice(true);
      await updateItemPrice(vendorId, selectedItem.itemId, parseFloat(newPrice));
      setUpdatePriceDialogOpen(false);
      setSelectedItem(null);
      setNewPrice("");
      await fetchVendorItems();
    } catch (error) {
      console.error("Error updating price:", error);
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete || !vendorId) return;

    try {
      setLoading(true);
      await removeItem(vendorId, itemToDelete.itemId);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      await fetchVendorItems();
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemAdded = () => {
    fetchVendorItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/vendors/${vendorId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendor
        </Button>
        <Button onClick={() => setAddItemDialogOpen(true)}>
          Add New Item
        </Button>
      </div>

      {/* Current Items */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Items</CardTitle>
          <CardDescription>
            Items and their pricing information for this vendor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                header: "Item",
                accessor: (row: VendorItem) => (
                  <div>
                    <div className="font-medium">{row.itemName}</div>
                    <div className="text-sm text-muted-foreground">
                      {row.description}
                    </div>
                  </div>
                ),
              },
              {
                header: "Price",
                accessor: (row: VendorItem) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(row.unitPrice),
              },
              {
                header: "Last Updated",
                accessor: (row: VendorItem) =>
                  format(new Date(row.lastUpdated), "PP"),
              },
              {
                header: "Actions",
                accessor: (row: VendorItem) => (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(row);
                        setUpdatePriceDialogOpen(true);
                      }}
                    >
                      Update Price
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setItemToDelete(row);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={vendorItems}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <VendorItemAssociation
        open={addItemDialogOpen}
        onClose={() => setAddItemDialogOpen(false)}
        onSuccess={handleItemAdded}
      />

      {/* Update Price Dialog */}
      <Dialog open={updatePriceDialogOpen} onOpenChange={setUpdatePriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Price</DialogTitle>
            <DialogDescription>
              Update the price for {selectedItem?.itemName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Price</label>
              <div className="text-lg">
                {selectedItem && new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(selectedItem.unitPrice)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">New Price</label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter new price"
                disabled={updatingPrice}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setUpdatePriceDialogOpen(false);
                setSelectedItem(null);
                setNewPrice("");
              }}
              disabled={updatingPrice}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePrice}
              disabled={updatingPrice || !newPrice || parseFloat(newPrice) <= 0}
            >
              {updatingPrice ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Price'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {itemToDelete?.itemName} from this vendor? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteItem}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}