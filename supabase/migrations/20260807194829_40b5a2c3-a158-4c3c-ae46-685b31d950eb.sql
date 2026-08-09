ALTER TABLE public.app_sessions ADD COLUMN IF NOT EXISTS cadet_enrollment_id text;
CREATE INDEX IF NOT EXISTS idx_app_sessions_token ON public.app_sessions (token);
CREATE INDEX IF NOT EXISTS idx_cadets_sbu_id ON public.cadets (sbu_id);