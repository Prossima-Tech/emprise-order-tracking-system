import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Plus, MapPin } from "lucide-react";
import apiClient from "../../../lib/utils/api-client";
import { useToast } from "../../../hooks/use-toast";

interface ShippingAddress {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

interface ShippingAddressSelectorProps {
  value: string;
  onChange: (address: string) => void;
  disabled?: boolean;
}

export function ShippingAddressSelector({
  value,
  onChange,
  disabled = false,
}: ShippingAddressSelectorProps) {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [newAddressText, setNewAddressText] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"saved" | "new">("saved");
  const { toast } = useToast();

  // Fetch saved addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching shipping addresses from /api/shipping-addresses");

      const response = await apiClient.get("/shipping-addresses");
      console.log("📦 Raw API Response:", response);
      console.log("📦 Response data:", response.data);
      console.log("📦 Response status:", response.data?.status);

      // Handle API response format: { status: 'success', data: { data: [...] } }
      let fetchedAddresses: ShippingAddress[] = [];

      // Check for triple-nested data (backend Result wrapper)
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        fetchedAddresses = response.data.data.data;
        console.log("✅ Successfully parsed addresses from response.data.data.data");
      } else if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
        fetchedAddresses = response.data.data;
        console.log("✅ Successfully parsed addresses from response.data.data");
      } else if (Array.isArray(response.data?.data)) {
        fetchedAddresses = response.data.data;
        console.log("✅ Successfully parsed addresses from response.data.data (no status check)");
      } else if (Array.isArray(response.data)) {
        fetchedAddresses = response.data;
        console.log("✅ Successfully parsed addresses from response.data");
      } else {
        console.warn("⚠️ Unexpected response format:", response.data);
      }

      console.log(`📊 Fetched ${fetchedAddresses.length} addresses:`, fetchedAddresses);
      setAddresses(fetchedAddresses);

      // If there are no saved addresses, switch to "new" mode
      if (fetchedAddresses.length === 0) {
        console.log("📝 No addresses found, switching to 'new' mode");
        setSelectedMode("new");
      } else {
        console.log("📋 Addresses found, switching to 'saved' mode");
        setSelectedMode("saved");
        // If value is empty and there's a default address, set it
        if (!value && fetchedAddresses.length > 0) {
          const defaultAddress = fetchedAddresses.find((addr: ShippingAddress) => addr.isDefault);
          if (defaultAddress) {
            console.log("⭐ Setting default address:", defaultAddress.label);
            onChange(defaultAddress.address);
          }
        }
      }
    } catch (error: any) {
      console.error("❌ Error fetching shipping addresses:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error message:", error.message);

      if (error.response?.status === 401) {
        console.error("🔒 Authentication error - user not logged in?");
      } else if (error.response?.status === 404) {
        console.error("🔍 Route not found - backend server needs restart?");
      }

      toast({
        title: "Error loading addresses",
        description: error.response?.data?.message || "Failed to load shipping addresses",
        variant: "destructive",
      });

      setAddresses([]);
      setSelectedMode("new");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewAddress = async () => {
    if (!newAddressLabel.trim() || !newAddressText.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both label and address",
        variant: "destructive",
      });
      return;
    }

    if (newAddressText.length < 10) {
      toast({
        title: "Validation Error",
        description: "Address must be at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const currentAddresses = Array.isArray(addresses) ? addresses : [];
      const response = await apiClient.post("/shipping-addresses", {
        label: newAddressLabel,
        address: newAddressText,
        isDefault: currentAddresses.length === 0, // Make it default if it's the first one
      });

      const newAddress = response.data.data;
      setAddresses([...currentAddresses, newAddress]);
      onChange(newAddress.address);
      setIsDialogOpen(false);
      setNewAddressLabel("");
      setNewAddressText("");

      toast({
        title: "Success",
        description: "Shipping address saved successfully",
      });

      // Switch to saved mode after adding first address
      if (currentAddresses.length === 0) {
        setSelectedMode("saved");
      }
    } catch (error) {
      console.error("Error saving shipping address:", error);
      toast({
        title: "Error",
        description: "Failed to save shipping address",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAddress = (addressId: string) => {
    if (addressId === "new") {
      setSelectedMode("new");
      onChange("");
    } else if (Array.isArray(addresses)) {
      const selected = addresses.find((addr) => addr.id === addressId);
      if (selected) {
        onChange(selected.address);
      }
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Mode Selection - only show if there are saved addresses */}
      {Array.isArray(addresses) && addresses.length > 0 && (
        <div className="flex items-center gap-4">
          <Select
            value={selectedMode}
            onValueChange={(mode: "saved" | "new") => {
              setSelectedMode(mode);
              if (mode === "new") {
                onChange("");
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saved">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Select Saved Address
                </div>
              </SelectItem>
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Enter New Address
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedMode === "saved" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Save New Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save New Shipping Address</DialogTitle>
                  <DialogDescription>
                    Add a new shipping address to your saved addresses for quick selection.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      placeholder="e.g., Office, Warehouse, Site A"
                      value={newAddressLabel}
                      onChange={(e) => setNewAddressLabel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter full shipping address..."
                      className="min-h-[100px]"
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNewAddress} disabled={saving} type="button">
                    {saving ? "Saving..." : "Save Address"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* Address Input Area */}
      {selectedMode === "saved" ? (
        <div className="space-y-2">
          <Select
            value={Array.isArray(addresses) ? (addresses.find((addr) => addr.address === value)?.id || "") : ""}
            onValueChange={handleSelectAddress}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a shipping address" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(addresses) && addresses.map((address) => (
                <SelectItem key={address.id} value={address.id}>
                  <div className="flex items-start gap-2">
                    <div>
                      <div className="font-medium">{address.label}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {address.address}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Show the selected address */}
          {value && (
            <div className="p-3 border rounded-md bg-muted/50 text-sm">
              <div className="font-medium mb-1">Selected Address:</div>
              <div className="whitespace-pre-wrap">{value}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder="Enter shipping address..."
            className="min-h-[100px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          {(!Array.isArray(addresses) || addresses.length === 0) && (
            <p className="text-xs text-muted-foreground">
              This will be your first saved address. You can save it for future use after creating the purchase order.
            </p>
          )}
          {Array.isArray(addresses) && addresses.length > 0 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Save This Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save This Address</DialogTitle>
                  <DialogDescription>
                    Give this address a label to save it for future use.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      placeholder="e.g., Office, Warehouse, Site A"
                      value={newAddressLabel}
                      onChange={(e) => setNewAddressLabel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <div className="p-3 border rounded-md bg-muted/50 text-sm whitespace-pre-wrap">
                      {value}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!newAddressLabel.trim()) {
                        toast({
                          title: "Validation Error",
                          description: "Please provide a label",
                          variant: "destructive",
                        });
                        return;
                      }
                      setNewAddressText(value);
                      await handleSaveNewAddress();
                    }}
                    disabled={saving}
                    type="button"
                  >
                    {saving ? "Saving..." : "Save Address"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}
