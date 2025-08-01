'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/delete-dialog';
import { Plus, Clock } from 'lucide-react';
import { useActivities, useDeleteActivity } from '@/hooks/use-activities';
import { useStops } from '@/hooks/use-stops';
import { Activity } from '@/lib/types/database';
import { formatDate } from '@/lib/utils';
import { ActivityModal } from '@/components/activity-modal';
import { QuickActivityForm } from '@/components/quick-activity-form';
import { ActivityCard } from '@/components/activity-card';

interface ActivitiesSectionProps {
  itineraryId: string;
}

export function ActivitiesSection({ itineraryId }: ActivitiesSectionProps) {
  const { data: activities = [] } = useActivities(itineraryId);
  const { data: stops = [] } = useStops(itineraryId);
  const deleteActivityMutation = useDeleteActivity();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const handleCreateActivity = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = async () => {
    if (!deletingActivity) return;

    try {
      await deleteActivityMutation.mutateAsync(deletingActivity.id);
      setDeletingActivity(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleShareClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Group activities by date and sort by time
  const groupedActivities = activities.reduce((groups: Record<string, Activity[]>, activity) => {
    if (!activity.scheduled_at) return groups;
    
    const date = new Date(activity.scheduled_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  // Sort activities within each date by time
  Object.keys(groupedActivities).forEach(date => {
    groupedActivities[date].sort((a, b) => {
      if (!a.scheduled_at || !b.scheduled_at) return 0;
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });
  });

  // Sort dates
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );



  return (
    <div className="space-y-6">
      {/* Quick Create Form */}
      <QuickActivityForm itineraryId={itineraryId} />

      {/* Header with Create Modal Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Lista Attività</h2>
        <Button onClick={handleCreateActivity} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuova Attività
        </Button>
      </div>

      {/* Activities List */}
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="space-y-3">
            <h3 className="text-lg font-medium text-muted-foreground">
              {formatDate(date)}
            </h3>
            <div className="space-y-3">
              {groupedActivities[date].map(activity => {
                const stop = stops.find(s => s.id === activity.stop_id);
                return (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity}
                    stop={stop}
                    onEdit={handleEditActivity}
                    onDelete={setDeletingActivity}
                    onShare={handleShareClick}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nessuna attività ancora</h3>
            <p className="text-muted-foreground mb-4">
              Crea la tua prima attività per questo itinerario
            </p>
            <Button onClick={handleCreateActivity} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Crea Prima Attività
            </Button>
          </div>
        )}
      </div>

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        itineraryId={itineraryId}
        activity={editingActivity}
      />

      {/* Delete Activity Confirmation Dialog */}
      <DeleteDialog
        isOpen={!!deletingActivity}
        onOpenChange={() => setDeletingActivity(null)}
        onConfirm={handleDeleteActivity}
        title="Conferma eliminazione"
        description={`Sei sicuro di voler eliminare l'attività "${deletingActivity?.title}"? Questa azione non può essere annullata.`}
        isLoading={deleteActivityMutation.isPending}
      />
    </div>
  );
} 