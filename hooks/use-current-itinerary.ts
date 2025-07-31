import { useState, useEffect, useCallback } from 'react';
import { useItineraries, useItinerary } from './use-itineraries';
import type { Itinerary } from '@/lib/schemas/itinerary';

const CURRENT_ITINERARY_KEY = 'current-itinerary-id';

export const useCurrentItinerary = () => {
  const { data: itineraries = [], isLoading, error } = useItineraries();
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);

  // Set current itinerary when data loads
  useEffect(() => {
    if (itineraries.length > 0 && !currentItinerary) {
      // Try to load from localStorage first
      const savedItineraryId = localStorage.getItem(CURRENT_ITINERARY_KEY);
      
      if (savedItineraryId) {
        const savedItinerary = itineraries.find(it => it.id === savedItineraryId);
        if (savedItinerary) {
          setCurrentItinerary(savedItinerary);
          return;
        }
      }
      
      // Fallback to first itinerary
      setCurrentItinerary(itineraries[0]);
    }
  }, [itineraries, currentItinerary]);

  // Simple setCurrentItinerary that saves to localStorage
  const setCurrentItineraryWithStorage = useCallback((itinerary: Itinerary | null) => {
    // Save to localStorage
    if (itinerary) {
      localStorage.setItem(CURRENT_ITINERARY_KEY, itinerary.id);
    } else {
      localStorage.removeItem(CURRENT_ITINERARY_KEY);
    }
    
    setCurrentItinerary(itinerary);
  }, []);

  // Function to clear localStorage when an itinerary is deleted
  const clearCurrentItinerary = useCallback(() => {
    localStorage.removeItem(CURRENT_ITINERARY_KEY);
    setCurrentItinerary(null);
  }, []);

  return {
    currentItinerary,
    setCurrentItinerary: setCurrentItineraryWithStorage,
    clearCurrentItinerary,
    itineraries,
    isLoading,
    error
  };
};

// Hook to get detailed information about the current itinerary
export const useCurrentItineraryDetails = () => {
  const { currentItinerary, setCurrentItinerary, clearCurrentItinerary, itineraries, isLoading: itinerariesLoading } = useCurrentItinerary();
  
  // Fetch detailed information about the current itinerary
  const { 
    data: itineraryDetails, 
    isLoading: detailsLoading, 
    error: detailsError
  } = useItinerary(currentItinerary?.id || '');

  return {
    currentItinerary: itineraryDetails || currentItinerary,
    setCurrentItinerary,
    clearCurrentItinerary,
    itineraries,
    isLoading: itinerariesLoading || detailsLoading,
    error: detailsError
  };
}; 