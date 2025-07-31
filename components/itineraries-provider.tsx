'use client';

import { useItineraries } from '@/hooks/use-itineraries';

interface ItinerariesProviderProps {
  children: React.ReactNode;
}

export function ItinerariesProvider({ children }: ItinerariesProviderProps) {
  // This will automatically load itineraries when the component mounts
  useItineraries();
  
  return <>{children}</>;
} 