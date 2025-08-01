import { createClient } from '@/lib/supabase/client';
import type { Activity, ActivityInsert, ActivityUpdate } from '@/lib/types/database';

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (itineraryId: string) => [...activityKeys.lists(), itineraryId] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
};

// Fetch all activities for an itinerary
export const fetchActivities = async (itineraryId: string): Promise<Activity[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('itinerary_id', itineraryId)
    .order('scheduled_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }

  return data || [];
};

// Fetch a single activity
export const fetchActivity = async (id: string): Promise<Activity> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }

  return data;
};

// Create a new activity
export const createActivity = async (itineraryId: string, data: Omit<ActivityInsert, 'itinerary_id'>): Promise<Activity> => {
  const supabase = createClient();
  const { data: activity, error } = await supabase
    .from('activities')
    .insert([{ ...data, itinerary_id: itineraryId }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create activity: ${error.message}`);
  }

  return activity;
};

// Update an activity
export const updateActivity = async (id: string, data: ActivityUpdate): Promise<Activity> => {
  const supabase = createClient();
  const { data: activity, error } = await supabase
    .from('activities')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update activity: ${error.message}`);
  }

  return activity;
};

// Delete an activity
export const deleteActivity = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete activity: ${error.message}`);
  }
}; 