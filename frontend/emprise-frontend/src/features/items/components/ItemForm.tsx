// src/features/items/components/ItemForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { Item } from "../types/item";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
  uom: z.string().min(1, "Unit of measurement is required"),
  hsnCode: z.string().min(1, "HSN Code is required"),
  taxRates: z.object({
    igst: z.coerce.number().min(0, "IGST rate must be positive"),
    sgst: z.coerce.number().min(0, "SGST rate must be positive"),
    ugst: z.coerce.number().min(0, "UGST rate must be positive"),
  }),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  initialData?: Item;
  onSubmit: (data: ItemFormData) => Promise<void>;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

export function ItemForm({ initialData, onSubmit, isLoading, mode }: ItemFormProps) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      unitPrice: initialData?.unitPrice ? parseFloat(initialData.unitPrice.toString()) : 0,
      uom: initialData?.uom || "",
      hsnCode: initialData?.hsnCode || "",
      taxRates: {
        igst: initialData?.taxRates.igst || 0,
        sgst: initialData?.taxRates.sgst || 0,
        ugst: initialData?.taxRates.ugst || 0,
      },
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measurement</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hsnCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HSN Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="taxRates.igst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxRates.sgst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxRates.ugst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === 'create' ? "Create Item" : "Update Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}