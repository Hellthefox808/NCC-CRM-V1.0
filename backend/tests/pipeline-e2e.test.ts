import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildEnrollmentRow,
  generate18DigitApplicationNo,
  mapCadet,
  mapToCadetRecord,
  maskPublicRecord,
  sanitizePostgrestQuery,
} from "../lib/ncc-db.ts";
import { cadetEnrollmentSchema, validateRequestBody } from "../lib/validation.schemas.ts";
import { checkRateLimitAsync } from "../lib/rate-limiter.server.ts";
import { getRedisStatus, redisGet, redisIncr, redisSet } from "../lib/redis.server.ts";
import { formatApplicationNo, sendMultiChannelApplicationConfirmation } from "../services/messaging/multichannel.service.ts";

describe("E2E Pipeline & Data Connection Integration Tests", () => {
  it("Complete Enrollment Form 1 -> 18-Digit App ID -> DB Row Pipeline", () => {
    const rawSubmission = {
      fullName: "Vikramaditya Rathore",
      gender: "SD" as const,
      dob: "2004-11-15",
      aadhaarNumber: "7890 1234 5678",
      mobile: "+91 98351 99887",
      email: "vikramaditya.rathore@sbu.ac.in",
      fatherName: "Devendra Singh Rathore",
      motherName: "Sushila Devi",
      bloodGroup: "O+",
      identificationMark: "Scar on forehead",
      sbuCourse: "Bachelor of Technology in Computer Science",
      sbuRollNo: "SBU/BTECH/2024/042",
      sbuDepartment: "Faculty of Engineering & Applied Sciences",
      sbuYear: "2nd Year",
      sbuSemester: "3rd Sem",
      marksPercentage10th: 92.5,
      marksPercentage12th: 89.0,
      heightCm: 178,
      weightKg: 70,
      run1600mTime: "05:45",
      pushupsCount: 45,
      hasJuniorCertificate: true,
      juniorCertificateNo: "JH/JD/2022/10492",
      sportsLevel: "State Level Athletics",
      bankName: "Punjab National Bank",
      accountNumber: "4521000100489211",
      ifscCode: "PUNB0452100",
      presentAddress: "Room 204, Tagore Hostel, SBU Campus, Ranchi",
      permanentAddress: "House 14, Circular Road, Lalpur, Ranchi, Jharkhand 834001",
    };

    // 1. Validate against schema
    const validation = validateRequestBody(cadetEnrollmentSchema, rawSubmission, "Form 1 Submission");
    assert.equal(validation.success, true);
    if (!validation.success) return;

    // 2. Build DB row with 18-digit Application Number
    const row = buildEnrollmentRow(validation.data);
    assert.equal(row.id.length, 18);
    assert.match(row.id, /^19\d{16}$/);
    assert.equal(row.full_name, "Vikramaditya Rathore");
    assert.equal(row.gender, "SD");
    assert.equal(row.sbu_roll_no, "SBU/BTECH/2024/042");
    assert.equal(row.status, "PENDING_ANO_REVIEW");
    assert.equal(row.aadhaar_number, "789012345678");
    assert.equal(row.mobile, "9835199887");

    // 3. Map DB row to CadetRecord interface
    const cadetRecord = mapToCadetRecord(row);
    assert.equal(cadetRecord.id, row.id);
    assert.equal(cadetRecord.fullName, "Vikramaditya Rathore");
    assert.equal(cadetRecord.sbuCourse, "Bachelor of Technology in Computer Science");

    // 4. Test Public Status Masking (PII Protection)
    const publicRecord = maskPublicRecord(cadetRecord);
    assert.equal(publicRecord.id, row.id);
    assert.equal(publicRecord.fullName, "Vikramaditya Rathore");
    assert.equal(publicRecord.status, "PENDING_ANO_REVIEW");
    // Verify Aadhaar, mobile, and bank details are not exposed in public tracking
    assert.equal("aadhaarNumber" in publicRecord, false);
    assert.equal("accountNumber" in publicRecord, false);
    assert.equal("ifscCode" in publicRecord, false);
  });

  it("RFC 4180 CSV Export generation with UTF-8 BOM", () => {
    function escapeCsvField(val: unknown): string {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    }

    const testCadets = [
      {
        "S.No": 1,
        "Application ID": "192026082199881122",
        "Cadet Full Name": "Rahul Kumar, Singh",
        "SBU Course": "B.Tech CSE",
        "Status": "Enrolled",
      },
      {
        "S.No": 2,
        "Application ID": "192026082199881123",
        "Cadet Full Name": 'Priya "Ananya" Kumari',
        "SBU Course": "BCA",
        "Status": "PENDING_ANO_REVIEW",
      },
    ];

    const headers = Object.keys(testCadets[0]);
    const headerRow = headers.map(escapeCsvField).join(",");
    const dataRows = testCadets.map((row) =>
      headers.map((h) => escapeCsvField((row as Record<string, unknown>)[h])).join(",")
    );
    const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");

    // Must start with UTF-8 BOM (\uFEFF)
    assert.ok(csvContent.startsWith("\uFEFF"));
    // Commas and quotes must be properly escaped
    assert.ok(csvContent.includes('"Rahul Kumar, Singh"'));
    assert.ok(csvContent.includes('"Priya ""Ananya"" Kumari"'));
  });

  it("Sanitizes PostgREST query inputs preventing filter injection", () => {
    const maliciousQuery = "1920260821%(),.\\";
    const sanitized = sanitizePostgrestQuery(maliciousQuery);

    assert.equal(sanitized.includes("%"), false);
    assert.equal(sanitized.includes(","), false);
    assert.equal(sanitized.includes("."), false);
    assert.equal(sanitized.includes("("), false);
    assert.equal(sanitized.includes(")"), false);
    assert.equal(sanitized.includes("\\"), false);
    assert.equal(sanitized, "1920260821");
  });

  it("Rate Limiter sliding window handles burst requests", async () => {
    const testKey = "test_user_burst_" + Date.now();
    const options = { maxAttempts: 5, windowMs: 10000 };

    const results = [];
    for (let i = 0; i < 7; i++) {
      const res = await checkRateLimitAsync(testKey, options);
      results.push(res.allowed);
    }

    // First 5 should be allowed (true), 6th and 7th should be blocked (false)
    assert.equal(results[0], true);
    assert.equal(results[1], true);
    assert.equal(results[2], true);
    assert.equal(results[3], true);
    assert.equal(results[4], true);
    assert.equal(results[5], false);
    assert.equal(results[6], false);
  });
});
