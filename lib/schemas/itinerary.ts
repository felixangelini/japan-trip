import { z } from 'zod';

// Base itinerary schema
export const itinerarySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Il titolo è obbligatorio').max(100, 'Il titolo deve essere inferiore a 100 caratteri'),
  description: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  is_public: z.boolean(),
  user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string()
});

// Schema for creating a new itinerary
export const createItinerarySchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio').max(100, 'Il titolo deve essere inferiore a 100 caratteri'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_public: z.boolean().default(false)
});

// Schema for updating an itinerary
export const updateItinerarySchema = createItinerarySchema.partial();

// Form schema (for react-hook-form)
export const itineraryFormSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio').max(100, 'Il titolo deve essere inferiore a 100 caratteri'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_public: z.boolean()
});

// TypeScript types derived from schemas
export type Itinerary = z.infer<typeof itinerarySchema>;
export type CreateItineraryInput = z.infer<typeof createItinerarySchema>;
export type UpdateItineraryInput = z.infer<typeof updateItinerarySchema>;
export type ItineraryFormData = z.infer<typeof itineraryFormSchema>; 