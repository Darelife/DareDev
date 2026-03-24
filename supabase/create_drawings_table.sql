-- Full reset + recreate script for canvas persistence
-- Safe to run multiple times.

BEGIN;

-- Ensure required extension exists.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Table
CREATE TABLE IF NOT EXISTS public.drawings (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Keep `updated_at` current on every update.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_drawings_set_updated_at ON public.drawings;
CREATE TRIGGER trg_drawings_set_updated_at
BEFORE UPDATE ON public.drawings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_drawings_updated_at
  ON public.drawings (updated_at DESC);

-- 3) Security
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- Start clean to avoid duplicate-policy errors on reruns.
DROP POLICY IF EXISTS "drawings_select_default_canvas" ON public.drawings;
DROP POLICY IF EXISTS "drawings_insert_default_canvas" ON public.drawings;
DROP POLICY IF EXISTS "drawings_update_default_canvas" ON public.drawings;

-- Your app always reads/writes id = 'default-canvas'.
-- Allow anon + authenticated for this single row only.
CREATE POLICY "drawings_select_default_canvas"
ON public.drawings
FOR SELECT
TO anon, authenticated
USING (id = 'default-canvas');

CREATE POLICY "drawings_insert_default_canvas"
ON public.drawings
FOR INSERT
TO anon, authenticated
WITH CHECK (id = 'default-canvas');

CREATE POLICY "drawings_update_default_canvas"
ON public.drawings
FOR UPDATE
TO anon, authenticated
USING (id = 'default-canvas')
WITH CHECK (id = 'default-canvas');

-- Explicit grants (usually present in Supabase, but included for robustness).
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.drawings TO anon, authenticated;

-- 4) Seed default row so GET works immediately.
INSERT INTO public.drawings (id, data)
VALUES (
  'default-canvas',
  jsonb_build_object(
    'elements', '[]'::jsonb,
    'appState', jsonb_build_object('collaborators', jsonb_build_object()),
    'files', jsonb_build_object()
  )
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
