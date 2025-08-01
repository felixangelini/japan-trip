import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchActivities, 
  fetchActivity, 
  createActivity, 
  updateActivity, 
  deleteActivity,
  activityKeys 
} from '@/lib/services/activity-service';
import type { Activity, ActivityInsert, ActivityUpdate } from '@/lib/types/database';

// Hook to fetch all activities for an itinerary
export const useActivities = (itineraryId: string) => {
  return useQuery({
    queryKey: activityKeys.list(itineraryId),
    queryFn: () => fetchActivities(itineraryId),
    enabled: !!itineraryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a single activity
export const useActivity = (id: string) => {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => fetchActivity(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create an activity
export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, data }: { itineraryId: string; data: Omit<ActivityInsert, 'itinerary_id'> }) =>
      createActivity(itineraryId, data),
    onSuccess: (newActivity, { itineraryId }) => {
      // Invalidate and refetch activities list
      queryClient.invalidateQueries({ queryKey: activityKeys.list(itineraryId) });
      
      // Add the new activity to the cache
      queryClient.setQueryData(
        activityKeys.detail(newActivity.id),
        newActivity
      );
    },
  });
};

// Hook to update an activity
export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActivityUpdate }) =>
      updateActivity(id, data),
    onSuccess: (updatedActivity) => {
      // Invalidate activities list to refresh the order
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      
      // Update the activity in the cache
      queryClient.setQueryData(
        activityKeys.detail(updatedActivity.id),
        updatedActivity
      );
    },
  });
};

// Hook to delete an activity
export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: (_, deletedActivityId) => {
      // Remove the activity from the cache
      queryClient.removeQueries({ queryKey: activityKeys.detail(deletedActivityId) });
      
      // Invalidate activities list
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}; 