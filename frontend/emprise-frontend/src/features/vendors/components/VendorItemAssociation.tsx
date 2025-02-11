import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useToast } from "../../../hooks/use-toast-app";
import { useItems } from "../../items/hooks/use-items";
import { useVendors } from "../hooks/use-vendors";
import { Loader2 } from "lucide-react";
import type { Item } from "../../items/types/item";

interface VendorItemAssociationProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VendorItemAssociation({ open, onClose, onSuccess }: VendorItemAssociationProps) {
  const { id: vendorId } = useParams<{ id: string }>();
  const { showError } = useToast();
  const { getItems } = useItems();
  const { addItem } = useVendors();
  
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");

  // Fetch available items when dialog opens
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetchingItems(true);
        const items = await getItems();
        setAvailableItems(items);
      } catch (error) {
        console.error("Error fetching items:", error);
        showError("Failed to fetch available items");
      } finally {
        setFetchingItems(false);
      }
    };

    if (open) {
      fetchItems();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedItemId || !unitPrice || !vendorId) {
      showError("Please select an item and enter a price");
      return;
    }

    try {
      setLoading(true);
      await addItem(vendorId, {
        itemId: selectedItemId,
        unitPrice: parseFloat(unitPrice),
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error associating item:", error);
      showError("Failed to add item to vendor");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedItemId("");
    setUnitPrice("");
    onClose();
  };

  const selectedItem = availableItems.find(item => item.id === selectedItemId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item to Vendor</DialogTitle>
          <DialogDescription>
            Select an item and set its price for this vendor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Item</label>
            <Select
              value={selectedItemId}
              onValueChange={setSelectedItemId}
              disabled={fetchingItems || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={fetchingItems ? "Loading items..." : "Select an item"} />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedItem && (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Description: </span>
                {selectedItem.description}
              </div>
              {/* <div className="text-sm">
                <span className="font-medium">Current Market Price: </span>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(selectedItem.unitPrice)}
              </div> */}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor Price</label>
            <Input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="Enter price"
              disabled={loading || fetchingItems}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || fetchingItems || !selectedItemId || !unitPrice}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Item'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}