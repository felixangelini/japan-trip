import { createClient } from '@/lib/supabase/client';
import type { 
  Itinerary, 
  CreateItineraryInput, 
  UpdateItineraryInput 
} from '@/lib/schemas/itinerary';

// Query keys for TanStack Query
export const itineraryKeys = {
  all: ['itineraries'] as const,
  lists: () => [...itineraryKeys.all, 'list'] as const,
  list: (filters: string) => [...itineraryKeys.lists(), { filters }] as const,
  details: () => [...itineraryKeys.all, 'detail'] as const,
  detail: (id: string) => [...itineraryKeys.details(), id] as const,
};

// Get current user ID
const getCurrentUserId = async (): Promise<string> => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user.id;
};

// Fetch all itineraries for the current user
export const fetchItineraries = async (): Promise<Itinerary[]> => {
  try {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch itineraries: ${error.message || 'Unknown error'}`);
    }

    return data || [];
  } catch {
    // Return empty array instead of throwing for better UX
    return [];
  }
};

// Fetch a single itinerary by ID
export const fetchItinerary = async (id: string): Promise<Itinerary> => {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch itinerary: ${error.message}`);
  }

  return data;
};

// Create a new itinerary
export const createItinerary = async (input: CreateItineraryInput): Promise<Itinerary> => {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('itineraries')
    .insert({
      ...input,
      user_id: userId,
      description: input.description || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create itinerary: ${error.message}`);
  }

  return data;
};

// Update an existing itinerary
export const updateItinerary = async (id: string, input: UpdateItineraryInput): Promise<Itinerary> => {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('itineraries')
    .update({
      ...input,
      description: input.description || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update itinerary: ${error.message}`);
  }

  return data;
};

// Delete an itinerary
export const deleteItinerary = async (id: string): Promise<void> => {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('itineraries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete itinerary: ${error.message}`);
  }
}; 