'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateAccommodation, useCreateStandaloneAccommodation, useUpdateAccommodation } from '@/hooks/use-accommodations';
import { useStops } from '@/hooks/use-stops';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Accommodation } from '@/lib/types/database';

// Schema di validazione
const accommodationSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  stop_id: z.string().optional().or(z.literal('none')),
  address: z.string().optional(),
  external_link: z.string().url('Inserisci un URL valido').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type AccommodationFormData = z.infer<typeof accommodationSchema>;

interface AccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accommodation?: Accommodation | null;
  stopId?: string; // Opzionale per accommodation standalone
  itineraryId?: string; // Opzionale per accommodation standalone
}

export function AccommodationModal({ isOpen, onClose, accommodation, stopId, itineraryId }: AccommodationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createAccommodationMutation = useCreateAccommodation();
  const createStandaloneAccommodationMutation = useCreateStandaloneAccommodation();
  const updateAccommodationMutation = useUpdateAccommodation();
  
  const { data: stops = [] } = useStops(itineraryId || '');
  
  const isEditing = !!accommodation;
  const isStandalone = !stopId;
  
  const form = useForm<AccommodationFormData>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      name: '',
      stop_id: '',
      address: '',
      external_link: '',
      notes: '',
    },
  });

  // Popola il form quando si apre in modalità editing
  useEffect(() => {
    if (isOpen && accommodation) {
      form.reset({
        name: accommodation.name,
        stop_id: accommodation.stop_id || 'none',
        address: accommodation.address || '',
        external_link: accommodation.external_link || '',
        notes: accommodation.notes || '',
      });
    } else if (isOpen && !accommodation) {
      form.reset({
        name: '',
        stop_id: 'none',
        address: '',
        external_link: '',
        notes: '',
      });
    }
  }, [isOpen, accommodation, form]);

  const onSubmit = async (data: AccommodationFormData) => {
    setIsSubmitting(true);
    
    try {
      // Convert "none" to null for stop_id
      const stopId = data.stop_id === 'none' ? null : data.stop_id;
      
      if (isEditing && accommodation) {
        await updateAccommodationMutation.mutateAsync({
          id: accommodation.id,
          data: {
            name: data.name,
            stop_id: stopId,
            address: data.address || null,
            external_link: data.external_link || null,
            notes: data.notes || null,
          },
        });
      } else if (isStandalone && itineraryId) {
        await createStandaloneAccommodationMutation.mutateAsync({
          itineraryId,
          data: {
            name: data.name,
            stop_id: stopId,
            address: data.address || null,
            external_link: data.external_link || null,
            notes: data.notes || null,
          },
        });
      } else if (stopId) {
        await createAccommodationMutation.mutateAsync({
          stopId,
          data: {
            name: data.name,
            address: data.address || null,
            external_link: data.external_link || null,
            notes: data.notes || null,
          },
        });
      }
      
      onClose();
      form.reset();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifica Alloggio' : 'Nuovo Alloggio'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome dell'alloggio" 
                      {...field} 
                      disabled={isSubmitting}
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
                  <FormLabel>Collega a una tappa (opzionale)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una tappa" />
                      </SelectTrigger>
                    </FormControl>
                                         <SelectContent>
                       <SelectItem value="none">Nessuna tappa</SelectItem>
                       {stops.map((stop) => (
                         <SelectItem key={stop.id} value={stop.id}>
                           {stop.title}
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indirizzo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Indirizzo dell'alloggio" 
                      {...field} 
                      disabled={isSubmitting}
                    />
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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Note aggiuntive..." 
                      {...field} 
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isEditing ? 'Salvataggio...' : 'Creazione...') 
                  : (isEditing ? 'Salva Modifiche' : 'Crea Alloggio')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 