export interface CadetRecord {
  id: string;
  enrollmentNo?: string;
  applicationDate: string;
  fullName: string;
  gender: "SD" | "SW";
  dob: string;
  aadhaarNumber: string;
  mobile: string;
  email: string;
  fatherName: string;
  motherName: string;
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  identificationMark: string;
  sbuCourse: string;
  sbuDepartment: string;
  sbuRollNo: string;
  sbuYear: string;
  sbuSemester: string;
  marksPercentage10th: number;
  marksPercentage12th: number;
  run1600mTime: string;
  pushupsCount: number;
  hasJuniorCertificate: boolean;
  juniorCertificateNo?: string;
  sportsLevel: "None" | "College" | "District" | "State" | "National";
  sportsDetails?: string;
  presentAddress: string;
  permanentAddress: string;
  pinCode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  guardianName: string;
  guardianRelation: string;
  guardianMobile: string;
  status:
    "Submitted" | "Physical Scheduled" | "Medical Cleared" | "Selected" | "Enrolled" | "Rejected";
  officerRemarks?: string;
  selectionRank?: number;
}

export interface NoticeItem {
  id: string;
  date: string;
  title: string;
  category: "Enrollment" | "Parade" | "Camp" | "Exam" | "General";
  isImportant?: boolean;
  description: string;
  downloadUrl?: string;
}

export interface ActivityCard {
  id: string;
  title: string;
  category: "Institutional" | "Camps" | "Shooting" | "Social Service" | "Adventure";
  description: string;
  image: string;
  highlights: string[];
}

export interface RankInfo {
  rank: string;
  abbr: string;
  insignia: string;
  responsibilities: string;
  level: string;
}

export interface CampScheduleItem {
  id: string;
  name: string;
  shortCode?: string;
  campType?: string;
  level?: "Institutional" | "Battalion" | "Group" | "Directorate" | "National";
  location: string;
  duration?: string;
  conductedBy?: string;
  dates?: string;
  eligibility?: string;
  status: "Upcoming" | "Active" | "Completed";
  vacancies: number;
  modules?: string[];
  incentive?: string;
  image?: string;
}

export interface AttendanceSummary {
  paradesAttended?: number;
  totalParades?: number;
  attendancePercent?: number;
  campEligibilityStatus?: string;
  attended?: number;
  absent?: number;
  late?: number;
  leave?: number;
  percentage?: number;
  drillPercent?: number;
  classPercent?: number;
  paradePercent?: number;
  campPercent?: number;
}

export interface CadetProfile {
  fullName: string;
  rank: string;
  regNo: string;
  sbuRollNo: string;
  sbuCourse: string;
  sbuYear: string;
  gender: string;
  unit: string;
  coy: string;
  groupHQ: string;
  directorate: string;
  joiningYear: string;
  batch: string;
  bloodGroup: string;
  dob: string;
  mobile: string;
  email: string;
  fatherName: string;
  motherName: string;
  parentMobile: string;
  parentOccupation: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  heightCm: string;
  weightKg: string;
  bmi: string;
  chestCm: string;
  fitnessStatus: string;
  medicalRemarks: string;
  beretSize: string;
  shirtSize: string;
  trouserWaist: string;
  bootSize: string;
  hackleColor: string;
  photoUrl?: string;
  aadhaarStatus?: string;
  bankPassbookStatus?: string;
  medicalFitnessCertStatus?: string;
  indemnityBondStatus?: string;
  accountNo?: string;
  ifscCode?: string;
  aadhaarVerified?: boolean;
  bankPassbookVerified?: boolean;
  collegeIdVerified?: boolean;
  medicalCertVerified?: boolean;
  parentConsentVerified?: boolean;
}
