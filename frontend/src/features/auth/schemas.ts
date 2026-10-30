import { z } from 'zod';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PASTOR'
  | 'EVENT_MANAGER'
  | 'FIELD_VOLUNTEER'
  | 'MEMBER'
  | 'NGO_ADMIN'
  | 'GUEST';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  permissions: string[];
}

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters with letters & numbers'),
  branchId: z.string().min(1, 'Please select your primary church campus'),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to church guidelines'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

