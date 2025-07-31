import { z } from 'zod';

// Schema for creating a stop
export const createStopSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  description: z.string().optional(),
  location_name: z.string().min(1, 'La località è obbligatoria'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  image_url: z.string().optional(),
  parent_stop_id: z.string().nullable().optional(),
});

// Schema for updating a stop
export const updateStopSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio').optional(),
  description: z.string().optional(),
  location_name: z.string().min(1, 'La località è obbligatoria').optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  image_url: z.string().optional(),
  parent_stop_id: z.string().nullable().optional(),
});

// Schema for stop (database model)
export const stopSchema = z.object({
  id: z.string().uuid(),
  itinerary_id: z.string().uuid(),
  parent_stop_id: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  location_name: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  order: z.number().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
});

// TypeScript types
export type CreateStopInput = z.infer<typeof createStopSchema>;
export type UpdateStopInput = z.infer<typeof updateStopSchema>;
export type Stop = z.infer<typeof stopSchema>; 