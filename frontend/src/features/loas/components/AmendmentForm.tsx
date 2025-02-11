import { useState } from 'react';
import { useForm } from '../../../hooks/use-form';
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { amendmentSchema, type AmendmentFormData } from '../types/loa';
import { Badge } from "../../../components/ui/badge";
import { X, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "../../../hooks/use-toast-app";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface AmendmentFormProps {
  onSubmit: (data: AmendmentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AmendmentForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: AmendmentFormProps) {
  const [tagInput, setTagInput] = useState('');
  const { showError } = useToast();

  const form = useForm<AmendmentFormData>({
    schema: amendmentSchema,
    defaultValues: {
      amendmentNumber: '',
      documentFile: undefined,
      tags: [],
    },
  });

  const handleSubmit = async (data: AmendmentFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting amendment:', error);
      showError('Failed to create amendment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Amendment</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Amendment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Amendment Number */}
              <FormField
                control={form.control}
                name="amendmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amendment Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="AMEND-YYYY-XXX" 
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
                    <FormLabel>Supporting Document</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
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
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          placeholder="Type tag and press Enter"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const newTag = tagInput.trim();
                              if (newTag && !field.value.includes(newTag)) {
                                field.onChange([...field.value, newTag]);
                              }
                              setTagInput('');
                            }
                          }}
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
                                onClick={() => {
                                  field.onChange(field.value.filter(t => t !== tag));
                                }}
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

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
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
                      Creating Amendment...
                    </>
                  ) : (
                    'Create Amendment'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}