export interface Database {
  public: {
    Tables: {
      itineraries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stops: {
        Row: {
          id: string;
          itinerary_id: string;
          parent_stop_id: string | null;
          title: string;
          description: string | null;
          location_name: string | null;
          lat: number | null;
          lng: number | null;
          start_date: string | null;
          end_date: string | null;
          order: number | null;
          accommodation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          itinerary_id: string;
          parent_stop_id?: string | null;
          title: string;
          description?: string | null;
          location_name?: string | null;
          lat?: number | null;
          lng?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          order?: number | null;
          accommodation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          itinerary_id?: string;
          parent_stop_id?: string | null;
          title?: string;
          description?: string | null;
          location_name?: string | null;
          lat?: number | null;
          lng?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          order?: number | null;
          accommodation_id?: string | null;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          stop_id: string;
          title: string;
          description: string | null;
          scheduled_at: string | null;
          location_name: string | null;
          lat: number | null;
          lng: number | null;
          external_link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stop_id: string;
          title: string;
          description?: string | null;
          scheduled_at?: string | null;
          location_name?: string | null;
          lat?: number | null;
          lng?: number | null;
          external_link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          stop_id?: string;
          title?: string;
          description?: string | null;
          scheduled_at?: string | null;
          location_name?: string | null;
          lat?: number | null;
          lng?: number | null;
          external_link?: string | null;
          created_at?: string;
        };
      };
      activity_media: {
        Row: {
          id: string;
          activity_id: string;
          url: string;
          type: 'image' | 'file';
          caption: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          url: string;
          type: 'image' | 'file';
          caption?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          url?: string;
          type?: 'image' | 'file';
          caption?: string | null;
          uploaded_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
        };
      };
      activity_tags: {
        Row: {
          activity_id: string;
          tag_id: string;
        };
        Insert: {
          activity_id: string;
          tag_id: string;
        };
        Update: {
          activity_id?: string;
          tag_id?: string;
        };
      };
      accommodations: {
        Row: {
          id: string;
          stop_id: string | null;
          itinerary_id: string;
          name: string;
          address: string | null;
          external_link: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stop_id?: string | null;
          itinerary_id: string;
          name: string;
          address?: string | null;
          external_link?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          stop_id?: string | null;
          itinerary_id?: string;
          name?: string;
          address?: string | null;
          external_link?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string | null;
          itinerary_id: string | null;
          stop_id: string | null;
          activity_id: string | null;
          accommodation_id: string | null;
          title: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          itinerary_id?: string | null;
          stop_id?: string | null;
          activity_id?: string | null;
          accommodation_id?: string | null;
          title?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          itinerary_id?: string | null;
          stop_id?: string | null;
          activity_id?: string | null;
          accommodation_id?: string | null;
          title?: string | null;
          content?: string;
          created_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          user_id: string | null;
          itinerary_id: string | null;
          stop_id: string | null;
          activity_id: string | null;
          accommodation_id: string | null;
          note_id: string | null;
          url: string;
          type: 'image' | 'pdf' | 'file';
          filename: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          itinerary_id?: string | null;
          stop_id?: string | null;
          activity_id?: string | null;
          accommodation_id?: string | null;
          note_id?: string | null;
          url: string;
          type: 'image' | 'pdf' | 'file';
          filename?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          itinerary_id?: string | null;
          stop_id?: string | null;
          activity_id?: string | null;
          accommodation_id?: string | null;
          note_id?: string | null;
          url?: string;
          type?: 'image' | 'pdf' | 'file';
          filename?: string | null;
          uploaded_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types for common operations
export type Itinerary = Database['public']['Tables']['itineraries']['Row'];
export type ItineraryInsert = Database['public']['Tables']['itineraries']['Insert'];
export type ItineraryUpdate = Database['public']['Tables']['itineraries']['Update'];

export type Stop = Database['public']['Tables']['stops']['Row'];
export type StopInsert = Database['public']['Tables']['stops']['Insert'];
export type StopUpdate = Database['public']['Tables']['stops']['Update'];

export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
export type ActivityUpdate = Database['public']['Tables']['activities']['Update'];

export type ActivityMedia = Database['public']['Tables']['activity_media']['Row'];
export type ActivityMediaInsert = Database['public']['Tables']['activity_media']['Insert'];
export type ActivityMediaUpdate = Database['public']['Tables']['activity_media']['Update'];

export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagInsert = Database['public']['Tables']['tags']['Insert'];
export type TagUpdate = Database['public']['Tables']['tags']['Update'];

export type ActivityTag = Database['public']['Tables']['activity_tags']['Row'];
export type ActivityTagInsert = Database['public']['Tables']['activity_tags']['Insert'];
export type ActivityTagUpdate = Database['public']['Tables']['activity_tags']['Update'];

export type Accommodation = Database['public']['Tables']['accommodations']['Row'];
export type AccommodationInsert = Database['public']['Tables']['accommodations']['Insert'];
export type AccommodationUpdate = Database['public']['Tables']['accommodations']['Update'];

export type Note = Database['public']['Tables']['notes']['Row'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];

export type Attachment = Database['public']['Tables']['attachments']['Row'];
export type AttachmentInsert = Database['public']['Tables']['attachments']['Insert'];
export type AttachmentUpdate = Database['public']['Tables']['attachments']['Update']; 