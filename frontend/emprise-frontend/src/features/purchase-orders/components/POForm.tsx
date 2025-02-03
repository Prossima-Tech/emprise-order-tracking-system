// src/features/purchase-orders/components/POForm.tsx
import { useState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Card, CardContent } from "../../../components/ui/card";
import { Trash2, Plus, X } from "lucide-react";
import { ItemSelector } from "./ItemSelector";
import { PurchaseOrder, purchaseOrderSchema, type PurchaseOrderFormData } from "../types/purchase-order";
import apiClient from "../../../lib/utils/api-client";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
import { useToast } from "../../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "../../../components/RichTextEditor";
import { usePurchaseOrders } from "../hooks/use-purchase-orders";
import { Badge } from "../../../components/ui/badge";
import { useLOAs } from "../../loas/hooks/use-loas";
import { useVendors } from "../../vendors/hooks/use-vendors";
import { VendorSelector } from "./VendorSelector";

interface POFormProps {
  mode: 'create' | 'edit';
  initialData?: PurchaseOrder;
  onSubmit: (data: PurchaseOrderFormData) => void;
  onCancel: () => void;
}

interface VendorOption {
  id: string;
  name: string;
  email: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

export function POForm({ mode, initialData, onCancel, onSubmit }: POFormProps) {
  const [loas, setLoas] = useState<any[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvers, setApprovers] = useState<User[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    mode === 'edit' && initialData?.tags ? initialData.tags : []
  );
  const [tagInput, setTagInput] = useState('');
  const [taxType, setTaxType] = useState<'amount' | 'percentage'>(
    mode === 'edit' && initialData?.taxAmount ? 'amount' : 'percentage'
  );
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getLOAs} = useLOAs();
  const { getVendors } = useVendors();
  const { updatePurchaseOrder } = usePurchaseOrders();

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: mode === 'edit' && initialData ? {
      loaId: initialData.loa.id,
      vendorId: initialData.vendor.id,
      items: initialData.items.map(item => ({
        itemId: item.item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      taxAmount: initialData.taxAmount || 0,
      requirementDesc: initialData.requirementDesc,
      termsConditions: initialData.termsConditions,
      shipToAddress: initialData.shipToAddress,
      notes: initialData.notes || '',
      tags: initialData.tags || [],
      approverId: initialData.approverId || '',
      expectedDeliveryDate: initialData.expectedDeliveryDate || '',
    } : {
      loaId: '',
      vendorId: '',
      items: [{ 
        itemId: '', 
        quantity: 1, 
        unitPrice: 0,
      }],
      taxAmount: 0,
      termsConditions: defaultTermsAndConditions,
      requirementDesc: '',
      shipToAddress: '',
      notes: '',
      tags: [],
      approverId: '',
      expectedDeliveryDate: '',
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const selectedVendor = form.watch("vendorId");
  const watchVendorId = form.watch("vendorId");
  const watchTaxAmount = form.watch("taxAmount");

  const calculateTotals = () => {
    const subtotal = watchItems.reduce(
      (acc, item) => acc + (item.quantity * item.unitPrice),
      0
    );
    
    let taxAmount = 0;
    if (taxType === 'percentage') {
      taxAmount = (subtotal * (watchTaxAmount || 0)) / 100;
    } else {
      taxAmount = watchTaxAmount || 0;
    }
    
    return {
      subtotal,
      tax: taxAmount,
      total: subtotal + taxAmount,
    };
  };

  const totals = calculateTotals();

  const handleItemSelect = async (index: number, itemId: string, unitPrice: number) => {
    form.setValue(`items.${index}`, {
      itemId,
      quantity: form.getValues(`items.${index}.quantity`) || 1,
      unitPrice,
    }, { shouldValidate: true });
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const [loasResponse, vendorsResponse] = await Promise.all([
          getLOAs(),
          getVendors(),
        ]);
        setLoas(loasResponse);
        setVendors(vendorsResponse || []);
      } catch (error) {
        setLoas([]);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await apiClient.get('/users');
        const adminUsers = response.data.filter((user: User) => user.role === 'ADMIN');
        setApprovers(adminUsers);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch approvers",
          variant: "destructive",
        });
      }
    };
    fetchApprovers();
  }, []);

  const handleSubmit = async (data: PurchaseOrderFormData) => {
    try {
      setSubmitting(true);
      
      // Convert tax percentage to amount if needed
      const taxAmount = taxType === 'percentage' 
        ? (calculateTotals().subtotal * (data.taxAmount || 0)) / 100
        : data.taxAmount;
      
      if (mode === 'edit' && initialData?.id) {
        const updatedData = {
          ...data,
          taxAmount,
          items: data.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        };
        
        await updatePurchaseOrder(initialData.id, updatedData);
        toast({
          title: "Success",
          description: "Purchase order updated successfully",
        });
        navigate(`/purchase-orders/${initialData.id}`);
      } else {
        const formattedData = {
          ...data,
          taxAmount,
          items: data.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        };
        
        await onSubmit(formattedData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save purchase order",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (watchVendorId) {
      if (mode !== 'edit') {
        form.setValue("items", [{ 
          itemId: "", 
          quantity: 1, 
          unitPrice: 0,
        }], {
          shouldValidate: true,
        });
      }
    }
  }, [watchVendorId, mode]);

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      form.setValue('tags', updatedTags);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* LOA Selection */}
        <FormField
          control={form.control}
          name="loaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LOA Reference</FormLabel>
              <Select 
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an LOA" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loas.map((loa) => (
                    <SelectItem key={loa.id} value={loa.id}>
                      {loa.loaNumber} (Available: ₹{(loa.loaValue || 0).toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Vendor Selection */}
        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl>
                <VendorSelector
                  vendors={vendors}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Line Items</h3>
            <Button
              type="button"
              onClick={() => append({ 
                itemId: "", 
                quantity: 1, 
                unitPrice: 0,
              })}
              disabled={!selectedVendor}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.itemId`}
                    render={({ field: itemField }) => (
                      <FormItem>
                        <FormLabel>Item</FormLabel>
                        <FormControl>
                          <ItemSelector
                            vendorId={selectedVendor}
                            value={itemField.value}
                            onChange={(itemId, unitPrice) => 
                              handleItemSelect(index, itemId, unitPrice)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field: quantityField }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...quantityField}
                              onChange={(e) => 
                                quantityField.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field: priceField }) => (
                        <FormItem>
                          <FormLabel>Unit Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...priceField}
                              onChange={(e) => priceField.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Item Total and Remove Button */}
                  <div className="col-span-2 flex justify-between items-center border-t pt-4 mt-2">
                    <div className="text-sm space-y-1">
                      <div>
                        Subtotal: ₹{(watchItems[index].quantity * watchItems[index].unitPrice).toFixed(2)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tax Type Selection and Amount */}
        <div className="space-y-4">
          <FormItem>
            <FormLabel>Tax Type</FormLabel>
            <Select
              value={taxType}
              onValueChange={(value: 'amount' | 'percentage') => {
                setTaxType(value);
                form.setValue('taxAmount', 0);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="amount">Fixed Amount</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>

          <FormField
            control={form.control}
            name="taxAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {taxType === 'percentage' ? 'Tax Percentage (%)' : 'Tax Amount (₹)'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Expected Delivery Date */}
        {/* <FormField
          control={form.control}
          name="expectedDeliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Delivery Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Order Totals */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  Tax {taxType === 'percentage' ? `(${watchTaxAmount || 0}%)` : 'Amount'}:
                </span>
                <span>₹{totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Fields */}
        <FormField
          control={form.control}
          name="requirementDesc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirement Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter requirement description..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Must be between 10 and 1000 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shipToAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter shipping address..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Must be between 10 and 500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms and Conditions</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Must be between 10 and 2000 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional notes..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags Input */}
        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Type a tag and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(tagInput);
              }
            }}
          />
        </div>

        {/* Approver Selection */}
        <FormField
          control={form.control}
          name="approverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Approver (Admin)</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an admin approver..." />
                </SelectTrigger>
                <SelectContent>
                  {approvers.map((approver) => (
                    <SelectItem key={approver.id} value={approver.id}>
                      {approver.name} ({approver.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {approvers.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No admin users available for approval
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Updating' : 'Creating'} Purchase Order...
              </>
            ) : (
              <>
                {mode === 'edit' ? 'Update Purchase Order' : 'Create Purchase Order'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Default terms and conditions template
const defaultTermsAndConditions = `
<ol>
  <li>Delivery Timeline: All items must be delivered within the specified timeline.</li>
  <li>Quality Standards: All items must meet the specified quality standards.</li>
  <li>Payment Terms: Payment will be processed as per the agreed terms.</li>
  <li>Warranty: Standard warranty terms apply as specified in the quotation.</li>
</ol>
`;
