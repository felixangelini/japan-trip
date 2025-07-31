import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchItineraryInvites, 
  fetchPendingInvites,
  createItineraryInvite, 
  updateItineraryInvite, 
  deleteItineraryInvite,
  itineraryInviteKeys 
} from '@/lib/services/itinerary-invite-service';
import type { 
  CreateItineraryInviteInput,
  UpdateItineraryInviteInput 
} from '@/lib/schemas/itinerary-invite';

// Hook to fetch invites for an itinerary
export const useItineraryInvites = (itineraryId: string) => {
  return useQuery({
    queryKey: itineraryInviteKeys.list(itineraryId),
    queryFn: () => fetchItineraryInvites(itineraryId),
    enabled: !!itineraryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch pending invites for current user
export const usePendingInvites = () => {
  return useQuery({
    queryKey: itineraryInviteKeys.pending(),
    queryFn: fetchPendingInvites,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create an invite
export const useCreateItineraryInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, data }: { itineraryId: string; data: CreateItineraryInviteInput }) =>
      createItineraryInvite(itineraryId, data),
    onSuccess: (newInvite) => {
      // Invalidate and refetch invites list for the specific itinerary
      queryClient.invalidateQueries({ 
        queryKey: itineraryInviteKeys.list(newInvite.itinerary_id) 
      });
      
      // Invalidate pending invites
      queryClient.invalidateQueries({ queryKey: itineraryInviteKeys.pending() });
    },
  });
};

// Hook to update an invite
export const useUpdateItineraryInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItineraryInviteInput }) =>
      updateItineraryInvite(id, data),
    onSuccess: (updatedInvite) => {
      // Invalidate and refetch invites list for the specific itinerary
      queryClient.invalidateQueries({ 
        queryKey: itineraryInviteKeys.list(updatedInvite.itinerary_id) 
      });
      
      // Invalidate pending invites
      queryClient.invalidateQueries({ queryKey: itineraryInviteKeys.pending() });
    },
  });
};

// Hook to delete an invite
export const useDeleteItineraryInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItineraryInvite,
    onSuccess: (_, deletedId) => {
      // Invalidate all invite queries since we don't know which itinerary it belonged to
      queryClient.invalidateQueries({ queryKey: itineraryInviteKeys.all });
    },
  });
}; 