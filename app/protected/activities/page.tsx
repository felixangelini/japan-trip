'use client';

import { useCurrentItinerary } from '@/hooks/use-current-itinerary';
import { ActivitiesSection } from './_components/activities-section';

export default function ActivitiesPage() {
  const { currentItinerary } = useCurrentItinerary();

  if (!currentItinerary) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Attività</h1>
          <p className="text-muted-foreground">
            Seleziona un itinerario per visualizzare le attività
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Attività</h1>
        <p className="text-muted-foreground mt-2">
          Gestisci le attività per {currentItinerary.title}
        </p>
      </div>

      <ActivitiesSection itineraryId={currentItinerary.id} />
    </div>
  );
}