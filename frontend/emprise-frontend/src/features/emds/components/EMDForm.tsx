import { useForm } from '../../../hooks/use-form';
import { useState, useEffect } from 'react';
import { Button } from "../../../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Calendar } from "../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { emdSchema, type EMDFormData } from '../types/emd';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { extractFDRData } from './fdr-extracter';
import { parseISO } from 'date-fns';
import { useOffers } from '../../budgetary-offers/hooks/use-offers';
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Offer } from '../../budgetary-offers/types/Offer';

interface EMDFormProps {
  initialData?: Partial<EMDFormData>;
  onSubmit: (data: EMDFormData) => void;
  onCancel: () => void;
}

export function EMDForm({ initialData, onSubmit, onCancel }: EMDFormProps) {
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [openOfferSelect, setOpenOfferSelect] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const { getOffers } = useOffers();
  const [newTag, setNewTag] = useState('');
  
  // Fetch offers when component mounts
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const fetchedOffers = await getOffers();
        // Ensure we have an array of offers and filter out those with EMDs
        const availableOffers = Array.isArray(fetchedOffers) 
          ? fetchedOffers
          : [];
        setOffers(availableOffers);
      } catch (error) {
        console.error('Error fetching offers:', error);
        setOffers([]); // Set empty array on error
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchOffers();
  }, [getOffers]);

  const form = useForm<EMDFormData>({
    schema: emdSchema,
    defaultValues: {
      amount: initialData?.amount || 0,
      submissionDate: initialData?.submissionDate || new Date(),
      maturityDate: initialData?.maturityDate || new Date(),
      bankName: 'IDBI',
      offerId: initialData?.offerId,
      tags: initialData?.tags || ['FDR'],
    },
  });

  const handleSubmit = async (data: EMDFormData) => {
    await onSubmit(data);
  };

  const parseDateString = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    
    // Handle DD-MM-YYYY format from extraction
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    // Fallback to ISO parsing
    try {
      return parseISO(dateStr);
    } catch {
      return null;
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setExtracting(true);
      setExtractionError(null);

      const extractedData = await extractFDRData(file);

      // Validate and apply extracted data
      const updates: Partial<EMDFormData> = { bankName: 'IDBI' };

      if (extractedData.amount) {
        updates.amount = extractedData.amount;
      }

      if (extractedData.maturityDate) {
        const maturityDate = parseDateString(extractedData.maturityDate);
        if (maturityDate && !isNaN(maturityDate.getTime())) {
          updates.maturityDate = maturityDate;
        }
      }

      if (extractedData.submissionDate) {
        const submissionDate = parseDateString(extractedData.submissionDate);
        if (submissionDate && !isNaN(submissionDate.getTime())) {
          updates.submissionDate = submissionDate;
        }
      }

      // Apply validated updates
      form.reset({ 
        ...form.getValues(),
        ...updates
      });

      // Check if any critical fields are missing
      if (!extractedData.amount || !extractedData.maturityDate) {
        setExtractionError('Some required fields could not be extracted. Please verify the values.');
      }

    } catch (error) {
      console.error('FDR extraction error:', error);
      setExtractionError(
        error instanceof Error 
          ? error.message 
          : 'Failed to extract document data. Please check the file format and quality.'
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const currentTags = form.getValues('tags') || [];
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="documentFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>FDR Document</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                        handleFileUpload(file);
                      }
                    }}
                    {...field}
                    disabled={extracting}
                  />
                  {extracting && (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner />
                      <span className="text-sm text-muted-foreground">
                        Analyzing FDR document...
                      </span>
                    </div>
                  )}
                  {extractionError && (
                    <Alert variant="destructive">
                      <AlertDescription>{extractionError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount Field */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (INR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="100"
                  placeholder="Enter FDR amount"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bank Name Field */}
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  value="IDBI"
                  readOnly
                  className="text-muted-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Offer Selection Field */}
        <FormField
          control={form.control}
          name="offerId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Associated Offer</FormLabel>
              <Popover 
                open={openOfferSelect} 
                onOpenChange={setOpenOfferSelect}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openOfferSelect}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={loadingOffers}
                    >
                      {loadingOffers ? (
                        "Loading offers..."
                      ) : field.value ? (
                        offers.find((offer) => offer.id === field.value)?.subject || "Select an offer"
                      ) : (
                        "Select an offer"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                {openOfferSelect && (
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="w-full">
                      <div className="border-b px-3 py-2">
                        <input
                          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                          placeholder="Search offers..."
                          onChange={(e) => {
                            const searchTerm = e.target.value.toLowerCase();
                            setOffers(offers.filter(offer => offer.subject.toLowerCase().includes(searchTerm)));
                          }}
                        />
                      </div>
                      <div className="max-h-[300px] overflow-auto">
                        {loadingOffers ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading offers...
                          </div>
                        ) : offers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No offers available
                          </div>
                        ) : (
                          offers.map((offer) => (
                            <div
                              key={offer.id}
                              className={cn(
                                "flex items-center px-3 py-2 cursor-pointer hover:bg-accent",
                                field.value === offer.id && "bg-accent"
                              )}
                              onClick={() => {
                                form.setValue("offerId", offer.id);
                                setOpenOfferSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === offer.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">
                                  {offer.id}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {offer.subject}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="submissionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Submission Date</FormLabel>
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
                        {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
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
            name="maturityDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Maturity Date</FormLabel>
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
                        {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags Field */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {field.value?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tag and press Enter"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={extracting || form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={extracting || form.formState.isSubmitting}
          >
            {(extracting || form.formState.isSubmitting) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit FDR Details
          </Button>
        </div>
      </form>
    </Form>
  );
}