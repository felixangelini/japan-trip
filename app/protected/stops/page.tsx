'use client';

import { MapPin, Hotel } from 'lucide-react';
import { useCurrentItinerary } from '@/hooks/use-current-itinerary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StopsSection } from './_components/stops-section';
import { AccommodationsSection } from './_components/accommodations-section';


export default function StopsPage() {
    const { currentItinerary } = useCurrentItinerary();


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
                    <h1 className="text-3xl font-bold">Tappe e Alloggi</h1>
                    <p className="text-muted-foreground">
                        Gestisci le tappe e gli alloggi dell&apos;itinerario &quot;{currentItinerary.title}&quot;
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="stops" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stops" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Tappe
                    </TabsTrigger>
                    <TabsTrigger value="accommodations" className="flex items-center gap-2">
                        <Hotel className="h-4 w-4" />
                        Alloggi
                    </TabsTrigger>
                </TabsList>

                {/* Stops Tab */}
                <TabsContent value="stops" className="space-y-6">
                    <StopsSection itineraryId={currentItinerary.id} />
                </TabsContent>

                {/* Accommodations Tab */}
                <TabsContent value="accommodations" className="space-y-6">
                    <AccommodationsSection itineraryId={currentItinerary.id} />
                </TabsContent>
            </Tabs>


        </div>
    );
}
