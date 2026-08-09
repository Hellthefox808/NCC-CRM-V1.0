-- Operations Schema: Activities, Calendar, Attendance, Staff Clock-in/out, Annual Planning

-- 1. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Institutional', -- 'Institutional', 'Camps', 'Shooting', 'Social Service', 'Adventure'
  description text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  location text NOT NULL DEFAULT 'SBU Parade Ground',
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  status text NOT NULL DEFAULT 'PLANNED', -- 'PLANNED', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
  organizer text DEFAULT '19 JHR BN NCC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities (status);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities (category);
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 2. Activity Participants (Many-to-Many Cadets ↔ Activities)
CREATE TABLE IF NOT EXISTS public.activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  cadet_enrollment_id text NOT NULL,
  status text NOT NULL DEFAULT 'REGISTERED', -- 'REGISTERED', 'ATTENDED', 'ABSENT', 'EXCUSED'
  remarks text,
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(activity_id, cadet_enrollment_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_participants_activity ON public.activity_participants (activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_cadet ON public.activity_participants (cadet_enrollment_id);
GRANT ALL ON public.activity_participants TO service_role;
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;

-- 3. Activity Photos (S3 / Storage Metadata)
CREATE TABLE IF NOT EXISTS public.activity_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text DEFAULT '',
  uploaded_by text NOT NULL DEFAULT 'System',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_photos_activity ON public.activity_photos (activity_id);
GRANT ALL ON public.activity_photos TO service_role;
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;

-- 4. Calendar Events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_type text NOT NULL DEFAULT 'Parade', -- 'Parade', 'Camp', 'Exam', 'Ceremony', 'Meeting', 'Holiday'
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text DEFAULT 'SBU Campus',
  description text DEFAULT '',
  is_all_day boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON public.calendar_events (start_time);
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 5. Annual Training Plans
CREATE TABLE IF NOT EXISTS public.annual_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_year integer NOT NULL DEFAULT 2026,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Training', -- 'Training', 'Camp', 'Inspection', 'Recruitment', 'Social'
  target_month text NOT NULL, -- 'January', 'February', etc.
  status text NOT NULL DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED'
  remarks text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_annual_plans_year ON public.annual_plans (plan_year);
GRANT ALL ON public.annual_plans TO service_role;
ALTER TABLE public.annual_plans ENABLE ROW LEVEL SECURITY;

-- 6. PI Staff Clock-In / Clock-Out
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_name text NOT NULL,
  staff_role text NOT NULL DEFAULT 'PI Staff', -- 'ANO', 'PI Staff', 'Subedar Major', 'Instructor'
  date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  duty_location text DEFAULT 'SBU Parade Ground',
  remarks text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON public.staff_attendance (date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON public.staff_attendance (staff_name);
GRANT ALL ON public.staff_attendance TO service_role;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
