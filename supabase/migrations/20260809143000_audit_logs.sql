-- Audit Logs: immutable security event records for the NCC portal.
-- NEVER store passwords, OTP codes, raw tokens, or PII in metadata.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL,
  action text NOT NULL,
  target text NOT NULL DEFAULT '',
  ip text NOT NULL DEFAULT 'unknown',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns (actor lookup, action filtering, time range)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs (actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
