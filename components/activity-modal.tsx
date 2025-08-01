'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useStops } from '@/hooks/use-stops';
import { useCreateActivity, useUpdateActivity } from '@/hooks/use-activities';
import { Activity } from '@/lib/types/database';

const activitySchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  description: z.string().optional(),
  stop_id: z.string().min(1, 'La tappa è obbligatoria'),
  scheduled_at: z.string().min(1, 'Data e ora sono obbligatori'),
  location_name: z.string().optional(),
  external_link: z.string().url().optional().or(z.literal('')),
}).refine((data) => {
  // Validazione personalizzata per controllare che la data sia nel range dello stop
  if (!data.stop_id || !data.scheduled_at) return true;
  
  // Questa validazione verrà applicata dinamicamente nel componente
  return true;
}, {
  message: "La data deve essere all'interno del periodo della tappa selezionata",
  path: ["scheduled_at"],
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  activity?: Activity | null;
}

export function ActivityModal({ isOpen, onClose, itineraryId, activity }: ActivityModalProps) {
  const { data: stops = [] } = useStops(itineraryId);
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      stop_id: '',
      scheduled_at: '',
      location_name: '',
      external_link: '',
    },
  });

  // Watch per i valori del form per validazione dinamica
  const watchedStopId = useWatch({
    control: form.control,
    name: "stop_id",
  });

  const watchedScheduledAt = useWatch({
    control: form.control,
    name: "scheduled_at",
  });

  // Trova lo stop selezionato
  const selectedStop = stops.find(stop => stop.id === watchedStopId);

  // Funzione per validare la data rispetto allo stop
  const validateDateInStopRange = (dateString: string) => {
    if (!selectedStop || !dateString) return true;
    
    const activityDate = new Date(dateString);
    const stopStartDate = selectedStop.start_date ? new Date(selectedStop.start_date + 'T00:00') : null;
    const stopEndDate = selectedStop.end_date ? new Date(selectedStop.end_date + 'T23:59') : null;
    
    // Se lo stop non ha date, accetta qualsiasi data
    if (!stopStartDate && !stopEndDate) return true;
    
    // Se ha solo start_date, la data deve essere >= start_date
    if (stopStartDate && !stopEndDate) {
      return activityDate >= stopStartDate;
    }
    
    // Se ha solo end_date, la data deve essere <= end_date
    if (!stopStartDate && stopEndDate) {
      return activityDate <= stopEndDate;
    }
    
    // Se ha entrambe le date, la data deve essere nel range
    if (stopStartDate && stopEndDate) {
      return activityDate >= stopStartDate && activityDate <= stopEndDate;
    }
    
    return true;
  };

  // Validazione dinamica quando cambiano i valori
  useEffect(() => {
    if (watchedScheduledAt && selectedStop) {
      const isValid = validateDateInStopRange(watchedScheduledAt);
      if (!isValid) {
        form.setError("scheduled_at", {
          type: "manual",
          message: "La data deve essere all'interno del periodo della tappa selezionata",
        });
      } else {
        form.clearErrors("scheduled_at");
      }
    }
  }, [watchedScheduledAt, selectedStop, form]);

  // Funzione per ottenere min e max date per l'input
  const getDateConstraints = () => {
    if (!selectedStop) return {};
    
    const constraints: { min?: string; max?: string } = {};
    
    if (selectedStop.start_date) {
      constraints.min = selectedStop.start_date + 'T00:00';
    }
    
    if (selectedStop.end_date) {
      constraints.max = selectedStop.end_date + 'T23:59';
    }
    
    return constraints;
  };

  // Reset form when modal opens/closes or activity changes
  useEffect(() => {
    if (isOpen) {
      if (activity) {
        // Edit mode
        form.reset({
          title: activity.title,
          description: activity.description || '',
          stop_id: activity.stop_id,
          scheduled_at: activity.scheduled_at ? new Date(activity.scheduled_at).toISOString().slice(0, 16) : '',
          location_name: activity.location_name || '',
          external_link: activity.external_link || '',
        });
      } else {
        // Create mode
        form.reset({
          title: '',
          description: '',
          stop_id: '',
          scheduled_at: '',
          location_name: '',
          external_link: '',
        });
      }
    }
  }, [isOpen, activity, form]);

  const onSubmit = async (data: ActivityFormData) => {
    // Validazione finale prima dell'invio
    if (!validateDateInStopRange(data.scheduled_at)) {
      form.setError("scheduled_at", {
        type: "manual",
        message: "La data deve essere all'interno del periodo della tappa selezionata",
      });
      return;
    }

    try {
      if (activity) {
        // Update existing activity
        await updateActivityMutation.mutateAsync({
          id: activity.id,
          data: {
            ...data,
            external_link: data.external_link || null,
          },
        });
      } else {
        // Create new activity
        await createActivityMutation.mutateAsync({
          itineraryId,
          data: {
            ...data,
            external_link: data.external_link || null,
          },
        });
      }
      onClose();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    }
  };

  const isLoading = createActivityMutation.isPending || updateActivityMutation.isPending;
  const dateConstraints = getDateConstraints();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Modifica Attività' : 'Nuova Attività'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Titolo dell'attività" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stop_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tappa *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una tappa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem key={stop.id} value={stop.id}>
                          {stop.title}
                          {stop.start_date && stop.end_date && (
                            <span className="text-muted-foreground ml-2">
                              ({new Date(stop.start_date).toLocaleDateString('it-IT')} - {new Date(stop.end_date).toLocaleDateString('it-IT')})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Ora *</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field}
                      {...dateConstraints}
                      disabled={!selectedStop}
                    />
                  </FormControl>
                  <FormMessage />
                  {selectedStop && (
                    <p className="text-xs text-muted-foreground">
                      {selectedStop.start_date && selectedStop.end_date ? (
                        `Periodo tappa: ${new Date(selectedStop.start_date).toLocaleDateString('it-IT')} - ${new Date(selectedStop.end_date).toLocaleDateString('it-IT')}`
                      ) : selectedStop.start_date ? (
                        `Dal: ${new Date(selectedStop.start_date).toLocaleDateString('it-IT')}`
                      ) : selectedStop.end_date ? (
                        `Al: ${new Date(selectedStop.end_date).toLocaleDateString('it-IT')}`
                      ) : (
                        'Nessuna data specificata per questa tappa'
                      )}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrizione dell'attività (opzionale)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Località</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome della località (opzionale)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="external_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Esterno</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://..." 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button type="submit" disabled={isLoading || !selectedStop}>
                {isLoading ? 'Salvataggio...' : (activity ? 'Aggiorna' : 'Crea')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 