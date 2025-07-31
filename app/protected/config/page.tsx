'use client';

import { useState } from 'react';
import { 
  Settings, 
  Edit, 
  Trash2, 
  Calendar,
  Globe,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentItineraryDetails } from '@/hooks/use-current-itinerary';
import { EditItineraryModal } from '@/components/edit-itinerary-modal';
import { DeleteItineraryModal } from '@/components/delete-itinerary-modal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function ConfigPage() {
  const { currentItinerary, isLoading } = useCurrentItineraryDetails();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Handle delete modal close - redirect to /protected if itinerary was deleted
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    // Clear localStorage to ensure no stale data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current-itinerary-id');
    }
    // Redirect to /protected after a short delay to ensure the deletion is processed
    setTimeout(() => {
      window.location.href = '/protected';
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
      </div>
    );
  }

  if (!currentItinerary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nessun itinerario selezionato</h3>
          <p className="text-muted-foreground">Seleziona un itinerario per vedere le configurazioni</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurazioni</h1>
      </div>

      {/* Itinerary Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentItinerary.title}
                {currentItinerary.is_public ? (
                  <Globe className="h-5 w-5 text-blue-600" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-600" />
                )}
              </CardTitle>
              <CardDescription>
                {currentItinerary.description || 'Nessuna descrizione'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {currentItinerary.start_date && currentItinerary.end_date ? (
                  `${format(new Date(currentItinerary.start_date), 'dd MMM yyyy', { locale: it })} - ${format(new Date(currentItinerary.end_date), 'dd MMM yyyy', { locale: it })}`
                ) : (
                  'Date non specificate'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={currentItinerary.is_public ? "default" : "secondary"}>
                {currentItinerary.is_public ? 'Pubblico' : 'Privato'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <EditItineraryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        itinerary={currentItinerary}
      />

      <DeleteItineraryModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        itineraryId={currentItinerary.id}
        itineraryTitle={currentItinerary.title}
      />
    </div>
  );
}
