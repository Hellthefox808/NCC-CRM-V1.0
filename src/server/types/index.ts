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

export interface OfficerNotification {
  id: string;
  title: string;
  category: "Parade Order" | "Exam Alert" | "Camp Broadcast" | "Urgent Notice";
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  date: string;
  body: string;
  read: boolean;
  actionType?: "quiz" | "schedule" | "upload" | "syllabus" | "general";
  actionLabel?: string;
}

export interface SessionRecord {
  token: string;
  userType: "cadet" | "admin";
  userId: string;
  userName: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}
