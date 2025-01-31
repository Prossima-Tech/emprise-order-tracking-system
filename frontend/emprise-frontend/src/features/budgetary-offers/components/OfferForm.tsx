import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Trash2, Plus } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Calendar } from "../../../components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { cn } from "../../../lib/utils";
import { Card, CardContent } from "../../../components/ui/card";
import { offerSchema, type OfferFormData, WorkItem } from "../types/Offer";
import { useOffers } from "../hooks/use-offers";
import { RichTextEditor } from '../../../components/RichTextEditor';
import {
  Badge,
} from "../../../components/ui/badge";
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import apiClient from "../../../lib/utils/api-client";

interface OfferFormProps {
  initialData?: Partial<OfferFormData>;
  onSubmit: (data: OfferFormData) => void;
  onCancel: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

export function OfferForm({ initialData, onSubmit, onCancel }: OfferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loading } = useOffers();
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [approvers, setApprovers] = useState<User[]>([]);

  // Transform initialData dates if they exist
  const formattedInitialData = initialData ? {
    ...initialData,
    offerDate: initialData.offerDate ? new Date(initialData.offerDate) : new Date(),
  } : undefined;

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await apiClient.get('/users');
        const adminUsers = response.data.filter((user: User) => user.role === 'ADMIN');
        setApprovers(adminUsers);
      } catch (error) {
        console.error('Failed to fetch approvers:', error);
      }
    };
    fetchApprovers();
  }, []);

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: formattedInitialData || {
      subject: "",
      toAuthority: "",
      offerDate: new Date(),
      workItems: [
        {
          description: "",
          quantity: 0,
          unitOfMeasurement: "",
          baseRate: 0,
          taxRate: 0,
        }
      ],
      termsConditions: "",
      tags: [],
      approverId: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workItems",
  });

  const handleSubmit = async (data: OfferFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      form.setValue('tags', [...selectedTags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  const calculateItemTotal = (item: WorkItem): number => {
    return item.quantity * item.baseRate * (1 + item.taxRate / 100);
  };

  const calculateTotal = (workItems: WorkItem[]): number => {
    return workItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Offer Date */}
        <FormField
          control={form.control}
          name="offerDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Offer Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Authority */}
        <FormField
          control={form.control}
          name="toAuthority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Authority</FormLabel>
              <FormControl>
                <Input placeholder="Enter authority name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subject */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Enter offer subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Work Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Work Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  description: "",
                  quantity: 0,
                  unitOfMeasurement: "",
                  baseRate: 0,
                  taxRate: 0,
                })
              }
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
                    name={`workItems.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Item description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`workItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`workItems.${index}.unitOfMeasurement`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., meters" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`workItems.${index}.baseRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Rate (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`workItems.${index}.taxRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Item Total */}
                  <div className="col-span-2 flex justify-between items-center border-t pt-4 mt-2">
                    <div className="text-sm text-muted-foreground">
                      Item Total: ₹
                      {calculateItemTotal(form.watch(`workItems.${index}`)).toFixed(2)}
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

        {/* Terms and Conditions with Rich Text Editor */}
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
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? 'Saving...' : 'Save Offer'}
          </Button>
        </div>

        {/* Grand Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Grand Total:</span>
            <span className="text-lg font-bold">
              ₹{calculateTotal(form.watch('workItems')).toFixed(2)}
            </span>
          </div>
        </div>
      </form>
    </Form>
  );
}