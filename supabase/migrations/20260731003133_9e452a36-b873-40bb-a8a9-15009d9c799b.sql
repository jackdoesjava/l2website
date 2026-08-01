ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;