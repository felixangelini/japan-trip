import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAccommodations, 
  fetchAccommodationsByItinerary,
  fetchAccommodation, 
  createAccommodation, 
  createStandaloneAccommodation,
  updateAccommodation, 
  deleteAccommodation,
  accommodationKeys 
} from '@/lib/services/accommodation-service';
import type { Accommodation, AccommodationInsert, AccommodationUpdate } from '@/lib/types/database';

// Hook to fetch all accommodations for a stop
export const useAccommodations = (itineraryId?: string) => {
  return useQuery({
    queryKey: itineraryId ? accommodationKeys.itineraryList(itineraryId) : accommodationKeys.all,
    queryFn: () => itineraryId ? fetchAccommodationsByItinerary(itineraryId) : fetchAccommodations(),
    enabled: !itineraryId || !!itineraryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a single accommodation
export const useAccommodation = (id: string) => {
  return useQuery({
    queryKey: accommodationKeys.detail(id),
    queryFn: () => fetchAccommodation(id),
    enabled: !!id && id !== '', // Don't run if id is empty string
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create an accommodation
export const useCreateAccommodation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stopId, data }: { stopId: string; data: Omit<AccommodationInsert, 'stop_id' | 'itinerary_id'> }) =>
      createAccommodation(stopId, data),
    onSuccess: (newAccommodation, { stopId }) => {
      // Invalidate and refetch accommodations list for the stop
      queryClient.invalidateQueries({ queryKey: accommodationKeys.list(stopId) });
      
      // Also invalidate all itinerary-based accommodation queries
      queryClient.invalidateQueries({ 
        queryKey: accommodationKeys.lists() 
      });
      
      // Invalidate stops queries to refresh accommodation relationships
      queryClient.invalidateQueries({ 
        queryKey: ['stops'] 
      });
      
      // Add the new accommodation to the cache
      queryClient.setQueryData(
        accommodationKeys.detail(newAccommodation.id),
        newAccommodation
      );
    },
  });
};

// Hook to create a standalone accommodation
export const useCreateStandaloneAccommodation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, data }: { itineraryId: string; data: Omit<AccommodationInsert, 'itinerary_id'> }) =>
      createStandaloneAccommodation(itineraryId, data),
    onSuccess: (newAccommodation) => {
      // Invalidate all itinerary-based accommodation queries
      queryClient.invalidateQueries({ 
        queryKey: accommodationKeys.lists() 
      });
      
      // Invalidate stops queries to refresh accommodation relationships
      queryClient.invalidateQueries({ 
        queryKey: ['stops'] 
      });
      
      // Add the new accommodation to the cache
      queryClient.setQueryData(
        accommodationKeys.detail(newAccommodation.id),
        newAccommodation
      );
    },
  });
};

// Hook to update an accommodation
export const useUpdateAccommodation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AccommodationUpdate }) =>
      updateAccommodation(id, data),
    onSuccess: (updatedAccommodation) => {
      // Invalidate and refetch accommodations list for the stop (if it has one)
      if (updatedAccommodation.stop_id) {
        queryClient.invalidateQueries({ 
          queryKey: accommodationKeys.list(updatedAccommodation.stop_id) 
        });
      }
      
      // Also invalidate all itinerary-based accommodation queries
      queryClient.invalidateQueries({ 
        queryKey: accommodationKeys.lists() 
      });
      
      // Invalidate stops queries to refresh accommodation relationships
      queryClient.invalidateQueries({ 
        queryKey: ['stops'] 
      });
      
      // Update the accommodation in the cache
      queryClient.setQueryData(
        accommodationKeys.detail(updatedAccommodation.id),
        updatedAccommodation
      );
    },
  });
};

// Hook to delete an accommodation
export const useDeleteAccommodation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccommodation,
    onSuccess: (_, accommodationId) => {
      // Get the accommodation from cache to get the stop_id
      const accommodation = queryClient.getQueryData<Accommodation>(
        accommodationKeys.detail(accommodationId)
      );
      
      if (accommodation) {
        // Invalidate and refetch accommodations list for the stop (if it has one)
        if (accommodation.stop_id) {
          queryClient.invalidateQueries({ 
            queryKey: accommodationKeys.list(accommodation.stop_id) 
          });
        }
        
        // Also invalidate all itinerary-based accommodation queries
        queryClient.invalidateQueries({
          queryKey: accommodationKeys.lists()
        });
        
        // Invalidate stops queries to refresh accommodation relationships
        queryClient.invalidateQueries({ 
          queryKey: ['stops'] 
        });
      }
      
      // Remove the accommodation from the cache
      queryClient.removeQueries({ queryKey: accommodationKeys.detail(accommodationId) });
    },
  });
}; 