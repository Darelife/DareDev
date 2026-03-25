-- Canvas multi-user schema (users, drawings, drawing_access)
-- Safe to run multiple times.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  data jsonb NOT NULL DEFAULT jsonb_build_object(
    'elements', '[]'::jsonb,
    'appState', '{}'::jsonb,
    'files', '{}'::jsonb
  ),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.drawing_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_id uuid NOT NULL REFERENCES public.drawings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (drawing_id, user_id)
);

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

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_drawings_updated_at ON public.drawings (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_drawing_access_user_id ON public.drawing_access (user_id);
CREATE INDEX IF NOT EXISTS idx_drawing_access_drawing_id ON public.drawing_access (drawing_id);

-- RLS can remain disabled because API routes use service-role key on the backend.
-- If you later move to user-level Supabase auth, re-enable and add per-user policies.
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawing_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_users" ON public.users;
DROP POLICY IF EXISTS "deny_all_drawings" ON public.drawings;
DROP POLICY IF EXISTS "deny_all_drawing_access" ON public.drawing_access;

CREATE POLICY "deny_all_users" ON public.users
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "deny_all_drawings" ON public.drawings
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "deny_all_drawing_access" ON public.drawing_access
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Initial admin seed (replace password hash first):
-- INSERT INTO public.users (username, password_hash, role)
-- VALUES ('admin', '$2b$12$REPLACE_WITH_BCRYPT_HASH', 'admin')
-- ON CONFLICT (username) DO NOTHING;

COMMIT;
