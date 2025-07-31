'use client';

import { useUpdateItineraryInvite } from '@/hooks/use-itinerary-invites';
import { usePendingInvites } from '@/hooks/use-itinerary-invites';
import type { ItineraryInvite } from '@/lib/schemas/itinerary-invite';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface PendingInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PendingInvitesModal({ isOpen, onClose }: PendingInvitesModalProps) {
  const { data: pendingInvites = [], isLoading } = usePendingInvites();
  const updateInviteMutation = useUpdateItineraryInvite();

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await updateInviteMutation.mutateAsync({ 
        id: inviteId, 
        data: { status: 'accepted' } 
      });
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await updateInviteMutation.mutateAsync({ 
        id: inviteId, 
        data: { status: 'declined' } 
      });
    } catch {
      // Error is handled by the mutation
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'editor':
        return <Edit className="h-4 w-4" />;
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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inviti Pendenti</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Inviti Pendenti
          </DialogTitle>
          <DialogDescription>
            Hai {pendingInvites.length} invito{pendingInvites.length !== 1 ? 'i' : ''} in attesa di risposta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {pendingInvites.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun invito pendente</h3>
              <p className="text-muted-foreground">
                Non hai inviti in attesa di risposta
              </p>
            </div>
          ) : (
            pendingInvites.map((invite: ItineraryInvite) => (
              <Card key={invite.id} className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Invito da {invite.from_email}
                    </CardTitle>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      In attesa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Role */}
                    <div className="flex items-center gap-2">
                      {getRoleIcon(invite.role)}
                      <span className="text-sm text-muted-foreground">
                        Ruolo: {getRoleText(invite.role)}
                      </span>
                    </div>

                    {/* Message */}
                    {invite.message && (
                      <div className="text-sm bg-muted p-3 rounded-md">
                        <p className="font-medium mb-1">Messaggio:</p>
                        <p className="text-muted-foreground">{invite.message}</p>
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      Ricevuto il {format(new Date(invite.created_at), 'dd MMM yyyy', { locale: it })}
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvite(invite.id)}
                        disabled={updateInviteMutation.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accetta
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineInvite(invite.id)}
                        disabled={updateInviteMutation.isPending}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rifiuta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 