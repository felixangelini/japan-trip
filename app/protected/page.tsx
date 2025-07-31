'use client';

import Countdown from "@/components/countdown"
import { useCurrentItinerary } from "@/hooks/use-current-itinerary"

export default function ProtectedPage() {
  const { currentItinerary, isLoading } = useCurrentItinerary();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {isLoading ? (
            "Caricamento..."
          ) : currentItinerary ? (
            `Tutto pronto per ${currentItinerary.title}`
          ) : (
                "Nessun itinerario"
          )}
        </h1>
      </div>

      {currentItinerary && <Countdown date={currentItinerary?.start_date || ""} />}
    </div>
  )
}
