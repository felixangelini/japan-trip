'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateStop, useUpdateStop, useStops } from '@/hooks/use-stops';
import { createStopSchema, type CreateStopInput, type UpdateStopInput, type Stop } from '@/lib/schemas/stop';
import { FileUpload } from '@/components/file-upload';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Calendar, GitBranch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCurrentItinerary } from '@/hooks/use-current-itinerary';

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  stop?: Stop | null; // null = create mode, Stop = edit mode
}

export function StopModal({ isOpen, onClose, itineraryId, stop }: StopModalProps) {
  const isEditMode = !!stop;
  const { currentItinerary } = useCurrentItinerary();
  const { data: stops = [] } = useStops(itineraryId);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [fileUploadId] = useState(() => `file-input-${Date.now()}-${Math.random().toString(36).substring(2)}`);
  
  const form = useForm<CreateStopInput>({
    resolver: zodResolver(createStopSchema),
    defaultValues: {
      title: '',
      description: '',
      location_name: '',
      start_date: '',
      end_date: '',
      image_url: '',
      parent_stop_id: null
    }
  });

  const createStopMutation = useCreateStop();
  const updateStopMutation = useUpdateStop();

  // Reset form when modal opens/closes or stop changes
  useEffect(() => {
    if (isOpen) {
      if (stop) {
        // Edit mode - populate form with existing data
        form.reset({
          title: stop.title,
          description: stop.description || '',
          location_name: stop.location_name || '',
          start_date: stop.start_date || '',
          end_date: stop.end_date || '',
          image_url: stop.image_url || '',
          parent_stop_id: stop.parent_stop_id
        });
        setUploadedImageUrl(stop.image_url || '');
      } else {
        // Create mode - reset to defaults
        form.reset({
          title: '',
          description: '',
          location_name: '',
          start_date: '',
          end_date: '',
          image_url: '',
          parent_stop_id: null
        });
        setUploadedImageUrl('');
      }
    }
  }, [isOpen, stop, form]);

  const handleImageUpload = (url: string) => {
    // Store the uploaded image URL for later use
    setUploadedImageUrl(url);
    form.setValue('image_url', url);
  };

  const handleImageUploadError = (error: string) => {
    console.error('Image upload error:', error);
  };

  const onSubmit = async (data: CreateStopInput) => {
    try {
      // Use uploaded image URL if available
      const finalData = {
        ...data,
        image_url: uploadedImageUrl || data.image_url
      };

      if (isEditMode && stop) {
        await updateStopMutation.mutateAsync({ id: stop.id, data: finalData as UpdateStopInput });
      } else {
        await createStopMutation.mutateAsync({ itineraryId, data: finalData });
      }
      form.reset();
      setUploadedImageUrl('');
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    // Non chiudere se stiamo caricando
    if (isLoading) return;
    
    form.reset();
    setUploadedImageUrl('');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      handleClose();
    }
  };

  const isLoading = createStopMutation.isPending || updateStopMutation.isPending;
  const error = createStopMutation.error || updateStopMutation.error;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Modifica Tappa' : 'Nuova Tappa'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form 
            id="stop-form" 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Es. Nome Tappa"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Località *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Es. Tokyo, Giappone"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Stop */}
            <FormField
              control={form.control}
              name="parent_stop_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tappa Parent</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <GitBranch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Select 
                        onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                        value={field.value || 'none'}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Seleziona una tappa parent (opzionale)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nessuna tappa parent</SelectItem>
                          {stops
                            .filter(s => s.id !== stop?.id) // Escludi la tappa corrente in modalità edit
                            .map((stopItem) => (
                              <SelectItem key={stopItem.id} value={stopItem.id}>
                                {stopItem.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="space-y-4">
              {currentItinerary && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <p className="font-medium mb-1">Intervallo Itinerario:</p>
                  <p>
                    {currentItinerary.start_date} - {currentItinerary.end_date}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Inizio *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            className="pl-10"
                            min={currentItinerary?.start_date || undefined}
                            max={currentItinerary?.end_date || undefined}
                            {...field}
                          />
                        </div>
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
                      <FormLabel>Data Fine *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            className="pl-10"
                            min={form.watch('start_date') || currentItinerary?.start_date || undefined}
                            max={currentItinerary?.end_date || undefined}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div 
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <FormLabel>Immagine</FormLabel>
              
              <FileUpload
                entityType="stop"
                userId={currentItinerary?.user_id || ''}
                onUploadComplete={handleImageUpload}
                onUploadError={handleImageUploadError}
                className="mt-2"
                id={fileUploadId}
              />
              {uploadedImageUrl && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    ✓ Immagine caricata con successo
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrizione della tappa..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error.message}
              </div>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            form="stop-form"
            disabled={isLoading}
          >
            {isLoading 
              ? (isEditMode ? 'Salvataggio...' : 'Creazione...') 
              : (isEditMode ? 'Salva Modifiche' : 'Crea Tappa')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 