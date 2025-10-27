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
import { EMDUploadSection } from './EMDUploadSection';

export interface EMDData {
  amount: number;
  bankName: string;
  submissionDate: Date;
  maturityDate: Date;
  documentFile?: File;
  tags: string[];
}

interface TenderFormProps {
  defaultValues?: Partial<TenderFormData>;
  onSubmit: (tenderData: TenderFormData, emdData?: EMDData) => void;
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
  const [nitFile, setNitFile] = useState<File | null>(null);
  const [emdDocumentFile, setEmdDocumentFile] = useState<File | null>(null);
  const [emdSubmissionDate, setEmdSubmissionDate] = useState<Date | undefined>(undefined);
  const [emdMaturityDate, setEmdMaturityDate] = useState<Date | undefined>(undefined);
  const [emdBankName, setEmdBankName] = useState<string>('IDBI');

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

  const handleEMDDataExtracted = (data: {
    amount: number | null;
    submissionDate: string | null;
    maturityDate: string | null;
    bankName: string;
  }) => {
    if (data.amount) {
      form.setValue('emdAmount', data.amount);
    }
    if (data.submissionDate) {
      // Parse DD-MM-YYYY format
      const [day, month, year] = data.submissionDate.split('-');
      setEmdSubmissionDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    }
    if (data.maturityDate) {
      // Parse DD-MM-YYYY format
      const [day, month, year] = data.maturityDate.split('-');
      setEmdMaturityDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    }
    setEmdBankName(data.bankName);
  };

  // Reset emdAmount when hasEMD is toggled off
  useEffect(() => {
    if (!hasEMD) {
      form.setValue('emdAmount', null);
    }
  }, [hasEMD, form]);

  const handleSubmit = (data: TenderFormData) => {
    const tenderFormData = {
      ...data,
      // If hasEMD is false, ensure emdAmount is null
      emdAmount: data.hasEMD ? data.emdAmount : null,
      documentFile: file || undefined,
      nitDocumentFile: nitFile || undefined
    };

    // Prepare EMD data if hasEMD is true and required fields are filled
    let emdData: EMDData | undefined;
    if (
      data.hasEMD &&
      data.emdAmount &&
      emdSubmissionDate &&
      emdMaturityDate &&
      emdBankName
    ) {
      emdData = {
        amount: data.emdAmount,
        bankName: emdBankName,
        submissionDate: emdSubmissionDate,
        maturityDate: emdMaturityDate,
        documentFile: emdDocumentFile || undefined,
        tags: data.tags || []
      };
    }

    onSubmit(tenderFormData, emdData);
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
              <div className="space-y-4">
                {/* AI Extraction Upload Section */}
                <EMDUploadSection
                  onDataExtracted={handleEMDDataExtracted}
                  onFileChange={setEmdDocumentFile}
                  disabled={isSubmitting}
                />

                {/* EMD Amount Field */}
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

                {/* Bank Name Field */}
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter bank name"
                      value={emdBankName}
                      onChange={(e) => setEmdBankName(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Name of the bank issuing the EMD/FDR
                  </FormDescription>
                </FormItem>

                {/* Submission Date Field */}
                <FormItem className="flex flex-col">
                  <FormLabel>EMD Submission Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !emdSubmissionDate && "text-muted-foreground"
                          )}
                        >
                          {emdSubmissionDate ? (
                            format(emdSubmissionDate, "PPP")
                          ) : (
                            <span>Pick submission date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={emdSubmissionDate}
                        onSelect={setEmdSubmissionDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Date when the EMD was submitted
                  </FormDescription>
                </FormItem>

                {/* Maturity Date Field */}
                <FormItem className="flex flex-col">
                  <FormLabel>EMD Maturity Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !emdMaturityDate && "text-muted-foreground"
                          )}
                        >
                          {emdMaturityDate ? (
                            format(emdMaturityDate, "PPP")
                          ) : (
                            <span>Pick maturity date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={emdMaturityDate}
                        onSelect={setEmdMaturityDate}
                        disabled={(date) =>
                          emdSubmissionDate ? date < emdSubmissionDate : false
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Date when the EMD will mature/expire
                  </FormDescription>
                </FormItem>
              </div>
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

            <FormItem>
              <FormLabel>NIT Document</FormLabel>
              <FilePicker
                accept=".pdf,.doc,.docx"
                onChange={(file: File | null) => setNitFile(file)}
              />
              <FormDescription>
                Upload NIT (Notice Inviting Tender) document (max 5MB)
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