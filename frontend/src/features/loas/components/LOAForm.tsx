import { useForm } from '../../../hooks/use-form';
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Calendar } from "../../../components/ui/calendar";
import { Textarea } from "../../../components/ui/textarea";
import { format } from "date-fns";
import { cn } from "../../../lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { loaSchema, type LOAFormData } from '../types/loa';
import { useState, useEffect } from 'react';
import { Badge } from "../../../components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "../../../hooks/use-toast-app";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { useSites } from '../../sites/hooks/use-sites';
import type { Site } from '../../sites/types/site';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';

interface LOAFormProps {
  initialData?: Partial<LOAFormData>;
  onSubmit: (data: LOAFormData) => void;
  onClose: () => void;
}

export function LOAForm({ initialData, onSubmit, onClose }: LOAFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const { getSites } = useSites();
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<LOAFormData>({
    schema: loaSchema,
    defaultValues: {
      siteId: initialData?.siteId || '',
      loaNumber: initialData?.loaNumber || '',
      loaValue: initialData?.loaValue || 0,
      deliveryPeriod: {
        start: initialData?.deliveryPeriod?.start ? new Date(initialData.deliveryPeriod.start) : new Date(),
        end: initialData?.deliveryPeriod?.end ? new Date(initialData.deliveryPeriod.end) : new Date(),
      },
      workDescription: initialData?.workDescription || '',
      tags: initialData?.tags || [],
      hasEmd: initialData?.hasEmd || false,
      emdAmount: initialData?.emdAmount || null,
      hasSecurityDeposit: initialData?.hasSecurityDeposit || false,
      securityDepositAmount: initialData?.securityDepositAmount || null,
      hasPerformanceGuarantee: initialData?.hasPerformanceGuarantee || false,
      performanceGuaranteeAmount: initialData?.performanceGuaranteeAmount || null,
    },
  });
  // Fetch available sites on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const sitesResponse = await getSites();
        setSites(sitesResponse?.sites || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Watch for changes to the hasEmd, hasSecurityDeposit, and hasPerformanceGuarantee fields
  const hasEmd = form.watch("hasEmd");
  const hasSecurityDeposit = form.watch("hasSecurityDeposit");
  const hasPerformanceGuarantee = form.watch("hasPerformanceGuarantee");

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      
      if (newTag && !form.getValues('tags').includes(newTag)) {
        const currentTags = form.getValues('tags');
        form.setValue('tags', [...currentTags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (data: LOAFormData) => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields before submission
      if (!data.loaNumber) {
        showError('LOA Number is required');
        return;
      }
      
      if (!data.siteId) {
        showError('Site selection is required');
        return;
      }
      
      if (!data.loaValue || data.loaValue <= 0) {
        showError('LOA Value must be a positive number');
        return;
      }
      
      if (!data.workDescription || data.workDescription.trim().length < 10) {
        showError('Work description must be at least 10 characters');
        return;
      }
      
      // Check delivery period dates
      if (!data.deliveryPeriod.start || !data.deliveryPeriod.end) {
        showError('Both start and end dates are required');
        return;
      }
      
      if (new Date(data.deliveryPeriod.start) >= new Date(data.deliveryPeriod.end)) {
        showError('Start date must be before end date');
        return;
      }
      
      // Continue with form submission...
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting LOA:', error);
      showError('Failed to create LOA. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Site Selection */}
        <FormField
          control={form.control}
          name="siteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site</FormLabel>
              <Select 
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a site" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LOA Number */}
        <FormField
          control={form.control}
          name="loaNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LOA Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter LOA number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LOA Value */}
        <FormField
          control={form.control}
          name="loaValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter LOA value"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Delivery Period */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="deliveryPeriod.start"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryPeriod.end"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Work Description */}
        <FormField
          control={form.control}
          name="workDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter work description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Document Upload */}
        <FormField
          control={form.control}
          name="documentFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Document</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => onChange(e.target.files?.[0])}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    placeholder="Type tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput}
                  />
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* EMD Section */}
        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="text-lg font-semibold">Earnest Money Deposit (EMD)</h3>
          
          <FormField
            control={form.control}
            name="hasEmd"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    EMD Required
                  </FormLabel>
                  <FormDescription>
                    Check this if an EMD is required for this LOA
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {hasEmd && (
            <FormField
              control={form.control}
              name="emdAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EMD Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter EMD amount"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Security Deposit Section */}
        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="text-lg font-semibold">Security Deposit</h3>
          
          <FormField
            control={form.control}
            name="hasSecurityDeposit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Security Deposit Required
                  </FormLabel>
                  <FormDescription>
                    Check this if a security deposit is required for this LOA
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {hasSecurityDeposit && (
            <>
              <FormField
                control={form.control}
                name="securityDepositAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter security deposit amount"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="securityDepositFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Security Deposit Document</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {/* Performance Guarantee Section */}
        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="text-lg font-semibold">Performance Guarantee</h3>
          
          <FormField
            control={form.control}
            name="hasPerformanceGuarantee"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Performance Guarantee Required
                  </FormLabel>
                  <FormDescription>
                    Check this if a performance guarantee is required for this LOA
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {hasPerformanceGuarantee && (
            <>
              <FormField
                control={form.control}
                name="performanceGuaranteeAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performance Guarantee Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter performance guarantee amount"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="performanceGuaranteeFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Performance Guarantee Document</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update LOA' : 'Create LOA'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}