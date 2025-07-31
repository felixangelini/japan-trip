import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchItineraries, 
  fetchItinerary, 
  createItinerary, 
  updateItinerary, 
  deleteItinerary,
  itineraryKeys 
} from '@/lib/services/itinerary-service';
import type {  UpdateItineraryInput } from '@/lib/schemas/itinerary';

// Hook to fetch all itineraries
export const useItineraries = () => {
  return useQuery({
    queryKey: itineraryKeys.lists(),
    queryFn: fetchItineraries,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry only once
    retryDelay: 1000, // Wait 1 second before retry
  });
};

// Hook to fetch a single itinerary
export const useItinerary = (id: string) => {
  return useQuery({
    queryKey: itineraryKeys.detail(id),
    queryFn: () => fetchItinerary(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry only once
    retryDelay: 1000, // Wait 1 second before retry
  });
};

// Hook to create an itinerary
export const useCreateItinerary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItinerary,
    onSuccess: (newItinerary) => {
      // Invalidate and refetch itineraries list
      queryClient.invalidateQueries({ queryKey: itineraryKeys.lists() });
      
      // Add the new itinerary to the cache
      queryClient.setQueryData(
        itineraryKeys.detail(newItinerary.id),
        newItinerary
      );

      // Set the new itinerary as current in localStorage
      localStorage.setItem('current-itinerary-id', newItinerary.id);

      // Force page reload to refresh the UI
      setTimeout(() => {
        window.location.reload();
      }, 100);
    },
  });
};

// Hook to update an itinerary
export const useUpdateItinerary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItineraryInput }) =>
      updateItinerary(id, data),
    onSuccess: (updatedItinerary) => {
      // Invalidate and refetch itineraries list
      queryClient.invalidateQueries({ queryKey: itineraryKeys.lists() });
      
      // Update the specific itinerary in cache
      queryClient.setQueryData(
        itineraryKeys.detail(updatedItinerary.id),
        updatedItinerary
      );
    },
  });
};

// Hook to delete an itinerary
export const useDeleteItinerary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItinerary,
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch itineraries list
      queryClient.invalidateQueries({ queryKey: itineraryKeys.lists() });
      
      // Remove the deleted itinerary from cache
      queryClient.removeQueries({ queryKey: itineraryKeys.detail(deletedId) });
    },
  });
}; 