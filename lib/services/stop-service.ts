import { createClient } from '@/lib/supabase/client';
import type { 
  Stop, 
  CreateStopInput,
  UpdateStopInput
} from '@/lib/schemas/stop';

// Query keys for TanStack Query
export const stopKeys = {
  all: ['stops'] as const,
  lists: () => [...stopKeys.all, 'list'] as const,
  list: (itineraryId: string) => [...stopKeys.lists(), { itineraryId }] as const,
  details: () => [...stopKeys.all, 'detail'] as const,
  detail: (id: string) => [...stopKeys.details(), id] as const,
};

// Fetch all stops for an itinerary
export const fetchStops = async (itineraryId: string): Promise<Stop[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('stops')
    .select('*')
    .eq('itinerary_id', itineraryId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch stops: ${error.message}`);
  }

  return data || [];
};

// Fetch a single stop by ID
export const fetchStop = async (id: string): Promise<Stop> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('stops')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch stop: ${error.message}`);
  }

  return data;
};

// Create a new stop
export const createStop = async (
  itineraryId: string, 
  input: CreateStopInput
): Promise<Stop> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('stops')
    .insert({
      ...input,
      itinerary_id: itineraryId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create stop: ${error.message}`);
  }

  return data;
};

// Update a stop
export const updateStop = async (
  id: string, 
  updates: UpdateStopInput
): Promise<Stop> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('stops')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update stop: ${error.message}`);
  }

  return data;
};

// Delete a stop
export const deleteStop = async (id: string): Promise<void> => {
  const supabase = createClient();

  // Prima elimina tutti gli allegati associati alla tappa
  const { error: attachmentsError } = await supabase
    .from('attachments')
    .delete()
    .eq('stop_id', id);

  if (attachmentsError) {
    throw new Error(`Failed to delete stop attachments: ${attachmentsError.message}`);
  }

  // Poi elimina tutte le tappe figlie (sottotappe)
  const { error: childStopsError } = await supabase
    .from('stops')
    .delete()
    .eq('parent_stop_id', id);

  if (childStopsError) {
    throw new Error(`Failed to delete child stops: ${childStopsError.message}`);
  }

  // Infine elimina la tappa principale
  const { error } = await supabase
    .from('stops')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete stop: ${error.message}`);
  }
}; 