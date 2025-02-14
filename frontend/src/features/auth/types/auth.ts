import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .refine(value => value.trim() === value, 'Email cannot start or end with spaces'),
  password: z
    .string()
    .min(6, 'Password must be at least 8 characters')
    .max(50, 'Password cannot exceed 50 characters')
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces')
    .refine(value => value.trim() === value, 'Name cannot start or end with spaces'),
  email: loginSchema.shape.email,
  password: loginSchema.shape.password,
  department: z
    .string()
    .min(2, 'Department must be at least 2 characters')
    .max(50, 'Department cannot exceed 50 characters')
    .refine(value => value.trim() === value, 'Department cannot start or end with spaces'),
  role: z.enum(['PO_SPECIALIST', 'BO_SPECIALIST'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;