-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ITINERARIES
create table itineraries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  start_date date,
  end_date date,
  is_public boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- STOPS (TAPPE)
create table stops (
  id uuid primary key default uuid_generate_v4(),
  itinerary_id uuid references itineraries(id) not null,
  parent_stop_id uuid references stops(id) on delete cascade,
  title text not null,
  description text,
  location_name text,
  lat double precision,
  lng double precision,
  start_date date,
  end_date date,
  "order" integer,
  created_at timestamp default now()
);

-- ACTIVITIES
create table activities (
  id uuid primary key default uuid_generate_v4(),
  stop_id uuid references stops(id) not null,
  title text not null,
  description text,
  scheduled_at timestamptz,
  location_name text,
  lat double precision,
  lng double precision,
  external_link text,
  created_at timestamp default now()
);

-- ACTIVITY MEDIA
create table activity_media (
  id uuid primary key default uuid_generate_v4(),
  activity_id uuid references activities(id) on delete cascade,
  url text not null,
  type text check (type in ('image', 'file')) not null,
  caption text,
  uploaded_at timestamp default now()
);

-- TAGS
create table tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null
);

-- ACTIVITY TAGS (many-to-many)
create table activity_tags (
  activity_id uuid references activities(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (activity_id, tag_id)
);

-- ACCOMMODATIONS
create table accommodations (
  id uuid primary key default uuid_generate_v4(),
  stop_id uuid references stops(id) not null,
  name text not null,
  check_in date not null,
  check_out date not null,
  address text,
  lat double precision,
  lng double precision,
  external_link text,
  notes text,
  created_at timestamp default now()
);

-- NOTES (generic notes attached to any entity)
create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  itinerary_id uuid references itineraries(id),
  stop_id uuid references stops(id),
  activity_id uuid references activities(id),
  accommodation_id uuid references accommodations(id),
  title text,
  content text not null,
  created_at timestamp default now()
);

-- ATTACHMENTS (generic files/images attached to any entity)
create table attachments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  itinerary_id uuid references itineraries(id),
  stop_id uuid references stops(id),
  activity_id uuid references activities(id),
  accommodation_id uuid references accommodations(id),
  note_id uuid references notes(id),
  url text not null,
  type text check (type in ('image', 'pdf', 'file')) not null,
  filename text,
  uploaded_at timestamp default now()
);

-- Create indexes for better performance
create index idx_itineraries_user_id on itineraries(user_id);
create index idx_itineraries_public on itineraries(is_public) where is_public = true;
create index idx_stops_itinerary_id on stops(itinerary_id);
create index idx_stops_parent_id on stops(parent_stop_id);
create index idx_stops_order on stops(itinerary_id, "order");
create index idx_activities_stop_id on activities(stop_id);
create index idx_activities_scheduled_at on activities(scheduled_at);
create index idx_activity_media_activity_id on activity_media(activity_id);
create index idx_tags_user_id on tags(user_id);
create index idx_activity_tags_activity_id on activity_tags(activity_id);
create index idx_activity_tags_tag_id on activity_tags(tag_id);
create index idx_accommodations_stop_id on accommodations(stop_id);
create index idx_notes_user_id on notes(user_id);
create index idx_notes_itinerary_id on notes(itinerary_id);
create index idx_notes_stop_id on notes(stop_id);
create index idx_notes_activity_id on notes(activity_id);
create index idx_notes_accommodation_id on notes(accommodation_id);
create index idx_attachments_user_id on attachments(user_id);
create index idx_attachments_itinerary_id on attachments(itinerary_id);
create index idx_attachments_stop_id on attachments(stop_id);
create index idx_attachments_activity_id on attachments(activity_id);
create index idx_attachments_accommodation_id on attachments(accommodation_id);
create index idx_attachments_note_id on attachments(note_id);

-- Enable Row Level Security (RLS)
alter table itineraries enable row level security;
alter table stops enable row level security;
alter table activities enable row level security;
alter table activity_media enable row level security;
alter table tags enable row level security;
alter table activity_tags enable row level security;
alter table accommodations enable row level security;
alter table notes enable row level security;
alter table attachments enable row level security;

-- RLS Policies for itineraries
create policy "Users can view their own itineraries" on itineraries
  for select using (auth.uid() = user_id);

create policy "Users can view public itineraries" on itineraries
  for select using (is_public = true);

create policy "Users can insert their own itineraries" on itineraries
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own itineraries" on itineraries
  for update using (auth.uid() = user_id);

create policy "Users can delete their own itineraries" on itineraries
  for delete using (auth.uid() = user_id);

-- RLS Policies for stops
create policy "Users can view stops from their itineraries" on stops
  for select using (
    exists (
      select 1 from itineraries 
      where itineraries.id = stops.itinerary_id 
      and (itineraries.user_id = auth.uid() or itineraries.is_public = true)
    )
  );

