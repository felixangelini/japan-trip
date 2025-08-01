import { createClient } from '@/lib/supabase/client';
import type { Accommodation, AccommodationInsert, AccommodationUpdate } from '@/lib/types/database';

export const accommodationKeys = {
  all: ['accommodations'] as const,
  lists: () => [...accommodationKeys.all, 'list'] as const,
  list: (stopId: string) => [...accommodationKeys.lists(), stopId] as const,
  itineraryList: (itineraryId: string) => [...accommodationKeys.lists(), 'itinerary', itineraryId] as const,
  details: () => [...accommodationKeys.all, 'detail'] as const,
  detail: (id: string) => [...accommodationKeys.details(), id] as const,
};

// Fetch accommodations for a stop
export const fetchAccommodations = async (): Promise<Accommodation[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch accommodations: ${error.message}`);
  }

  return data || [];
};

// Fetch accommodations for an itinerary
export const fetchAccommodationsByItinerary = async (itineraryId: string): Promise<Accommodation[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('itinerary_id', itineraryId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch accommodations for itinerary: ${error.message}`);
  }

  return data || [];
};

// Fetch a single accommodation
export const fetchAccommodation = async (id: string): Promise<Accommodation> => {
  if (!id || id === '') {
    throw new Error('Accommodation ID is required');
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch accommodation: ${error.message}`);
  }

  return data;
};

// Create a new accommodation
export const createAccommodation = async (stopId: string, data: Omit<AccommodationInsert, 'stop_id' | 'itinerary_id'>): Promise<Accommodation> => {
  const supabase = createClient();
  
  // First, get the itinerary_id from the stop
  const { data: stop, error: stopError } = await supabase
    .from('stops')
    .select('itinerary_id')
    .eq('id', stopId)
    .single();

  if (stopError) {
    throw new Error(`Failed to get stop itinerary: ${stopError.message}`);
  }

  const { data: accommodation, error } = await supabase
    .from('accommodations')
    .insert([{ ...data, stop_id: stopId, itinerary_id: stop.itinerary_id }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create accommodation: ${error.message}`);
  }

  // Sincronizziamo lo stop con il nuovo accommodation_id
  const { error: stopUpdateError } = await supabase
    .from('stops')
    .update({ accommodation_id: accommodation.id })
    .eq('id', stopId);

  if (stopUpdateError) {
    throw new Error(`Failed to update stop with accommodation: ${stopUpdateError.message}`);
  }

  return accommodation;
};

// Create a standalone accommodation (with optional stop)
export const createStandaloneAccommodation = async (itineraryId: string, data: Omit<AccommodationInsert, 'itinerary_id'>): Promise<Accommodation> => {
  const supabase = createClient();

  const { data: accommodation, error } = await supabase
    .from('accommodations')
    .insert([{ ...data, itinerary_id: itineraryId }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create accommodation: ${error.message}`);
  }

  // Se è stato specificato un stop_id, sincronizziamo lo stop
  if (data.stop_id) {
    const { error: stopUpdateError } = await supabase
      .from('stops')
      .update({ accommodation_id: accommodation.id })
      .eq('id', data.stop_id);

    if (stopUpdateError) {
      throw new Error(`Failed to update stop with accommodation: ${stopUpdateError.message}`);
    }
  }

  return accommodation;
};

// Update an accommodation
export const updateAccommodation = async (id: string, data: AccommodationUpdate): Promise<Accommodation> => {   
  const supabase = createClient();

  // Se stiamo aggiornando stop_id, dobbiamo sincronizzare anche lo stop
  if (data.stop_id !== undefined) {
    // Prima aggiorniamo l'accommodation
    const { data: updatedAccommodation, error: accommodationError } = await supabase
      .from('accommodations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (accommodationError) {
      throw new Error(`Failed to update accommodation: ${accommodationError.message}`);
    }

    // Poi sincronizziamo lo stop
    if (data.stop_id) {
      // Se stop_id è impostato, aggiorniamo lo stop con questo accommodation_id
      const { error: stopError } = await supabase
        .from('stops')
        .update({ accommodation_id: id })
        .eq('id', data.stop_id);

      if (stopError) {
        throw new Error(`Failed to update stop: ${stopError.message}`);
      }
    } else {
      // Se stop_id è null, rimuoviamo il riferimento da tutti gli stops che puntano a questa accommodation
      const { error: stopError } = await supabase
        .from('stops')
        .update({ accommodation_id: null })
        .eq('accommodation_id', id);

      if (stopError) {
        throw new Error(`Failed to update stops: ${stopError.message}`);
      }
    }

    return updatedAccommodation;
  } else {
    // Se non stiamo aggiornando stop_id, procediamo normalmente
    const { data: accommodation, error } = await supabase
      .from('accommodations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update accommodation: ${error.message}`);
    }

    return accommodation;
  }
};

// Delete an accommodation
export const deleteAccommodation = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('accommodations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete accommodation: ${error.message}`);
  }
}; 