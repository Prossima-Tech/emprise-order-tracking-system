import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LOA } from "../types/loa";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { useLOAs } from "../hooks/use-loas";

const formSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED", "DELAYED"]),
  reason: z.string().optional(),
});

type StatusFormData = z.infer<typeof formSchema>;

interface LOAStatusFormProps {
  loa: LOA;
  onSuccess: () => void;
}

export function LOAStatusForm({ loa, onSuccess }: LOAStatusFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateLOAStatus } = useLOAs();

  const form = useForm<StatusFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: loa.status,
      reason: "",
    },
  });

  const handleSubmit = async (data: StatusFormData) => {
    setIsSubmitting(true);
    try {
      await updateLOAStatus(loa.id, data.status, data.reason);
      onSuccess();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LOA Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft - Initial state, in preparation</SelectItem>
                  <SelectItem value="ACTIVE">Active - Work in progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed - Work finished successfully</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled - Work terminated</SelectItem>
                  <SelectItem value="DELAYED">Delayed - Behind schedule</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Status Change (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter reason for changing the status"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Status"}
        </Button>
      </form>
    </Form>
  );
} 