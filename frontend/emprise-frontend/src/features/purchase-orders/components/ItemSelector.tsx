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
  value?: string;
  onChange: (itemId: string, unitPrice: number) => void;
}

export function ItemSelector({ vendorId, value, onChange }: ItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [vendorItems, setVendorItems] = useState<VendorItem[]>([]);
  const [priceHistory, setPriceHistory] = useState<Map<string, PriceHistoryData>>(new Map());
  const [loading, setLoading] = useState(false);
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
        const itemsData = response.data?.data?.data?.items || [];
        console.log("itemsData in item selector", itemsData);
        setVendorItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (error) {
        console.error('Error fetching items:', error);
        setVendorItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [vendorId]);

  const selectedItem = vendorItems.find(vi => vi.item.id === value);
  const filteredItems = vendorItems.filter(vi => 
    vi.item.name.toLowerCase().includes(search.toLowerCase()) ||
    vi.item.description.toLowerCase().includes(search.toLowerCase())
  );

  const fetchPriceHistory = async (itemId: string) => {
    try {
      console.log('Fetching price history for item:', itemId);
      const response = await apiClient.get<PriceHistoryResponse>(`/items/${itemId}/price-history?vendorId=${vendorId}`);
      
      console.log('Price history response:', response.data);
      
      setPriceHistory(new Map(priceHistory.set(itemId, response.data.data)));
      console.log('New price history:', priceHistory);
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  useEffect(() => {
    console.log('Current price history:', priceHistory);
  }, [priceHistory]);

  const handleSelect = async (itemId: string) => {
    try {
      if (!priceHistory.has(itemId)) {
        await fetchPriceHistory(itemId);
      }

      const history = priceHistory.get(itemId);
      console.log("history in item selector", history);
      const lastPurchasePrice = history?.priceHistory[0]?.unitPrice;
      console.log("lastPurchasePrice in item selector", lastPurchasePrice);
      const currentPrice = vendorItems.find(vi => vi.item.id === itemId)?.unitPrice || 0;
      const priceToUse = lastPurchasePrice || currentPrice;

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
                • ₹{selectedItem.unitPrice}/{selectedItem.item.uom}
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
                  onSelect={() => {
                    handleSelect(vi.item.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CheckIcon
                      className={cn(
                        "h-4 w-4",
                        value === vi.item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{vi.item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {vi.item.description} • ₹{vi.unitPrice}/{vi.item.uom}
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
