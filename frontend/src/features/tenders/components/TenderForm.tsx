import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { cn } from '../../../lib/utils';
import { Switch } from '../../../components/ui/switch';
import { TenderFormData, tenderSchema } from '../types/tender';
import { FilePicker } from '../../../components/ui/file-picker';
import TagInput from '../../../components/ui/tag-input';

interface TenderFormProps {
  defaultValues?: Partial<TenderFormData>;
  onSubmit: (data: TenderFormData) => void;
  isSubmitting: boolean;
  title: string;
  submitLabel: string;
}

export function TenderForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  title,
  submitLabel,
}: TenderFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<TenderFormData>({
    resolver: zodResolver(tenderSchema),
    defaultValues: {
      tenderNumber: defaultValues?.tenderNumber || '',
      dueDate: defaultValues?.dueDate || new Date(),
      description: defaultValues?.description || '',
      hasEMD: defaultValues?.hasEMD || false,
      emdAmount: defaultValues?.emdAmount || null,
      tags: defaultValues?.tags || [],
    },
  });

  const hasEMD = form.watch('hasEMD');

  // Reset emdAmount when hasEMD is toggled off
  useEffect(() => {
    if (!hasEMD) {
      form.setValue('emdAmount', null);
    }
  }, [hasEMD, form]);

  const handleSubmit = (data: TenderFormData) => {
    const formData = {
      ...data,
      // If hasEMD is false, ensure emdAmount is null
      emdAmount: data.hasEMD ? data.emdAmount : null,
      documentFile: file || undefined
    };
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="tenderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tender Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tender number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                          date < new Date(new Date().setHours(0, 0, 0, 0))
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter tender description" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasEMD"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">EMD Deposit Required</FormLabel>
                    <FormDescription>
                      Toggle this if EMD deposit is required for this tender
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {hasEMD && (
              <FormField
                control={form.control}
                name="emdAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EMD Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter EMD amount" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : null);
                        }}
                        value={field.value === null ? '' : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput 
                      placeholder="Add tag..."
                      tags={field.value || []}
                      setTags={(newTags: string[]) => field.onChange(newTags)}
                    />
                  </FormControl>
                  <FormDescription>
                    Press enter to add a tag
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Tender Document</FormLabel>
              <FilePicker
                accept=".pdf,.doc,.docx"
                onChange={(file: File | null) => setFile(file)}
              />
              <FormDescription>
                Upload a PDF or document file (max 5MB)
              </FormDescription>
            </FormItem>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 