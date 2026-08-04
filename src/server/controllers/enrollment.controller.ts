import { Request, Response } from "express";
import { prisma } from "../repositories/db";
import { serverCache } from "../repositories/cache";
import { broadcastWebSocketEvent } from "../services/websocket.service";
import { CadetRecord } from "../types";
import * as XLSX from "xlsx";

const mapToCadetRecord = (profile: any): CadetRecord => {
  return {
    id: profile.id,
    enrollmentNo: profile.enrollmentNo || undefined,
    applicationDate: profile.applicationDate.toISOString().split("T")[0],
    fullName: profile.fullName,
    gender: profile.gender,
    dob: profile.dob.toISOString().split("T")[0],
    aadhaarNumber: profile.aadhaarNumber,
    mobile: profile.mobile,
    email: profile.user?.email || "",
    bloodGroup: profile.bloodGroup,
    identificationMark: profile.identificationMark,
    status: profile.status.replace("_", " "),
    officerRemarks: profile.officerRemarks || undefined,
    selectionRank: profile.selectionRank || undefined,

    // Academic
    sbuCourse: profile.academicDetails?.sbuCourse || "",
    sbuDepartment: profile.academicDetails?.sbuDepartment || "",
    sbuRollNo: profile.academicDetails?.sbuRollNo || "",
    sbuYear: profile.academicDetails?.sbuYear || "",
    sbuSemester: profile.academicDetails?.sbuSemester || "",
    marksPercentage10th: profile.academicDetails?.marksPercentage10th || 0,
    marksPercentage12th: profile.academicDetails?.marksPercentage12th || 0,

    // Physical
    heightCm: profile.physicalDetails?.heightCm || 0,
    weightKg: profile.physicalDetails?.weightKg || 0,
    run1600mTime: profile.physicalDetails?.run1600mTime || "",
    pushupsCount: profile.physicalDetails?.pushupsCount || 0,
    hasJuniorCertificate: profile.physicalDetails?.hasJuniorCertificate || false,
    juniorCertificateNo: profile.physicalDetails?.juniorCertificateNo || undefined,
    sportsLevel: profile.physicalDetails?.sportsLevel || "None",
    sportsDetails: profile.physicalDetails?.sportsDetails || undefined,

    // Bank
    presentAddress: profile.bankDetails?.presentAddress || "",
    permanentAddress: profile.bankDetails?.permanentAddress || "",
    pinCode: profile.bankDetails?.pinCode || "",
    bankName: profile.bankDetails?.bankName || "",
    accountNumber: profile.bankDetails?.accountNumber || "",
    ifscCode: profile.bankDetails?.ifscCode || "",
    guardianName: profile.bankDetails?.guardianName || "",
    guardianRelation: profile.bankDetails?.guardianRelation || "",
    guardianMobile: profile.bankDetails?.guardianMobile || "",

    // Fallbacks
    fatherName: profile.bankDetails?.guardianRelation === "Father" ? profile.bankDetails.guardianName : "",
    motherName: profile.bankDetails?.guardianRelation === "Mother" ? profile.bankDetails.guardianName : "",
  };
};

export const getEnrollments = async (req: Request, res: Response): Promise<any> => {
  const cacheKey = `enrollments:${req.url}`;
  const cached = serverCache.get(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    return res.json(cached);
  }

  const { status, gender, sbuCourse, search, sortBy, order, page = "1", limit = "50" } = req.query;

  try {
    const where: any = {};
    if (status) where.status = String(status).replace(" ", "_");
    if (gender) where.gender = gender;
    
    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
        { enrollmentNo: { contains: q, mode: "insensitive" } },
        { mobile: { contains: q } },
        { academicDetails: { sbuRollNo: { contains: q, mode: "insensitive" } } }
      ];
    }
    
    if (sbuCourse) {
      where.academicDetails = { ...where.academicDetails, sbuCourse: { contains: String(sbuCourse), mode: "insensitive" } };
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const [dbProfiles, total] = await Promise.all([
      prisma.cadetProfile.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: true,
          academicDetails: true,
          physicalDetails: true,
          bankDetails: true
        },
        orderBy: sortBy ? { [String(sortBy)]: order === "desc" ? "desc" : "asc" } : { applicationDate: "desc" }
      }),
      prisma.cadetProfile.count({ where })
    ]);

    const mapped = dbProfiles.map(mapToCadetRecord);

    const responseBody = {
      success: true,
      data: {
        enrollments: mapped,
        count: mapped.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      },
      meta: { cacheHit: false, requestId: req.headers["x-request-id"] }
    };

    serverCache.set(cacheKey, responseBody, 10000);
    res.setHeader("X-Cache", "MISS");
    return res.json(responseBody);
  } catch (err) {
    return res.status(500).json({ success: false, error: "Database error fetching enrollments" });
  }
};

