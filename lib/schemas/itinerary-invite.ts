import { z } from 'zod';

// Schema for creating an itinerary invite
export const createItineraryInviteSchema = z.object({
  email: z.string().email('Email non valida'),
  role: z.enum(['viewer', 'editor']),
  message: z.string().optional(),
});

// Schema for updating an itinerary invite
export const updateItineraryInviteSchema = z.object({
  status: z.enum(['accepted', 'declined']),
});

// Schema for itinerary invite (database model)
export const itineraryInviteSchema = z.object({
  id: z.string().uuid(),
  itinerary_id: z.string().uuid(),
  inviter_id: z.string().uuid(),
  email: z.string().email(),
  from_email: z.string().email(),
  role: z.enum(['viewer', 'editor']),
  status: z.enum(['pending', 'accepted', 'declined']),
  message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// TypeScript types
export type CreateItineraryInviteInput = z.infer<typeof createItineraryInviteSchema>;
export type UpdateItineraryInviteInput = z.infer<typeof updateItineraryInviteSchema>;
export type ItineraryInvite = z.infer<typeof itineraryInviteSchema>; 