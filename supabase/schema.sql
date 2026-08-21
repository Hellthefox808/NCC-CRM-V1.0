-- ========================================================
-- 19 JHARKHAND BATTALION NCC — COMPLETE DATABASE SCHEMA
-- Project: qsrmzajadmmgqhfbxdwu
-- Generated on: 2026-08-21T17:38:18.362Z
-- ========================================================

-- >>> MIGRATION: 20260807173331_2255f582-0bbb-4b6f-8ef0-295e59bfe3e3.sql <<<
CREATE TABLE public.cadet_enrollments (
  id TEXT PRIMARY KEY,
  enrollment_no TEXT UNIQUE,
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'SD',
  dob DATE NOT NULL,
  aadhaar_number TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  blood_group TEXT NOT NULL DEFAULT 'O+',
  identification_mark TEXT NOT NULL DEFAULT 'NIL',
  status TEXT NOT NULL DEFAULT 'Submitted',
  officer_remarks TEXT,
  selection_rank INTEGER,
  sbu_course TEXT NOT NULL DEFAULT '',
  sbu_department TEXT NOT NULL DEFAULT 'Sarala Birla University',
  sbu_roll_no TEXT NOT NULL DEFAULT '',
  sbu_year TEXT NOT NULL DEFAULT '1st Year',
  sbu_semester TEXT NOT NULL DEFAULT '1st Sem',
  marks_percentage_10th NUMERIC NOT NULL DEFAULT 0,
  marks_percentage_12th NUMERIC NOT NULL DEFAULT 0,
  height_cm NUMERIC NOT NULL DEFAULT 0,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  run_1600m_time TEXT NOT NULL DEFAULT '',
  pushups_count INTEGER NOT NULL DEFAULT 0,
  has_junior_certificate BOOLEAN NOT NULL DEFAULT false,
  junior_certificate_no TEXT,
  sports_level TEXT NOT NULL DEFAULT 'None',
  sports_details TEXT,
  present_address TEXT NOT NULL DEFAULT '',
  permanent_address TEXT NOT NULL DEFAULT '',
  pin_code TEXT NOT NULL DEFAULT '',
  bank_name TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  ifsc_code TEXT NOT NULL DEFAULT '',
  guardian_name TEXT NOT NULL DEFAULT '',
  guardian_relation TEXT NOT NULL DEFAULT 'Father',
  guardian_mobile TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.cadet_enrollments TO service_role;
ALTER TABLE public.cadet_enrollments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_cadet_enrollments_status ON public.cadet_enrollments (status);
CREATE INDEX idx_cadet_enrollments_gender ON public.cadet_enrollments (gender);
CREATE INDEX idx_cadet_enrollments_roll ON public.cadet_enrollments (sbu_roll_no);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Urgent Notice',
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  body TEXT NOT NULL,
  action_type TEXT DEFAULT 'general',
  action_label TEXT DEFAULT 'View Details',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'cadet',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.app_sessions TO service_role;
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cadet_enrollments_updated_at
BEFORE UPDATE ON public.cadet_enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cadet_enrollments
  (id, enrollment_no, application_date, full_name, gender, dob, aadhaar_number, mobile, email, blood_group, identification_mark, status, officer_remarks, selection_rank, sbu_course, sbu_department, sbu_roll_no, sbu_year, sbu_semester, marks_percentage_10th, marks_percentage_12th, height_cm, weight_kg, run_1600m_time, pushups_count, has_junior_certificate, junior_certificate_no, sports_level, sports_details, present_address, permanent_address, pin_code, bank_name, account_number, ifsc_code, guardian_name, guardian_relation, guardian_mobile)
VALUES
  ('19JHR-SBU-2026-101', 'JH/26/SD/104512', '2026-01-12', 'Aditya Kumar Singh', 'SD', '2006-04-18', '482913776541', '9871203451', 'aditya.singh@sbu.ac.in', 'B+', 'Mole on left cheek', 'Enrolled', 'Enrolled in 19 JHR BN. Excellent drill aptitude.', 1, 'B.Tech Computer Science', 'School of Engineering', 'SBU/CSE/2026/014', '2nd Year', '3rd Sem', 88.4, 91.2, 174, 66, '5:42', 42, true, 'JD/A/2021/8841', 'District', 'District level football, Ranchi', 'Hostel Block C, SBU Campus, Ranchi', 'Village Barkakana, Ramgarh, Jharkhand', '834010', 'State Bank of India', '38812004551', 'SBIN0007321', 'Rajesh Kumar Singh', 'Father', '9431102233'),
  ('19JHR-SBU-2026-102', 'JH/26/SW/104513', '2026-01-14', 'Priya Kumari Mahto', 'SW', '2006-09-02', '551204889112', '9955612340', 'priya.mahto@sbu.ac.in', 'O+', 'Scar on right elbow', 'Selected', 'Cleared physical and medical boards. Awaiting regimental allotment.', 2, 'BBA', 'School of Management', 'SBU/BBA/2026/041', '1st Year', '2nd Sem', 91.0, 89.6, 162, 54, '6:58', 24, false, NULL, 'State', 'State level athletics, 400m', 'Girls Hostel A, SBU Campus, Ranchi', 'Hehal, Ranchi, Jharkhand', '834005', 'Bank of India', '47120099812', 'BKID0004712', 'Sunita Devi Mahto', 'Mother', '9430567781'),
  ('19JHR-SBU-2026-103', NULL, '2026-01-19', 'Mohd Sameer Ansari', 'SD', '2005-12-11', '661903442718', '8987231145', 'sameer.ansari@sbu.ac.in', 'A+', 'Birthmark on neck', 'Medical Cleared', 'Medical board cleared. Selection list pending officer review.', NULL, 'B.Sc Agriculture', 'School of Agriculture', 'SBU/AGR/2026/077', '2nd Year', '4th Sem', 79.2, 82.4, 171, 63, '6:05', 35, false, NULL, 'College', 'Inter-college kabaddi', 'Doranda, Ranchi, Jharkhand', 'Doranda, Ranchi, Jharkhand', '834002', 'Punjab National Bank', '55120078441', 'PUNB0551200', 'Iqbal Ansari', 'Father', '9835221190'),
  ('19JHR-SBU-2026-104', NULL, '2026-01-22', 'Ankit Oraon', 'SD', '2007-02-27', '712045667290', '7712340098', 'ankit.oraon@sbu.ac.in', 'AB+', 'NIL', 'Physical Scheduled', 'Physical efficiency test scheduled at SBU parade ground.', NULL, 'B.Tech Mechanical', 'School of Engineering', 'SBU/ME/2026/108', '1st Year', '1st Sem', 74.8, 77.1, 168, 58, '6:30', 28, false, NULL, 'None', NULL, 'Kanke Road, Ranchi, Jharkhand', 'Gumla, Jharkhand', '835207', 'Canara Bank', '61220044190', 'CNRB0006122', 'Budhwa Oraon', 'Father', '9612337740'),
  ('19JHR-SBU-2026-105', NULL, '2026-01-25', 'Shreya Gupta', 'SW', '2006-07-08', '803312998145', '9304451122', 'shreya.gupta@sbu.ac.in', 'B-', 'Mole on forehead', 'Submitted', 'Online application submitted successfully.', NULL, 'B.Com Honours', 'School of Commerce', 'SBU/COM/2026/135', '1st Year', '2nd Sem', 85.6, 88.0, 159, 51, '7:15', 18, true, 'JD/A/2022/1157', 'College', 'College badminton team', 'Ashok Nagar, Ranchi, Jharkhand', 'Ashok Nagar, Ranchi, Jharkhand', '834002', 'HDFC Bank', '50100377211', 'HDFC0000412', 'Manoj Kumar Gupta', 'Father', '9431778812'),
  ('19JHR-SBU-2026-106', NULL, '2026-01-28', 'Rahul Bhengra', 'SD', '2005-05-30', '904471223390', '8340012789', 'rahul.bhengra@sbu.ac.in', 'O-', 'Cut mark on left knee', 'Rejected', 'Did not meet minimum height standard for Senior Division.', NULL, 'BCA', 'School of Computer Applications', 'SBU/BCA/2026/090', '2nd Year', '3rd Sem', 68.4, 71.2, 158, 55, '7:48', 12, false, NULL, 'None', NULL, 'Khunti, Jharkhand', 'Khunti, Jharkhand', '835210', 'Union Bank of India', '39120066712', 'UBIN0539121', 'Somra Bhengra', 'Father', '9771120044');

INSERT INTO public.notifications (title, category, priority, body, action_type, action_label)
VALUES
  ('Annual Training Camp (ATC) selection list published', 'Camp Selection', 'URGENT', 'The provisional nominal roll for ATC-1/2026 at 19 Jharkhand Battalion, Ranchi has been published. Selected cadets must report to the ANO office with medical fitness certificates by Friday 1700 hrs.', 'camp', 'View Nominal Roll'),
  ('Drill practice: 0.22 rifle stripping and assembly', 'Training Update', 'NORMAL', 'Subedar Major B.S. Gurung will conduct hands-on weapon handling and safety precautions at SBU Parade Ground tomorrow at 0600 hrs. Attendance mandatory for B and C certificate cadets.', 'schedule', 'View Drill Schedule'),
  ('B and C certificate examination date sheet', 'Examination', 'HIGH', 'Written examination for NCC B and C certificates will be held across three days in March 2026. Detailed date sheet and syllabus weightage are now available on the cadet dashboard.', 'exam', 'Open Date Sheet'),
  ('Uniform and boot issue drive', 'Administration', 'NORMAL', 'Fresh uniform sets, boots DMS and NCC belts will be issued at the NCC store room over two days. Cadets must carry their identity card and enrollment slip.', 'general', 'View Details');

-- >>> MIGRATION: 20260807193603_2061835e-b7a5-40fb-b886-ae7bd487e9ab.sql <<<
CREATE TABLE IF NOT EXISTS public.cadets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id text NOT NULL UNIQUE,
  batch text,
  rank text,
  full_name text,
  gender text,
  wing text,
  mobile text,
  email text,
  dob text,
  father_name text,
  mother_name text,
  nationality text,
  institute text,
  ano_name text,
  wing_type text,
  group_hq text,
  house_no text,
  building text,
  area text,
  city text,
  state text,
  pin_code text,
  nearest_railway_station text,
  identification_mark text,
  blood_group text,
  medical_complaint text,
  nok_name text,
  nok_relationship text,
  nok_contact text,
  nok_address text,
  sports_games text,
  co_curricular text,
  willing_military_training text,
  willing_serve_ncc text,
  previously_applied text,
  criminal_record text,
  sbu_id text,
  course text,
  branch text,
  semester text,
  section text,
  bank_account_number text,
  ifsc_code text,
  account_holder_name text,
  aadhaar_number text,
  stipend_received text,
  performance text,
  behaviour text,
  participation text,
  distinction text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.cadets TO service_role;

ALTER TABLE public.cadets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS cadets_batch_idx ON public.cadets (batch);
CREATE INDEX IF NOT EXISTS cadets_name_idx ON public.cadets (lower(full_name));

-- >>> MIGRATION: 20260807194829_40b5a2c3-a158-4c3c-ae46-685b31d950eb.sql <<<
ALTER TABLE public.app_sessions ADD COLUMN IF NOT EXISTS cadet_enrollment_id text;
CREATE INDEX IF NOT EXISTS idx_app_sessions_token ON public.app_sessions (token);
CREATE INDEX IF NOT EXISTS idx_cadets_sbu_id ON public.cadets (sbu_id);

-- >>> MIGRATION: 20260807202408_845b6f7a-3f4f-4e78-8f1b-6a7d00fe01e2.sql <<<
CREATE TABLE public.auth_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  purpose text NOT NULL DEFAULT 'password_reset',
  code_hash text NOT NULL,
  destination text,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_otp_codes_identifier_idx ON public.auth_otp_codes (lower(identifier), purpose, created_at DESC);
GRANT ALL ON public.auth_otp_codes TO service_role;
ALTER TABLE public.auth_otp_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.app_credentials (
  identifier text PRIMARY KEY,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_credentials TO service_role;
ALTER TABLE public.app_credentials ENABLE ROW LEVEL SECURITY;

-- >>> MIGRATION: 20260809143000_audit_logs.sql <<<
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


-- >>> MIGRATION: 20260809150000_operations_schema.sql <<<
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


-- >>> MIGRATION: 20260811000000_calendar_prompter_notifications.sql <<<
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


-- >>> MIGRATION: 20260811100000_cadet_lifecycle_activation_onboarding.sql <<<
-- Migration: 20260811100000_cadet_lifecycle_activation_onboarding.sql
-- Controlled Cadet Lifecycle, Account Activation & Onboarding Progress Schema

-- 1. Create cadet_users table
CREATE TABLE IF NOT EXISTS public.cadet_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cadet_id text UNIQUE NOT NULL,
  application_id text NOT NULL,
  email text NOT NULL,
  password_hash text,
  role text NOT NULL DEFAULT 'CADET',
  account_status text NOT NULL DEFAULT 'ACTIVATION_PENDING', -- 'ACTIVATION_PENDING', 'ACTIVE', 'SUSPENDED'
  activated_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cadet_users_cadet_id ON public.cadet_users (cadet_id);
CREATE INDEX IF NOT EXISTS idx_cadet_users_email ON public.cadet_users (email);
CREATE INDEX IF NOT EXISTS idx_cadet_users_status ON public.cadet_users (account_status);
GRANT ALL ON public.cadet_users TO service_role;
ALTER TABLE public.cadet_users ENABLE ROW LEVEL SECURITY;

-- 2. Create account_activation_tokens table
CREATE TABLE IF NOT EXISTS public.account_activation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.cadet_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_activation_tokens_hash ON public.account_activation_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_account_activation_tokens_user ON public.account_activation_tokens (user_id);
GRANT ALL ON public.account_activation_tokens TO service_role;
ALTER TABLE public.account_activation_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Create onboarding_progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  user_id uuid PRIMARY KEY REFERENCES public.cadet_users(id) ON DELETE CASCADE,
  profile_completed boolean NOT NULL DEFAULT false,
  contact_verified boolean NOT NULL DEFAULT false,
  documents_verified boolean NOT NULL DEFAULT false,
  declaration_accepted boolean NOT NULL DEFAULT false,
  orientation_completed boolean NOT NULL DEFAULT false,
  onboarding_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.onboarding_progress TO service_role;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;


-- >>> MIGRATION: 20260811120000_bucket_tokenisation_storage_security.sql <<<
-- Migration: 20260811120000_bucket_tokenisation_storage_security.sql
-- Storage Capability & Bucket Tokenisation Security Schema (OWASP ASVS 5.0 / API Security)

-- 1. Create storage_upload_intents table
CREATE TABLE storage_upload_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opaque_intent_id text NOT NULL UNIQUE,
  user_id text NOT NULL,
  resource_type text NOT NULL, -- 'APPLICATION_DOCUMENT', 'CADET_PHOTO', 'ACTIVITY_MEDIA', 'CERTIFICATE'
  resource_id text NOT NULL,
  bucket text NOT NULL,
  object_key text NOT NULL UNIQUE,
  operation text NOT NULL DEFAULT 'UPLOAD', -- 'UPLOAD'
  allowed_mime text NOT NULL,
  max_size_bytes bigint NOT NULL,
  checksum text,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'UPLOADING', 'VERIFIED', 'EXPIRED', 'REVOKED', 'FAILED'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_storage_intents_user ON storage_upload_intents (user_id);
CREATE INDEX idx_storage_intents_status_exp ON storage_upload_intents (status, expires_at);
CREATE INDEX idx_storage_intents_token ON storage_upload_intents (token_hash);
GRANT ALL ON storage_upload_intents TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE storage_upload_intents ENABLE ROW LEVEL SECURITY';
END $$;

-- 2. Create storage_objects table
CREATE TABLE storage_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opaque_object_id text NOT NULL UNIQUE,
  bucket text NOT NULL,
  object_key text NOT NULL UNIQUE,
  owner_id text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  checksum text,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'QUARANTINED', 'DELETED'
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  deleted_at timestamptz
);

CREATE INDEX idx_storage_objects_owner ON storage_objects (owner_id);
CREATE INDEX idx_storage_objects_resource ON storage_objects (resource_type, resource_id);
CREATE INDEX idx_storage_objects_key ON storage_objects (object_key);
GRANT ALL ON storage_objects TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY';
END $$;

-- 3. Create storage_access_grants table
CREATE TABLE storage_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opaque_grant_id text NOT NULL UNIQUE,
  user_id text NOT NULL,
  object_id uuid NOT NULL REFERENCES storage_objects(id) ON DELETE CASCADE,
  operation text NOT NULL DEFAULT 'DOWNLOAD', -- 'DOWNLOAD', 'VIEW'
  grant_token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  status text NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'REVOKED', 'CONSUMED'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_storage_grants_user ON storage_access_grants (user_id);
CREATE INDEX idx_storage_grants_object ON storage_access_grants (object_id);
CREATE INDEX idx_storage_grants_token ON storage_access_grants (grant_token_hash);
GRANT ALL ON storage_access_grants TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE storage_access_grants ENABLE ROW LEVEL SECURITY';
END $$;


-- >>> MIGRATION: 20260811130000_intrusion_detection_system.sql <<<
-- Migration: 20260811130000_intrusion_detection_system.sql
-- Intrusion Detection System (IDS), Security Alerting & Automated Containment Schema

-- 1. Create ids_events table
CREATE TABLE ids_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'AUTH_FAILURE', 'IDOR_ATTEMPT', 'STORAGE_TOKEN_REPLAY', 'RATE_LIMIT_TRIGGERED', 'UNAUTHORIZED_EXPORT', 'AI_ABUSE'
  actor_id text,
  actor_ip text NOT NULL,
  risk_score integer NOT NULL DEFAULT 10, -- Scale 1 to 100
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ids_events_actor ON ids_events (actor_id);
CREATE INDEX idx_ids_events_ip ON ids_events (actor_ip);
CREATE INDEX idx_ids_events_type_time ON ids_events (event_type, created_at);
GRANT ALL ON ids_events TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE ids_events ENABLE ROW LEVEL SECURITY';
END $$;

-- 2. Create ids_alerts table
CREATE TABLE ids_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES ids_events(id) ON DELETE CASCADE,
  alert_level text NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ids_alerts_level_status ON ids_alerts (alert_level, status);
GRANT ALL ON ids_alerts TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE ids_alerts ENABLE ROW LEVEL SECURITY';
END $$;

-- 3. Create ids_actions table
CREATE TABLE ids_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES ids_alerts(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- 'LOG', 'ALERT_STAFF', 'RATE_LIMIT_IP', 'REVOKE_SESSION', 'QUARANTINE_OBJECT'
  target_resource text,
  executed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'EXECUTED'
);

CREATE INDEX idx_ids_actions_alert ON ids_actions (alert_id);
GRANT ALL ON ids_actions TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE ids_actions ENABLE ROW LEVEL SECURITY';
END $$;