export const getEnrollmentStatus = async (req: Request, res: Response): Promise<any> => {
  const query = req.params.query.trim().toLowerCase();
  
  try {
    const profile = await prisma.cadetProfile.findFirst({
      where: {
        OR: [
          { id: { equals: query, mode: "insensitive" } },
          { aadhaarNumber: { equals: query } },
          { enrollmentNo: { equals: query, mode: "insensitive" } },
          { mobile: { equals: query } },
          { academicDetails: { sbuRollNo: { equals: query, mode: "insensitive" } } }
        ]
      },
      include: {
        user: true,
        academicDetails: true,
        physicalDetails: true,
        bankDetails: true
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: "No NCC Enrollment record found matching query.", code: "RECORD_NOT_FOUND" });
    }

    return res.json({ success: true, data: { record: mapToCadetRecord(profile) } });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Database error" });
  }
};

export const submitEnrollment = async (req: Request, res: Response): Promise<any> => {
  try {
    const data = req.body;
    if (!data.fullName || !data.aadhaarNumber || !data.sbuRollNo || !data.mobile) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, aadhaarNumber, sbuRollNo, mobile.",
        code: "VALIDATION_FAILED"
      });
    }

    const newId = `19JHR-SBU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const email = data.email || `${data.aadhaarNumber}@sbu.ac.in`;

    const newProfile = await prisma.user.create({
      data: {
        email,
        passwordHash: "MOCKED",
        role: "CADET",
        cadetProfile: {
          create: {
            id: newId,
            fullName: data.fullName,
            gender: data.gender || "SD",
            dob: new Date(data.dob || "2000-01-01"),
            aadhaarNumber: data.aadhaarNumber,
            mobile: data.mobile,
            bloodGroup: data.bloodGroup || "O+",
            identificationMark: data.identificationMark || "NIL",
            status: "Submitted",
            officerRemarks: "Online application submitted successfully.",
            academicDetails: {
              create: {
                sbuCourse: data.sbuCourse || "Unknown",
                sbuDepartment: data.sbuDepartment || "Sarala Birla University",
                sbuRollNo: data.sbuRollNo,
                sbuYear: data.sbuYear || "1st Year",
                sbuSemester: data.sbuSemester || "1st Sem",
                marksPercentage10th: Number(data.marksPercentage10th) || 0,
                marksPercentage12th: Number(data.marksPercentage12th) || 0,
              }
            },
            physicalDetails: {
              create: {
                heightCm: Number(data.heightCm) || 170,
                weightKg: Number(data.weightKg) || 60,
                run1600mTime: data.run1600mTime || "N/A",
                pushupsCount: Number(data.pushupsCount) || 0,
                hasJuniorCertificate: Boolean(data.hasJuniorCertificate),
                juniorCertificateNo: data.juniorCertificateNo || null,
                sportsLevel: data.sportsLevel || "None",
                sportsDetails: data.sportsDetails || null,
              }
            },
            bankDetails: {
              create: {
                presentAddress: data.presentAddress || "N/A",
                permanentAddress: data.permanentAddress || data.presentAddress || "N/A",
                pinCode: data.pinCode || "834010",
                bankName: data.bankName || "N/A",
                accountNumber: data.accountNumber || "N/A",
                ifscCode: data.ifscCode || "N/A",
                guardianName: data.guardianName || data.fatherName || "N/A",
                guardianRelation: data.guardianRelation || "Father",
                guardianMobile: data.guardianMobile || data.mobile || "N/A",
              }
            }
          }
        }
      },
      include: {
        cadetProfile: {
          include: { user: true, academicDetails: true, physicalDetails: true, bankDetails: true }
        }
      }
    });

    const newRecord = mapToCadetRecord(newProfile.cadetProfile);

    serverCache.invalidateTag("enrollments");
    broadcastWebSocketEvent("cadre:enrollments", "ENROLLMENT_SUBMITTED", newRecord);

    return res.status(201).json({
      success: true,
      message: "NCC Enrollment Application submitted successfully to 19 Jharkhand Battalion, Ranchi.",
      data: { enrollment: newRecord }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to submit enrollment." });
  }
};

export const updateEnrollmentStatus = async (req: Request, res: Response): Promise<any> => {
  const { id, status, remarks, enrollmentNo } = req.body;
  
  try {
    const updated = await prisma.cadetProfile.update({
      where: { id },
      data: {
        status: status ? status.replace(" ", "_") : undefined,
        officerRemarks: remarks,
        enrollmentNo
      },
      include: { user: true, academicDetails: true, physicalDetails: true, bankDetails: true }
    });

    const mapped = mapToCadetRecord(updated);
    serverCache.invalidateTag("enrollments");
    broadcastWebSocketEvent("cadre:enrollments", "STATUS_UPDATED", mapped);

    return res.json({ success: true, data: { updated: mapped } });
  } catch (err) {
    return res.status(404).json({ success: false, error: "Enrollment record not found.", code: "NOT_FOUND" });
  }
};

export const exportExcel = async (req: Request, res: Response): Promise<any> => {
  try {
    const dbProfiles = await prisma.cadetProfile.findMany({
      include: { user: true, academicDetails: true, physicalDetails: true, bankDetails: true }
    });
    
    const enrollments = dbProfiles.map(mapToCadetRecord);

    const nominalRollData = enrollments.map((e, idx) => ({
      "S.No": idx + 1,
      "Application ID": e.id,
      "NCC Regimental No": e.enrollmentNo || "Pending Allocation",
      "Cadet Full Name": e.fullName,
      "Wing/Gender": e.gender === "SD" ? "Senior Division (Male)" : "Senior Wing (Female)",
      "SBU Course": e.sbuCourse,
      "SBU Roll No": e.sbuRollNo,
      "Year/Sem": `${e.sbuYear} / ${e.sbuSemester}`,
      "DOB": e.dob,
      "Aadhaar Number": e.aadhaarNumber,
      "Mobile No": e.mobile,
      "Email ID": e.email,
      "Height (cm)": e.heightCm,
      "Weight (kg)": e.weightKg,
      "Blood Group": e.bloodGroup,
      "1600m Run Score": e.run1600mTime,
      "Pushups": e.pushupsCount,
      "10th %": e.marksPercentage10th,
      "12th %": e.marksPercentage12th,
      "Junior 'A' Cert": e.hasJuniorCertificate ? "Yes" : "No",
      "Sports Level": e.sportsLevel,
      "Application Status": e.status,
      "Officer Remarks": e.officerRemarks || ""
    }));

    const bankData = enrollments.map((e, idx) => ({
      "S.No": idx + 1,
      "Application ID": e.id,
      "Cadet Name": e.fullName,
      "SBU Roll No": e.sbuRollNo,
      "Bank Name": e.bankName,
      "Account Number": e.accountNumber,
      "IFSC Code": e.ifscCode,
      "Aadhaar Number": e.aadhaarNumber,
      "Mobile Number": e.mobile
    }));

    const workbook = XLSX.utils.book_new();
    const wsNominal = XLSX.utils.json_to_sheet(nominalRollData);
    const wsBank = XLSX.utils.json_to_sheet(bankData);

    XLSX.utils.book_append_sheet(workbook, wsNominal, "Nominal Roll 19 JHR BN");
    XLSX.utils.book_append_sheet(workbook, wsBank, "Bank Details");

    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", 'attachment; filename="NCC_19JHR_BN_Enrollments.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    return res.send(excelBuffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to generate Excel sheet." });
  }
};
