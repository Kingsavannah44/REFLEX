import { z } from 'zod';

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^\+\d{7,15}$/, 'Phone must be in E.164 format, e.g. +254712345678'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
