'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateItineraryInvite } from '@/hooks/use-itinerary-invites';
import { createItineraryInviteSchema, type CreateItineraryInviteInput } from '@/lib/schemas/itinerary-invite';
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
import { Eye, Edit } from 'lucide-react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  itineraryTitle: string;
}

export function InviteUserModal({ isOpen, onClose, itineraryId, itineraryTitle }: InviteUserModalProps) {
  const form = useForm<CreateItineraryInviteInput>({
    resolver: zodResolver(createItineraryInviteSchema),
    defaultValues: {
      email: '',
      role: 'editor' as const,
      message: ''
    }
  });

  const createInviteMutation = useCreateItineraryInvite();

  const onSubmit = async (data: CreateItineraryInviteInput) => {
    try {
      await createInviteMutation.mutateAsync({ itineraryId, data });
      form.reset();
      onClose();
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
          <DialogTitle>Invita Utente</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="invite-user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="utente@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ruolo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un ruolo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Visualizzatore
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Editor
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Messaggio (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Ti invito a collaborare al mio itinerario "${itineraryTitle}"...`}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Message */}
            {createInviteMutation.error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {createInviteMutation.error.message}
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
            form="invite-user-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Invio...' : 'Invia Invito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 