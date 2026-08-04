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
  status: "Submitted" | "Physical Scheduled" | "Medical Cleared" | "Selected" | "Enrolled" | "Rejected";
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
  location: string;
  dates: string;
  eligibility: string;
  status: "Upcoming" | "Active" | "Completed";
  vacancies: number;
  image?: string;
}
