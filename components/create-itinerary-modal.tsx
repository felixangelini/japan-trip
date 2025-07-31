'use client';

import { Calendar, Globe, Lock, Unlock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateItinerary } from '@/hooks/use-itineraries';
import { itineraryFormSchema, type ItineraryFormData } from '@/lib/schemas/itinerary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface CreateItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateItineraryModal({ isOpen, onClose }: CreateItineraryModalProps) {
  const form = useForm<ItineraryFormData>({
    resolver: zodResolver(itineraryFormSchema),
    defaultValues: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      is_public: false
    }
  });

  const isPublic = form.watch('is_public');

  const createItineraryMutation = useCreateItinerary();

  const onSubmit = async (data: ItineraryFormData) => {
    try {
      await createItineraryMutation.mutateAsync(data);
      form.reset();
      onClose();
      // The hook will automatically set the new itinerary as current and reload the page
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Itinerario</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="create-itinerary-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Es: Viaggio in Giappone 2024"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi il tuo viaggio..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Data Inizio
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Data Fine
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

                      {/* Public/Private Toggle */}
            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {isPublic ? 'Pubblico' : 'Privato'}
                  </FormLabel>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => field.onChange(!field.value)}
                      className="w-full justify-start"
                    >
                      {isPublic ? (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Chiunque può vedere questo itinerario
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Solo tu puoi vedere questo itinerario
                        </>
                      )}
                    </Button>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Message */}
            {createItineraryMutation.error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {createItineraryMutation.error.message}
              </div>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={form.formState.isSubmitting}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            form="create-itinerary-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Creando...' : 'Crea Itinerario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 