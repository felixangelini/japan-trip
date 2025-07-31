'use client';

import { useState } from 'react';
import { 
  Settings, 
  Edit, 
  Trash2, 
  Calendar,
  Globe,
  Lock,
  UserPlus,
  Mail,
  Eye,
  Edit as EditIcon,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrentItineraryDetails } from '@/hooks/use-current-itinerary';
import { useItineraryInvites } from '@/hooks/use-itinerary-invites';
import { useDeleteItineraryInvite } from '@/hooks/use-itinerary-invites';
import { EditItineraryModal } from '@/components/edit-itinerary-modal';
import { DeleteItineraryModal } from '@/components/delete-itinerary-modal';
import { InviteUserModal } from '@/components/invite-user-modal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { ItineraryInvite } from '@/lib/schemas/itinerary-invite';

export default function ConfigPage() {
  const { currentItinerary, isLoading } = useCurrentItineraryDetails();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

  // Fetch invites for current itinerary
  const { data: invites = [], isLoading: invitesLoading } = useItineraryInvites(
    currentItinerary?.id || ''
  );

  const deleteInviteMutation = useDeleteItineraryInvite();

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInviteMutation.mutateAsync(inviteId);
    } catch {
      // Error is handled by the mutation
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accettato';
      case 'declined':
        return 'Rifiutato';
      default:
        return 'In attesa';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'editor':
        return <EditIcon className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'editor':
        return 'Editor';
      default:
        return 'Visualizzatore';
    }
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

      {/* Invites Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Inviti
              </CardTitle>
              <CardDescription>
                Gestisci gli utenti invitati a questo itinerario
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              disabled={invitesLoading}
            >
              <Mail className="h-4 w-4 mr-2" />
              Invita Utente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invitesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun invito</h3>
              <p className="text-muted-foreground mb-4">
                Non hai ancora invitato nessuno a questo itinerario
              </p>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invita il primo utente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite: ItineraryInvite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invite.status)}
                      <span className="text-sm font-medium">{invite.email}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      {getRoleIcon(invite.role)}
                      <span className="text-sm text-muted-foreground">
                        {getRoleText(invite.role)}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <Badge variant="outline">
                      {getStatusText(invite.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(invite.created_at), 'dd MMM yyyy', { locale: it })}
                    </span>
                    {invite.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvite(invite.id)}
                        disabled={deleteInviteMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        itineraryId={currentItinerary.id}
        itineraryTitle={currentItinerary.title}
      />
    </div>
  );
}
