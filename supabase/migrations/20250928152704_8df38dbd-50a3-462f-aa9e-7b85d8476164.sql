-- Make user_id nullable in profiles table for cases without Supabase auth
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow users to view profiles without authentication for registration check
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Allow reading profiles for registration check" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow inserting profiles without user_id for initial registration
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

CREATE POLICY "Allow profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Update service requests policies to work with profiles without user_id
DROP POLICY IF EXISTS "Users can view their own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can create their own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can update their own service requests" ON public.service_requests;

CREATE POLICY "Allow service request operations" 
ON public.service_requests 
FOR ALL 
USING (true)
WITH CHECK (true);
-- Create a new table for notes
create table notes (
  id bigint primary key generated always as identity,
  title text not null
);

-- Insert some sample data into the table
insert into notes (title)
values
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');

alter table notes enable row level security;
create policy "public can read countries"
on public.notes
for select to anon
using (true);