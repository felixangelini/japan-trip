'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useStops } from '@/hooks/use-stops';
import { useCreateActivity } from '@/hooks/use-activities';
import { useWatch } from 'react-hook-form';
import React from 'react';

const quickActivitySchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  stop_id: z.string().min(1, 'La tappa è obbligatoria'),
  scheduled_at: z.string().min(1, 'Data e ora sono obbligatori'),
}).refine((data) => {
  // Validazione personalizzata per controllare che la data sia nel range dello stop
  if (!data.stop_id || !data.scheduled_at) return true;
  
  // Questa validazione verrà applicata dinamicamente nel componente
  return true;
}, {
  message: "La data deve essere all'interno del periodo della tappa selezionata",
  path: ["scheduled_at"],
});

type QuickActivityFormData = z.infer<typeof quickActivitySchema>;

interface QuickActivityFormProps {
  itineraryId: string;
}

export function QuickActivityForm({ itineraryId }: QuickActivityFormProps) {
  const { data: stops = [] } = useStops(itineraryId);
  const createActivityMutation = useCreateActivity();
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<QuickActivityFormData>({
    resolver: zodResolver(quickActivitySchema),
    defaultValues: {
      title: '',
      stop_id: '',
      scheduled_at: '',
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
  React.useEffect(() => {
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

  const onSubmit = async (data: QuickActivityFormData) => {
    // Validazione finale prima dell'invio
    if (!validateDateInStopRange(data.scheduled_at)) {
      form.setError("scheduled_at", {
        type: "manual",
        message: "La data deve essere all'interno del periodo della tappa selezionata",
      });
      return;
    }

    try {
      await createActivityMutation.mutateAsync({
        itineraryId,
        data: {
          stop_id: data.stop_id,
          title: data.title,
          scheduled_at: data.scheduled_at,
        },
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Errore durante la creazione:', error);
    }
  };

  const isLoading = createActivityMutation.isPending;
  const dateConstraints = getDateConstraints();

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Creazione Rapida</CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titolo *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Titolo dell'attività" 
                            {...field} 
                          />
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
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !selectedStop}
                    className="w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isLoading ? 'Creazione...' : 'Crea Rapida'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
} 