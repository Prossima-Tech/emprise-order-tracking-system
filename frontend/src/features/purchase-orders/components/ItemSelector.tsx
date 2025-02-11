import { useState, useEffect } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Button } from "../../../components/ui/button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import apiClient from "../../../lib/utils/api-client";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../../components/ui/select";

interface VendorItem {
  vendor: {
    id: string;
    name: string;
  };
  item: {
    id: string;
    name: string;
    description: string;
    unitPrice: number;
    uom: string;
    // taxRates: {
    //   igst: number;
    //   sgst: number;
    //   ugst: number;
    // };
  };
  unitPrice: number;
}

interface PriceHistoryData {
  currentPrice: number;
  priceHistory: Array<{
    purchaseDate: string;
    poNumber: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    status: string;
  }>;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
}

interface PriceHistoryResponse {
  isSuccess: boolean;
  data: PriceHistoryData;
}

interface ItemSelectorProps {
  vendorId: string;
  value: string;
  onChange: (itemId: string, unitPrice: number) => void;
  excludeItems?: string[];
}

export function ItemSelector({ vendorId, value, onChange, excludeItems = [] }: ItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [vendorItems, setVendorItems] = useState<VendorItem[]>([]);
  const [priceHistory, setPriceHistory] = useState<Map<string, PriceHistoryData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingPriceHistory, setLoadingPriceHistory] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      if (!vendorId) {
        setVendorItems([]);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/vendors/${vendorId}/items`);
        
        // Access the items array from the correct path in the response
        const items = response?.data?.data?.data?.items || [];
        
        // Filter out excluded items
        const availableItems = items.filter(
          (item: VendorItem) => !excludeItems.includes(item.item.id)
        );
        
        setVendorItems(availableItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        setVendorItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [vendorId, excludeItems]);

  const selectedItem = vendorItems.find(vi => vi.item.id === value);
  const filteredItems = vendorItems.filter(vi => 
    vi.item.name.toLowerCase().includes(search.toLowerCase()) ||
    vi.item.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number): string => {
    return `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const fetchPriceHistory = async (itemId: string) => {
    try {
      setLoadingPriceHistory(true);
      const response = await apiClient.get<PriceHistoryResponse>(`/items/${itemId}/price-history?vendorId=${vendorId}`);
      
      if (response.data.isSuccess) {
        setPriceHistory(new Map(priceHistory.set(itemId, response.data.data)));
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoadingPriceHistory(false);
    }
  };

  useEffect(() => {
  }, [priceHistory]);

  const handleSelect = async (itemId: string) => {
    try {
      if (!priceHistory.has(itemId)) {
        await fetchPriceHistory(itemId);
      }

      const selectedVendorItem = vendorItems.find(vi => vi.item.id === itemId);
      if (!selectedVendorItem) return;

      const history = priceHistory.get(itemId);
      const lastPurchasePrice = history?.priceHistory[0]?.unitPrice;
      const priceToUse = lastPurchasePrice || selectedVendorItem.unitPrice;

      onChange(itemId, priceToUse);
      setOpen(false);
      setSearch("");
    } catch (error) {
      console.error('Error handling item selection:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={!vendorId}
        >
          {selectedItem ? (
            <span className="flex items-center gap-2 truncate">
              <span>{selectedItem.item.name}</span>
              <span className="text-muted-foreground">
                • {formatCurrency(selectedItem.unitPrice)}/{selectedItem.item.uom}
              </span>
            </span>
          ) : (
            'Select an item...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search items..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                'No items found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredItems.map((vi) => (
                <CommandItem
                  key={vi.item.id}
                  onSelect={() => handleSelect(vi.item.id)}
                  disabled={loadingPriceHistory}
                >
                  <div className="flex items-center gap-2">
                    {loadingPriceHistory ? (
                      <span className="h-4 w-4 animate-spin">⌛</span>
                    ) : (
                      <CheckIcon
                        className={cn(
                          "h-4 w-4",
                          value === vi.item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{vi.item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {vi.item.description} • {formatCurrency(vi.unitPrice)}/{vi.item.uom}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