create policy "Users can insert stops in their itineraries" on stops
  for insert with check (
    exists (
      select 1 from itineraries 
      where itineraries.id = stops.itinerary_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can update stops in their itineraries" on stops
  for update using (
    exists (
      select 1 from itineraries 
      where itineraries.id = stops.itinerary_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can delete stops in their itineraries" on stops
  for delete using (
    exists (
      select 1 from itineraries 
      where itineraries.id = stops.itinerary_id 
      and itineraries.user_id = auth.uid()
    )
  );

-- RLS Policies for activities
create policy "Users can view activities from their stops" on activities
  for select using (
    exists (
      select 1 from stops 
      join itineraries on stops.itinerary_id = itineraries.id
      where stops.id = activities.stop_id 
      and (itineraries.user_id = auth.uid() or itineraries.is_public = true)
    )
  );

create policy "Users can insert activities in their stops" on activities
  for insert with check (
    exists (
      select 1 from stops 
      join itineraries on stops.itinerary_id = itineraries.id
      where stops.id = activities.stop_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can update activities in their stops" on activities
  for update using (
    exists (
      select 1 from stops 
      join itineraries on stops.itinerary_id = itineraries.id
      where stops.id = activities.stop_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can delete activities in their stops" on activities
  for delete using (
    exists (
      select 1 from stops 
      join itineraries on stops.itinerary_id = itineraries.id
      where stops.id = activities.stop_id 
      and itineraries.user_id = auth.uid()
    )
  );

-- RLS Policies for activity_media
create policy "Users can view media from their activities" on activity_media
  for select using (
    exists (
      select 1 from activities
      join stops on activities.stop_id = stops.id
      join itineraries on stops.itinerary_id = itineraries.id
      where activities.id = activity_media.activity_id 
      and (itineraries.user_id = auth.uid() or itineraries.is_public = true)
    )
  );

create policy "Users can insert media in their activities" on activity_media
  for insert with check (
    exists (
      select 1 from activities
      join stops on activities.stop_id = stops.id
      join itineraries on stops.itinerary_id = itineraries.id
      where activities.id = activity_media.activity_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can update media in their activities" on activity_media
  for update using (
    exists (
      select 1 from activities
      join stops on activities.stop_id = stops.id
      join itineraries on stops.itinerary_id = itineraries.id
      where activities.id = activity_media.activity_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can delete media in their activities" on activity_media
  for delete using (
    exists (
      select 1 from activities
      join stops on activities.stop_id = stops.id
      join itineraries on stops.itinerary_id = itineraries.id
      where activities.id = activity_media.activity_id 
      and itineraries.user_id = auth.uid()
    )
  );

-- RLS Policies for tags
create policy "Users can view their own tags" on tags
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tags" on tags
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tags" on tags
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tags" on tags
  for delete using (auth.uid() = user_id);

-- RLS Policies for activity_tags
create policy "Users can view activity tags from their activities" on activity_tags
  for select using (
    exists (
      select 1 from activities
      join stops on activities.stop_id = stops.id
      join itineraries on stops.itinerary_id = itineraries.id
      where activities.id = activity_tags.activity_id 
      and (itineraries.user_id = auth.uid() or itineraries.is_public = true)
    )
  );

create policy "Users can insert activity tags in their activities" on activity_tags
  for insert with check (
    exists (
      select 1 from activities
      join stops on activities.stop_id = stops.id
      join itineraries on stops.itinerary_id = itineraries.id
      where activities.id = activity_tags.activity_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can delete activity tags from their activities" on activity_tags
  for delete using (
    exists (
      select 1 from activities
      join stops on activities.stop_id = stops.id
      join itineraries on stops.itinerary_id = itineraries.id
      where activities.id = activity_tags.activity_id 
      and itineraries.user_id = auth.uid()
    )
  );

-- RLS Policies for accommodations
create policy "Users can view accommodations from their stops" on accommodations
  for select using (
    exists (
      select 1 from stops 
      join itineraries on stops.itinerary_id = itineraries.id
      where stops.id = accommodations.stop_id 
      and (itineraries.user_id = auth.uid() or itineraries.is_public = true)
    )
  );

create policy "Users can insert accommodations in their stops" on accommodations
  for insert with check (
    exists (
      select 1 from stops 
      join itineraries on stops.itinerary_id = itineraries.id
      where stops.id = accommodations.stop_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can update accommodations in their stops" on accommodations
  for update using (
    exists (
      select 1 from stops 
      join itineraries on stops.itinerary_id = itineraries.id
      where stops.id = accommodations.stop_id 
      and itineraries.user_id = auth.uid()
    )
  );

create policy "Users can delete accommodations in their stops" on accommodations
  for delete using (
    exists (
      select 1 from stops 
      join itineraries on stops.itinerary_id = itineraries.id
      where stops.id = accommodations.stop_id 
      and itineraries.user_id = auth.uid()
    )
  );

-- RLS Policies for notes
create policy "Users can view their own notes" on notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes" on notes
  for delete using (auth.uid() = user_id);

-- RLS Policies for attachments
create policy "Users can view their own attachments" on attachments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own attachments" on attachments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own attachments" on attachments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own attachments" on attachments
  for delete using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_itineraries_updated_at
  before update on itineraries
  for each row
  execute function update_updated_at_column(); 