import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchStops, 
  fetchStop, 
  createStop, 
  updateStop, 
  deleteStop,
  stopKeys 
} from '@/lib/services/stop-service';
import type { CreateStopInput, UpdateStopInput } from '@/lib/schemas/stop';

// Hook to fetch all stops for an itinerary
export const useStops = (itineraryId: string) => {
  return useQuery({
    queryKey: stopKeys.list(itineraryId),
    queryFn: () => fetchStops(itineraryId),
    enabled: !!itineraryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a single stop
export const useStop = (id: string) => {
  return useQuery({
    queryKey: stopKeys.detail(id),
    queryFn: () => fetchStop(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a stop
export const useCreateStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, data }: { itineraryId: string; data: CreateStopInput }) =>
      createStop(itineraryId, data),
    onSuccess: (newStop, { itineraryId }) => {
      // Invalidate and refetch stops list
      queryClient.invalidateQueries({ queryKey: stopKeys.list(itineraryId) });
      
      // Add the new stop to the cache
      queryClient.setQueryData(
        stopKeys.detail(newStop.id),
        newStop
      );
    },
  });
};

// Hook to update a stop
export const useUpdateStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStopInput }) =>
      updateStop(id, data),
    onSuccess: (updatedStop) => {
      // Update the stop in the cache
      queryClient.setQueryData(
        stopKeys.detail(updatedStop.id),
        updatedStop
      );
      
      // Invalidate stops list to refresh the order
      queryClient.invalidateQueries({ queryKey: stopKeys.lists() });
    },
  });
};

// Hook to delete a stop
export const useDeleteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStop,
    onSuccess: (_, deletedStopId) => {
      // Remove the stop from the cache
      queryClient.removeQueries({ queryKey: stopKeys.detail(deletedStopId) });
      
      // Invalidate stops list
      queryClient.invalidateQueries({ queryKey: stopKeys.lists() });
    },
  });
}; 