-- Migration: 20260811000000_calendar_prompter_notifications.sql
-- Integrated Schema for NCC Calendar, Prompter Engine, Notifications & Async Email Jobs

-- 1. Evolve calendar_events table
ALTER TABLE public.calendar_events 
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'System Officer',
  ADD COLUMN IF NOT EXISTS updated_by text DEFAULT 'System Officer',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS published_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- 2. Create calendar_event_attendees table
CREATE TABLE IF NOT EXISTS public.calendar_event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  cadet_enrollment_id text NOT NULL,
  status text NOT NULL DEFAULT 'INVITED', -- 'INVITED', 'ACCEPTED', 'DECLINED', 'ATTENDED', 'ABSENT'
  invited_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, cadet_enrollment_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_event_attendees_event ON public.calendar_event_attendees (event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_attendees_cadet ON public.calendar_event_attendees (cadet_enrollment_id);
GRANT ALL ON public.calendar_event_attendees TO service_role;
ALTER TABLE public.calendar_event_attendees ENABLE ROW LEVEL SECURITY;

-- 3. Create calendar_event_reminders table
CREATE TABLE IF NOT EXISTS public.calendar_event_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  offset_minutes integer NOT NULL, -- e.g. 1440 (24h), 120 (2h), 30 (30m), 0 (start)
  channel text NOT NULL DEFAULT 'BOTH', -- 'EMAIL', 'SOCKET_IO', 'IN_APP', 'BOTH'
  recipient_scope text NOT NULL DEFAULT 'ALL_CADETS', -- 'ALL_CADETS', 'PI_STAFF', 'OFFICERS', 'SPECIFIC_USERS'
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'CANCELLED', 'FAILED'
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_event ON public.calendar_event_reminders (event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_scheduled ON public.calendar_event_reminders (scheduled_for, status);
GRANT ALL ON public.calendar_event_reminders TO service_role;
ALTER TABLE public.calendar_event_reminders ENABLE ROW LEVEL SECURITY;

-- 4. Evolve notifications table
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id text,
  ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications (created_at DESC);

-- 5. Create notification_deliveries table
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  recipient_id text NOT NULL,
  channel text NOT NULL DEFAULT 'IN_APP', -- 'IN_APP', 'EMAIL', 'SOCKET_IO'
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'DELIVERED', 'FAILED'
  attempt_count integer NOT NULL DEFAULT 0,
  sent_at timestamptz,
  failed_at timestamptz,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON public.notification_deliveries (notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_recipient ON public.notification_deliveries (recipient_id);
GRANT ALL ON public.notification_deliveries TO service_role;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

-- 6. Create email_jobs table
CREATE TABLE IF NOT EXISTS public.email_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL, -- 'sendOtp', 'sendWelcomeEmail', 'sendCalendarInvitation', etc.
  recipient text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  attempts integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_jobs_status_scheduled ON public.email_jobs (status, scheduled_at);
GRANT ALL ON public.email_jobs TO service_role;
ALTER TABLE public.email_jobs ENABLE ROW LEVEL SECURITY;

-- 7. Create email_delivery_logs table
CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_job_id uuid REFERENCES public.email_jobs(id) ON DELETE SET NULL,
  recipient text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'SENT', -- 'SENT', 'FAILED'
  smtp_message_id text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  error_details text
);

CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_job ON public.email_delivery_logs (email_job_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_recipient ON public.email_delivery_logs (recipient);
GRANT ALL ON public.email_delivery_logs TO service_role;
ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;
