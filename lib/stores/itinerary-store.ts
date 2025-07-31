import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Itinerary, ItineraryInsert, ItineraryUpdate } from '@/lib/types/database';

interface ItineraryState {
  // State
  itineraries: Itinerary[];
  currentItinerary: Itinerary | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchItineraries: () => Promise<void>;
  createItinerary: (itinerary: Omit<ItineraryInsert, 'user_id'>) => Promise<Itinerary | null>;
  updateItinerary: (id: string, updates: ItineraryUpdate) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  clearError: () => void;
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  // Initial state
  itineraries: [],
  currentItinerary: null,
  loading: false,
  error: null,

  // Fetch all itineraries for the current user
  fetchItineraries: async () => {
    const supabase = createClient();
    
    try {
      set({ loading: true, error: null });
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch itineraries
      const { data: itineraries, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      set({ 
        itineraries: itineraries || [], 
        loading: false,
        // Set first itinerary as current if none selected
        currentItinerary: get().currentItinerary || itineraries?.[0] || null
      });

    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch itineraries',
        loading: false 
      });
    }
  },

  // Create a new itinerary
  createItinerary: async (itineraryData) => {
    const supabase = createClient();
    
    try {
      set({ loading: true, error: null });
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create itinerary
      const newItinerary: ItineraryInsert = {
        ...itineraryData,
        user_id: user.id
      };

      const { data: itinerary, error } = await supabase
        .from('itineraries')
        .insert(newItinerary)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update state
      set(state => ({
        itineraries: [itinerary, ...state.itineraries],
        currentItinerary: itinerary,
        loading: false
      }));

      return itinerary;

    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create itinerary',
        loading: false 
      });
      return null;
    }
  },

  // Update an existing itinerary
  updateItinerary: async (id: string, updates: ItineraryUpdate) => {
    const supabase = createClient();
    
    try {
      set({ loading: true, error: null });

      const { data: itinerary, error } = await supabase
        .from('itineraries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update state
      set(state => ({
        itineraries: state.itineraries.map(item => 
          item.id === id ? itinerary : item
        ),
        currentItinerary: state.currentItinerary?.id === id ? itinerary : state.currentItinerary,
        loading: false
      }));

    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update itinerary',
        loading: false 
      });
    }
  },

  // Delete an itinerary
  deleteItinerary: async (id: string) => {
    const supabase = createClient();
    
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update state
      set(state => {
        const newItineraries = state.itineraries.filter(item => item.id !== id);
        return {
          itineraries: newItineraries,
          currentItinerary: state.currentItinerary?.id === id 
            ? (newItineraries[0] || null) 
            : state.currentItinerary,
          loading: false
        };
      });

    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete itinerary',
        loading: false 
      });
    }
  },

  // Set current itinerary
  setCurrentItinerary: (itinerary) => {
    set({ currentItinerary: itinerary });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
})); 