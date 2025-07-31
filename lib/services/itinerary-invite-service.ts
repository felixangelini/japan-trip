import { createClient } from '@/lib/supabase/client';
import type { 
  ItineraryInvite, 
  CreateItineraryInviteInput,
  UpdateItineraryInviteInput
} from '@/lib/schemas/itinerary-invite';

// Query keys for TanStack Query
export const itineraryInviteKeys = {
  all: ['itinerary-invites'] as const,
  lists: () => [...itineraryInviteKeys.all, 'list'] as const,
  list: (itineraryId: string) => [...itineraryInviteKeys.lists(), { itineraryId }] as const,
  pending: () => [...itineraryInviteKeys.all, 'pending'] as const,
  details: () => [...itineraryInviteKeys.all, 'detail'] as const,
  detail: (id: string) => [...itineraryInviteKeys.details(), id] as const,
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

// Get current user email
const getCurrentUserEmail = async (): Promise<string> => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user.email || '';
};

// Fetch all invites for an itinerary
export const fetchItineraryInvites = async (itineraryId: string): Promise<ItineraryInvite[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('itinerary_invites')
    .select('*')
    .eq('itinerary_id', itineraryId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch itinerary invites: ${error.message}`);
  }

  return data || [];
};

// Fetch pending invites for current user
export const fetchPendingInvites = async (): Promise<ItineraryInvite[]> => {
  const supabase = createClient();
  const userEmail = await getCurrentUserEmail();

  const { data, error } = await supabase
    .from('itinerary_invites')
    .select('*')
    .eq('email', userEmail)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch pending invites: ${error.message}`);
  }

  return data || [];
};

// Create a new invite
export const createItineraryInvite = async (
  itineraryId: string, 
  input: CreateItineraryInviteInput
): Promise<ItineraryInvite> => {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  const userEmail = await getCurrentUserEmail();

  const { data, error } = await supabase
    .from('itinerary_invites')
    .insert({
      ...input,
      itinerary_id: itineraryId,
      inviter_id: userId,
      from_email: userEmail,
      message: input.message || null
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create itinerary invite: ${error.message}`);
  }

  return data;
};

// Update an invite
export const updateItineraryInvite = async (
  id: string, 
  updates: UpdateItineraryInviteInput
): Promise<ItineraryInvite> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('itinerary_invites')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update itinerary invite: ${error.message}`);
  }

  // If the invite was accepted, add the user as a collaborator
  if (updates.status === 'accepted' && data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Add collaborator
        const { error: collabError } = await supabase
          .from('itinerary_collaborators')
          .insert({
            itinerary_id: data.itinerary_id,
            user_id: user.id,
            role: data.role
          });

        if (collabError) {
          console.error('Failed to add collaborator:', collabError);
          // Don't throw here, the invite was still updated successfully
        }
      }
    } catch (collaboratorError) {
      console.error('Failed to add user as collaborator:', collaboratorError);
      // Don't throw here, the invite was still updated successfully
    }
  }

  return data;
};

// Delete an invite
export const deleteItineraryInvite = async (id: string): Promise<void> => {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('itinerary_invites')
    .delete()
    .eq('id', id)
    .eq('inviter_id', userId);

  if (error) {
    throw new Error(`Failed to delete itinerary invite: ${error.message}`);
  }
}; 