CREATE TABLE IF NOT EXISTS public.cadet_enrollments (
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

CREATE INDEX IF NOT EXISTS idx_cadet_enrollments_status ON public.cadet_enrollments (status);
CREATE INDEX IF NOT EXISTS idx_cadet_enrollments_gender ON public.cadet_enrollments (gender);
CREATE INDEX IF NOT EXISTS idx_cadet_enrollments_roll ON public.cadet_enrollments (sbu_roll_no);

CREATE TABLE IF NOT EXISTS public.notifications (
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

CREATE TABLE IF NOT EXISTS public.app_sessions (
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

DROP TRIGGER IF EXISTS update_cadet_enrollments_updated_at ON public.cadet_enrollments;
CREATE TRIGGER update_cadet_enrollments_updated_at
BEFORE UPDATE ON public.cadet_enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
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
  ('19JHR-SBU-2026-106', NULL, '2026-01-28', 'Rahul Bhengra', 'SD', '2005-05-30', '904471223390', '8340012789', 'rahul.bhengra@sbu.ac.in', 'O-', 'Cut mark on left knee', 'Rejected', 'Did not meet minimum height standard for Senior Division.', NULL, 'BCA', 'School of Computer Applications', 'SBU/BCA/2026/090', '2nd Year', '3rd Sem', 68.4, 71.2, 158, 55, '7:48', 12, false, NULL, 'None', NULL, 'Khunti, Jharkhand', 'Khunti, Jharkhand', '835210', 'Union Bank of India', '39120066712', 'UBIN0539121', 'Somra Bhengra', 'Father', '9771120044')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (title, category, priority, body, action_type, action_label)
VALUES
  ('Annual Training Camp (ATC) selection list published', 'Camp Selection', 'URGENT', 'The provisional nominal roll for ATC-1/2026 at 19 Jharkhand Battalion, Ranchi has been published. Selected cadets must report to the ANO office with medical fitness certificates by Friday 1700 hrs.', 'camp', 'View Nominal Roll'),
  ('Drill practice: 0.22 rifle stripping and assembly', 'Training Update', 'NORMAL', 'Subedar Major B.S. Gurung will conduct hands-on weapon handling and safety precautions at SBU Parade Ground tomorrow at 0600 hrs. Attendance mandatory for B and C certificate cadets.', 'schedule', 'View Drill Schedule'),
  ('B and C certificate examination date sheet', 'Examination', 'HIGH', 'Written examination for NCC B and C certificates will be held across three days in March 2026. Detailed date sheet and syllabus weightage are now available on the cadet dashboard.', 'exam', 'Open Date Sheet'),
  ('Uniform and boot issue drive', 'Administration', 'NORMAL', 'Fresh uniform sets, boots DMS and NCC belts will be issued at the NCC store room over two days. Cadets must carry their identity card and enrollment slip.', 'general', 'View Details');