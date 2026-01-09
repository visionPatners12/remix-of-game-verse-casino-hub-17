-- Ensure buckets exist and are public (idempotent)
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('post-media', 'post-media', true)
on conflict (id) do update set public = excluded.public;

-- Drop existing policies to avoid duplicates
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;
drop policy if exists "Post media publicly accessible" on storage.objects;
drop policy if exists "Users can upload post media" on storage.objects;
drop policy if exists "Users can update post media" on storage.objects;
drop policy if exists "Users can delete post media" on storage.objects;

-- RLS policies for avatars bucket
create policy "Avatar images are publicly accessible"
on storage.objects
for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own avatar"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own avatar"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for post-media bucket
create policy "Post media publicly accessible"
on storage.objects
for select
using (bucket_id = 'post-media');

create policy "Users can upload post media"
on storage.objects
for insert
with check (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update post media"
on storage.objects
for update
using (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete post media"
on storage.objects
for delete
using (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);