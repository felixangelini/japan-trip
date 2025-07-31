-- Create storage bucket for attachments (only if it doesn't exist)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 
  'attachments',
  'attachments',
  false,
  52428800, -- 50MB limit
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
where not exists (
  select 1 from storage.buckets where id = 'attachments'
);

-- Function to get storage URL
create or replace function get_storage_url(bucket text, path text)
returns text as $$
begin
  return 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/' || bucket || '/' || path;
end;
$$ language plpgsql security definer; 