import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useHookForm } from "react-hook-form";
import type { UseFormProps } from "react-hook-form";
import type { ZodSchema } from "zod";
import type { FieldValues } from "react-hook-form";

interface UseFormConfig<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: ZodSchema;
}

export function useForm<T extends Record<string, unknown>>({ schema, ...formConfig }: UseFormConfig<T>) {
  return useHookForm<T>({
    ...formConfig,
    resolver: zodResolver(schema),
  });
}
