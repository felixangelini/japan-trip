'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, MoreVertical, Edit, Trash2, MapPin, Calendar, ChevronDown, ChevronRight, GitBranch } from 'lucide-react';
import { useStops, useDeleteStop } from '@/hooks/use-stops';
import { useCurrentItinerary } from '@/hooks/use-current-itinerary';
import { StopModal } from '@/components/stop-modal';
import { Stop } from '@/lib/schemas/stop';
import { formatDate } from '@/lib/utils';

interface GroupedStop {
    parent: Stop;
    children: Stop[];
}

export default function StopsPage() {
    const { currentItinerary } = useCurrentItinerary();
    const { data: stops = [] } = useStops(currentItinerary?.id || '');
    const deleteStopMutation = useDeleteStop();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStop, setEditingStop] = useState<Stop | null>(null);
    const [deletingStop, setDeletingStop] = useState<Stop | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Group stops by parent
    const groupedStops = stops.reduce((groups: GroupedStop[], stop) => {
        if (!stop.parent_stop_id) {
            // This is a parent stop
            const children = stops.filter(s => s.parent_stop_id === stop.id);
            groups.push({ parent: stop, children });
        }
        return groups;
    }, []);


    // Sort functions
    const sortByStartDate = (a: Stop, b: Stop) => {
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return dateA - dateB;
    };

    // Sort grouped stops by parent start date
    const sortedGroupedStops = groupedStops
        .map(group => ({
            ...group,
            children: group.children.sort(sortByStartDate)
        }))
        .sort((a, b) => sortByStartDate(a.parent, b.parent));



    const handleCreateStop = () => {
        setEditingStop(null);
        setIsModalOpen(true);
    };

    const handleEditStop = (stop: Stop) => {
        setEditingStop(stop);
        setIsModalOpen(true);
    };

    const handleDeleteStop = async () => {
        if (!deletingStop) return;

        try {
            await deleteStopMutation.mutateAsync(deletingStop.id);
            setDeletingStop(null);
        } catch {
            // Error is handled by the mutation
        }
    };

    const toggleGroup = (parentId: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(parentId)) {
                newSet.delete(parentId);
            } else {
                newSet.add(parentId);
            }
            return newSet;
        });
    };

    const renderStopCard = (stop: Stop, isChild = false) => (
        <Card key={stop.id} className={`group overflow-hidden ${isChild ? 'h-24' : ''}`}>
            {/* Background Image */}
            <div
                className={`bg-cover bg-center relative ${isChild ? 'h-24' : 'h-48'}`}
                style={{
                    backgroundImage: stop.image_url
                        ? `url(${stop.image_url})`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20" />

                {/* Actions Menu */}
                <div className="absolute top-3 right-3 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStop(stop)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifica
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeletingStop(stop)}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Elimina
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Location Badge */}
                {!isChild && (
                    <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 text-gray-900">
                            <MapPin className="h-3 w-3 mr-1" />
                            {stop.location_name || 'Località non specificata'}
                        </Badge>
                    </div>
                )}

                {/* Child Indicator */}
                {isChild && (
                    <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="bg-white/90 text-xs">
                            <GitBranch className="h-3 w-3 mr-1" />
                            Sottotappa
                        </Badge>
                    </div>
                )}

                {/* Child Content Overlay */}
                {isChild && (
                    <div className="absolute inset-0 flex items-center p-3">
                        <div className="text-white">
                            <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                                {stop.title}
                            </h3>
                            <div className="flex items-center text-xs opacity-90">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>
                                    {stop.start_date ? formatDate(stop.start_date) : 'Data non specificata'} - {stop.end_date ? formatDate(stop.end_date) : 'Data non specificata'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content - Only for parent stops */}
            {!isChild && (
                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {stop.title}
                    </h3>

                    {stop.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {stop.description}
                        </p>
                    )}

                    {/* Dates */}
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                            {stop.start_date ? formatDate(stop.start_date) : 'Data non specificata'} - {stop.end_date ? formatDate(stop.end_date) : 'Data non specificata'}
                        </span>
                    </div>
                </CardContent>
            )}
        </Card>
    );

    if (!currentItinerary) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Seleziona un itinerario per visualizzare le tappe</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tappe</h1>
                    <p className="text-muted-foreground">
                        Gestisci le tappe dell&apos;itinerario &quot;{currentItinerary.title}&quot;
                    </p>
                </div>
                <Button onClick={handleCreateStop}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova Tappa
                </Button>
            </div>

            {/* Stops Grid */}
            <div className="space-y-6">
                {/* Grouped Stops (parents with children) */}
                {sortedGroupedStops.map(({ parent, children }) => (
                    <div key={parent.id} className="space-y-4">
                        <div className="flex items-center gap-3" onClick={() => toggleGroup(parent.id)}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto"
                            >
                                {expandedGroups.has(parent.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                {parent.title}
                                <Badge variant="secondary" className="text-xs">
                                    {children.length} {children.length === 1 ? 'sottotappa' : 'sottotappe'}
                                </Badge>
                            </h2>
                        </div>

                        {/* Parent and Children Layout */}
                        <div className="flex gap-4">
                            {/* Parent Stop */}
                            <div className="flex-1">
                                {renderStopCard(parent)}
                            </div>

                            {/* Children Stops - Horizontal */}
                            {expandedGroups.has(parent.id) && children.length > 0 && (
                                <div className="flex gap-3 min-w-0 overflow-x-auto pb-2">
                                    {children.map(child => (
                                        <div key={child.id} className="w-64 flex-shrink-0">
                                            {renderStopCard(child, true)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {/* Empty State */}
                {stops.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                            <MapPin className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Nessuna tappa ancora</h3>
                        <p className="text-muted-foreground mb-4">
                            Inizia creando la tua prima tappa per questo itinerario
                        </p>
                        <Button onClick={handleCreateStop}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crea Prima Tappa
                        </Button>
                    </div>
                )}
            </div>

            {/* Stop Modal */}
            <StopModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingStop(null);
                }}
                itineraryId={currentItinerary.id}
                stop={editingStop}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingStop} onOpenChange={() => setDeletingStop(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                        <AlertDialogDescription>
                            Sei sicuro di voler eliminare la tappa &quot;{deletingStop?.title}&quot;?
                            Questa azione eliminerà anche tutte le sottotappe associate e non può essere annullata.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteStop}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteStopMutation.isPending}
                        >
                            {deleteStopMutation.isPending ? 'Eliminazione...' : 'Elimina'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
