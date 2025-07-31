'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteItinerary } from '@/hooks/use-itineraries';

interface DeleteItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  itineraryTitle: string;
}

export function DeleteItineraryModal({ 
  isOpen, 
  onClose, 
  itineraryId, 
  itineraryTitle 
}: DeleteItineraryModalProps) {
  const deleteItineraryMutation = useDeleteItinerary();

  const handleDelete = async () => {
    try {
      await deleteItineraryMutation.mutateAsync(itineraryId);
      
      // Clear localStorage and reload page after deletion
      console.log('🗑️ Itinerary deleted, clearing localStorage and reloading...');
      localStorage.removeItem('current-itinerary-id');
      
      // Close modal first
      onClose();
      
      // Force page reload after a small delay
      setTimeout(() => {
        console.log('🔄 Reloading page after itinerary deletion...');
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Elimina Itinerario
          </DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare l&apos;itinerario <strong>&quot;{itineraryTitle}&quot;</strong>?
            Questa azione non può essere annullata e eliminerà definitivamente tutti i dati associati.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteItineraryMutation.isPending}
          >
            Annulla
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteItineraryMutation.isPending}
          >
            {deleteItineraryMutation.isPending ? 'Eliminando...' : 'Elimina'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 