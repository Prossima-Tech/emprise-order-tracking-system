import { useState } from 'react';
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

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gstin?: string;
}

interface VendorSelectorProps {
  vendors: Vendor[];
  value?: string;
  onChange: (vendorId: string) => void;
  disabled?: boolean;
}

export function VendorSelector({ vendors, value, onChange, disabled }: VendorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedVendor = vendors.find(v => v.id === value);
  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase()) ||
    (v.gstin && v.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (vendorId: string) => {
    onChange(vendorId);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedVendor ? (
            <span className="flex items-center gap-2 truncate">
              <span>{selectedVendor.name}</span>
              <span className="text-muted-foreground">
                • {selectedVendor.email}
              </span>
            </span>
          ) : (
            'Select a vendor...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search vendors..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No vendors found.</CommandEmpty>
            <CommandGroup>
              {filteredVendors.map((vendor) => (
                <CommandItem
                  key={vendor.id}
                  onSelect={() => handleSelect(vendor.id)}
                >
                  <div className="flex items-center gap-2">
                    <CheckIcon
                      className={cn(
                        "h-4 w-4",
                        value === vendor.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{vendor.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {vendor.email}
                        {vendor.gstin && ` • GSTIN: ${vendor.gstin}`}
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