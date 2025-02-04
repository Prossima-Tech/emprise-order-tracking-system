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
import { useLOAs } from '../hooks/use-loas';

interface LOAFormProps {
  initialData?: Partial<LOAFormData>;
  onSubmit: (data: LOAFormData) => void;
  onClose: () => void;
}

// Add EMD type
interface EMD {
  id: string;
  amount: number;
  bankName: string;
  paymentMode: string;
  status: string;
  submissionDate: string;
  maturityDate: string;
  tags: string[];
}

export function LOAForm({ initialData, onSubmit, onClose }: LOAFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useToast();
  const [availableEMDs, setAvailableEMDs] = useState<EMD[]>([]);
  const { getAvailableEMDs } = useLOAs();
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<LOAFormData>({
    schema: loaSchema,
    defaultValues: {
      loaNumber: initialData?.loaNumber || '',
      loaValue: initialData?.loaValue || 0,
      deliveryPeriod: {
        start: initialData?.deliveryPeriod?.start ? new Date(initialData.deliveryPeriod.start) : new Date(),
        end: initialData?.deliveryPeriod?.end ? new Date(initialData.deliveryPeriod.end) : new Date(),
      },
      workDescription: initialData?.workDescription || '',
      tags: initialData?.tags || [],
    },
  });

  // Fetch available EMDs
  useEffect(() => {
    const fetchEMDs = async () => {
      try {
        const emds = await getAvailableEMDs();
        setAvailableEMDs(emds);
      } catch (error) {
        console.error('Error fetching EMDs:', error);
      }
    };

    fetchEMDs();
  }, []);

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
      console.log('Submitting LOA data:', data);
    

      // Create FormData object
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'documentFile' && value) {
          formData.append(key, value);
        } else if (key === 'deliveryPeriod') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'tags') {
          const uniqueTags = Array.from(new Set(value))
            .map((tag: any) => tag.trim())
            .filter(Boolean);
          formData.append(key, JSON.stringify(uniqueTags));
        } else {
          formData.append(key, String(value));
        }
      });

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting LOA:', error);
      showError('Failed to create LOA. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        {/* EMD Selection */}
        <FormField
          control={form.control}
          name="emdId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EMD</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an EMD" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableEMDs.map((emd) => (
                    <SelectItem key={emd.id} value={emd.id}>
                      {emd.bankName} - ₹{emd.amount.toLocaleString()} ({format(new Date(emd.submissionDate), "PP")})
                      {emd.tags.length > 0 && (
                        <span className="ml-2 text-muted-foreground">
                          [{emd.tags.join(', ')}]
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Only EMDs that are not associated with any LOA are shown
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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