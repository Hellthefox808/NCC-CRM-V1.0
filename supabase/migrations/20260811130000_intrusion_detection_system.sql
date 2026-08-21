-- Migration: 20260811130000_intrusion_detection_system.sql
-- Intrusion Detection System (IDS), Security Alerting & Automated Containment Schema

-- 1. Create ids_events table
CREATE TABLE IF NOT EXISTS public.ids_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'AUTH_FAILURE', 'IDOR_ATTEMPT', 'STORAGE_TOKEN_REPLAY', 'RATE_LIMIT_TRIGGERED', 'UNAUTHORIZED_EXPORT', 'AI_ABUSE'
  actor_id text,
  actor_ip text NOT NULL,
  risk_score integer NOT NULL DEFAULT 10, -- Scale 1 to 100
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ids_events_actor ON public.ids_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_ids_events_ip ON public.ids_events (actor_ip);
CREATE INDEX IF NOT EXISTS idx_ids_events_type_time ON public.ids_events (event_type, created_at);
GRANT ALL ON public.ids_events TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.ids_events ENABLE ROW LEVEL SECURITY';
END $$;

-- 2. Create ids_alerts table
CREATE TABLE IF NOT EXISTS public.ids_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.ids_events(id) ON DELETE CASCADE,
  alert_level text NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ids_alerts_level_status ON public.ids_alerts (alert_level, status);
GRANT ALL ON public.ids_alerts TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.ids_alerts ENABLE ROW LEVEL SECURITY';
END $$;

-- 3. Create ids_actions table
CREATE TABLE IF NOT EXISTS public.ids_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES public.ids_alerts(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- 'LOG', 'ALERT_STAFF', 'RATE_LIMIT_IP', 'REVOKE_SESSION', 'QUARANTINE_OBJECT'
  target_resource text,
  executed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'EXECUTED'
);

CREATE INDEX IF NOT EXISTS idx_ids_actions_alert ON public.ids_actions (alert_id);
GRANT ALL ON public.ids_actions TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.ids_actions ENABLE ROW LEVEL SECURITY';
END $$;
