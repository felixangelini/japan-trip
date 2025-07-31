# Supabase Database Setup

This document explains how to set up the database schema for the Japan Travel app in Supabase.

## Database Schema Overview

The application uses the following main entities:

- **Itineraries**: Main travel plans with start/end dates
- **Stops**: Destinations within an itinerary (can be nested)
- **Activities**: Specific things to do at each stop
- **Accommodations**: Hotel/lodging information
- **Tags**: User-defined categories for activities
- **Notes**: Generic notes attached to any entity
- **Attachments**: Files and images attached to any entity

## Setup Instructions

### 1. Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section

### 2. Run the Migration

1. Copy the contents of `supabase/migrations/001_create_travel_schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

### 3. Verify the Setup

After running the migration, you should see:

- 9 new tables created
- Row Level Security (RLS) enabled on all tables
- Appropriate indexes for performance
- Security policies that ensure users can only access their own data

### 4. Test the Setup

You can verify the setup by running these test queries in the SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'itineraries', 'stops', 'activities', 'activity_media', 
  'tags', 'activity_tags', 'accommodations', 'notes', 'attachments'
);

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Key Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Public itineraries can be viewed by anyone
- Hierarchical access control (users can access stops/activities within their itineraries)

### Performance Optimizations
- Indexes on foreign keys and frequently queried columns
- Composite indexes for ordered queries
- Partial indexes for public content

### Data Integrity
- Foreign key constraints with cascade deletes
- Check constraints for media types
- Automatic timestamp updates

## Usage in the Application

The TypeScript types in `lib/types/database.ts` provide full type safety when working with the database. You can use them like this:

```typescript
import { createClient } from '@/lib/supabase/client';
import type { ItineraryInsert, Itinerary } from '@/lib/types/database';

const supabase = createClient();

// Create a new itinerary
const newItinerary: ItineraryInsert = {
  user_id: 'user-uuid',
  title: 'Japan Adventure',
  description: 'Exploring Tokyo and Kyoto',
  start_date: '2024-03-01',
  end_date: '2024-03-15',
  is_public: false
};

const { data, error } = await supabase
  .from('itineraries')
  .insert(newItinerary)
  .select()
  .single();
```

## Storage Setup

### 1. Run the Storage Migration

After setting up the main database schema, run the storage migration:

1. Copy the contents of `supabase/migrations/002_setup_storage.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

This will:
- Create a storage bucket called "attachments"
- Set up RLS policies for secure file access
- Configure allowed file types and size limits

### 2. Configure Storage Settings

In your Supabase dashboard:

1. Go to **Storage** section
2. Verify the "attachments" bucket exists
3. Check that RLS is enabled
4. Review the bucket settings (file size limit: 50MB)

### 3. Test File Upload

You can test the storage setup using the provided components:

```typescript
import { FileUpload } from '@/components/file-upload';
import { AttachmentViewer } from '@/components/attachment-viewer';

// In your component
<FileUpload
  entityType="itinerary"
  entityId="your-itinerary-id"
  userId="current-user-id"
  onUploadComplete={(attachment) => console.log('Uploaded:', attachment)}
  onUploadError={(error) => console.error('Error:', error)}
/>

<AttachmentViewer
  entityType="itinerary"
  entityId="your-itinerary-id"
  onAttachmentDeleted={(id) => console.log('Deleted:', id)}
/>
```

## Next Steps

1. **Authentication**: Ensure your auth setup is working correctly
2. **API Routes**: Create server-side API routes for complex operations
3. **Real-time**: Enable real-time subscriptions if needed

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure you're logged in and the user has the correct permissions
2. **Foreign Key Violations**: Ensure referenced records exist before creating relationships
3. **RLS Blocking Queries**: Check that your RLS policies allow the operations you're trying to perform

### Getting Help

- Check the Supabase documentation for detailed information about RLS and policies
- Use the Supabase dashboard to inspect table structures and policies
- Test queries in the SQL Editor before implementing them in your application 