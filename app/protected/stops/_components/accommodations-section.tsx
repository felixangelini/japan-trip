'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/delete-dialog';
import { AccommodationModal } from '@/components/accommodation-modal';
import { Plus, MoreVertical, Edit, Trash2, MapPin, Hotel } from 'lucide-react';
import { useAccommodations, useDeleteAccommodation } from '@/hooks/use-accommodations';
import { useStops } from '@/hooks/use-stops';
import { Accommodation } from '@/lib/types/database';


interface AccommodationsSectionProps {
    itineraryId: string;
}

export function AccommodationsSection({ itineraryId }: AccommodationsSectionProps) {
    const { data: allAccommodations = [] } = useAccommodations(itineraryId);
    const { data: stops = [] } = useStops(itineraryId);
    const deleteAccommodationMutation = useDeleteAccommodation();

    const [deletingAccommodation, setDeletingAccommodation] = useState<Accommodation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);

    const handleCreateAccommodation = () => {
        setEditingAccommodation(null);
        setIsModalOpen(true);
    };

    const handleEditAccommodation = (accommodation: Accommodation) => {
        setEditingAccommodation(accommodation);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAccommodation(null);
    };

    const handleDeleteAccommodation = async () => {
        if (!deletingAccommodation) return;

        try {
            await deleteAccommodationMutation.mutateAsync(deletingAccommodation.id);
            setDeletingAccommodation(null);
        } catch {
            // Error is handled by the mutation
        }
    };

    const AccommodationCard = ({ accommodation }: { accommodation: Accommodation }) => {
        const linkedStop = accommodation.stop_id ? stops.find(stop => stop.id === accommodation.stop_id) : null;
        
        return (
            <Card className="group overflow-hidden">
                {/* Background Image if linked to a stop */}
                {linkedStop?.image_url && (
                    <div
                        className="h-32 bg-cover bg-center relative"
                        style={{
                            backgroundImage: `url(${linkedStop.image_url})`
                        }}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/20" />
                        
                        {/* Stop Badge */}
                        <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-white/90 text-gray-900">
                                <MapPin className="h-3 w-3 mr-1" />
                                {linkedStop.title}
                            </Badge>
                        </div>
                    </div>
                )}
                
                <CardContent className={`p-4 ${linkedStop?.image_url ? '' : 'pt-4'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                                {accommodation.name}
                            </h3>
                            
                            {/* Show stop badge if no background image */}
                            {linkedStop && !linkedStop.image_url && (
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                    <Badge variant="outline" className="text-xs">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {linkedStop.title}
                                    </Badge>
                                </div>
                            )}
                            
                            {accommodation.address && (
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span>{accommodation.address}</span>
                                </div>
                            )}

                            {accommodation.notes && (
                                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                    {accommodation.notes}
                                </p>
                            )}

                            {accommodation.external_link && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <a 
                                        href={accommodation.external_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Link esterno
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditAccommodation(accommodation)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifica
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setDeletingAccommodation(accommodation)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Elimina
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={handleCreateAccommodation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Alloggio
                </Button>
            </div>

            {/* Accommodations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allAccommodations.map((accommodation) => (
                    <AccommodationCard key={accommodation.id} accommodation={accommodation} />
                ))}
            </div>

            {/* Empty State */}
            {allAccommodations.length === 0 && (
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Hotel className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Nessun alloggio ancora</h3>
                    <p className="text-muted-foreground mb-4">
                        Crea il tuo primo alloggio per questo itinerario
                    </p>
                    <Button onClick={handleCreateAccommodation}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crea Primo Alloggio
                    </Button>
                </div>
            )}

            {/* Accommodation Modal */}
            <AccommodationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                accommodation={editingAccommodation}
                stopId={undefined} // Standalone accommodation
                itineraryId={itineraryId}
            />

            {/* Delete Accommodation Confirmation Dialog */}
            <DeleteDialog
                isOpen={!!deletingAccommodation}
                onOpenChange={() => setDeletingAccommodation(null)}
                onConfirm={handleDeleteAccommodation}
                title="Conferma eliminazione"
                description={`Sei sicuro di voler eliminare l'alloggio "${deletingAccommodation?.name}"? Questa azione non può essere annullata.`}
                isLoading={deleteAccommodationMutation.isPending}
            />
        </div>
    );
} 