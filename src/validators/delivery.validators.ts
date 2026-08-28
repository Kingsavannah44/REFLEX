import { z } from 'zod';

export const createDeliverySchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customerPhone: z
    .string()
    .regex(/^\+\d{7,15}$/, 'Phone must be in E.164 format, e.g. +254722000000'),
  deliveryAddress: z.string().min(5, 'Address is too short').max(500),
  itemDescription: z.string().min(3, 'Description is too short').max(500),
});

export const assignRiderSchema = z.object({
  riderId: z.string().uuid('riderId must be a valid UUID'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PICKED_UP', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be one of: PICKED_UP, DELIVERED, CANCELLED' }),
  }),
  notes: z.string().max(500).optional(),
});

export const confirmDeliverySchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
});

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type AssignRiderInput = z.infer<typeof assignRiderSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ConfirmDeliveryInput = z.infer<typeof confirmDeliverySchema>;
