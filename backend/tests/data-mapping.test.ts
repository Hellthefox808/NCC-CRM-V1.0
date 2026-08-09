import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapToCadetRecord, buildEnrollmentRow } from "../lib/ncc-db.ts";
import { mapCadet, rosterRecords } from "../lib/cadet-registry.server.ts";

describe("Data Mapping & Transformation Unit Tests", () => {
  it("mapToCadetRecord() correctly transforms raw DB rows into frontend CadetRecord objects", () => {
    const rawRow = {
      id: "19JHR-SBU-2026-102",
      enrollment_no: "JH/26/SW/104513",
      application_date: "2026-01-14",
      full_name: "Priya Kumari Mahto",
      gender: "SW",
      dob: "2006-09-02",
      aadhaar_number: "551204889112",
      mobile: "9955612340",
      email: "priya.mahto@sbu.ac.in",
      blood_group: "O+",
      identification_mark: "Scar on right elbow",
      status: "Selected",
      officer_remarks: "Cleared physical and medical boards.",
      selection_rank: 2,
      sbu_course: "BBA",
      sbu_department: "School of Management",
      sbu_roll_no: "SBU/BBA/2026/041",
      sbu_year: "1st Year",
      sbu_semester: "2nd Sem",
      marks_percentage_10th: 91.0,
      marks_percentage_12th: 89.6,
      height_cm: 162,
      weight_kg: 54,
      run_1600m_time: "6:58",
      pushups_count: 24,
      has_junior_certificate: false,
      junior_certificate_no: null,
      sports_level: "State",
      sports_details: "State level athletics, 400m",
      present_address: "Girls Hostel A, SBU Campus, Ranchi",
      permanent_address: "Hehal, Ranchi, Jharkhand",
      pin_code: "834005",
      bank_name: "Bank of India",
      account_number: "47120099812",
      ifsc_code: "BKID0004712",
      guardian_name: "Sunita Devi Mahto",
      guardian_relation: "Mother",
      guardian_mobile: "9430567781",
    };

    const cadet = mapToCadetRecord(rawRow);

    assert.equal(cadet.id, "19JHR-SBU-2026-102");
    assert.equal(cadet.enrollmentNo, "JH/26/SW/104513");
    assert.equal(cadet.fullName, "Priya Kumari Mahto");
    assert.equal(cadet.gender, "SW");
    assert.equal(cadet.marksPercentage10th, 91.0);
    assert.equal(cadet.motherName, "Sunita Devi Mahto");
    assert.equal(cadet.fatherName, "");
  });

  it("buildEnrollmentRow() generates valid DB insert objects with generated IDs", () => {
    const payload = {
      fullName: "Rohan Kumar",
      gender: "SD",
      dob: "2006-05-15",
      aadhaarNumber: "998877665544",
      mobile: "9876543210",
      email: "rohan.kumar@sbu.ac.in",
      sbuCourse: "B.Tech CSE",
      sbuRollNo: "SBU/BTECH/2026/009",
      heightCm: "176",
      weightKg: "68",
    };

    const row = buildEnrollmentRow(payload);

    assert.match(row.id, /^19JHR-SBU-\d{4}-\d{3}$/);
    assert.equal(row.full_name, "Rohan Kumar");
    assert.equal(row.aadhaar_number, "998877665544");
    assert.equal(row.status, "Submitted");
    assert.equal(row.height_cm, 176);
  });

  it("mapCadet() masks sensitive identifiers by default", () => {
    const rawCadet = {
      id: "cadet_001",
      enrollment_id: "JH/26/SD/104512",
      full_name: "Aditya Kumar Singh",
      bank_account_number: "38812004551",
      aadhaar_number: "482913776541",
    };

    const masked = mapCadet(rawCadet, false);
    assert.equal(masked.bankAccountNumber, "•••••••4551");
    assert.equal(masked.aadhaarNumber, "••••••••6541");

    const unmasked = mapCadet(rawCadet, true);
    assert.equal(unmasked.bankAccountNumber, "38812004551");
    assert.equal(unmasked.aadhaarNumber, "482913776541");
  });

  it("rosterRecords() returns the shipped unit nominal rolls", () => {
    const records = rosterRecords();
    assert.ok(Array.isArray(records));
    assert.ok(records.length > 0);
  });
});
