'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/delete-dialog';
import { Plus, MoreVertical, Edit, Trash2, MapPin, Calendar, ChevronDown, ChevronRight, GitBranch, Hotel } from 'lucide-react';
import { useStops, useDeleteStop } from '@/hooks/use-stops';
import { useAccommodation } from '@/hooks/use-accommodations';
import { StopModal } from '@/components/stop-modal';
import { Stop } from '@/lib/schemas/stop';
import { formatDate } from '@/lib/utils';

interface GroupedStop {
    parent: Stop;
    children: Stop[];
}

interface StopsSectionProps {
    itineraryId: string;
}

export function StopsSection({ itineraryId }: StopsSectionProps) {
    const { data: stops = [] } = useStops(itineraryId);
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

    const StopCard = ({ stop, isChild = false, isCompressed = false }: { stop: Stop; isChild?: boolean; isCompressed?: boolean }) => {
        const { data: accommodation } = useAccommodation(stop.accommodation_id || '');

        return (
            <Card key={stop.id} className={`group overflow-hidden ${isChild ? 'h-24' : ''}`}>
                {/* Background Image */}
                <div
                    className={`bg-cover bg-center relative ${isChild ? 'h-24' : isCompressed ? 'h-24' : 'h-48'}`}
                    style={{
                        backgroundImage: stop.image_url
                            ? `url(${stop.image_url})`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Actions Menu */}
                    <div className="absolute top-3 right-3 transition-opacity z-10">
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
                    {!isChild && !isCompressed && (
                        <div className="absolute bottom-3 left-3">
                            <Badge variant="secondary" className="bg-white/90 text-gray-900">
                                <MapPin className="h-3 w-3 mr-1" />
                                {stop.location_name || 'Località non specificata'}
                            </Badge>
                        </div>
                    )}

                    {/* Child Indicator */}
                    {isChild && (
                        <div className="absolute bottom-2 right-2 opacity-50">
                            <Badge variant="outline" className="bg-white/90 text-xs">
                                <GitBranch className="h-6 w-3 mr-1" />
                            </Badge>
                        </div>
                    )}

                    {/* Compressed Content Overlay */}
                    {isCompressed && (
                        <div className="absolute inset-0 flex items-center p-3 pointer-events-none">
                            <div className="text-white">
                                <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                                    {stop.title}
                                </h3>
                                <div className="flex items-center text-xs opacity-90 mb-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>
                                        {stop.start_date ? formatDate(stop.start_date) : 'Data non specificata'} - {stop.end_date ? formatDate(stop.end_date) : 'Data non specificata'}
                                    </span>
                                </div>
                                {/* Accommodation for compressed stops */}
                                {accommodation && (
                                    <div className="flex items-center text-xs opacity-90">
                                        <Hotel className="h-3 w-3 mr-1" />
                                        <span>{accommodation.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Child Content Overlay */}
                    {isChild && (
                        <div className="absolute inset-0 flex items-center p-3 pointer-events-none">
                            <div className="text-white">
                                <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                                    {stop.title}
                                </h3>
                                <div className="flex items-center text-xs opacity-90 mb-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>
                                        {stop.start_date ? formatDate(stop.start_date) : 'Data non specificata'} - {stop.end_date ? formatDate(stop.end_date) : 'Data non specificata'}
                                    </span>
                                </div>
                                {/* Accommodation for child stops */}
                                {accommodation && (
                                    <div className="flex items-center text-xs opacity-90">
                                        <Hotel className="h-3 w-3 mr-1" />
                                        <span>{accommodation.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Content - Only for parent stops when not compressed */}
                {!isChild && !isCompressed && (
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
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                                {stop.start_date ? formatDate(stop.start_date) : 'Data non specificata'} - {stop.end_date ? formatDate(stop.end_date) : 'Data non specificata'}
                            </span>
                        </div>

                        {/* Accommodation */}
                        {accommodation && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Hotel className="h-4 w-4 mr-2" />
                                <span className="font-medium">{accommodation.name}</span>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
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
                        <div className="space-y-2">
                            {/* Parent Stop */}
                            <div className={`transition-all duration-300 ${expandedGroups.has(parent.id) ? 'h-24' : ''}`}>
                                <StopCard stop={parent} isCompressed={expandedGroups.has(parent.id)} />
                            </div>

                            {/* Children Stops - Vertical */}
                            {expandedGroups.has(parent.id) && children.length > 0 && (
                                <div className="relative">                                    
                                    <div className="flex flex-col gap-1 pl-16">
                                        {children.map((child) => (
                                            <div key={child.id} className="relative">
                                                {/* Tree indicator */}
                                                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 flex items-center">
                                                    <div className="w-4 h-px bg-gray-300"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                </div>
                                                {/* Vertical line connecting all children */}
                                                <div className="absolute -left-6 top-0 w-px h-full bg-gray-300"></div>
                                                <StopCard stop={child} isChild={true} />
                                            </div>
                                        ))}
                                    </div>
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
                itineraryId={itineraryId}
                stop={editingStop}
            />

            {/* Delete Stop Confirmation Dialog */}
            <DeleteDialog
                isOpen={!!deletingStop}
                onOpenChange={() => setDeletingStop(null)}
                onConfirm={handleDeleteStop}
                title="Conferma eliminazione"
                description={`Sei sicuro di voler eliminare la tappa "${deletingStop?.title}"? Questa azione eliminerà anche tutte le sottotappe associate e non può essere annullata.`}
                isLoading={deleteStopMutation.isPending}
            />
        </div>
    );
} 